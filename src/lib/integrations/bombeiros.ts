// Servico de integracao Corpo de Bombeiros
// Sistema de inspecao e vistoria - AVCB/CLCB

import { BombeirosConsultaResult, VistoriaStatus } from './types'

export async function consultarVistoria(cnpj: string): Promise<BombeirosConsultaResult> {
  const cleanCnpj = cnpj.replace(/\D/g, '')

  // API dos Bombeiros nao e publica - simulacao
  await new Promise(resolve => setTimeout(resolve, 900))

  const lastDigit = parseInt(cleanCnpj.slice(-1))
  let status: VistoriaStatus = 'pendente'

  if (lastDigit >= 7) status = 'aprovada'
  else if (lastDigit >= 4) status = 'pendente'
  else if (lastDigit >= 2) status = 'vencida'
  else status = 'reprovada'

  const isApproved = status === 'aprovada'

  return {
    cnpj: cleanCnpj,
    protocolo: `CBM-AL-${new Date().getFullYear()}-${Math.floor(Math.random() * 99999).toString().padStart(5, '0')}`,
    tipoDocumento: Math.random() > 0.5 ? 'AVCB' : 'CLCB',
    status,
    dataVistoria: isApproved
      ? new Date(Date.now() - Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : undefined,
    dataValidade: isApproved
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : undefined,
    observacoes: isApproved ? 'Vistoria aprovada sem pendencias' : 'Aguardando agendamento de vistoria',
  }
}

export function getVistoriaStatusColor(status: VistoriaStatus): string {
  switch (status) {
    case 'aprovada': return 'var(--success)'
    case 'pendente': return 'var(--warning)'
    case 'reprovada': return 'var(--danger)'
    case 'vencida': return 'var(--danger)'
    default: return 'var(--text-muted)'
  }
}

export function getVistoriaStatusLabel(status: VistoriaStatus): string {
  switch (status) {
    case 'aprovada': return 'Aprovada'
    case 'pendente': return 'Pendente'
    case 'reprovada': return 'Reprovada'
    case 'vencida': return 'Vencida'
    default: return 'Nao encontrada'
  }
}
