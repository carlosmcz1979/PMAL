// Tipos compartilhados para integracoes governamentais

export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'simulated'

export interface IntegrationConfig {
  name: string
  code: string
  description: string
  status: IntegrationStatus
  baseUrl?: string
  apiKey?: string
  lastSync?: string
}

// RedeSIM
export type RiskLevel = 'baixo' | 'medio' | 'alto'

export interface RedeSIMConsultaResult {
  cnpj: string
  razaoSocial: string
  nomeFantasia: string
  situacaoCadastral: string
  cnae: string
  descricaoCnae: string
  riskLevel: RiskLevel
  endereco: string
  municipio: string
  uf: string
  autoLicensing: boolean
}

// SIAT
export interface SIATConsultaResult {
  cnpj: string
  situacaoFiscal: 'adimplente' | 'inadimplente' | 'nao_encontrado'
  debitosAbertos: number
  valorTotal: number
  certidaoNegativa: boolean
  validadeCertidao?: string
}

// SUPE
export interface SUPEGuia {
  id: string
  numero: string
  cnpj: string
  descricao: string
  valor: number
  dataEmissao: string
  dataVencimento: string
  status: 'pendente' | 'pago' | 'vencido' | 'cancelado'
  codigoBarras?: string
}

// Facilita Alagoas
export interface FacilitaConsultaResult {
  cnpj: string
  nire: string
  situacao: 'ativa' | 'inativa' | 'suspensa' | 'nao_encontrada'
  dataRegistro: string
  tipoEmpresa: string
  capitalSocial: number
  portalUrl: string
}

// Corpo de Bombeiros
export type VistoriaStatus = 'aprovada' | 'reprovada' | 'pendente' | 'vencida' | 'nao_encontrada'

export interface BombeirosConsultaResult {
  cnpj: string
  protocolo: string
  tipoDocumento: 'AVCB' | 'CLCB'
  status: VistoriaStatus
  dataVistoria?: string
  dataValidade?: string
  observacoes?: string
}
