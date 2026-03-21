'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'
import {
  Plus,
  Building2,
  FileCheck,
  ClipboardCheck,
  TrendingUp,
  Search,
  ArrowRight,
} from 'lucide-react'

interface Estabelecimento {
  id: string
  nome: string
  cnpj: string
  email: string
  tipo_atividade: string
  created_at: string
}

interface Stats {
  totalEstabelecimentos: number
  totalLicencas: number
  licencasPendentes: number
  totalInspecoes: number
}

export default function Dashboard() {
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([])
  const [stats, setStats] = useState<Stats>({
    totalEstabelecimentos: 0,
    totalLicencas: 0,
    licencasPendentes: 0,
    totalInspecoes: 0,
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Fetch estabelecimentos
    const { data: estData } = await supabase
      .from('estabelecimentos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (estData) {
      setEstabelecimentos(estData)
    }

    // Stats
    const { count: licCount } = await supabase
      .from('licencas')
      .select('*', { count: 'exact', head: true })

    const { count: licPendCount } = await supabase
      .from('licencas')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pendente')

    const { count: insCount } = await supabase
      .from('inspecoes')
      .select('*', { count: 'exact', head: true })

    setStats({
      totalEstabelecimentos: estData?.length || 0,
      totalLicencas: licCount || 0,
      licencasPendentes: licPendCount || 0,
      totalInspecoes: insCount || 0,
    })

    setLoading(false)
  }

  const filteredEstabelecimentos = estabelecimentos.filter(
    (est) =>
      est.nome.toLowerCase().includes(search.toLowerCase()) ||
      est.cnpj.includes(search)
  )

  const kpis = [
    {
      label: 'Estabelecimentos',
      value: stats.totalEstabelecimentos,
      icon: Building2,
      gradient: 'linear-gradient(135deg, #0d9488, #0f766e)',
      color: '#5eead4',
    },
    {
      label: 'Total Licenças',
      value: stats.totalLicencas,
      icon: FileCheck,
      gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
      color: '#93c5fd',
    },
    {
      label: 'Pendentes',
      value: stats.licencasPendentes,
      icon: TrendingUp,
      gradient: 'linear-gradient(135deg, #d97706, #b45309)',
      color: '#fcd34d',
    },
    {
      label: 'Inspeções',
      value: stats.totalInspecoes,
      icon: ClipboardCheck,
      gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
      color: '#c4b5fd',
    },
  ]

  return (
    <AppLayout
      title="Dashboard"
      subtitle="Visão geral do sistema de licenciamento"
      actions={
        <Link href="/estabelecimento/novo" className="btn-primary" style={{ textDecoration: 'none' }}>
          <Plus size={18} />
          Novo Estabelecimento
        </Link>
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
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            {kpis.map((kpi) => {
              const Icon = kpi.icon
              return (
                <div
                  key={kpi.label}
                  className="kpi-card"
                  style={{ background: kpi.gradient }}
                >
                  <Icon size={40} className="kpi-icon" style={{ color: 'white' }} />
                  <p className="kpi-label" style={{ color: kpi.color }}>
                    {kpi.label}
                  </p>
                  <p className="kpi-value" style={{ color: 'white' }}>
                    {kpi.value}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Search and Establishments List */}
          <div className="glass-card-static p-6">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-lg font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                Estabelecimentos
              </h2>
              <div className="relative" style={{ width: 280 }}>
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  id="dashboard-search"
                  type="text"
                  placeholder="Buscar por nome ou CNPJ..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-premium"
                  style={{ paddingLeft: '2.5rem', fontSize: '0.875rem' }}
                />
              </div>
            </div>

            {filteredEstabelecimentos.length === 0 ? (
              <div className="text-center py-12">
                <Building2
                  size={48}
                  className="mx-auto mb-4"
                  style={{ color: 'var(--text-muted)', opacity: 0.5 }}
                />
                <p className="text-lg font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {search ? 'Nenhum resultado encontrado' : 'Nenhum estabelecimento cadastrado'}
                </p>
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                  {search ? 'Tente outro termo de busca' : 'Cadastre o primeiro agora'}
                </p>
                {!search && (
                  <Link href="/estabelecimento/novo" className="btn-primary" style={{ textDecoration: 'none' }}>
                    <Plus size={18} />
                    Cadastrar
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid gap-3 stagger-children">
                {filteredEstabelecimentos.map((est) => (
                  <Link
                    key={est.id}
                    href={`/estabelecimento/${est.id}`}
                    className="flex items-center justify-between p-4 rounded-xl group no-underline"
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-hover)'
                      e.currentTarget.style.transform = 'translateX(4px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-default)'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="flex items-center justify-center rounded-lg"
                        style={{
                          width: 44,
                          height: 44,
                          background: 'rgba(20, 184, 166, 0.1)',
                          border: '1px solid rgba(20, 184, 166, 0.2)',
                        }}
                      >
                        <Building2 size={20} style={{ color: 'var(--primary-400)' }} />
                      </div>
                      <div>
                        <h3
                          className="font-semibold text-base"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {est.nome}
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          CNPJ: {est.cnpj}
                          {est.tipo_atividade && ` · ${est.tipo_atividade}`}
                        </p>
                      </div>
                    </div>
                    <ArrowRight
                      size={18}
                      style={{
                        color: 'var(--text-muted)',
                        transition: 'color 0.2s',
                      }}
                    />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  )
}
