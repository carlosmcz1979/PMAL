'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import AppLayout from '@/components/AppLayout'
import * as XLSX from 'xlsx'
import {
  Download,
  Building2,
  FileCheck,
  ClipboardCheck,
  TrendingUp,
} from 'lucide-react'

interface Estabelecimento {
  id: string
  nome: string
  cnpj: string
  email: string
  tipo_atividade: string
}

interface Licenca {
  id: string
  numero_licenca: string
  status: string
  data_solicitacao: string
  estabelecimento_id: string
}

interface Inspecao {
  id: string
  data_inspecao: string
  tipo_inspecao: string
  resultado: string
  estabelecimento_id: string
}

export default function Relatorio() {
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([])
  const [licencas, setLicencas] = useState<Licenca[]>([])
  const [inspecoes, setInspecoes] = useState<Inspecao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: estData } = await supabase
      .from('estabelecimentos')
      .select('*')
      .eq('user_id', user.id)

    if (estData) setEstabelecimentos(estData)

    const { data: licData } = await supabase
      .from('licencas')
      .select('*')

    if (licData) setLicencas(licData)

    const { data: insData } = await supabase
      .from('inspecoes')
      .select('*')

    if (insData) setInspecoes(insData)
    setLoading(false)
  }

  const generateExcel = () => {
    const estData = estabelecimentos.map((est) => ({
      Nome: est.nome,
      CNPJ: est.cnpj,
      Email: est.email,
      'Tipo de Atividade': est.tipo_atividade,
    }))

    const licData = licencas.map((lic) => {
      const est = estabelecimentos.find((e) => e.id === lic.estabelecimento_id)
      return {
        'Número da Licença': lic.numero_licenca,
        Estabelecimento: est?.nome || 'N/A',
        Status: lic.status,
        'Data de Solicitação': new Date(lic.data_solicitacao).toLocaleDateString('pt-BR'),
      }
    })

    const insData = inspecoes.map((ins) => {
      const est = estabelecimentos.find((e) => e.id === ins.estabelecimento_id)
      return {
        Estabelecimento: est?.nome || 'N/A',
        'Data da Inspeção': new Date(ins.data_inspecao).toLocaleDateString('pt-BR'),
        Tipo: ins.tipo_inspecao,
        Resultado: ins.resultado,
      }
    })

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(estData), 'Estabelecimentos')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(licData), 'Licenças')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(insData), 'Inspeções')
    XLSX.writeFile(wb, `relatorio-visa-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const licPendentes = licencas.filter((l) => l.status === 'pendente').length
  const licAprovadas = licencas.filter((l) => l.status === 'aprovado').length
  const licRejeitadas = licencas.filter((l) => l.status === 'rejeitado').length

  const insConformes = inspecoes.filter((i) => i.resultado === 'conforme').length
  const insNaoConformes = inspecoes.filter((i) => i.resultado === 'não_conforme').length
  const insPendentes = inspecoes.filter((i) => i.resultado === 'pendente').length

  const licPercent = licencas.length > 0 ? Math.round((licAprovadas / licencas.length) * 100) : 0
  const insPercent = inspecoes.length > 0 ? Math.round((insConformes / inspecoes.length) * 100) : 0

  const kpis = [
    {
      label: 'Estabelecimentos',
      value: estabelecimentos.length,
      icon: Building2,
      gradient: 'linear-gradient(135deg, #0d9488, #0f766e)',
    },
    {
      label: 'Total Licenças',
      value: licencas.length,
      icon: FileCheck,
      gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    },
    {
      label: 'Total Inspeções',
      value: inspecoes.length,
      icon: ClipboardCheck,
      gradient: 'linear-gradient(135deg, #059669, #047857)',
    },
    {
      label: 'Taxa Aprovação',
      value: `${licPercent}%`,
      icon: TrendingUp,
      gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    },
  ]

  return (
    <AppLayout
      title="Relatórios"
      subtitle="Visão geral e exportação de dados"
      actions={
        <button
          id="export-excel"
          onClick={generateExcel}
          className="btn-success"
          disabled={loading}
        >
          <Download size={18} />
          Exportar Excel
        </button>
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
                <div key={kpi.label} className="kpi-card" style={{ background: kpi.gradient }}>
                  <Icon size={40} className="kpi-icon" style={{ color: 'white' }} />
                  <p className="kpi-label" style={{ color: 'rgba(255,255,255,0.7)' }}>{kpi.label}</p>
                  <p className="kpi-value" style={{ color: 'white' }}>{kpi.value}</p>
                </div>
              )
            })}
          </div>

          {/* Status Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Licenças */}
            <div className="glass-card-static p-6">
              <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--text-primary)' }}>
                Status das Licenças
              </h2>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Taxa de aprovação
                    </span>
                    <span className="text-sm font-bold" style={{ color: 'var(--success)' }}>
                      {licPercent}%
                    </span>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${licPercent}%`, background: 'var(--success)' }}
                    />
                  </div>
                </div>

                <div className="space-y-3" style={{ borderTop: '1px solid var(--border-default)', paddingTop: '1rem' }}>
                  {[
                    { label: 'Aprovadas', value: licAprovadas, color: 'var(--success)' },
                    { label: 'Pendentes', value: licPendentes, color: 'var(--warning)' },
                    { label: 'Rejeitadas', value: licRejeitadas, color: 'var(--danger)' },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                      </div>
                      <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Inspeções */}
            <div className="glass-card-static p-6">
              <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--text-primary)' }}>
                Resultado das Inspeções
              </h2>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Taxa de conformidade
                    </span>
                    <span className="text-sm font-bold" style={{ color: 'var(--success)' }}>
                      {insPercent}%
                    </span>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${insPercent}%`, background: 'var(--success)' }}
                    />
                  </div>
                </div>

                <div className="space-y-3" style={{ borderTop: '1px solid var(--border-default)', paddingTop: '1rem' }}>
                  {[
                    { label: 'Conformes', value: insConformes, color: 'var(--success)' },
                    { label: 'Não Conformes', value: insNaoConformes, color: 'var(--danger)' },
                    { label: 'Pendentes', value: insPendentes, color: 'var(--warning)' },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                      </div>
                      <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
