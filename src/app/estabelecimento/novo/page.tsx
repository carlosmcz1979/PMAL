'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import { consultarCNPJ, getRiskColor, getRiskLabel } from '@/lib/integrations/redesim'
import { RedeSIMConsultaResult } from '@/lib/integrations/types'
import {
  Building2,
  Hash,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  Save,
  Search,
  AlertTriangle,
  CheckCircle,
  Shield,
} from 'lucide-react'
import Link from 'next/link'

export default function NovoEstabelecimento() {
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    endereco: '',
    telefone: '',
    email: '',
    tipo_atividade: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [consultaRedeSIM, setConsultaRedeSIM] = useState<RedeSIMConsultaResult | null>(null)
  const [consultando, setConsultando] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleConsultarCNPJ = async () => {
    if (!formData.cnpj || formData.cnpj.replace(/\D/g, '').length < 14) {
      setError('Preencha o CNPJ completo para consultar')
      return
    }
    setConsultando(true)
    setError('')
    try {
      const result = await consultarCNPJ(formData.cnpj)
      setConsultaRedeSIM(result)
      // Preenche campos automaticamente
      setFormData(prev => ({
        ...prev,
        nome: result.razaoSocial || prev.nome,
        endereco: result.endereco !== 'Endereco nao disponivel' ? `${result.endereco} - ${result.municipio}/${result.uf}` : prev.endereco,
        tipo_atividade: result.descricaoCnae || prev.tipo_atividade,
      }))
    } catch (err) {
      setError('Erro ao consultar RedeSIM')
    }
    setConsultando(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Usuario nao autenticado')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('estabelecimentos').insert([
      {
        ...formData,
        user_id: user.id,
      },
    ])

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <AppLayout
      title="Novo Estabelecimento"
      subtitle="Cadastrar um novo estabelecimento no sistema"
      actions={
        <Link href="/dashboard" className="btn-secondary" style={{ textDecoration: 'none' }}>
          ← Voltar
        </Link>
      }
    >
      <div className="max-w-2xl">
        <div className="glass-card-static p-8">
          {error && (
            <div
              className="p-3 rounded-lg mb-6 text-sm font-medium flex items-center gap-2"
              style={{
                background: 'var(--danger-light)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* CNPJ com botao RedeSIM */}
            <div>
              <label className="input-label">CNPJ</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }}
                  />
                  <input
                    id="field-cnpj"
                    type="text"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleChange}
                    className="input-premium"
                    style={{ paddingLeft: '2.75rem' }}
                    placeholder="00.000.000/0000-00"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleConsultarCNPJ}
                  disabled={consultando}
                  className="btn-primary"
                  style={{ whiteSpace: 'nowrap', width: 'auto' }}
                >
                  {consultando ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Search size={16} />
                  )}
                  RedeSIM
                </button>
              </div>
            </div>

            {/* Resultado RedeSIM */}
            {consultaRedeSIM && (
              <div
                className="p-4 rounded-lg animate-fade-in"
                style={{
                  background: 'rgba(20, 184, 166, 0.08)',
                  border: '1px solid rgba(20, 184, 166, 0.2)',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Shield size={16} style={{ color: 'var(--primary-400)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--primary-400)' }}>
                    Resultado RedeSIM
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Razao Social:</span>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{consultaRedeSIM.razaoSocial}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Situacao:</span>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{consultaRedeSIM.situacaoCadastral}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>CNAE:</span>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{consultaRedeSIM.descricaoCnae}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Classificacao de Risco:</span>
                    <p className="font-bold flex items-center gap-1" style={{ color: getRiskColor(consultaRedeSIM.riskLevel) }}>
                      <Shield size={14} />
                      {getRiskLabel(consultaRedeSIM.riskLevel)}
                    </p>
                  </div>
                </div>
                {consultaRedeSIM.autoLicensing && (
                  <div
                    className="mt-3 p-2 rounded-md flex items-center gap-2 text-sm font-medium"
                    style={{
                      background: 'var(--success-light)',
                      color: '#34d399',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    <CheckCircle size={16} />
                    Atividade de baixo risco - Licenciamento automatico disponivel
                  </div>
                )}
              </div>
            )}

            {/* Nome */}
            <div>
              <label className="input-label">Nome do Estabelecimento</label>
              <div className="relative">
                <Building2
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  id="field-nome"
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="input-premium"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="Nome fantasia ou razao social"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="input-label">Email</label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  id="field-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-premium"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="contato@empresa.com"
                />
              </div>
            </div>

            {/* Telefone */}
            <div>
              <label className="input-label">Telefone</label>
              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  id="field-telefone"
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  className="input-premium"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="(82) 99999-9999"
                />
              </div>
            </div>

            {/* Tipo de Atividade */}
            <div>
              <label className="input-label">Tipo de Atividade</label>
              <div className="relative">
                <Briefcase
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  id="field-tipo"
                  type="text"
                  name="tipo_atividade"
                  value={formData.tipo_atividade}
                  onChange={handleChange}
                  className="input-premium"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="Ex: Restaurante, Farmacia, Clinica..."
                />
              </div>
            </div>

            {/* Endereco */}
            <div>
              <label className="input-label">Endereco</label>
              <div className="relative">
                <MapPin
                  size={18}
                  className="absolute left-3 top-3"
                  style={{ color: 'var(--text-muted)' }}
                />
                <textarea
                  id="field-endereco"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  className="input-premium"
                  style={{ paddingLeft: '2.75rem', minHeight: 80, resize: 'vertical' }}
                  placeholder="Rua, numero, bairro, CEP..."
                  required
                />
              </div>
            </div>

            <button
              id="submit-estabelecimento"
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
              style={{ padding: '0.875rem 1.5rem', marginTop: '1.5rem' }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando...
                </span>
              ) : (
                <>
                  <Save size={18} />
                  Salvar Estabelecimento
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}
