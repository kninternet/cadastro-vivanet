-- Funil do formulário de cadastro da Viva Net (uma linha por sessão de preenchimento).
-- O cadastro em si (regras, SGP e cópia ao atendimento) fica no sgp-gateway (vivanet.cadastros).
CREATE TABLE IF NOT EXISTS leads_vivanet (
  id                      serial PRIMARY KEY,
  session_id              text,
  step_atual              int NOT NULL DEFAULT 1,
  origem                  text DEFAULT 'web',
  -- etapa 1
  nome                    text,
  email                   text,
  whatsapp                text,
  utm_source text, utm_medium text, utm_campaign text, utm_content text, utm_term text,
  -- etapa 2
  cpf                     text,
  cidade_cobertura        text,
  bairro_cobertura        text,
  plano_velocidade        text,
  plano_preco             text,
  vencimento              text,
  aceita_taxa_instalacao  boolean,
  -- etapa 3
  cep text, logradouro text, numero text, complemento text,
  bairro_endereco text, cidade_endereco text, estado text,
  -- resultado no gateway: criado | documento_existente | recusado_sgp | invalido
  gateway_status          text,
  gateway_resposta        text,
  gateway_lead_id         int,
  cliente_id              int,
  criado_em               timestamptz NOT NULL DEFAULT now(),
  atualizado_em           timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS leads_vivanet_criado ON leads_vivanet (criado_em DESC);
