# STATUS DO MVP — SORRENTINNI × MACEIÓ

**Sistema de Licenciamento Sanitário — VISA Maceió**
Atualizado em: 23/03/2026

---

## 1. RESUMO EXECUTIVO

| Item | Valor |
|---|---|
| **Status Geral** | **~70% completo** |
| **Data de Início** | 21/03/2026 |
| **Data Prevista de Go-Live** | A definir |
| **Equipe** | 1 desenvolvedor |
| **Stack** | Next.js 16, React 19, Supabase (Postgres), Tailwind 4 |

> O MVP contempla Portal Admin funcional com autenticação, CRUD completo de estabelecimentos/licenças/inspeções, painel administrativo com KPIs, integrações governamentais (1 real + 4 simuladas), relatórios com exportação, e geração de PDF. O Portal do Contribuinte ainda não foi iniciado.

---

## 2. MÓDULOS

### 2.1 Portal Admin — 80% completo ✅

#### ✅ Funcionalidades Prontas
| Funcionalidade | Rota | Detalhes |
|---|---|---|
| Login com autenticação | `/login` | Supabase Auth, tela responsiva com branding |
| Registro de usuários | `/register` | Formulário de cadastro |
| Dashboard principal | `/dashboard` | KPIs (estabelecimentos, licenças, pendentes, inspeções), busca, listagem |
| Cadastro de estabelecimento | `/estabelecimento/novo` | Formulário completo com consulta CNPJ via RedeSIM (BrasilAPI) |
| Detalhes do estabelecimento | `/estabelecimento/[id]` | Dados cadastrais + licenças + inspeções vinculadas |
| Solicitar licença sanitária | `/licenca/nova?id=X` | Vinculada ao estabelecimento, gera número automático |
| Gerenciar licenças | `/licenca/gerenciar` | Listagem com filtro (todos/pendentes/aprovadas/rejeitadas), aprovar/rejeitar |
| Nova inspeção | `/inspecao/nova?id=X` | Formulário com tipo, resultado, observações + geração de Auto de Inspeção em PDF |
| Relatórios | `/relatorio` | KPIs consolidados + exportação para Excel (XLSX) |
| Painel administrativo | `/admin` | Estatísticas globais, taxas de aprovação/conformidade, ações rápidas |
| Painel de integrações | `/integracoes` | Status de cada integração (conectada/simulada), links externos |
| Sidebar com navegação | Componente global | 7 links + logout, indicador de rota ativa |
| Layout responsivo | Componente global | Sidebar colapsável em mobile, header com título/subtítulo/ações |

#### 🔨 Funcionalidades em Desenvolvimento
- Edição de estabelecimentos (atualmente somente cadastro)
- Histórico/auditoria de alterações em licenças

#### ❌ Funcionalidades Não Iniciadas
- Gestão de usuários / Perfis de acesso (admin, fiscal, supervisor)
- Notificações push / e-mail
- Renovação automática de licenças
- Alvará sanitário digital com QR Code
- Agenda de vistorias / Calendário de inspeções

---

### 2.2 Portal do Contribuinte — 0% completo ❌

#### ❌ Funcionalidades Não Iniciadas
- Autoatendimento do contribuinte (solicitar licença, acompanhar status)
- Upload de documentos
- Consulta pública de licenças
- Emissão de 2ª via de alvará
- Boleto/guia de pagamento (taxa de licenciamento)

---

### 2.3 Integrações — 40% completo ⚡

| Integração | Status | Tipo | Detalhes |
|---|---|---|---|
| **RedeSIM** | ✅ Conectado | Real | Consulta CNPJ via BrasilAPI + classificação de risco por CNAE |
| **SIAT** | ⚡ Simulado | Mock | Consulta de débitos e certidão negativa (dados fictícios) |
| **SUPE** | ⚡ Simulado | Mock | Geração de guias DAM (dados fictícios) |
| **Facilita AL** | ⚡ Simulado | Mock | Consulta JUCEAL (dados fictícios) |
| **Bombeiros** | ⚡ Simulado | Mock | Consulta AVCB/CLCB (dados fictícios) |

