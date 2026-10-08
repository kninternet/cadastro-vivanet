# cadastro-vivanet

Formulário de cadastro da Viva Net (`cadastro.vivanettelecom.com.br`), derivado do `pre-cadastro` da KN.

- **Regras de venda** (cobertura pelo CEP, planos, vencimentos 5/10/15, taxa R$ 160, CPF/CNPJ): no **sgp-gateway**, canal `formulario` — as mesmas do Vitor. `lib/data.ts` só monta as telas.
- **Envio**: `/api/submit` → gateway `/v1/cadastro` (origem `formulario`). O gateway cria o cliente no CRM do SGP e envia a cópia ao atendimento@ (aguarda 45 s pela confirmação do e-mail).
- **Código de e-mail**: `/api/otp` → gateway `/v1/email/codigo` e `/v1/email/verificar`. Não bloqueia o cadastro.
- **Funil**: tabela `leads_vivanet` (`sql/001_leads_vivanet.sql`), com UTMs.
- **Medição**: Meta Pixel `2038106976890187` e GA4 `G-EPW5K28HVN` (gtag.js, Consent Mode v2); CAPI e Measurement Protocol no servidor, se os tokens estiverem no `.env`.
- **Privacidade**: `/privacidade` redireciona para `vivanettelecom.com.br/privacidade.html`.
- **Pré-preenchimento por link**: `?cidade=sao-goncalo&bairro=tribobo&plano=350&vencimento=10` (e `nome`, `email`, `whatsapp`, `cpf`, `utm_*`).

## Rodar em produção (.241)

```bash
pnpm install && pnpm build
PORT=3010 pm2 start pnpm --name vivanet-cadastro -- start && pm2 save
```

Variáveis: ver `.env.example`.
