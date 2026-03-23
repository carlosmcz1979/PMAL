'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import {
  Activity,
  Building2,
  FileCheck,
  Plus,
  LogOut,
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from 'lucide-react'

interface Estabelecimento {
  id: string
  nome: string
  cnpj: string
  endereco: string
  tipo_atividade: string
}

interface Licenca {
  id: string
  numero_licenca: string
  status: string
  data_solicitacao: string
  estabelecimento_id: string
}

export default function DashboardContribuinte() {
  const router = useRouter()
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([])
  const [licencas, setLicencas] = useState<Licenca[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserEmail(user.email || '')

      // Busca estabelecimentos do contribuinte
      const { data: est } = await supabase
        .from('estabelecimentos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (est) setEstabelecimentos(est)

      // Busca licenças vinculadas
      const { data: lic } = await supabase
        .from('licencas')
        .select('*')
        .in('estabelecimento_id', (est || []).map(e => e.id))
        .order('data_solicitacao', { ascending: false })

      if (lic) setLicencas(lic)

      setLoading(false)
    }
    fetchData()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Contadores
  const totalEst = estabelecimentos.length
  const totalLic = licencas.length
  const licPendentes = licencas.filter(l => l.status === 'pendente').length
  const licAprovadas = licencas.filter(l => l.status === 'aprovado').length

  const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
    pendente: { icon: Clock, color: '#f59e0b', label: 'Pendente' },
    aprovado: { icon: CheckCircle, color: '#10b981', label: 'Aprovada' },
    rejeitado: { icon: XCircle, color: '#ef4444', label: 'Rejeitada' },
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
            href="/contribuinte/solicitacoes"
            className="btn-secondary text-sm"
            style={{ textDecoration: 'none', padding: '0.5rem 1rem' }}
          >
            <FileCheck size={16} />
            Solicitações
          </Link>
          <Link
            href="/contribuinte/estabelecimento/novo"
            className="btn-primary text-sm"
            style={{ textDecoration: 'none', padding: '0.5rem 1rem' }}
          >
            <Plus size={16} />
            Novo Estabelecimento
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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Título */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Meus Estabelecimentos
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Gerencie seus estabelecimentos e acompanhe licenças sanitárias
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-pulse-glow rounded-full" style={{ width: 48, height: 48, background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))' }} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Estabelecimentos', value: totalEst, gradient: 'linear-gradient(135deg, #0d9488, #0f766e)' },
                { label: 'Licenças', value: totalLic, gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)' },
                { label: 'Pendentes', value: licPendentes, gradient: 'linear-gradient(135deg, #d97706, #b45309)' },
                { label: 'Aprovadas', value: licAprovadas, gradient: 'linear-gradient(135deg, #059669, #047857)' },
              ].map(kpi => (
                <div key={kpi.label} className="kpi-card" style={{ background: kpi.gradient, padding: '1rem' }}>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>{kpi.label}</p>
                  <p style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700 }}>{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Lista de estabelecimentos */}
            {estabelecimentos.length === 0 ? (
              <div className="glass-card-static p-12 text-center">
                <Building2 size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Nenhum estabelecimento cadastrado
                </h3>
                <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                  Cadastre seu primeiro estabelecimento para solicitar a licença sanitária
                </p>
                <Link
                  href="/contribuinte/estabelecimento/novo"
                  className="btn-primary inline-flex items-center gap-2"
                  style={{ textDecoration: 'none', padding: '0.75rem 1.5rem' }}
                >
                  <Plus size={18} />
                  Cadastrar Estabelecimento
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {estabelecimentos.map((est) => {
                  const estLicencas = licencas.filter(l => l.estabelecimento_id === est.id)
                  return (
                    <div key={est.id} className="glass-card-static p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
                            {est.nome}
                          </h3>
                          <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                            <span>CNPJ: {est.cnpj}</span>
                            {est.tipo_atividade && <span>· {est.tipo_atividade}</span>}
                          </div>
                          {est.endereco && (
                            <p className="text-xs mt-1 truncate" style={{ color: 'var(--text-muted)' }}>{est.endereco}</p>
                          )}
                        </div>

                        {/* Licenças do estabelecimento */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {estLicencas.length > 0 ? (
                            estLicencas.slice(0, 2).map(lic => {
                              const cfg = statusConfig[lic.status] || statusConfig.pendente
                              const Icon = cfg.icon
                              return (
                                <span
                                  key={lic.id}
                                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                                  style={{ background: `${cfg.color}15`, color: cfg.color }}
                                >
                                  <Icon size={12} /> {cfg.label}
                                </span>
                              )
                            })
                          ) : (
                            <Link
                              href={`/licenca/nova?id=${est.id}`}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                              style={{
                                background: 'var(--primary-700)',
                                color: 'white',
                                textDecoration: 'none',
                              }}
                            >
                              <FileCheck size={12} className="inline mr-1" />
                              Solicitar Licença
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