**Bloqueio:** As 4 integrações simuladas dependem de ofícios formais aos órgãos para obtenção de credenciais de API. Modelos de ofício já preparados em `docs/oficios-integracao.md`.

---

## 3. INFRAESTRUTURA

| Item | Detalhes |
|---|---|
| **Cloud** | Supabase (Postgres hospedado) |
| **Banco de Dados** | PostgreSQL via Supabase |
| **Autenticação** | Supabase Auth (email/senha) |
| **Hospedagem** | Vercel (configurado, `.vercel/` presente) |
| **URL Dev** | `http://localhost:3001` |
| **URL Staging** | Não configurado |
| **URL Produção** | Não configurado |
| **Domínio** | Não definido |

### Tabelas no Banco (Supabase)
- `estabelecimentos` — Cadastro de estabelecimentos
- `licencas` — Licenças sanitárias (status: pendente/aprovado/rejeitado)
- `inspecoes` — Inspeções sanitárias (resultado: conforme/não_conforme/pendente)

---

## 4. STACK TÉCNICA

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js | 16.2.1 |
| UI | React | 19.2.4 |
| Estilização | Tailwind CSS | 4.x |
| Backend/Auth | Supabase | 2.99.3 |
| Formulários | React Hook Form | 7.71.2 |
| Validação | Zod | 4.3.6 |
| PDF | jsPDF | 4.2.1 |
| Excel | SheetJS (xlsx) | 0.18.5 |
| Ícones | Lucide React | 0.577.0 |
| State Fetching | TanStack React Query | 5.91.3 |
| Screenshot | html2canvas | 1.4.1 |

---

## 5. CRONOGRAMA

### ✅ Milestones Completados
| Data | Milestone |
|---|---|
| 21/03/2026 | Setup do projeto, autenticação, CRUD básico |
| 21/03/2026 | Integração com RedeSIM + 4 serviços simulados |
| 23/03/2026 | Redesign de 10 páginas, modelos de ofício |

### ⏳ Milestones Pendentes
| Prioridade | Milestone | Estimativa |
|---|---|---|
| 🔴 Alta | Portal do Contribuinte (autoatendimento) | 2-3 semanas |
| 🔴 Alta | Gestão de perfis de acesso (admin/fiscal/supervisor) | 1 semana |
| 🟡 Média | Conectar integrações reais (após obter credenciais) | 1-2 semanas |
| 🟡 Média | Alvará digital com QR Code | 3-5 dias |
| 🟡 Média | Agenda/calendário de inspeções | 1 semana |
| 🟢 Baixa | Deploy para produção (Vercel + domínio) | 1-2 dias |
| 🟢 Baixa | Notificações (email/push) | 1 semana |

---

## 6. RISCOS

| Risco | Impacto | Mitigação |
|---|---|---|
| Credenciais das APIs governamentais | 🔴 Alto | Ofícios já preparados; sistema funciona em modo simulado |
| Ausência do Portal do Contribuinte | 🔴 Alto | Módulo inteiro não iniciado, priorizar no próximo sprint |
| Sem gestão de permissões (RLS) | 🟡 Médio | Qualquer usuário logado pode ver/alterar tudo; implementar roles |
| Sem testes automatizados | 🟡 Médio | Riscos em regressões; planejar suíte de testes |
| Sem ambiente staging | 🟢 Baixo | Criar branch/deploy separado antes de ir para produção |

---

## 7. PRÓXIMOS PASSOS

1. **Enviar ofícios** para obter credenciais de API (SIAT, SUPE, JUCEAL, CBMAL)
2. **Implementar Portal do Contribuinte** — autoatendimento, upload de documentos
3. **Adicionar gestão de perfis** — admin, fiscal, supervisor com RLS no Supabase
4. **Criar alvará digital** com QR Code de validação
5. **Implementar agenda de inspeções** — calendário com agendamento
6. **Configurar deploy** — Vercel com domínio oficial da prefeitura
7. **Adicionar testes** — E2E com Playwright e/ou unitários com Jest
