import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

export interface DashboardMetrics {
  totalProviders: number;
  healthyProviders: number;
  totalModels: number;
  totalProjects: number;
  totalActiveKeys: number;
  currentMonth: {
    totalRequests: number;
    totalTokens: number;
    totalCostUsd: number;
    averageLatencyMs: number;
  };
}

export interface ProviderItem {
  id: string;
  name: string;
  providerType: string;
  baseUrl: string;
  priority: number;
  timeoutMs: number;
  maxRetries: number;
  isActive: boolean;
  notes?: string;
  healthStatus: string;
  lastHealthAt?: string;
  hasApiKey: boolean;
  modelCount: number;
  testing?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ModelItem {
  id: string;
  providerId: string;
  providerName: string;
  providerType: string;
  modelCode: string;
  displayName: string;
  inputPricePer1K: number;
  outputPricePer1K: number;
  inputPricePer1M: number;
  outputPricePer1M: number;
  priceUnit: string;
  maxContextTokens: number;
  supportsStreaming: boolean;
  capabilities: number;
  isDefault: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  defaultModelId?: string;
  defaultTemperature?: number;
  activeKeyCount: number;
  quota?: {
    tokenLimit?: number;
    requestLimit?: number;
    costLimitUsd?: number;
    currentMonthTokens: number;
    currentMonthRequests: number;
    currentMonthCostUsd: number;
    alertThreshold: number;
    rateLimitRpm?: number;
    softLimit: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PromptTemplateItem {
  id: string;
  projectId?: string;
  projectName?: string;
  code: string;
  name: string;
  description?: string;
  sourceSystem?: string;
  module?: string;
  variablesSchemaJson?: string;
  publishedVersionId?: string;
  publishedVersionNumber?: number;
  systemPrompt?: string;
  userPromptTemplate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UsageLogItem {
  id: string;
  createdAt: string;
  projectId: string;
  projectName: string;
  projectCode: string;
  apiKeyId: string;
  keyPrefix: string;
  modelCode: string;
  modelDisplayName: string;
  providerType: string;
  fallbackFromProvider?: string;
  endpoint: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
  latencyMs: number;
  status: string;
  errorCode?: string;
  requestId?: string;
  isStreaming: boolean;
}

@Injectable({
  providedIn: "root",
})
export class AiApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Dashboard
  getDashboardMetrics(): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>(`${this.baseUrl}/dashboard/metrics`);
  }

  getTokensChart(days = 14): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/dashboard/chart-tokens?days=${days}`);
  }

  getCostChart(days = 14): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/dashboard/chart-cost?days=${days}`);
  }

  getTopModels(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/dashboard/top-models`);
  }

  getProvidersHealth(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/dashboard/providers-health`);
  }

  // Providers
  getProviders(): Observable<ProviderItem[]> {
    return this.http.get<ProviderItem[]>(`${this.baseUrl}/providers`);
  }

  getProvider(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/providers/${id}`);
  }

  createProvider(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/providers`, data);
  }

  updateProvider(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/providers/${id}`, data);
  }

  deleteProvider(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/providers/${id}`);
  }

  testProvider(id: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/providers/${id}/test`, {});
  }

  // Models
  getModels(providerId?: string, activeOnly?: boolean): Observable<ModelItem[]> {
    let params = new HttpParams();
    if (providerId) params = params.set("providerId", providerId);
    if (activeOnly !== undefined) params = params.set("activeOnly", activeOnly);
    return this.http.get<ModelItem[]>(`${this.baseUrl}/models`, { params });
  }

  getModel(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/models/${id}`);
  }

  createModel(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/models`, data);
  }

  updateModel(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/models/${id}`, data);
  }

  deleteModel(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/models/${id}`);
  }

  // Projects & ApiKeys
  getProjects(): Observable<ProjectItem[]> {
    return this.http.get<ProjectItem[]>(`${this.baseUrl}/projects`);
  }

  getProject(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/projects/${id}`);
  }

  createProject(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/projects`, data);
  }

  updateProject(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/projects/${id}`, data);
  }

  deleteProject(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/projects/${id}`);
  }

  generateApiKey(projectId: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/projects/${projectId}/keys`, data);
  }

  revokeApiKey(projectId: string, keyId: string, reason?: string): Observable<any> {
    let params = new HttpParams();
    if (reason) params = params.set("reason", reason);
    return this.http.delete<any>(`${this.baseUrl}/projects/${projectId}/keys/${keyId}`, { params });
  }

  updateQuota(projectId: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/projects/${projectId}/quota`, data);
  }

  // Prompt Templates
  getTemplates(projectId?: string, category?: string): Observable<PromptTemplateItem[]> {
    let params = new HttpParams();
    if (projectId) params = params.set("projectId", projectId);
    if (category) params = params.set("category", category);
    return this.http.get<PromptTemplateItem[]>(`${this.baseUrl}/templates`, { params });
  }

  getTemplate(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/templates/${id}`);
  }

  createTemplate(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/templates`, data);
  }

  updateTemplate(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/templates/${id}`, data);
  }

  createVersion(id: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/templates/${id}/versions`, data);
  }

  publishVersion(id: string, versionId: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/templates/${id}/versions/${versionId}/publish`, {});
  }

  testTemplate(id: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/templates/${id}/test`, data);
  }

  // Usage Logs
  getLogs(filter: {
    projectId?: string;
    providerType?: string;
    endpoint?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
    page: number;
    pageSize: number;
  }): Observable<{ items: UsageLogItem[]; page: number; pageSize: number; totalItems: number; totalPages: number }> {
    let params = new HttpParams()
      .set("page", filter.page)
      .set("pageSize", filter.pageSize);
    if (filter.projectId) params = params.set("projectId", filter.projectId);
    if (filter.providerType) params = params.set("providerType", filter.providerType);
    if (filter.endpoint) params = params.set("endpoint", filter.endpoint);
    if (filter.status) params = params.set("status", filter.status);
    if (filter.fromDate) params = params.set("fromDate", filter.fromDate);
    if (filter.toDate) params = params.set("toDate", filter.toDate);

    return this.http.get<any>(`${this.baseUrl}/logs`, { params });
  }

  getLogStats(filter?: { projectId?: string; fromDate?: string; toDate?: string }): Observable<any> {
    let params = new HttpParams();
    if (filter?.projectId) params = params.set("projectId", filter.projectId);
    if (filter?.fromDate) params = params.set("fromDate", filter.fromDate);
    if (filter?.toDate) params = params.set("toDate", filter.toDate);
    return this.http.get<any>(`${this.baseUrl}/logs/stats`, { params });
  }

  // Invoke / Playground
  chatComplete(request: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/ai/chat/complete`, request);
  }
}
