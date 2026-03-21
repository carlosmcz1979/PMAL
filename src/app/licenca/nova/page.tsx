'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'
import { FileCheck, Send } from 'lucide-react'

function NovaLicencaContent() {
  const [estabelecimento, setEstabelecimento] = useState<any>(null)
  const [formData, setFormData] = useState({ observacoes: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const estabelecimentoId = searchParams.get('id')

  useEffect(() => {
    if (estabelecimentoId) fetchEstabelecimento()
  }, [estabelecimentoId])

  const fetchEstabelecimento = async () => {
    const { data, error } = await supabase
      .from('estabelecimentos')
      .select('*')
      .eq('id', estabelecimentoId)
      .single()
    if (!error && data) setEstabelecimento(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!estabelecimentoId) {
      setError('Estabelecimento não encontrado')
      setLoading(false)
      return
    }

    const numeroLicenca = `LIC-${Date.now()}`

    const { error } = await supabase.from('licencas').insert([
      {
        estabelecimento_id: estabelecimentoId,
        numero_licenca: numeroLicenca,
        status: 'pendente',
        observacoes: formData.observacoes,
      },
    ])

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(`/estabelecimento/${estabelecimentoId}`)
    }
  }

  return (
    <AppLayout
      title="Nova Licença Sanitária"
      subtitle={estabelecimento ? `Estabelecimento: ${estabelecimento.nome}` : 'Solicitar nova licença'}
      actions={
        <Link href="/dashboard" className="btn-secondary" style={{ textDecoration: 'none' }}>
          ← Voltar
        </Link>
      }
    >
      <div className="max-w-2xl">
        <div className="glass-card-static p-8">
          {/* Info box */}
          {estabelecimento && (
            <div
              className="flex items-center gap-3 p-4 rounded-xl mb-6"
              style={{
                background: 'rgba(20, 184, 166, 0.08)',
                border: '1px solid rgba(20, 184, 166, 0.15)',
              }}
            >
              <FileCheck size={20} style={{ color: 'var(--primary-400)' }} />
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {estabelecimento.nome}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  CNPJ: {estabelecimento.cnpj}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div
              className="p-3 rounded-lg mb-4 text-sm font-medium"
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
            <div>
              <label className="input-label">Observações</label>
              <textarea
                id="licenca-observacoes"
                name="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ observacoes: e.target.value })}
                rows={5}
                className="input-premium"
                style={{ resize: 'vertical' }}
                placeholder="Descreva informações relevantes para a solicitação..."
              />
            </div>

            <button
              id="submit-licenca"
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
              style={{ padding: '0.875rem 1.5rem' }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enviando...
                </span>
              ) : (
                <>
                  <Send size={18} />
                  Solicitar Licença
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}

export default function NovaLicenca() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-base)' }}>
          <div
            className="animate-pulse-glow rounded-full"
            style={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
            }}
          />
        </div>
      }
    >
      <NovaLicencaContent />
    </Suspense>
  )
}
