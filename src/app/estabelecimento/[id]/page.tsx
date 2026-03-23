'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'
import {
  Plus,
  Building2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  FileCheck,
  ClipboardCheck,
  Pencil,
  History,
} from 'lucide-react'

interface Licenca {
  id: string
  numero_licenca: string
  status: string
  data_solicitacao: string
}

interface Inspecao {
  id: string
  data_inspecao: string
  tipo_inspecao: string
  resultado: string
}

export default function DetalhesEstabelecimento() {
  const params = useParams()
  const id = params.id as string

  const [estabelecimento, setEstabelecimento] = useState<any>(null)
  const [licencas, setLicencas] = useState<Licenca[]>([])
  const [inspecoes, setInspecoes] = useState<Inspecao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    const { data: estData } = await supabase
      .from('estabelecimentos')
      .select('*')
      .eq('id', id)
      .single()

    if (estData) setEstabelecimento(estData)

    const { data: licData } = await supabase
      .from('licencas')
      .select('*')
      .eq('estabelecimento_id', id)
      .order('data_solicitacao', { ascending: false })

    if (licData) setLicencas(licData)

    const { data: insData } = await supabase
      .from('inspecoes')
      .select('*')
      .eq('estabelecimento_id', id)
      .order('data_inspecao', { ascending: false })

    if (insData) setInspecoes(insData)
    setLoading(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprovado':
      case 'conforme':
        return 'badge badge-success'
      case 'rejeitado':
      case 'não_conforme':
        return 'badge badge-danger'
      default:
        return 'badge badge-warning'
    }
  }

  if (loading || !estabelecimento) {
    return (
      <AppLayout title="Estabelecimento" subtitle="Carregando detalhes...">
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
      </AppLayout>
    )
  }

  const infoItems = [
    { icon: Mail, label: 'Email', value: estabelecimento.email },
    { icon: Phone, label: 'Telefone', value: estabelecimento.telefone },
    { icon: MapPin, label: 'Endereço', value: estabelecimento.endereco },
    { icon: Briefcase, label: 'Atividade', value: estabelecimento.tipo_atividade },
  ]

  return (
    <AppLayout
      title={estabelecimento.nome}
      subtitle={`CNPJ: ${estabelecimento.cnpj}`}
      actions={
        <div className="flex gap-2">
          <Link
            href={`/estabelecimento/${id}/editar`}
            className="btn-primary"
            style={{ textDecoration: 'none', padding: '0.5rem 1rem' }}
          >
            <Pencil size={16} />
            Editar
          </Link>
          <Link
            href={`/estabelecimento/${id}/historico`}
            className="btn-secondary"
            style={{ textDecoration: 'none', padding: '0.5rem 1rem' }}
          >
            <History size={16} />
            Histórico
          </Link>
          <Link href="/dashboard" className="btn-secondary" style={{ textDecoration: 'none' }}>
            ← Voltar
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          {infoItems.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="glass-card-static p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center rounded-lg flex-shrink-0"
                    style={{
                      width: 40,
                      height: 40,
                      background: 'rgba(20, 184, 166, 0.1)',
                      border: '1px solid rgba(20, 184, 166, 0.15)',
                    }}
                  >
                    <Icon size={18} style={{ color: 'var(--primary-400)' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      {item.label}
                    </p>
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {item.value || '—'}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Licenças */}
        <div className="glass-card-static p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <FileCheck size={22} style={{ color: 'var(--primary-400)' }} />
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                Licenças Sanitárias
              </h2>
              <span className="badge badge-info">{licencas.length}</span>
            </div>
            <Link
              href={`/licenca/novo?id=${id}`}
              className="btn-primary text-sm"
              style={{ textDecoration: 'none', padding: '0.5rem 1rem' }}
            >
              <Plus size={16} />
              Nova Licença
            </Link>
          </div>

          {licencas.length === 0 ? (
            <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
              Nenhuma licença solicitada
            </p>
          ) : (
            <div className="space-y-3">
              {licencas.map((licenca) => (
                <div
                  key={licenca.id}
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {licenca.numero_licenca}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(licenca.data_solicitacao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className={getStatusBadge(licenca.status)}>
                    {licenca.status.charAt(0).toUpperCase() + licenca.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inspeções */}
        <div className="glass-card-static p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <ClipboardCheck size={22} style={{ color: 'var(--success)' }} />
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                Inspeções
              </h2>
              <span className="badge badge-info">{inspecoes.length}</span>
            </div>
            <Link
              href={`/inspecao/nova?id=${id}`}
              className="btn-success text-sm"
              style={{ textDecoration: 'none', padding: '0.5rem 1rem' }}
            >
              <Plus size={16} />
              Nova Inspeção
            </Link>
          </div>

          {inspecoes.length === 0 ? (
            <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
              Nenhuma inspeção registrada
            </p>
          ) : (
            <div className="space-y-3">
              {inspecoes.map((inspecao) => (
                <div
                  key={inspecao.id}
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {inspecao.tipo_inspecao}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(inspecao.data_inspecao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className={getStatusBadge(inspecao.resultado)}>
                    {inspecao.resultado.charAt(0).toUpperCase() + inspecao.resultado.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
