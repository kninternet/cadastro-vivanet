/**
 * Área de venda e planos da Viva Net, para montar as telas.
 * A validação final (cobertura pelo CEP, plano, vencimento e taxa) é SEMPRE do gateway,
 * a mesma usada pelo Vitor: se estes dados ficarem desatualizados, o envio é recusado,
 * nunca vendido com regra errada.
 */
export interface Plan {
  v: string // "350MB"
  p: string // "R$ 120,00"
}

export interface CityData {
  vencimentos: string[]
  bairros: Record<string, Plan[]>
}

const planosTribobo: Plan[] = [
  { v: "350MB", p: "R$ 120,00" },
  { v: "450MB", p: "R$ 150,00" },
  { v: "600MB", p: "R$ 170,00" },
  { v: "800MB", p: "R$ 200,00" },
]

// POP 100072 (linha de planos TRIBOBO)
export const DATA: Record<string, CityData> = {
  "São Gonçalo": {
    vencimentos: ["5", "10", "15"],
    bairros: {
      "Nova Grécia": planosTribobo,
      "Tribobó": planosTribobo,
    },
  },
}

export function getVencimentos(cidade: string, _bairro: string): string[] {
  return DATA[cidade]?.vencimentos ?? []
}

/** "350MB" → "350 Mega" (nome do plano no gateway). */
export function nomePlanoGateway(velocidade: string): string {
  const m = /(\d+)/.exec(velocidade)
  return m ? `${m[1]} Mega` : velocidade
}

export interface TaxaInstalacao {
  fixa: number
  incluiMensalidade: boolean
  descricao: string
}

export function getInstalacao(_cidade: string, _bairro: string, _planoPreco?: string): TaxaInstalacao {
  return { fixa: 160, incluiMensalidade: false, descricao: "R$ 160,00" }
}
