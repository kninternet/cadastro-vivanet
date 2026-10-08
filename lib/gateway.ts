/**
 * Chamadas ao sgp-gateway (somente no servidor). A chave do canal "formulario" fica no .env
 * e nunca vai para o navegador.
 */
import 'server-only'

const BASE = process.env.GATEWAY_URL ?? 'http://177.86.157.241:3200'

export interface RespostaGateway<T = Record<string, unknown>> {
  status: number
  dados: T
}

export async function gateway<T = Record<string, unknown>>(rota: string, corpo: unknown, timeoutMs = 20000): Promise<RespostaGateway<T>> {
  const chave = process.env.GATEWAY_KEY
  if (!chave) throw new Error('GATEWAY_KEY não configurada')
  const res = await fetch(`${BASE}${rota}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-gateway-key': chave },
    body: JSON.stringify(corpo),
    signal: AbortSignal.timeout(timeoutMs),
    cache: 'no-store',
  })
  const dados = (await res.json().catch(() => ({}))) as T
  return { status: res.status, dados }
}
