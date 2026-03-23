'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'
import {
  History,
  Filter,
  Download,
  Plus,
  Pencil,
  Trash2,
  User,
  Calendar,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react'

// ────────────────────────────────────────────
// Tipos
// ────────────────────────────────────────────
interface AuditEntry {
  id: string
  tabela: string
  registro_id: string
  usuario_id: string | null
  acao: 'CREATE' | 'UPDATE' | 'DELETE'
  dados_antigos: Record<string, any> | null
  dados_novos: Record<string, any> | null
  data_hora: string
}

// Campos legíveis para exibição
const FIELD_LABELS: Record<string, string> = {
  nome: 'Nome',
  cnpj: 'CNPJ',
  endereco: 'Endereço',
  telefone: 'Telefone',
  email: 'Email',
  tipo_atividade: 'Tipo de Atividade',
  status: 'Status',
  numero_licenca: 'Nº Licença',
  observacoes: 'Observações',
  data_inspecao: 'Data Inspeção',
  tipo_inspecao: 'Tipo Inspeção',
  resultado: 'Resultado',
  data_solicitacao: 'Data Solicitação',
}

// Campos que devem ser ignorados no diff
const IGNORED_FIELDS = ['id', 'user_id', 'created_at', 'updated_at', 'estabelecimento_id']

// ────────────────────────────────────────────
// Utilitários
// ────────────────────────────────────────────
function getActionConfig(acao: string) {
  switch (acao) {
    case 'CREATE':
      return {
        label: 'Criação',
        icon: Plus,
        color: 'var(--success)',
        bg: 'rgba(16, 185, 129, 0.1)',
        border: 'rgba(16, 185, 129, 0.2)',
      }
    case 'UPDATE':
      return {
        label: 'Alteração',
        icon: Pencil,
        color: 'var(--warning)',
        bg: 'rgba(245, 158, 11, 0.1)',
        border: 'rgba(245, 158, 11, 0.2)',
      }
    case 'DELETE':
      return {
        label: 'Exclusão',
        icon: Trash2,
        color: 'var(--danger)',
        bg: 'rgba(239, 68, 68, 0.1)',
        border: 'rgba(239, 68, 68, 0.2)',
      }
    default:
      return {
        label: acao,
        icon: History,
        color: 'var(--text-muted)',
        bg: 'var(--bg-input)',
        border: 'var(--border-default)',
      }
  }
}

/** Calcula os campos que mudaram entre dados antigos e novos */
function getDiff(
  antigos: Record<string, any> | null,
  novos: Record<string, any> | null
): { campo: string; de: any; para: any }[] {
  if (!antigos || !novos) return []

  const changes: { campo: string; de: any; para: any }[] = []
  const allKeys = new Set([...Object.keys(antigos), ...Object.keys(novos)])

  for (const key of allKeys) {
    if (IGNORED_FIELDS.includes(key)) continue
    const oldVal = antigos[key]
    const newVal = novos[key]
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes.push({
        campo: FIELD_LABELS[key] || key,
        de: oldVal ?? '—',
        para: newVal ?? '—',
      })
    }
  }

  return changes
}

/** Formata data/hora para exibição */
function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

/** Formata data curta */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR')
}

