'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import {
  Activity,
  FileCheck,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Building2,
  Calendar,
  MapPin,
  AlertTriangle,
  LogOut,
  ClipboardList,
} from 'lucide-react'

// ────────────────────────────────────────────
// Tipos
// ────────────────────────────────────────────
interface Licenca {
  id: string
  numero_licenca: string
  status: string
  tipo: string
  data_solicitacao: string
  data_aprovacao: string | null
  data_validade: string | null
  observacoes: string | null
  estabelecimento_id: string
  estabelecimento?: {
    id: string
    nome: string
    cnpj: string
    endereco: string
    tipo_atividade: string
  }
}

// ────────────────────────────────────────────
// Configuração de Status
// ────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any; description: string }> = {
  pendente: {
    label: 'Pendente',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    icon: Clock,
    description: 'Sua solicitação foi recebida e aguarda análise pela equipe da Vigilância Sanitária.',
  },
  em_analise: {
    label: 'Em Análise',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.1)',
    icon: Eye,
    description: 'Sua solicitação está sendo analisada por um fiscal.',
  },
  aprovado: {
    label: 'Aprovada',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.1)',
    icon: CheckCircle,
    description: 'Sua licença foi aprovada! Você pode fazer o download abaixo.',
  },
  rejeitado: {
    label: 'Rejeitada',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    icon: XCircle,
    description: 'Sua solicitação foi rejeitada. Verifique o motivo abaixo.',
  },
}

