import { NextResponse } from 'next/server'
import { gateway } from '@/lib/gateway'

/** CEP → endereço + cobertura, pela mesma regra do Vitor (gateway). */
export async function GET(request: Request) {
  const cep = new URL(request.url).searchParams.get('cep')?.replace(/\D/g, '') ?? ''
  if (cep.length !== 8) return NextResponse.json({ error: 'cep_invalido' }, { status: 400 })
  try {
    const { dados } = await gateway<Record<string, any>>('/v1/cobertura', { cep }, 10000)
    const e = dados.endereco
    if (!e) return NextResponse.json({ error: dados.motivo ?? 'cep_nao_encontrado' }, { status: 404 })
    return NextResponse.json({
      cep: e.cep, logradouro: e.logradouro, bairro: e.bairro, cidade: e.cidade, uf: e.uf,
      atende: dados.atende === true, motivo: dados.motivo ?? null,
    })
  } catch {
    return NextResponse.json({ error: 'indisponivel' }, { status: 503 })
  }
}
