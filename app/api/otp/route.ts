import { NextResponse } from 'next/server'
import { gateway } from '@/lib/gateway'

/**
 * Código de verificação do e-mail, pelo gateway (código guardado em banco, com validade e
 * limite de tentativas). Não condiciona o cadastro: só registra que o e-mail foi confirmado.
 */
export async function POST(request: Request) {
  const { email } = (await request.json().catch(() => ({}))) as { email?: string }
  if (!email) return NextResponse.json({ error: 'E-mail ausente' }, { status: 400 })
  try {
    const { status, dados } = await gateway<Record<string, any>>('/v1/email/codigo', { email })
    if (status === 429) return NextResponse.json({ error: 'Muitos códigos pedidos. Aguarde alguns minutos.' }, { status: 429 })
    if (status !== 200) return NextResponse.json({ error: 'Não foi possível enviar o código.' }, { status: 502 })
    return NextResponse.json({ ok: true, validade_min: dados.validade_min })
  } catch {
    return NextResponse.json({ error: 'Não foi possível enviar o código.' }, { status: 502 })
  }
}

export async function PUT(request: Request) {
  const { email, code } = (await request.json().catch(() => ({}))) as { email?: string; code?: string }
  if (!email || !code) return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
  try {
    const { dados } = await gateway<Record<string, any>>('/v1/email/verificar', { email, codigo: code })
    if (dados.verificado) return NextResponse.json({ ok: true })
    const msg: Record<string, string> = {
      codigo_incorreto: `Código incorreto.${dados.restantes ? ` Restam ${dados.restantes} tentativa(s).` : ''}`,
      codigo_expirado: 'Código expirado. Toque em reenviar para receber um novo.',
      muitas_tentativas: 'Muitas tentativas. Toque em reenviar para receber um novo código.',
    }
    return NextResponse.json({ error: msg[dados.erro] ?? 'Código inválido.' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Não foi possível verificar agora. Tente de novo.' }, { status: 502 })
  }
}
