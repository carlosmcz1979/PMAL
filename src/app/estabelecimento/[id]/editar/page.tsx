'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import AppLayout from '@/components/AppLayout'
import { consultarCNPJ, getRiskColor, getRiskLabel } from '@/lib/integrations/redesim'
import { RedeSIMConsultaResult } from '@/lib/integrations/types'
import Link from 'next/link'
import {
  Building2,
  Hash,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  Save,
  Search,
  Shield,
  CheckCircle,
  AlertTriangle,
  X,
} from 'lucide-react'

// ────────────────────────────────────────────
// Schema de validação Zod
// ────────────────────────────────────────────
const estabelecimentoSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(200, 'Nome muito longo'),
  cnpj: z
    .string()
    .min(14, 'CNPJ deve ter pelo menos 14 dígitos')
    .refine(
      (val) => {
        const digits = val.replace(/\D/g, '')
        return digits.length === 14
      },
      { message: 'CNPJ inválido — deve conter 14 dígitos' }
    ),
  endereco: z
    .string()
    .min(5, 'Endereço deve ter pelo menos 5 caracteres')
    .max(500, 'Endereço muito longo'),
  telefone: z
    .string()
    .max(20, 'Telefone muito longo')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
  tipo_atividade: z
    .string()
    .max(300, 'Tipo de atividade muito longo')
    .optional()
    .or(z.literal('')),
})

type EstabelecimentoForm = z.infer<typeof estabelecimentoSchema>

// ────────────────────────────────────────────
// Toast simples inline (sem dependência extra)
// ────────────────────────────────────────────
function Toast({
  message,
  type,
  onClose,
}: {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg animate-fade-in"
      style={{
        background: type === 'success' ? 'var(--success)' : 'var(--danger)',
        color: 'white',
        minWidth: 280,
        maxWidth: 420,
      }}
    >
      {type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
      <span className="text-sm font-medium flex-1">{message}</span>
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}
      >
        <X size={16} />
      </button>
    </div>
  )
}

