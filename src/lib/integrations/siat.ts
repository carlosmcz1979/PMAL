// Servico de integracao SIAT
// Sistema de Informacoes de Arrecadacao Tributaria - Prefeitura de Maceio

import { SIATConsultaResult } from './types'

export async function consultarSituacaoFiscal(cnpj: string): Promise<SIATConsultaResult> {
  const cleanCnpj = cnpj.replace(/\D/g, '')

  // API do SIAT nao e publica - simulacao com dados realistas
  // Quando a API for disponibilizada, substituir este bloco
  await new Promise(resolve => setTimeout(resolve, 800))

  // Simulacao baseada no ultimo digito do CNPJ
  const lastDigit = parseInt(cleanCnpj.slice(-1))
  const isAdimplente = lastDigit >= 3

  return {
    cnpj: cleanCnpj,
    situacaoFiscal: isAdimplente ? 'adimplente' : 'inadimplente',
    debitosAbertos: isAdimplente ? 0 : Math.floor(Math.random() * 5) + 1,
    valorTotal: isAdimplente ? 0 : parseFloat((Math.random() * 5000 + 500).toFixed(2)),
    certidaoNegativa: isAdimplente,
    validadeCertidao: isAdimplente
      ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : undefined,
  }
}

export function getSituacaoFiscalColor(situacao: string): string {
  switch (situacao) {
    case 'adimplente': return 'var(--success)'
    case 'inadimplente': return 'var(--danger)'
    default: return 'var(--text-muted)'
  }
}

export function getSituacaoFiscalLabel(situacao: string): string {
  switch (situacao) {
    case 'adimplente': return 'Adimplente'
    case 'inadimplente': return 'Inadimplente'
    default: return 'Nao encontrado'
  }
}
