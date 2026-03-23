// Servico de integracao RedeSIM
// Rede Nacional para Simplificacao do Registro e Legalizacao de Empresas

import { RedeSIMConsultaResult, RiskLevel } from './types'

// Classificacao de risco por CNAE (simplificada)
const CNAE_RISK_MAP: Record<string, RiskLevel> = {
  '47': 'baixo',   // Comercio varejista
  '56': 'medio',   // Alimentacao
  '86': 'alto',    // Saude
  '85': 'medio',   // Educacao
  '96': 'baixo',   // Servicos pessoais
  '62': 'baixo',   // TI
  '69': 'baixo',   // Contabilidade/advocacia
}

function classifyRisk(cnae: string): RiskLevel {
  const prefix = cnae.substring(0, 2)
  return CNAE_RISK_MAP[prefix] || 'medio'
}

export async function consultarCNPJ(cnpj: string): Promise<RedeSIMConsultaResult> {
  const cleanCnpj = cnpj.replace(/\D/g, '')

  // Tenta API publica da Receita Federal (BrasilAPI)
  try {
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`)
    if (response.ok) {
      const data = await response.json()
      const cnaeCode = data.cnae_fiscal?.toString() || '0000000'
      const riskLevel = classifyRisk(cnaeCode)

      return {
        cnpj: cleanCnpj,
        razaoSocial: data.razao_social || '',
        nomeFantasia: data.nome_fantasia || '',
        situacaoCadastral: data.descricao_situacao_cadastral || 'Ativa',
        cnae: cnaeCode,
        descricaoCnae: data.cnae_fiscal_descricao || '',
        riskLevel,
        endereco: `${data.logradouro || ''}, ${data.numero || ''} - ${data.bairro || ''}`,
        municipio: data.municipio || '',
        uf: data.uf || '',
        autoLicensing: riskLevel === 'baixo',
      }
    }
  } catch (error) {
    console.warn('BrasilAPI indisponivel, usando dados simulados')
  }

  // Fallback: dados simulados
  return {
    cnpj: cleanCnpj,
    razaoSocial: 'Empresa Simulada LTDA',
    nomeFantasia: 'Empresa Simulada',
    situacaoCadastral: 'Ativa',
    cnae: '4712100',
    descricaoCnae: 'Comercio varejista',
    riskLevel: 'medio',
    endereco: 'Endereco nao disponivel',
    municipio: 'Maceio',
    uf: 'AL',
    autoLicensing: false,
  }
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'baixo': return 'var(--success)'
    case 'medio': return 'var(--warning)'
    case 'alto': return 'var(--danger)'
  }
}

export function getRiskLabel(level: RiskLevel): string {
  switch (level) {
    case 'baixo': return 'Baixo Risco'
    case 'medio': return 'Medio Risco'
    case 'alto': return 'Alto Risco'
  }
}