// ────────────────────────────────────────────
// Componente principal
// ────────────────────────────────────────────
export default function EditarEstabelecimento() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  // Estados
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [consultaRedeSIM, setConsultaRedeSIM] = useState<RedeSIMConsultaResult | null>(null)
  const [consultando, setConsultando] = useState(false)

  // React Hook Form (sem resolver externo — validação manual via Zod)
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<EstabelecimentoForm>({
    defaultValues: {
      nome: '',
      cnpj: '',
      endereco: '',
      telefone: '',
      email: '',
      tipo_atividade: '',
    },
  })

  const cnpjValue = watch('cnpj')

  // ── Carregar dados do estabelecimento ────────────
  useEffect(() => {
    const fetchEstabelecimento = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('estabelecimentos')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        setToast({ message: 'Estabelecimento não encontrado.', type: 'error' })
        setTimeout(() => router.push('/dashboard'), 2000)
        return
      }

      // Preenche o formulário com dados existentes
      reset({
        nome: data.nome || '',
        cnpj: data.cnpj || '',
        endereco: data.endereco || '',
        telefone: data.telefone || '',
        email: data.email || '',
        tipo_atividade: data.tipo_atividade || '',
      })

      setLoading(false)
    }

    fetchEstabelecimento()
  }, [id, reset, router])

  // ── Consulta RedeSIM ─────────────────────────────
  const handleConsultarCNPJ = async () => {
    const cleanCnpj = cnpjValue?.replace(/\D/g, '') || ''
    if (cleanCnpj.length < 14) {
      setToast({ message: 'Preencha o CNPJ completo para consultar.', type: 'error' })
      return
    }

    setConsultando(true)
    try {
      const result = await consultarCNPJ(cnpjValue)
      setConsultaRedeSIM(result)

      // Preenche campos com dados da RedeSIM
      if (result.razaoSocial) setValue('nome', result.razaoSocial, { shouldDirty: true })
      if (result.endereco !== 'Endereco nao disponivel') {
        setValue('endereco', `${result.endereco} - ${result.municipio}/${result.uf}`, { shouldDirty: true })
      }
      if (result.descricaoCnae) setValue('tipo_atividade', result.descricaoCnae, { shouldDirty: true })

      setToast({ message: 'Dados atualizados via RedeSIM.', type: 'success' })
    } catch {
      setToast({ message: 'Erro ao consultar RedeSIM.', type: 'error' })
    }
    setConsultando(false)
  }

  // ── Salvar alterações ────────────────────────────
  const onSubmit = async (formData: EstabelecimentoForm) => {
    // Validação Zod
    const validation = estabelecimentoSchema.safeParse(formData)
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Dados inválidos'
      setToast({ message: firstError, type: 'error' })
      return
    }

    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setToast({ message: 'Sessão expirada. Faça login novamente.', type: 'error' })
        setSaving(false)
        return
      }

      // Sanitiza os dados antes de enviar
      const sanitizedData = {
        nome: validation.data.nome.trim(),
        cnpj: validation.data.cnpj.replace(/\D/g, ''),
        endereco: validation.data.endereco.trim(),
        telefone: (validation.data.telefone || '').trim(),
        email: (validation.data.email || '').trim().toLowerCase(),
        tipo_atividade: (validation.data.tipo_atividade || '').trim(),
      }

      const { error } = await supabase
        .from('estabelecimentos')
        .update(sanitizedData)
        .eq('id', id)
        .eq('user_id', user.id) // Garante que o usuário é o dono

      if (error) {
        console.error('Erro ao atualizar:', error)
        setToast({ message: `Erro ao salvar: ${error.message}`, type: 'error' })
        setSaving(false)
        return
      }

      setToast({ message: 'Estabelecimento atualizado com sucesso!', type: 'success' })

      // Redireciona após feedback visual
      setTimeout(() => router.push(`/estabelecimento/${id}`), 1500)
    } catch (err) {
      console.error('Erro inesperado:', err)
      setToast({ message: 'Erro inesperado. Tente novamente.', type: 'error' })
      setSaving(false)
    }
  }

  // ── Validação inline por campo ───────────────────
  const validate = (field: keyof EstabelecimentoForm) => {
    return {
      ...register(field, {
        validate: (value) => {
          const partial = { [field]: value } as Record<string, unknown>
          const fieldSchema = estabelecimentoSchema.shape[field]
          const result = fieldSchema.safeParse(value)
          return result.success || result.error.issues[0]?.message
        },
      }),
    }
  }

  // ── Campo reutilizável ───────────────────────────
  const FormField = ({
    name,
    label,
    icon: Icon,
    placeholder,
    required = false,
    type = 'text',
    isTextarea = false,
  }: {
    name: keyof EstabelecimentoForm
    label: string
    icon: any
    placeholder: string
    required?: boolean
    type?: string
    isTextarea?: boolean
  }) => (
    <div>
      <label className="input-label">
        {label}
        {required && <span style={{ color: 'var(--danger)' }}> *</span>}
      </label>
      <div className="relative">
        <Icon
          size={18}
          className={`absolute left-3 ${isTextarea ? 'top-3' : 'top-1/2 -translate-y-1/2'}`}
          style={{ color: errors[name] ? 'var(--danger)' : 'var(--text-muted)' }}
        />
        {isTextarea ? (
          <textarea
            id={`field-${name}`}
            {...validate(name)}
            className="input-premium"
            style={{
              paddingLeft: '2.75rem',
              minHeight: 80,
              resize: 'vertical',
              borderColor: errors[name] ? 'var(--danger)' : undefined,
            }}
            placeholder={placeholder}
          />
        ) : (
          <input
            id={`field-${name}`}
            type={type}
            {...validate(name)}
            className="input-premium"
            style={{
              paddingLeft: '2.75rem',
              borderColor: errors[name] ? 'var(--danger)' : undefined,
            }}
            placeholder={placeholder}
          />
        )}
      </div>
      {errors[name] && (
        <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--danger)' }}>
          <AlertTriangle size={12} />
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  )

  // ── Loading state ────────────────────────────────
  if (loading) {
    return (
      <AppLayout title="Editar Estabelecimento" subtitle="Carregando dados...">
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

  // ── Render ───────────────────────────────────────
  return (
    <AppLayout
      title="Editar Estabelecimento"
      subtitle="Atualizar dados cadastrais"
      actions={
        <Link
          href={`/estabelecimento/${id}`}
          className="btn-secondary"
          style={{ textDecoration: 'none' }}
        >
          ← Voltar
        </Link>
      }
    >
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="glass-card-static p-8 space-y-5">
            {/* CNPJ com botão RedeSIM */}
            <div>
              <label className="input-label">
                CNPJ<span style={{ color: 'var(--danger)' }}> *</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: errors.cnpj ? 'var(--danger)' : 'var(--text-muted)' }}
                  />
                  <input
                    id="field-cnpj"
                    type="text"
                    {...validate('cnpj')}
                    className="input-premium"
                    style={{
                      paddingLeft: '2.75rem',
                      borderColor: errors.cnpj ? 'var(--danger)' : undefined,
                    }}
                    placeholder="00.000.000/0000-00"
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
              {errors.cnpj && (
                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--danger)' }}>
                  <AlertTriangle size={12} />
                  {errors.cnpj.message}
                </p>
              )}
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
                    <span style={{ color: 'var(--text-muted)' }}>Razão Social:</span>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {consultaRedeSIM.razaoSocial}
                    </p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Situação:</span>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {consultaRedeSIM.situacaoCadastral}
                    </p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>CNAE:</span>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {consultaRedeSIM.descricaoCnae}
                    </p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Classificação de Risco:</span>
                    <p
                      className="font-bold flex items-center gap-1"
                      style={{ color: getRiskColor(consultaRedeSIM.riskLevel) }}
                    >
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
                    Atividade de baixo risco — Licenciamento automático disponível
                  </div>
                )}
              </div>
            )}

            {/* Campos do formulário */}
            <FormField
              name="nome"
              label="Nome do Estabelecimento"
              icon={Building2}
              placeholder="Nome fantasia ou razão social"
              required
            />

            <FormField
              name="email"
              label="Email"
              icon={Mail}
              placeholder="contato@empresa.com"
              type="email"
            />

            <FormField
              name="telefone"
              label="Telefone"
              icon={Phone}
              placeholder="(82) 99999-9999"
              type="tel"
            />

            <FormField
              name="tipo_atividade"
              label="Tipo de Atividade / CNAE"
              icon={Briefcase}
              placeholder="Ex: Restaurante, Farmácia, Clínica..."
            />

            <FormField
              name="endereco"
              label="Endereço"
              icon={MapPin}
              placeholder="Rua, número, bairro, CEP..."
              required
              isTextarea
            />

            {/* Botões de ação */}
            <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid var(--border-default)' }}>
              <button
                id="submit-editar"
                type="submit"
                disabled={saving || !isDirty}
                className="btn-primary flex-1"
                style={{
                  padding: '0.875rem 1.5rem',
                  opacity: !isDirty ? 0.5 : 1,
                }}
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Salvando...
                  </span>
                ) : (
                  <>
                    <Save size={18} />
                    Salvar Alterações
                  </>
                )}
              </button>

              <Link
                href={`/estabelecimento/${id}`}
                className="btn-secondary"
                style={{
                  textDecoration: 'none',
                  padding: '0.875rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <X size={18} />
                Cancelar
              </Link>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