// ────────────────────────────────────────────
// Timeline Step
// ────────────────────────────────────────────
function TimelineStep({ date, label, active, last }: { date: string | null; label: string; active: boolean; last?: boolean }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className="rounded-full flex-shrink-0"
          style={{
            width: 12,
            height: 12,
            background: active ? 'var(--primary-500)' : 'var(--border-default)',
            border: active ? '2px solid var(--primary-400)' : '2px solid var(--border-default)',
          }}
        />
        {!last && (
          <div
            className="flex-1"
            style={{ width: 2, minHeight: 24, background: active ? 'var(--primary-700)' : 'var(--border-default)' }}
          />
        )}
      </div>
      <div className="pb-4">
        <p className="text-sm font-medium" style={{ color: active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
          {label}
        </p>
        {date && (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────
// Card de Solicitação
// ────────────────────────────────────────────
function SolicitacaoCard({ licenca }: { licenca: Licenca }) {
  const [expanded, setExpanded] = useState(false)
  const config = STATUS_CONFIG[licenca.status] || STATUS_CONFIG.pendente
  const Icon = config.icon
  const est = licenca.estabelecimento

  const timelineSteps = [
    { label: 'Solicitação enviada', date: licenca.data_solicitacao, active: true },
    { label: 'Em análise', date: licenca.status !== 'pendente' ? licenca.data_solicitacao : null, active: ['em_analise', 'aprovado', 'rejeitado'].includes(licenca.status) },
    {
      label: licenca.status === 'rejeitado' ? 'Rejeitada' : 'Aprovada',
      date: licenca.data_aprovacao,
      active: ['aprovado', 'rejeitado'].includes(licenca.status),
    },
  ]

  return (
    <div
      className="glass-card-static overflow-hidden transition-all"
      style={{ border: `1px solid ${expanded ? config.color + '30' : 'var(--border-default)'}` }}
    >
      {/* Header clickable */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center gap-4 text-left"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        {/* Status icon */}
        <div
          className="flex items-center justify-center rounded-xl flex-shrink-0"
          style={{ width: 48, height: 48, background: config.bg, border: `1px solid ${config.color}30` }}
        >
          <Icon size={22} style={{ color: config.color }} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              {est?.nome || 'Estabelecimento'}
            </h3>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: config.bg, color: config.color }}
            >
              {config.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs flex-wrap" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1">
              <FileCheck size={12} />
              {licenca.numero_licenca || `#${licenca.id.substring(0, 8)}`}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(licenca.data_solicitacao).toLocaleDateString('pt-BR')}
            </span>
            {est?.cnpj && (
              <span className="hidden sm:flex items-center gap-1">
                <Building2 size={12} />
                CNPJ: {est.cnpj}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {licenca.status === 'aprovado' && (
            <span
              className="hidden sm:inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg"
              style={{ background: 'var(--primary-700)', color: 'white', cursor: 'pointer' }}
              onClick={(e) => { e.stopPropagation() }}
              title="Baixar licença"
            >
              <Download size={14} />
              Baixar
            </span>
          )}
          {expanded ? <ChevronUp size={18} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />}
        </div>
      </button>

      {/* Conteúdo expandido */}
      {expanded && (
        <div className="px-5 pb-5 animate-fade-in" style={{ borderTop: '1px solid var(--border-default)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
            {/* Coluna 1: Timeline */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
                Movimentações
              </h4>
              <div>
                {timelineSteps.map((step, i) => (
                  <TimelineStep key={i} {...step} last={i === timelineSteps.length - 1} />
                ))}
              </div>

              {/* Status description */}
              <div
                className="p-3 rounded-lg mt-2 text-sm"
                style={{ background: config.bg, color: config.color, border: `1px solid ${config.color}20` }}
              >
                <Icon size={14} className="inline mr-1.5" style={{ verticalAlign: 'text-bottom' }} />
                {config.description}
              </div>

              {/* Motivo de rejeição */}
              {licenca.status === 'rejeitado' && licenca.observacoes && (
                <div
                  className="p-3 rounded-lg mt-3 text-sm"
                  style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
                >
                  <p className="font-semibold mb-1 flex items-center gap-1.5" style={{ color: '#f87171' }}>
                    <AlertTriangle size={14} />
                    Motivo da Rejeição
                  </p>
                  <p style={{ color: 'var(--text-secondary)' }}>{licenca.observacoes}</p>
                </div>
              )}
            </div>

            {/* Coluna 2: Dados do estabelecimento */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
                Dados do Estabelecimento
              </h4>
              {est ? (
                <div className="space-y-3">
                  {[
                    { label: 'Razão Social', value: est.nome, icon: Building2 },
                    { label: 'CNPJ', value: est.cnpj, icon: FileCheck },
                    { label: 'Atividade', value: est.tipo_atividade, icon: ClipboardList },
                    { label: 'Endereço', value: est.endereco, icon: MapPin },
                  ].map(item => item.value ? (
                    <div key={item.label} className="flex items-start gap-2">
                      <item.icon size={14} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />
                      <div>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                      </div>
                    </div>
                  ) : null)}

                  {licenca.data_validade && (
                    <div className="flex items-start gap-2">
                      <Calendar size={14} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />
                      <div>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Validade</p>
                        <p className="text-sm font-medium" style={{ color: 'var(--success)' }}>
                          {new Date(licenca.data_validade).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Dados não disponíveis</p>
              )}

              {/* Botão de download se aprovada */}
              {licenca.status === 'aprovado' && (
                <button
                  className="btn-primary w-full mt-4"
                  style={{ padding: '0.75rem' }}
                  onClick={() => {}}
                >
                  <Download size={16} />
                  Baixar Licença Sanitária
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ────────────────────────────────────────────
// Página Principal
// ────────────────────────────────────────────
export default function SolicitacoesContribuinte() {
  const router = useRouter()
  const [licencas, setLicencas] = useState<Licenca[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')

  // Filtros
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserEmail(user.email || '')

      // Busca estabelecimentos do contribuinte
      const { data: est } = await supabase
        .from('estabelecimentos')
        .select('id, nome, cnpj, endereco, tipo_atividade')
        .eq('user_id', user.id)

      if (!est || est.length === 0) {
        setLoading(false)
        return
      }

      // Busca licenças vinculadas aos estabelecimentos
      const { data: lics } = await supabase
        .from('licencas')
        .select('*')
        .in('estabelecimento_id', est.map(e => e.id))
        .order('data_solicitacao', { ascending: false })

      if (lics) {
        // Enriquece com dados do estabelecimento
        const enriched = lics.map(lic => ({
          ...lic,
          estabelecimento: est.find(e => e.id === lic.estabelecimento_id),
        }))
        setLicencas(enriched)
      }

      setLoading(false)
    }

    fetchData()

    // Realtime: escuta mudanças na tabela licenças
    const channel = supabase
      .channel('licencas-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'licencas' }, () => {
        fetchData() // Recarrega ao detectar mudança
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [router])

  // Filtrar
  const filtered = licencas.filter(l => {
    if (filterStatus !== 'todos' && l.status !== filterStatus) return false
    if (search) {
      const s = search.toLowerCase()
      const nome = l.estabelecimento?.nome?.toLowerCase() || ''
      const numero = (l.numero_licenca || l.id).toLowerCase()
      if (!nome.includes(s) && !numero.includes(s)) return false
    }
    return true
  })

  // Contadores
  const counts = {
    total: licencas.length,
    pendente: licencas.filter(l => l.status === 'pendente').length,
    em_analise: licencas.filter(l => l.status === 'em_analise').length,
    aprovado: licencas.filter(l => l.status === 'aprovado').length,
    rejeitado: licencas.filter(l => l.status === 'rejeitado').length,
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
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
          <div className="flex items-center justify-center rounded-xl" style={{ width: 40, height: 40, background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))' }}>
            <Activity size={22} color="white" />
          </div>
          <div>
            <h1 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Portal do Contribuinte</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{userEmail}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/contribuinte/dashboard"
            className="btn-secondary text-sm"
            style={{ textDecoration: 'none', padding: '0.5rem 1rem' }}
          >
            <ArrowLeft size={16} />
            Meus Estabelecimentos
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg"
            style={{ background: 'none', border: '1px solid var(--border-default)', cursor: 'pointer', color: 'var(--text-muted)' }}
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Minhas Solicitações
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Acompanhe o status das suas licenças sanitárias em tempo real
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-pulse-glow rounded-full" style={{ width: 48, height: 48, background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))' }} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { key: 'todos', label: 'Total', value: counts.total, color: '#0d9488' },
                { key: 'pendente', label: 'Pendentes', value: counts.pendente, color: '#f59e0b' },
                { key: 'em_analise', label: 'Em Análise', value: counts.em_analise, color: '#3b82f6' },
                { key: 'aprovado', label: 'Aprovadas', value: counts.aprovado, color: '#10b981' },
                { key: 'rejeitado', label: 'Rejeitadas', value: counts.rejeitado, color: '#ef4444' },
              ].map(kpi => (
                <button
                  key={kpi.key}
                  onClick={() => setFilterStatus(kpi.key)}
                  className="p-3 rounded-xl text-center transition-all"
                  style={{
                    background: filterStatus === kpi.key ? `${kpi.color}15` : 'var(--bg-card)',
                    border: `2px solid ${filterStatus === kpi.key ? kpi.color : 'var(--border-default)'}`,
                    cursor: 'pointer',
                  }}
                >
                  <p className="text-lg font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{kpi.label}</p>
                </button>
              ))}
            </div>

            {/* Busca */}
            <div className="glass-card-static p-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Buscar por nome ou protocolo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-premium"
                  style={{ paddingLeft: '2.5rem', fontSize: '0.875rem' }}
                />
              </div>
            </div>

            {/* Lista de solicitações */}
            {filtered.length === 0 ? (
              <div className="glass-card-static p-12 text-center">
                <FileCheck size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {licencas.length === 0
                    ? 'Nenhuma solicitação encontrada'
                    : 'Nenhum resultado para os filtros aplicados'}
                </h3>
                <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                  {licencas.length === 0
                    ? 'Cadastre um estabelecimento e solicite sua primeira licença.'
                    : 'Tente alterar os filtros para ver mais resultados.'}
                </p>
                {licencas.length === 0 && (
                  <Link
                    href="/contribuinte/estabelecimento/novo"
                    className="btn-primary inline-flex items-center gap-2"
                    style={{ textDecoration: 'none', padding: '0.75rem 1.5rem' }}
                  >
                    <Building2 size={18} />
                    Cadastrar Estabelecimento
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(lic => (
                  <SolicitacaoCard key={lic.id} licenca={lic} />
                ))}
              </div>
            )}

            {/* Realtime badge */}
            <div className="text-center">
              <span className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(16,185,129,0.08)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--success)' }} />
                Atualizações em tempo real ativas
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
