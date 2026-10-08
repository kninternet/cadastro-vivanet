import { NextResponse } from 'next/server'
import { gateway } from '@/lib/gateway'

/** Avisa se o CPF/CNPJ já é cliente da Viva Net (o SGP é o árbitro final no envio). */
export async function GET(request: Request) {
  const doc = new URL(request.url).searchParams.get('cpf')?.replace(/\D/g, '') ?? ''
  if (doc.length !== 11 && doc.length !== 14) return NextResponse.json({ found: false })
  try {
    const { status, dados } = await gateway<Record<string, any>>('/v1/identificar', { cpfcnpj: doc }, 10000)
    if (status !== 200) return NextResponse.json({ found: false })
    const found = (Array.isArray(dados.clientes) && dados.clientes.length > 0) || Boolean(dados.cadastro)
    return NextResponse.json({ found })
  } catch {
    return NextResponse.json({ found: false })
  }
}