// ────────────────────────────────────────────
// Componente de entrada expandível
// ────────────────────────────────────────────
function AuditEntryCard({ entry }: { entry: AuditEntry }) {
  const [expanded, setExpanded] = useState(false)
  const config = getActionConfig(entry.acao)
  const Icon = config.icon
  const diff = getDiff(entry.dados_antigos, entry.dados_novos)

  return (
    <div className="glass-card-static overflow-hidden">
      {/* Header clicável */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-5 text-left"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        {/* Ícone da ação */}
        <div
          className="flex items-center justify-center rounded-lg flex-shrink-0"
          style={{
            width: 42,
            height: 42,
            background: config.bg,
            border: `1px solid ${config.border}`,
          }}
        >
          <Icon size={20} style={{ color: config.color }} />
        </div>

        {/* Info principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className="text-sm font-bold"
              style={{ color: config.color }}
            >
              {config.label}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: 'var(--bg-input)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-default)',
              }}
            >
              {entry.tabela}
            </span>
            {entry.acao === 'UPDATE' && diff.length > 0 && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: config.bg,
                  color: config.color,
                }}
              >
                {diff.length} campo{diff.length > 1 ? 's' : ''} alterado{diff.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formatDateTime(entry.data_hora)}
            </span>
            <span className="flex items-center gap-1">
              <User size={12} />
              {entry.usuario_id ? entry.usuario_id.substring(0, 8) + '...' : 'Sistema'}
            </span>
          </div>
        </div>

        {/* Expand toggle */}
        <div style={{ color: 'var(--text-muted)' }}>
          {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </button>

      {/* Detalhes expandidos */}
      {expanded && (
        <div
          className="px-5 pb-5 space-y-4 animate-fade-in"
          style={{ borderTop: '1px solid var(--border-default)' }}
        >
          {/* Diff para UPDATE */}
          {entry.acao === 'UPDATE' && diff.length > 0 && (
            <div className="pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                Campos alterados
              </p>
              <div className="space-y-2">
                {diff.map((d, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 p-3 rounded-lg text-sm"
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    <span className="font-semibold flex-shrink-0" style={{ color: 'var(--text-primary)', minWidth: 120 }}>
                      {d.campo}
                    </span>
                    <span className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
                      <span
                        className="px-2 py-0.5 rounded line-through text-xs"
                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}
                      >
                        {String(d.de)}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>→</span>
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}
                      >
                        {String(d.para)}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dados para CREATE */}
          {entry.acao === 'CREATE' && entry.dados_novos && (
            <div className="pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                Dados criados
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(entry.dados_novos)
                  .filter(([k]) => !IGNORED_FIELDS.includes(k))
                  .map(([key, val]) => (
                    <div
                      key={key}
                      className="p-2 rounded-lg text-sm"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
                    >
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {FIELD_LABELS[key] || key}
                      </span>
                      <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {String(val || '—')}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Dados para DELETE */}
          {entry.acao === 'DELETE' && entry.dados_antigos && (
            <div className="pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                Dados excluídos
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(entry.dados_antigos)
                  .filter(([k]) => !IGNORED_FIELDS.includes(k))
                  .map(([key, val]) => (
                    <div
                      key={key}
                      className="p-2 rounded-lg text-sm"
                      style={{
                        background: 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid rgba(239, 68, 68, 0.15)',
                      }}
                    >
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {FIELD_LABELS[key] || key}
                      </span>
                      <p className="font-medium truncate line-through" style={{ color: 'var(--danger)' }}>
                        {String(val || '—')}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ID do registro */}
          <p className="text-xs pt-2" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-default)' }}>
            ID do registro: <code>{entry.registro_id}</code>
          </p>
        </div>
      )}
    </div>
  )
}

// ────────────────────────────────────────────
// Página principal
// ────────────────────────────────────────────
export default function HistoricoEstabelecimento() {
  const params = useParams()
  const id = params.id as string

  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [estabelecimentoNome, setEstabelecimentoNome] = useState('')

  // Filtros
  const [filterAcao, setFilterAcao] = useState('todos')
  const [filterDataInicio, setFilterDataInicio] = useState('')
  const [filterDataFim, setFilterDataFim] = useState('')

  // ── Buscar dados ─────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true)

    // Nome do estabelecimento
    const { data: est } = await supabase
      .from('estabelecimentos')
      .select('nome')
      .eq('id', id)
      .single()

    if (est) setEstabelecimentoNome(est.nome)

    // Registros de auditoria para este estabelecimento
    // Busca em todas as tabelas que referenciam este ID
    let query = supabase
      .from('audit_log')
      .select('*')
      .or(`registro_id.eq.${id},dados_novos->>estabelecimento_id.eq.${id},dados_antigos->>estabelecimento_id.eq.${id}`)
      .order('data_hora', { ascending: false })
      .limit(200)

    // Filtro por ação
    if (filterAcao !== 'todos') {
      query = query.eq('acao', filterAcao)
    }

    // Filtro por data início
    if (filterDataInicio) {
      query = query.gte('data_hora', `${filterDataInicio}T00:00:00`)
    }

    // Filtro por data fim
    if (filterDataFim) {
      query = query.lte('data_hora', `${filterDataFim}T23:59:59`)
    }

    const { data, error } = await query

    if (!error && data) {
      setEntries(data as AuditEntry[])
    }

    setLoading(false)
  }, [id, filterAcao, filterDataInicio, filterDataFim])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ── Exportar CSV ─────────────────────────────────
  const exportCSV = () => {
    if (entries.length === 0) return

    const headers = ['Data/Hora', 'Ação', 'Tabela', 'Usuário', 'Campos Alterados']
    const rows = entries.map((e) => {
      const diff = getDiff(e.dados_antigos, e.dados_novos)
      const changes = diff.map((d) => `${d.campo}: ${d.de} → ${d.para}`).join('; ')
      return [
        formatDateTime(e.data_hora),
        e.acao,
        e.tabela,
        e.usuario_id || 'Sistema',
        changes || (e.acao === 'CREATE' ? 'Registro criado' : e.acao === 'DELETE' ? 'Registro excluído' : '—'),
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')),
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `historico-${id.substring(0, 8)}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // ── Contagem por ação ────────────────────────────
  const counts = {
    todos: entries.length,
    CREATE: entries.filter((e) => e.acao === 'CREATE').length,
    UPDATE: entries.filter((e) => e.acao === 'UPDATE').length,
    DELETE: entries.filter((e) => e.acao === 'DELETE').length,
  }

  const filterButtons = [
    { value: 'todos', label: 'Todos' },
    { value: 'CREATE', label: 'Criações' },
    { value: 'UPDATE', label: 'Alterações' },
    { value: 'DELETE', label: 'Exclusões' },
  ]

  return (
    <AppLayout
      title="Histórico de Alterações"
      subtitle={estabelecimentoNome ? `Estabelecimento: ${estabelecimentoNome}` : 'Carregando...'}
      actions={
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="btn-success"
            style={{ padding: '0.5rem 1rem' }}
            disabled={entries.length === 0}
          >
            <Download size={16} />
            Exportar CSV
          </button>
          <Link
            href={`/estabelecimento/${id}`}
            className="btn-secondary"
            style={{ textDecoration: 'none' }}
          >
            <ArrowLeft size={16} />
            Voltar
          </Link>
        </div>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div
            className="animate-pulse-glow rounded-full"
            style={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
            }}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Filtros */}
          <div className="glass-card-static p-5">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={16} style={{ color: 'var(--text-muted)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Filtros
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Filtro por ação */}
              <div className="flex items-center gap-2 flex-wrap">
                {filterButtons.map((btn) => (
                  <button
                    key={btn.value}
                    onClick={() => setFilterAcao(btn.value)}
                    className="text-sm font-medium px-3 py-1.5 rounded-lg transition-all"
                    style={{
                      background: filterAcao === btn.value ? 'var(--primary-700)' : 'var(--bg-elevated)',
                      color: filterAcao === btn.value ? 'white' : 'var(--text-secondary)',
                      border: `1px solid ${filterAcao === btn.value ? 'var(--primary-600)' : 'var(--border-default)'}`,
                      cursor: 'pointer',
                    }}
                  >
                    {btn.label}
                    <span
                      className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
                      style={{
                        background: filterAcao === btn.value ? 'rgba(255,255,255,0.2)' : 'var(--bg-card)',
                      }}
                    >
                      {counts[btn.value as keyof typeof counts]}
                    </span>
                  </button>
                ))}
              </div>

              {/* Filtro por data */}
              <div className="flex items-center gap-2 ml-auto">
                <input
                  type="date"
                  value={filterDataInicio}
                  onChange={(e) => setFilterDataInicio(e.target.value)}
                  className="input-premium text-sm"
                  style={{ width: 150, padding: '0.375rem 0.75rem' }}
                  title="Data início"
                />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>até</span>
                <input
                  type="date"
                  value={filterDataFim}
                  onChange={(e) => setFilterDataFim(e.target.value)}
                  className="input-premium text-sm"
                  style={{ width: 150, padding: '0.375rem 0.75rem' }}
                  title="Data fim"
                />
              </div>
            </div>
          </div>

          {/* Lista de entradas */}
          {entries.length === 0 ? (
            <div className="glass-card-static p-12 text-center">
              <History
                size={48}
                className="mx-auto mb-4"
                style={{ color: 'var(--text-muted)', opacity: 0.5 }}
              />
              <p className="text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Nenhum registro de auditoria
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {filterAcao !== 'todos' || filterDataInicio || filterDataFim
                  ? 'Tente ajustar os filtros'
                  : 'As alterações serão registradas automaticamente a partir de agora'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 stagger-children">
              {entries.map((entry) => (
                <AuditEntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>
      )}
    </AppLayout>
  )
}
