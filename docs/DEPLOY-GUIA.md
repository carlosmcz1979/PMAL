# 🚀 Guia de Deploy — VISA Maceió

## Visão Geral

| Item | Valor |
|---|---|
| **Aplicação** | Next.js 16 |
| **Hospedagem** | Vercel (Free/Pro) |
| **Banco** | Supabase (Postgres) |
| **Domínio** | visa.maceio.al.gov.br |
| **SSL** | Automático via Vercel |
| **Email** | Supabase Auth (SMTP) |

---

## Pré-requisitos

- [ ] Conta no [Vercel](https://vercel.com) (GitHub login)
- [ ] Conta no [Supabase](https://supabase.com) (projeto já criado)
- [ ] Repositório no GitHub
- [ ] Acesso ao DNS de `maceio.al.gov.br` (TI da prefeitura)

---

## FASE 1 — Preparar o Projeto

### 1.1. Garantir que o build funciona

```bash
cd sistema-licenciamento
npm run build
```

> Se der erro, corrija antes de continuar. O Vercel roda `npm run build` no deploy.

### 1.2. Criar arquivo `.env.production`

> ⚠️ **NÃO** commite este arquivo. Ele é só referência, as variáveis vão no Vercel.

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...sua_chave_service_role
```

### 1.3. Adicionar ao `.gitignore`

```
.env.production
.env.local
```

### 1.4. Commit e Push

```bash
git add .
git commit -m "chore: preparar para deploy produção"
git push origin main
```

---

## FASE 2 — Deploy no Vercel

### 2.1. Importar Projeto

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Clique **Import Git Repository**
3. Selecione o repositório `sistema-licenciamento`
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (ou `sistema-licenciamento` se for monorepo)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 2.2. Variáveis de Ambiente

Na tela de import, clique em **Environment Variables** e adicione:

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://SEU_PROJETO.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sua anon key |

> [!CAUTION]
> **NUNCA** adicione a `SUPABASE_SERVICE_ROLE_KEY` como `NEXT_PUBLIC_`. Ela só deve ser usada no server-side.

### 2.3. Deploy

Clique **Deploy**. O Vercel vai:
1. Clonar o repositório
2. Rodar `npm install`
3. Rodar `npm run build`
4. Publicar em `https://sistema-licenciamento-XXXX.vercel.app`

> O primeiro deploy leva 2–5 minutos. Após isso, cada push no `main` faz deploy automático.

---

## FASE 3 — Domínio Personalizado

### 3.1. Adicionar domínio no Vercel

1. No dashboard do Vercel, vá em **Settings → Domains**
2. Digite: `visa.maceio.al.gov.br`
3. Clique **Add**
4. O Vercel mostrará os registros DNS necessários

### 3.2. Configurar DNS (TI da Prefeitura)

Solicite à equipe de TI da Prefeitura que adicione os registros DNS:

**Opção A: CNAME (Recomendado)**
```
Tipo:   CNAME
Nome:   visa
Valor:  cname.vercel-dns.com
TTL:    3600
```

**Opção B: A Records (se CNAME não funcionar no apex)**
```
Tipo:  A
Nome:  visa
Valor: 76.76.21.21
TTL:   3600
```

### 3.3. SSL/HTTPS

> [!TIP]
> O Vercel gera e renova o certificado SSL **automaticamente** via Let's Encrypt.
> Não precisa configurar nada. Após o DNS propagar (até 48h), o HTTPS já funciona.

### 3.4. Verificar Propagação

```bash
# Testar se DNS propagou
nslookup visa.maceio.al.gov.br

# Ou use o site:
# https://dnschecker.org/#A/visa.maceio.al.gov.br
```

---

## FASE 4 — Configurar Supabase para Produção

### 4.1. URL de Redirect

No Supabase Dashboard:
1. **Authentication → URL Configuration**
2. **Site URL**: `https://visa.maceio.al.gov.br`
3. **Redirect URLs**: adicione:
   - `https://visa.maceio.al.gov.br/**`
   - `https://visa.maceio.al.gov.br/contribuinte/confirmacao`

### 4.2. Email Templates

No Supabase Dashboard:
1. **Authentication → Email Templates**
2. Customize o template de confirmação:

```html
<h2>VISA Maceió — Confirmação de Conta</h2>
<p>Olá!</p>
<p>Clique no link abaixo para confirmar sua conta:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar Email</a></p>
<p>Este link é válido por 24 horas.</p>
<hr>
<p style="color: #999; font-size: 12px;">
  Vigilância Sanitária — Prefeitura de Maceió
</p>
```

### 4.3. RLS — Verificar que está ativo

```sql
-- Verificar RLS ativo em todas as tabelas
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

Todas devem estar com `rowsecurity = true`.

---

## FASE 5 — Modelo de Ofício para TI

Use este modelo para solicitar o subdomínio à TI:

```
OFÍCIO Nº ___/2026 — SECRETARIA DE SAÚDE

À Secretaria de Tecnologia da Informação,

Solicito a criação do subdomínio "visa.maceio.al.gov.br" 
para hospedar o Sistema de Licenciamento Sanitário da 
Vigilância Sanitária Municipal.

CONFIGURAÇÃO DNS NECESSÁRIA:
  Tipo:   CNAME
  Nome:   visa
  Valor:  cname.vercel-dns.com
  TTL:    3600

O certificado SSL será gerado automaticamente pelo 
provedor de hospedagem (Vercel/Let's Encrypt).

Atenciosamente,
[Nome] — Coordenação VISA Maceió
```

---

## Troubleshooting

| Problema | Solução |
|---|---|
| Build falha no Vercel | Rode `npm run build` local primeiro e corrija os erros |
| DNS não propaga | Aguarde até 48h. Verifique em dnschecker.org |
| SSL não gera | DNS precisa estar propagado. Verifique no Vercel Dashboard |
| Login não funciona | Verifique Site URL e Redirect URLs no Supabase |
| Email não chega | Verifique SMTP no Supabase → Authentication → Email |
| 404 nas rotas | Verifique se o framework preset é "Next.js" no Vercel |
| Variáveis undefined | Redeploy após adicionar variáveis (Vercel → Redeploy) |

---

## Checklist Final de Deploy

- [ ] `npm run build` funciona local sem erros
- [ ] Repositório atualizado no GitHub
- [ ] Projeto importado no Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Build do Vercel passou ✅
- [ ] Domínio adicionado no Vercel
- [ ] DNS configurado (CNAME)
- [ ] SSL ativo (HTTPS)
- [ ] Site URL no Supabase atualizada
- [ ] Redirect URLs no Supabase configuradas
- [ ] Email template customizado
- [ ] RLS ativo em todas as tabelas
- [ ] Login funciona em produção
- [ ] Teste de cadastro de contribuinte funciona
- [ ] Teste de criação de estabelecimento funciona
