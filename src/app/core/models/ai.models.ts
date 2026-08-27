export interface PagedResult<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ProviderConfigDto {
  id: string;
  provider: string;
  displayName: string;
  modelName: string;
  baseUrl?: string;
  maskedApiKey: string;
  maxTokens: number;
  temperature: number;
  promptTokenPricePer1K: number;
  completionTokenPricePer1K: number;
  isDefault: boolean;
  isActive: boolean;
  supportedModules?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromptTemplateDto {
  id: string;
  code: string;
  name: string;
  sourceSystem: string;
  module: string;
  systemPrompt: string;
  userPromptTemplate: string;
  parametersJson?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AiRequestDto {
  id: string;
  sourceSystem: string;
  module: string;
  provider: string;
  modelName: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
  latencyMs: number;
  status: string;
  errorMessage?: string;
  requestPayload?: string;
  responsePayload?: string;
  traceId?: string;
  createdAt: string;
}

export interface AiJobDto {
  id: string;
  sourceSystem: string;
  jobType: string;
  status: string;
  progress: number;
  inputPayload?: string;
  resultPayload?: string;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface DashboardSummaryDto {
  totalRequests: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  totalCostUsd: number;
  successRate: number;
  avgLatencyMs: number;
  activeProvidersCount: number;
  costBySystem: SystemCostUsageDto[];
  dailyTrends: DailyUsageDto[];
  moduleDistribution: ModuleDistributionDto[];
}

export interface SystemCostUsageDto {
  system: string;
  requestCount: number;
  tokenCount: number;
  costUsd: number;
  percentage: number;
}

export interface DailyUsageDto {
  date: string;
  requestCount: number;
  tokenCount: number;
  costUsd: number;
}

export interface ModuleDistributionDto {
  module: string;
  count: number;
  costUsd: number;
}

export interface AiChatRequest {
  sourceSystem?: string;
  module?: string;
  provider?: string;
  model?: string;
  messages: { role: string; content: string }[];
  systemPrompt?: string;
  promptTemplateCode?: string;
  templateVariables?: Record<string, string>;
  temperature?: number;
  maxTokens?: number;
}

export interface AiChatResponse {
  id: string;
  message: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  latencyMs: number;
  timestamp: string;
}

export interface AiOcrRequest {
  sourceSystem?: string;
  module?: string;
  provider?: string;
  imageBase64?: string;
  documentUrl?: string;
  documentType: string;
  runAsync?: boolean;
}

export interface AiOcrResponse {
  jobId?: string;
  isAsync: boolean;
  status: string;
  extractedText: string;
  structuredData?: Record<string, any>;
  confidence: number;
  promptTokens: number;
  completionTokens: number;
  estimatedCostUsd: number;
  latencyMs: number;
}

export interface AiSummarizeRequest {
  sourceSystem?: string;
  module?: string;
  provider?: string;
  content: string;
  summaryLength: string;
  focusTopic?: string;
  language: string;
}

export interface AiSummarizeResponse {
  summary: string;
  keyPoints: string[];
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  estimatedCostUsd: number;
  latencyMs: number;
}

export interface AiForecastRequest {
  sourceSystem?: string;
  module?: string;
  targetMetric: string;
  historicalData: { date: string; value: number; label?: string }[];
  forecastPeriods: number;
  additionalContext?: string;
}

export interface AiForecastResponse {
  forecastResults: { date: string; value: number; label?: string }[];
  analysisReport: string;
  riskLevel: string;
  recommendations: string[];
  estimatedCostUsd: number;
  latencyMs: number;
}

export interface AiContentGenRequest {
  sourceSystem?: string;
  module?: string;
  topic: string;
  contentType: string;
  tone: string;
  targetAudience: string;
  keyKeywords?: string[];
  language: string;
}

export interface AiContentGenResponse {
  title: string;
  content: string;
  suggestedTags: string[];
  promptTokens: number;
  completionTokens: number;
  estimatedCostUsd: number;
  latencyMs: number;
}
