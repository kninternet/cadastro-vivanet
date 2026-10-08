/**
 * Pré-preenchimento a partir de links do site (ex.: ?cidade=sao-goncalo&bairro=tribobo&plano=350&vencimento=10).
 * Só aplica combinações que existem em DATA.
 */
export const CIDADE_SLUG_TO_NOME: Record<string, string> = { "sao-goncalo": "São Gonçalo" }

export const BAIRRO_SLUG_TO_NOME: Record<string, string> = {
  "nova-grecia": "Nova Grécia",
  "tribobo": "Tribobó",
}

export const PLANO_SLUG_TO_VELOCIDADE_PRECO: Record<string, { velocidade: number; preco: number }> = {
  "350": { velocidade: 350, preco: 120 },
  "450": { velocidade: 450, preco: 150 },
  "600": { velocidade: 600, preco: 170 },
  "800": { velocidade: 800, preco: 200 },
}

export function formatPlanoKey(velocidade: number, preco: number): string {
  return `${velocidade}MB - R$ ${preco.toFixed(2).replace(".", ",")}`
}
