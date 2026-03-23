'use client'

import { useState } from 'react'
import AppLayout from '@/components/AppLayout'
import {
  Globe,
  DollarSign,
  CreditCard,
  Building,
  Flame,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Zap,
  ExternalLink,
} from 'lucide-react'

interface IntegrationCard {
  name: string
  code: string
  description: string
  icon: any
  color: string
  gradient: string
  url: string
  status: 'simulated' | 'connected' | 'error'
  features: string[]
}

const integrations: IntegrationCard[] = [
  {
    name: 'RedeSIM',
    code: 'REDESIM',
    description: 'Rede de Simplificacao de Licenciamento - Consulta CNPJ e classificacao de risco',
    icon: Globe,
    color: '#14b8a6',
    gradient: 'linear-gradient(135deg, #0d9488, #0f766e)',
    url: 'https://redesim.gov.br',
    status: 'connected',
    features: ['Consulta CNPJ via BrasilAPI', 'Classificacao de risco por CNAE', 'Licenciamento automatico baixo risco'],
  },
  {
    name: 'SIAT',
    code: 'SIAT',
    description: 'Sistema de Informacoes de Arrecadacao Tributaria - Prefeitura de Maceio',
    icon: DollarSign,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    url: 'https://maceio.al.gov.br',
    status: 'simulated',
    features: ['Consulta debitos por CNPJ', 'Certidao negativa de debitos', 'Verificacao antes de aprovar licenca'],
  },
  {
    name: 'SUPE',
    code: 'SUPE',
    description: 'Sistema Unico de Pagamentos Eletronicos - Guias de pagamento',
    icon: CreditCard,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #d97706, #b45309)',
    url: '#',
    status: 'simulated',
    features: ['Geracao de guia DAM', 'Consulta de pagamento', 'Codigo de barras'],
  },
  {
    name: 'Facilita Alagoas',
    code: 'FACILITA',
    description: 'Portal de servicos do Estado - Juceal (Junta Comercial)',
    icon: Building,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    url: 'https://facilita.al.gov.br',
    status: 'simulated',
    features: ['Consulta registros Juceal', 'Situacao cadastral', 'Link direto ao portal'],
  },
  {
    name: 'Corpo de Bombeiros',
    code: 'BOMBEIROS',
    description: 'Sistema de inspecao - Vistoria AVCB/CLCB',
    icon: Flame,
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)',
    url: '#',
    status: 'simulated',
    features: ['Consulta vistoria AVCB/CLCB', 'Status e validade', 'Condiciona aprovacao de licenca'],
  },
]

function getStatusIcon(status: string) {
  switch (status) {
    case 'connected': return <CheckCircle size={16} style={{ color: 'var(--success)' }} />
    case 'simulated': return <Zap size={16} style={{ color: 'var(--warning)' }} />
    case 'error': return <XCircle size={16} style={{ color: 'var(--danger)' }} />
    default: return <AlertTriangle size={16} style={{ color: 'var(--text-muted)' }} />
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'connected': return 'Conectado'
    case 'simulated': return 'Simulado'
    case 'error': return 'Erro'
    default: return 'Desconhecido'
  }
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'connected': return 'badge badge-success'
    case 'simulated': return 'badge badge-warning'
    case 'error': return 'badge badge-danger'
    default: return 'badge badge-info'
  }
}

export default function Integracoes() {
  const [refreshing, setRefreshing] = useState<string | null>(null)

  const handleRefresh = async (code: string) => {
    setRefreshing(code)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setRefreshing(null)
  }

  const connectedCount = integrations.filter(i => i.status === 'connected').length
  const simulatedCount = integrations.filter(i => i.status === 'simulated').length

  return (
    <AppLayout
      title="Integracoes"
      subtitle={`${connectedCount} conectadas, ${simulatedCount} simuladas`}
    >
      <div className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card-static p-4 flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg" style={{ width: 40, height: 40, background: 'var(--success-light)' }}>
              <CheckCircle size={20} style={{ color: 'var(--success)' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{connectedCount}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Conectadas</p>
            </div>
          </div>
          <div className="glass-card-static p-4 flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg" style={{ width: 40, height: 40, background: 'var(--warning-light)' }}>
              <Zap size={20} style={{ color: 'var(--warning)' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{simulatedCount}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Simuladas</p>
            </div>
          </div>
          <div className="glass-card-static p-4 flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg" style={{ width: 40, height: 40, background: 'var(--info-light)' }}>
              <Globe size={20} style={{ color: 'var(--info)' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{integrations.length}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total</p>
            </div>
          </div>
        </div>

        {/* Integration Cards */}
        <div className="space-y-4 stagger-children">
          {integrations.map((integration) => {
            const Icon = integration.icon
            return (
              <div key={integration.code} className="glass-card-static p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className="flex items-center justify-center rounded-xl flex-shrink-0"
                      style={{
                        width: 52,
                        height: 52,
                        background: integration.gradient,
                      }}
                    >
                      <Icon size={24} color="white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                          {integration.name}
                        </h3>
                        <span className={getStatusBadgeClass(integration.status)}>
                          {getStatusIcon(integration.status)}
                          {getStatusLabel(integration.status)}
                        </span>
                      </div>
                      <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                        {integration.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {integration.features.map((feature) => (
                          <span
                            key={feature}
                            className="text-xs px-2 py-1 rounded-md"
                            style={{
                              background: 'var(--bg-input)',
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--border-default)',
                            }}
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleRefresh(integration.code)}
                      className="btn-secondary"
                      style={{ padding: '0.5rem 0.75rem', width: 'auto' }}
                      disabled={refreshing === integration.code}
                    >
                      <RefreshCw
                        size={16}
                        className={refreshing === integration.code ? 'animate-spin' : ''}
                      />
                    </button>
                    {integration.url !== '#' && (
                      <a
                        href={integration.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary"
                        style={{ padding: '0.5rem 0.75rem', textDecoration: 'none', width: 'auto' }}
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AppLayout>
  )
}
