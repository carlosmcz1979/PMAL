'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import {
  Building2,
  Hash,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  Save,
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
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Usuário não autenticado')
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

  const fields = [
    { name: 'nome', label: 'Nome do Estabelecimento', type: 'text', icon: Building2, required: true, placeholder: 'Nome fantasia ou razão social' },
    { name: 'cnpj', label: 'CNPJ', type: 'text', icon: Hash, required: true, placeholder: '00.000.000/0000-00' },
    { name: 'email', label: 'Email', type: 'email', icon: Mail, required: false, placeholder: 'contato@empresa.com' },
    { name: 'telefone', label: 'Telefone', type: 'tel', icon: Phone, required: false, placeholder: '(82) 99999-9999' },
    { name: 'tipo_atividade', label: 'Tipo de Atividade', type: 'text', icon: Briefcase, required: false, placeholder: 'Ex: Restaurante, Farmácia, Clínica...' },
  ]

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
              className="p-3 rounded-lg mb-6 text-sm font-medium"
              style={{
                background: 'var(--danger-light)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {fields.map((field) => {
              const Icon = field.icon
              return (
                <div key={field.name}>
                  <label className="input-label">{field.label}</label>
                  <div className="relative">
                    <Icon
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--text-muted)' }}
                    />
                    <input
                      id={`field-${field.name}`}
                      type={field.type}
                      name={field.name}
                      value={formData[field.name as keyof typeof formData]}
                      onChange={handleChange}
                      className="input-premium"
                      style={{ paddingLeft: '2.75rem' }}
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                  </div>
                </div>
              )
            })}

            {/* Endereço como textarea */}
            <div>
              <label className="input-label">Endereço</label>
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
                  placeholder="Rua, número, bairro, CEP..."
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
