// Servico de integracao SUPE
// Sistema Unico de Pagamentos Eletronicos

import { SUPEGuia } from './types'

export async function gerarGuiaPagamento(
  cnpj: string,
  descricao: string,
  valor: number
): Promise<SUPEGuia> {
  const cleanCnpj = cnpj.replace(/\D/g, '')

  // API do SUPE nao e publica - simulacao
  await new Promise(resolve => setTimeout(resolve, 600))

  const now = new Date()
  const vencimento = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  return {
    id: `SUPE-${Date.now()}`,
    numero: `DAM-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 99999).toString().padStart(5, '0')}`,
    cnpj: cleanCnpj,
    descricao,
    valor,
    dataEmissao: now.toISOString().split('T')[0],
    dataVencimento: vencimento.toISOString().split('T')[0],
    status: 'pendente',
    codigoBarras: `23793.${Math.floor(Math.random() * 99999)} ${Math.floor(Math.random() * 99999)}.${Math.floor(Math.random() * 999999)} ${Math.floor(Math.random() * 99999)}.${Math.floor(Math.random() * 999999)}`,
  }
}

export async function consultarPagamento(guiaId: string): Promise<SUPEGuia | null> {
  // Simulacao
  await new Promise(resolve => setTimeout(resolve, 400))

  return null // Guia nao encontrada na simulacao
}

export function getStatusPagamentoColor(status: string): string {
  switch (status) {
    case 'pago': return 'var(--success)'
    case 'pendente': return 'var(--warning)'
    case 'vencido': return 'var(--danger)'
    case 'cancelado': return 'var(--text-muted)'
    default: return 'var(--text-muted)'
  }
}
