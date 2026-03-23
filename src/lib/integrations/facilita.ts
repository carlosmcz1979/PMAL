// Servico de integracao Facilita Alagoas
// Portal de servicos do Estado - Juceal (Junta Comercial)

import { FacilitaConsultaResult } from './types'

export async function consultarRegistro(cnpj: string): Promise<FacilitaConsultaResult> {
  const cleanCnpj = cnpj.replace(/\D/g, '')

  // API do Facilita nao e publica - simulacao
  await new Promise(resolve => setTimeout(resolve, 700))

  const lastDigit = parseInt(cleanCnpj.slice(-1))

  return {
    cnpj: cleanCnpj,
    nire: `27${Math.floor(Math.random() * 999999999).toString().padStart(9, '0')}`,
    situacao: lastDigit >= 2 ? 'ativa' : 'suspensa',
    dataRegistro: new Date(Date.now() - Math.floor(Math.random() * 365 * 5) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tipoEmpresa: 'Sociedade Empresaria Limitada',
    capitalSocial: parseFloat((Math.random() * 500000 + 10000).toFixed(2)),
    portalUrl: `https://facilita.al.gov.br/consulta/${cleanCnpj}`,
  }
}

export function getSituacaoRegistroColor(situacao: string): string {
  switch (situacao) {
    case 'ativa': return 'var(--success)'
    case 'suspensa': return 'var(--warning)'
    case 'inativa': return 'var(--danger)'
    default: return 'var(--text-muted)'
  }
}
