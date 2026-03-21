'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AppLayout from '@/components/AppLayout'
import { Check, X, FileCheck, Filter } from 'lucide-react'

interface Licenca {
  id: string
  numero_licenca: string
  status: string
  data_solicitacao: string
  observacoes: string
  estabelecimento_id: string
  estabelecimento?: {
    nome: string
    cnpj: string
  }
}

export default function GerenciarLicencas() {
  const [licencas, setLicencas] = useState<Licenca[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('todos')

  useEffect(() => {
    fetchLicencas()
  }, [])

  const fetchLicencas = async () => {
    const { data, error } = await supabase
      .from('licencas')
      .select(`
        *,
        estabelecimento:estabelecimento_id(nome, cnpj)
      `)
      .order('data_solicitacao', { ascending: false })

    if (!error && data) setLicencas(data)
    setLoading(false)
  }

  const updateStatus = async (id: string, novoStatus: string) => {
    const { error } = await supabase
      .from('licencas')
      .update({ status: novoStatus })
      .eq('id', id)

    if (!error) fetchLicencas()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprovado':
        return 'badge badge-success'
      case 'rejeitado':
        return 'badge badge-danger'
      default:
        return 'badge badge-warning'
    }
  }

  const filteredLicencas = filterStatus === 'todos'
    ? licencas
    : licencas.filter((l) => l.status === filterStatus)

  const statusCounts = {
    todos: licencas.length,
    pendente: licencas.filter((l) => l.status === 'pendente').length,
    aprovado: licencas.filter((l) => l.status === 'aprovado').length,
    rejeitado: licencas.filter((l) => l.status === 'rejeitado').length,
  }

  const filterButtons = [
    { value: 'todos', label: 'Todos' },
    { value: 'pendente', label: 'Pendentes' },
    { value: 'aprovado', label: 'Aprovadas' },
    { value: 'rejeitado', label: 'Rejeitadas' },
  ]

  return (
    <AppLayout
      title="Gerenciar Licenças"
      subtitle={`${statusCounts.pendente} licenças pendentes de análise`}
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
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilterStatus(btn.value)}
                className="text-sm font-medium px-4 py-2 rounded-lg transition-all"
                style={{
                  background: filterStatus === btn.value ? 'var(--primary-700)' : 'var(--bg-elevated)',
                  color: filterStatus === btn.value ? 'white' : 'var(--text-secondary)',
                  border: `1px solid ${filterStatus === btn.value ? 'var(--primary-600)' : 'var(--border-default)'}`,
                  cursor: 'pointer',
                }}
              >
                {btn.label}
                <span
                  className="ml-2 px-1.5 py-0.5 rounded-full text-xs"
                  style={{
                    background: filterStatus === btn.value ? 'rgba(255,255,255,0.2)' : 'var(--bg-card)',
                  }}
                >
                  {statusCounts[btn.value as keyof typeof statusCounts]}
                </span>
              </button>
            ))}
          </div>

          {/* Licenças List */}
          {filteredLicencas.length === 0 ? (
            <div className="glass-card-static p-8 text-center">
              <FileCheck
                size={48}
                className="mx-auto mb-4"
                style={{ color: 'var(--text-muted)', opacity: 0.5 }}
              />
              <p className="text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Nenhuma licença encontrada
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {filterStatus !== 'todos' ? 'Tente outro filtro' : 'Nenhuma licença para gerenciar'}
              </p>
            </div>
          ) : (
            <div className="space-y-4 stagger-children">
              {filteredLicencas.map((licenca) => (
                <div key={licenca.id} className="glass-card-static p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                          {licenca.numero_licenca}
                        </h3>
                        <span className={getStatusBadge(licenca.status)}>
                          {licenca.status.charAt(0).toUpperCase() + licenca.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {(licenca.estabelecimento as any)?.nome || 'N/A'}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        CNPJ: {(licenca.estabelecimento as any)?.cnpj || 'N/A'} ·{' '}
                        {new Date(licenca.data_solicitacao).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  {licenca.observacoes && (
                    <div
                      className="p-3 rounded-lg mb-4 text-sm"
                      style={{
                        background: 'var(--bg-input)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-default)',
                      }}
                    >
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Observações:
                      </span>{' '}
                      {licenca.observacoes}
                    </div>
                  )}

                  {licenca.status === 'pendente' && (
                    <div className="flex gap-3">
                      <button
                        id={`approve-${licenca.id}`}
                        onClick={() => updateStatus(licenca.id, 'aprovado')}
                        className="btn-success text-sm"
                        style={{ padding: '0.5rem 1.25rem' }}
                      >
                        <Check size={16} />
                        Aprovar
                      </button>
                      <button
                        id={`reject-${licenca.id}`}
                        onClick={() => updateStatus(licenca.id, 'rejeitado')}
                        className="btn-danger text-sm"
                        style={{ padding: '0.5rem 1.25rem' }}
                      >
                        <X size={16} />
                        Rejeitar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </AppLayout>
  )
}
