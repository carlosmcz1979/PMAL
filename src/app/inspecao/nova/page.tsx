'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'
import jsPDF from 'jspdf'
import { ClipboardCheck, FileText, Save } from 'lucide-react'

function NovaInspecaoContent() {
  const [estabelecimento, setEstabelecimento] = useState<any>(null)
  const [formData, setFormData] = useState({
    data_inspecao: new Date().toISOString().split('T')[0],
    tipo_inspecao: 'Rotina',
    observacoes: '',
    resultado: 'conforme',
  })
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const generatePDF = async (inspecaoId: string) => {
    const doc = new jsPDF()

    // Header
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('AUTO DE INSPEÇÃO SANITÁRIA', 105, 25, { align: 'center' })

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('VISA Maceió — Vigilância Sanitária', 105, 32, { align: 'center' })

    // Divider
    doc.setDrawColor(20, 184, 166)
    doc.setLineWidth(0.5)
    doc.line(20, 38, 190, 38)

    // Data
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Dados do Estabelecimento', 20, 48)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`Nome: ${estabelecimento.nome}`, 20, 56)
    doc.text(`CNPJ: ${estabelecimento.cnpj}`, 20, 63)
    doc.text(`Endereço: ${estabelecimento.endereco || 'N/A'}`, 20, 70)

    doc.setFont('helvetica', 'bold')
    doc.text('Dados da Inspeção', 20, 85)

    doc.setFont('helvetica', 'normal')
    doc.text(`Data: ${new Date(formData.data_inspecao).toLocaleDateString('pt-BR')}`, 20, 93)
    doc.text(`Tipo: ${formData.tipo_inspecao}`, 20, 100)
    doc.text(`Resultado: ${formData.resultado}`, 20, 107)

    doc.setFont('helvetica', 'bold')
    doc.text('Observações:', 20, 122)
    doc.setFont('helvetica', 'normal')
    const splitText = doc.splitTextToSize(formData.observacoes || 'Sem observações.', 170)
    doc.text(splitText, 20, 130)

    // Footer
    doc.setDrawColor(200)
    doc.line(20, 260, 190, 260)
    doc.setFontSize(8)
    doc.text(`ID: ${inspecaoId}`, 20, 267)
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, 273)

    doc.save(`auto-inspecao-${inspecaoId}.pdf`)
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

    const { data, error } = await supabase
      .from('inspecoes')
      .insert([
        {
          estabelecimento_id: estabelecimentoId,
          data_inspecao: formData.data_inspecao,
          tipo_inspecao: formData.tipo_inspecao,
          observacoes: formData.observacoes,
          resultado: formData.resultado,
          auto_gerado: true,
        },
      ])
      .select()

    if (error) {
      setError(error.message)
      setLoading(false)
    } else if (data && data[0]) {
      await generatePDF(data[0].id)
      router.push(`/estabelecimento/${estabelecimentoId}`)
    }
  }

  const resultOptions = [
    { value: 'conforme', label: 'Conforme', color: 'var(--success)' },
    { value: 'não_conforme', label: 'Não Conforme', color: 'var(--danger)' },
    { value: 'pendente', label: 'Pendente', color: 'var(--warning)' },
  ]

  return (
    <AppLayout
      title="Nova Inspeção"
      subtitle={estabelecimento ? `Estabelecimento: ${estabelecimento.nome}` : 'Registrar nova inspeção'}
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
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.15)',
              }}
            >
              <ClipboardCheck size={20} style={{ color: 'var(--success)' }} />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="input-label">Data da Inspeção</label>
                <input
                  id="inspecao-data"
                  type="date"
                  name="data_inspecao"
                  value={formData.data_inspecao}
                  onChange={handleChange}
                  className="input-premium"
                  required
                />
              </div>

              <div>
                <label className="input-label">Tipo de Inspeção</label>
                <select
                  id="inspecao-tipo"
                  name="tipo_inspecao"
                  value={formData.tipo_inspecao}
                  onChange={handleChange}
                  className="input-premium"
                >
                  <option>Rotina</option>
                  <option>Denúncia</option>
                  <option>Acompanhamento</option>
                  <option>Especial</option>
                </select>
              </div>
            </div>

            {/* Result Selection */}
            <div>
              <label className="input-label">Resultado</label>
              <div className="grid grid-cols-3 gap-3 mt-1">
                {resultOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, resultado: opt.value }))}
                    className="p-3 rounded-xl text-center text-sm font-semibold transition-all"
                    style={{
                      background:
                        formData.resultado === opt.value
                          ? `${opt.color}20`
                          : 'var(--bg-input)',
                      border: `2px solid ${
                        formData.resultado === opt.value ? opt.color : 'var(--border-default)'
                      }`,
                      color:
                        formData.resultado === opt.value ? opt.color : 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="input-label">Observações</label>
              <textarea
                id="inspecao-observacoes"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                className="input-premium"
                style={{ resize: 'vertical', minHeight: 120 }}
                placeholder="Descreva observações, irregularidades encontradas, recomendações..."
                rows={5}
              />
            </div>

            <button
              id="submit-inspecao"
              type="submit"
              disabled={loading}
              className="btn-success w-full"
              style={{ padding: '0.875rem 1.5rem' }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Registrando...
                </span>
              ) : (
                <>
                  <FileText size={18} />
                  Registrar Inspeção e Gerar PDF
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}

export default function NovaInspecao() {
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
      <NovaInspecaoContent />
    </Suspense>
  )
}
