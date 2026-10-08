import { NextResponse } from 'next/server'
import { Pool } from 'pg'
import { gateway } from '@/lib/gateway'
import { nomePlanoGateway } from '@/lib/data'
import { sendCAPIEvent } from '@/lib/meta-capi'
import { sendGA4Event } from '@/lib/ga4-mp'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

/**
 * Envio do cadastro. Toda regra de venda (cobertura pelo CEP, planos, vencimentos, taxa,
 * CPF/CNPJ) é aplicada pelo gateway, a mesma do Vitor. O gateway também:
 *   - cria o cliente no CRM do SGP ("Em análise") ou registra a recusa;
 *   - envia a cópia ao atendimento@ (esperando a confirmação do e-mail por código).
 */
export async function POST(request: Request) {
  let b: Record<string, string>
  try {
    b = await request.json()
  } catch {
    return NextResponse.json({ status: 'error', message: 'Payload inválido' }, { status: 400 })
  }

  const {
    nome, email, celular, cpfcnpj, cep, numero, complemento, plano, vencimento,
    cidade_cobertura, bairro_cobertura, lead_id, session_id,
    logradouro, bairro, cidade, uf,
    client_ip_address, client_user_agent, fbp, ga_client_id,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term,
  } = b

  if (!nome || !email || !cpfcnpj || !cep || !numero || !plano || !vencimento) {
    return NextResponse.json({ status: 'error', message: 'Campos obrigatórios ausentes' }, { status: 400 })
  }

  const leadId = lead_id ? parseInt(lead_id) : null
  const [velocidade, preco] = plano.split(' - ').map((s) => s.trim())
  const valor = Number((preco ?? '').replace(/[^\d,]/g, '').replace(',', '.')) || undefined

  // ── 1. Banco — endereço (etapa 3)
  if (leadId) {
    await pool.query(
      `UPDATE leads_vivanet SET cep = $1, logradouro = $2, numero = $3, complemento = $4,
              bairro_endereco = $5, cidade_endereco = $6, estado = $7, step_atual = 3, atualizado_em = now()
        WHERE id = $8`,
      [cep.replace(/\D/g, ''), logradouro ?? null, numero, complemento || null, bairro ?? null, cidade ?? null, uf ?? null, leadId],
    ).catch((e) => console.error('[STEP3 DB]', e))
  }

  // ── 2. Gateway — cadastro no SGP com as regras da Viva
  const utm = Object.fromEntries(
    Object.entries({ utm_source, utm_medium, utm_campaign, utm_content, utm_term }).filter(([, v]) => v),
  )
  let status: number
  let dados: Record<string, any>
  try {
    ;({ status, dados } = await gateway<Record<string, any>>('/v1/cadastro', {
      cpfcnpj: cpfcnpj.replace(/\D/g, ''),
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      celular: (celular ?? '').replace(/\D/g, '') || null,
      cep: cep.replace(/\D/g, ''),
      numero: numero.trim(),
      complemento: complemento?.trim() || null,
      plano: nomePlanoGateway(velocidade),
      vencimento: Number(vencimento),
      origem: 'formulario',
      utm: Object.keys(utm).length ? utm : null,
    }, 30000))
  } catch (e) {
    console.error('[GATEWAY]', e)
    return NextResponse.json({ status: 'error', message: 'Não conseguimos enviar agora. Tente novamente em instantes.' }, { status: 503 })
  }

  // Criado, documento já existente e recusa do SGP seguem para a equipe (a cópia já foi para
  // o atendimento): para o cliente, é sucesso. Só cobertura e dados inválidos voltam como erro.
  const resultado =
    status === 200 ? 'criado'
    : status === 409 ? 'documento_existente'
    : status === 502 ? 'recusado_sgp'
    : 'invalido'

  if (leadId) {
    await pool.query(
      `UPDATE leads_vivanet SET gateway_status = $1, gateway_resposta = $2, cliente_id = $3, gateway_lead_id = $4, atualizado_em = now() WHERE id = $5`,
      [resultado, JSON.stringify(dados).slice(0, 2000), dados.cliente_id ?? null, dados.lead_id ?? null, leadId],
    ).catch((e) => console.error('[DB GATEWAY]', e))
  }

  if (resultado === 'invalido') {
    const mensagens: Record<string, string> = {
      sem_cobertura: 'Ainda não atendemos esse endereço. Confira o CEP e o bairro.',
      plano_invalido: 'Esse plano não está disponível para o seu endereço.',
      vencimento_invalido: 'Esse dia de vencimento não está disponível.',
      cpf_invalido: 'CPF inválido. Confira os números.',
      cnpj_invalido: 'CNPJ inválido. Confira os números.',
      email_invalido: 'E-mail inválido. Use só letras sem acento, números e @.',
      nome_incompleto: 'Informe o nome completo.',
    }
    return NextResponse.json(
      { status: 'error', code: dados.erro, message: mensagens[dados.erro] ?? 'Confira os dados e tente novamente.' },
      { status: 422 },
    )
  }

  // ── 3. Conversão (Meta CAPI + GA4 MP), com o mesmo event_id do navegador
  const partes = nome.trim().split(' ')
  void sendCAPIEvent({
    eventName: 'CompleteRegistration',
    eventId: `viva_submit_${leadId ?? session_id ?? Date.now()}`,
    userData: {
      email: email.trim().toLowerCase(),
      phone: celular ? `55${celular.replace(/\D/g, '')}` : undefined,
      firstName: partes[0],
      lastName: partes.length > 1 ? partes[partes.length - 1] : undefined,
      city: cidade_cobertura || cidade,
      state: uf,
      zipCode: cep,
      country: 'br',
      clientIpAddress: client_ip_address,
      clientUserAgent: client_user_agent,
      fbp,
    },
    customData: {
      contentName: plano,
      contentCategory: `${cidade_cobertura} – ${bairro_cobertura}`,
      value: valor,
      currency: 'BRL',
      status: resultado === 'criado' ? 'success' : 'pending',
    },
  })
  void sendGA4Event({
    clientId: ga_client_id ?? session_id ?? String(leadId),
    eventName: 'conversion',
    params: {
      lead_id: leadId ?? 0,
      viva_plano: velocidade,
      viva_cidade: cidade_cobertura,
      viva_bairro: bairro_cobertura,
      sgp_status: resultado,
      value: valor ?? 0,
      currency: 'BRL',
    },
  })

  return NextResponse.json({ status: 'success', cliente_id: dados.cliente_id ?? null })
}
