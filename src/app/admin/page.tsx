'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'
import {
  Building2,
  FileCheck,
  CheckCircle,
  ClipboardCheck,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'

interface Stats {
  totalEstabelecimentos: number
  totalLicencas: number
  licencasAprovadas: number
  licencasPendentes: number
  licencasRejeitadas: number
  totalInspecoes: number
  inspecoesConformes: number
  inspecoesNaoConformes: number
}

export default function Admin() {
  const [stats, setStats] = useState<Stats>({
    totalEstabelecimentos: 0,
    totalLicencas: 0,
    licencasAprovadas: 0,
    licencasPendentes: 0,
    licencasRejeitadas: 0,
    totalInspecoes: 0,
    inspecoesConformes: 0,
    inspecoesNaoConformes: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    const { count: estCount } = await supabase
      .from('estabelecimentos')
      .select('*', { count: 'exact', head: true })

    const { count: licCount } = await supabase
      .from('licencas')
      .select('*', { count: 'exact', head: true })

    const { count: licAprovCount } = await supabase
      .from('licencas')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'aprovado')

    const { count: licPendCount } = await supabase
      .from('licencas')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pendente')

    const { count: licRejCount } = await supabase
      .from('licencas')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejeitado')

    const { count: insCount } = await supabase
      .from('inspecoes')
      .select('*', { count: 'exact', head: true })

    const { count: insConfCount } = await supabase
      .from('inspecoes')
      .select('*', { count: 'exact', head: true })
      .eq('resultado', 'conforme')

    const { count: insNaoConfCount } = await supabase
      .from('inspecoes')
      .select('*', { count: 'exact', head: true })
      .eq('resultado', 'não_conforme')

    setStats({
      totalEstabelecimentos: estCount || 0,
      totalLicencas: licCount || 0,
      licencasAprovadas: licAprovCount || 0,
      licencasPendentes: licPendCount || 0,
      licencasRejeitadas: licRejCount || 0,
      totalInspecoes: insCount || 0,
      inspecoesConformes: insConfCount || 0,
      inspecoesNaoConformes: insNaoConfCount || 0,
    })

    setLoading(false)
  }

  const kpis = [
    {
      label: 'Estabelecimentos',
      value: stats.totalEstabelecimentos,
      icon: Building2,
      gradient: 'linear-gradient(135deg, #0d9488, #0f766e)',
    },
    {
      label: 'Licenças Totais',
      value: stats.totalLicencas,
      icon: FileCheck,
      gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    },
    {
      label: 'Aprovadas',
      value: stats.licencasAprovadas,
      icon: CheckCircle,
      gradient: 'linear-gradient(135deg, #059669, #047857)',
    },
    {
      label: 'Inspeções',
      value: stats.totalInspecoes,
      icon: ClipboardCheck,
      gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    },
  ]

  const quickActions = [
    { href: '/licenca/gerenciar', label: 'Gerenciar Licenças', sub: `${stats.licencasPendentes} pendentes`, icon: FileCheck, color: '#3b82f6' },
    { href: '/relatorio', label: 'Relatórios', sub: 'Exportar dados', icon: TrendingUp, color: '#10b981' },
    { href: '/estabelecimento/novo', label: 'Novo Estabelecimento', sub: 'Cadastrar', icon: Building2, color: '#f59e0b' },
    { href: '/dashboard', label: 'Painel Principal', sub: 'Visão geral', icon: CheckCircle, color: '#8b5cf6' },
  ]

  const licPercent = stats.totalLicencas > 0
    ? Math.round((stats.licencasAprovadas / stats.totalLicencas) * 100)
    : 0

  const insPercent = stats.totalInspecoes > 0
    ? Math.round((stats.inspecoesConformes / stats.totalInspecoes) * 100)
    : 0

  return (
    <AppLayout title="Administração" subtitle="Painel administrativo com estatísticas globais">
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
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            {kpis.map((kpi) => {
              const Icon = kpi.icon
              return (
                <div key={kpi.label} className="kpi-card" style={{ background: kpi.gradient }}>
                  <Icon size={40} className="kpi-icon" style={{ color: 'white' }} />
                  <p className="kpi-label" style={{ color: 'rgba(255,255,255,0.7)' }}>{kpi.label}</p>
                  <p className="kpi-value" style={{ color: 'white' }}>{kpi.value}</p>
                </div>
              )
            })}
          </div>

          {/* Quick Actions */}
          <div className="glass-card-static p-6">
            <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--text-primary)' }}>
              Ações Rápidas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 p-4 rounded-xl no-underline"
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-hover)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-default)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <div
                      className="flex items-center justify-center rounded-lg flex-shrink-0"
                      style={{
                        width: 40,
                        height: 40,
                        background: `${action.color}15`,
                        border: `1px solid ${action.color}30`,
                      }}
                    >
                      <Icon size={20} style={{ color: action.color }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {action.label}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {action.sub}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Summary with Progress Bars */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card-static p-6">
              <h3 className="text-lg font-bold mb-5" style={{ color: 'var(--text-primary)' }}>
                Licenças
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Taxa de aprovação</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--success)' }}>{licPercent}%</span>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${licPercent}%`, background: 'var(--success)' }} />
                  </div>
                </div>
                <div className="space-y-3 pt-2" style={{ borderTop: '1px solid var(--border-default)' }}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--success)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Aprovadas</span>
                    </div>
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{stats.licencasAprovadas}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--warning)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Pendentes</span>
                    </div>
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{stats.licencasPendentes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--danger)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Rejeitadas</span>
                    </div>
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{stats.licencasRejeitadas}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card-static p-6">
              <h3 className="text-lg font-bold mb-5" style={{ color: 'var(--text-primary)' }}>
                Inspeções
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Taxa de conformidade</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--success)' }}>{insPercent}%</span>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${insPercent}%`, background: 'var(--success)' }} />
                  </div>
                </div>
                <div className="space-y-3 pt-2" style={{ borderTop: '1px solid var(--border-default)' }}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--success)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Conformes</span>
                    </div>
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{stats.inspecoesConformes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--danger)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Não conformes</span>
                    </div>
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{stats.inspecoesNaoConformes}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
