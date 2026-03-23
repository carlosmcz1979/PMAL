'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { consultarCNPJ, getRiskColor, getRiskLabel } from '@/lib/integrations/redesim'
import { RedeSIMConsultaResult } from '@/lib/integrations/types'
import Link from 'next/link'
import {
  Activity,
  Building2,
  Hash,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  Save,
  Search,
  Shield,
  CheckCircle,
  AlertTriangle,
  X,
  ArrowLeft,
  Loader2,
} from 'lucide-react'

// ────────────────────────────────────────────
// Toast
// ────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  return (
    <div
      className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg animate-fade-in"
      style={{ background: type === 'success' ? 'var(--success)' : 'var(--danger)', color: 'white', minWidth: 280, maxWidth: 420 }}
    >
      {type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
      <span className="text-sm font-medium flex-1">{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}><X size={16} /></button>
    </div>
  )
}

// ────────────────────────────────────────────
// Validação de CNPJ
// ────────────────────────────────────────────
function formatCNPJ(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14)
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

// ────────────────────────────────────────────
// Campo reutilizável (fora do componente para evitar re-mount)
// ────────────────────────────────────────────
function FormField({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  required = false,
  type = 'text',
  disabled = false,
  isTextarea = false,
}: {
  label: string
  icon: any
  value: string
  onChange: (v: string) => void
  placeholder: string
  required?: boolean
  type?: string
  disabled?: boolean
  isTextarea?: boolean
}) {
  return (
    <div>
      <label className="input-label">
        {label}
        {required && <span style={{ color: 'var(--danger)' }}> *</span>}
      </label>
      <div className="relative">
        <Icon
          size={18}
          className={`absolute left-3 ${isTextarea ? 'top-3' : 'top-1/2 -translate-y-1/2'}`}
          style={{ color: 'var(--text-muted)' }}
        />
        {isTextarea ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="input-premium"
            style={{ paddingLeft: '2.75rem', minHeight: 80, resize: 'vertical' }}
            placeholder={placeholder}
            disabled={disabled}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="input-premium"
            style={{ paddingLeft: '2.75rem' }}
            placeholder={placeholder}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────
// Componente Principal
// ────────────────────────────────────────────
export default function NovoEstabelecimentoContribuinte() {
  const router = useRouter()

  // Form
  const [cnpj, setCnpj] = useState('')
  const [nome, setNome] = useState('')
  const [endereco, setEndereco] = useState('')
  const [tipoAtividade, setTipoAtividade] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')

  // Controles
  const [consultando, setConsultando] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [consultaResult, setConsultaResult] = useState<RedeSIMConsultaResult | null>(null)
  const [cnpjConsultado, setCnpjConsultado] = useState(false)

  // ── Consulta CNPJ ────────────────────────────────
  const handleConsultarCNPJ = async () => {
    const digits = cnpj.replace(/\D/g, '')
    if (digits.length !== 14) {
      setToast({ message: 'Digite um CNPJ válido com 14 dígitos.', type: 'error' })
      return
    }

    setConsultando(true)
    setConsultaResult(null)
    setCnpjConsultado(false)

    try {
      const result = await consultarCNPJ(digits)
      setConsultaResult(result)
      setCnpjConsultado(true)

      // Preenche campos automaticamente
      if (result.razaoSocial) setNome(result.razaoSocial)
      if (result.endereco && result.endereco !== 'Endereco nao disponivel') {
        setEndereco(`${result.endereco} - ${result.municipio}/${result.uf}`)
      }
      if (result.descricaoCnae) setTipoAtividade(result.descricaoCnae)

      setToast({ message: 'Dados carregados via RedeSIM!', type: 'success' })
    } catch {
      setToast({ message: 'Erro ao consultar CNPJ. Preencha manualmente.', type: 'error' })
    }

    setConsultando(false)
  }

  // Autodetecta CNPJ completo
  useEffect(() => {
    const digits = cnpj.replace(/\D/g, '')
    if (digits.length === 14 && !cnpjConsultado) {
      handleConsultarCNPJ()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cnpj])

  // ── Validação do formulário ──────────────────────
  const isFormValid =
    cnpj.replace(/\D/g, '').length === 14 &&
    nome.trim().length >= 2 &&
    endereco.trim().length >= 5

  // ── Salvar ───────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setToast({ message: 'Sessão expirada. Faça login novamente.', type: 'error' })
        setSaving(false)
        return
      }

      // Verifica se CNPJ já está cadastrado
      const { data: existing } = await supabase
        .from('estabelecimentos')
        .select('id')
        .eq('cnpj', cnpj.replace(/\D/g, ''))
        .single()

      if (existing) {
        setToast({ message: 'Este CNPJ já está cadastrado no sistema.', type: 'error' })
        setSaving(false)
        return
      }

      // Salva no banco
      const { data, error } = await supabase
        .from('estabelecimentos')
        .insert({
          cnpj: cnpj.replace(/\D/g, ''),
          nome: nome.trim(),
          endereco: endereco.trim(),
          tipo_atividade: tipoAtividade.trim(),
          telefone: telefone.trim(),
          email: email.trim().toLowerCase(),
          user_id: user.id,
        })
        .select('id')
        .single()

      if (error) {
        setToast({ message: `Erro ao salvar: ${error.message}`, type: 'error' })
        setSaving(false)
        return
      }

      setToast({ message: 'Estabelecimento cadastrado com sucesso!', type: 'success' })

      // Redireciona para solicitar licença
      setTimeout(() => {
        if (data?.id) {
          router.push(`/contribuinte/dashboard`)
        }
      }, 1500)
    } catch {
      setToast({ message: 'Erro inesperado. Tente novamente.', type: 'error' })
      setSaving(false)
    }
  }


  // ── Render ───────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <header
        className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between"
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: 40, height: 40, background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))' }}
          >
            <Activity size={22} color="white" />
          </div>
          <div>
            <h1 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Portal do Contribuinte</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>VISA Maceió</p>
          </div>
        </div>
        <Link
          href="/contribuinte/dashboard"
          className="btn-secondary text-sm"
          style={{ textDecoration: 'none', padding: '0.5rem 1rem' }}
        >
          <ArrowLeft size={16} />
          Voltar
        </Link>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Título */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Cadastrar Estabelecimento
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Informe o CNPJ para preencher automaticamente os dados via RedeSIM
          </p>
        </div>

        <form onSubmit={handleSave}>
          {/* Card CNPJ — Destaque */}
          <div
            className="glass-card-static p-6 mb-6"
            style={{
              border: consultaResult
                ? `2px solid ${getRiskColor(consultaResult.riskLevel)}30`
                : '2px solid var(--border-default)',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Search size={18} style={{ color: 'var(--primary-400)' }} />
              <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--primary-400)' }}>
                Consulta CNPJ
              </h3>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  value={cnpj}
                  onChange={(e) => {
                    setCnpj(formatCNPJ(e.target.value))
                    setCnpjConsultado(false)
                    setConsultaResult(null)
                  }}
                  className="input-premium"
                  style={{ paddingLeft: '2.75rem', fontSize: '1.1rem', fontWeight: 600 }}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
              </div>
              <button
                type="button"
                onClick={handleConsultarCNPJ}
                disabled={consultando || cnpj.replace(/\D/g, '').length !== 14}
                className="btn-primary"
                style={{ whiteSpace: 'nowrap', width: 'auto', opacity: cnpj.replace(/\D/g, '').length !== 14 ? 0.5 : 1 }}
              >
                {consultando ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                Consultar
              </button>
            </div>

            {/* Resultado RedeSIM */}
            {consultaResult && (
              <div className="mt-4 animate-fade-in">
                <div
                  className="p-4 rounded-xl"
                  style={{
                    background: 'rgba(20, 184, 166, 0.06)',
                    border: '1px solid rgba(20, 184, 166, 0.15)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Shield size={16} style={{ color: 'var(--primary-400)' }} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--primary-400)' }}>
                      Resultado RedeSIM
                    </span>
                    <span
                      className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{
                        background: `${getRiskColor(consultaResult.riskLevel)}20`,
                        color: getRiskColor(consultaResult.riskLevel),
                      }}
                    >
                      Risco {getRiskLabel(consultaResult.riskLevel)}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Razão Social</span>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{consultaResult.razaoSocial}</p>
                    </div>
                    <div>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Situação</span>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{consultaResult.situacaoCadastral}</p>
                    </div>
                    <div>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>CNAE</span>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{consultaResult.descricaoCnae}</p>
                    </div>
                    <div>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Município</span>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{consultaResult.municipio}/{consultaResult.uf}</p>
                    </div>
                  </div>
                  {consultaResult.autoLicensing && (
                    <div
                      className="mt-3 p-2.5 rounded-lg flex items-center gap-2 text-sm font-medium"
                      style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: '#34d399',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                      }}
                    >
                      <CheckCircle size={16} />
                      Atividade de baixo risco — Licenciamento automático disponível
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Card Dados */}
          <div className="glass-card-static p-6 space-y-5 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Building2 size={18} style={{ color: 'var(--text-muted)' }} />
              <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Dados do Estabelecimento
              </h3>
            </div>

            <FormField
              label="Nome / Razão Social"
              icon={Building2}
              value={nome}
              onChange={setNome}
              placeholder="Nome do estabelecimento"
              required
            />

            <FormField
              label="Email de Contato"
              icon={Mail}
              value={email}
              onChange={setEmail}
              placeholder="contato@empresa.com"
              type="email"
            />

            <FormField
              label="Telefone"
              icon={Phone}
              value={telefone}
              onChange={(v) => setTelefone(formatPhone(v))}
              placeholder="(82) 99999-9999"
              type="tel"
            />

            <FormField
              label="Tipo de Atividade / CNAE"
              icon={Briefcase}
              value={tipoAtividade}
              onChange={setTipoAtividade}
              placeholder="Ex: Restaurante, Farmácia, Clínica..."
            />

            <FormField
              label="Endereço Completo"
              icon={MapPin}
              value={endereco}
              onChange={setEndereco}
              placeholder="Rua, número, bairro, CEP..."
              required
              isTextarea
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving || !isFormValid}
              className="btn-primary flex-1"
              style={{
                padding: '0.875rem 1.5rem',
                fontSize: '1rem',
                opacity: !isFormValid ? 0.5 : 1,
              }}
            >
              {saving ? (
                <span className="flex items-center gap-2 justify-center">
                  <Loader2 size={18} className="animate-spin" />
                  Salvando...
                </span>
              ) : (
                <span className="flex items-center gap-2 justify-center">
                  <Save size={18} />
                  Cadastrar Estabelecimento
                </span>
              )}
            </button>
            <Link
              href="/contribuinte/dashboard"
              className="btn-secondary"
              style={{ textDecoration: 'none', padding: '0.875rem 1.5rem' }}
            >
              Cancelar
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
