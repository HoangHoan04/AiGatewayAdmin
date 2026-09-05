import { Component, OnInit } from "@angular/core";
import { AiApiService, ProjectItem, UsageLogItem } from "../../../core/services/ai-api.service";

@Component({
  selector: "app-usage-logs",
  standalone: false,
  templateUrl: "./usage-logs.component.html",
  styleUrls: ["./usage-logs.component.scss"],
})
export class UsageLogsComponent implements OnInit {
  isLoading = true;
  logs: UsageLogItem[] = [];
  projects: ProjectItem[] = [];

  page = 1;
  pageSize = 20;
  totalItems = 0;

  selectedProjectId: string | null = null;
  selectedProviderType: string | null = null;
  selectedEndpoint: string | null = null;
  selectedStatus: string | null = null;

  stats: any = {
    totalRequests: 0,
    totalTokens: 0,
    totalCostUsd: 0,
    averageLatencyMs: 0,
    successRate: 100,
  };

  constructor(private aiApi: AiApiService) {}

  ngOnInit(): void {
    this.loadProjects();
    this.loadLogs();
    this.loadStats();
  }

  loadProjects(): void {
    this.aiApi.getProjects().subscribe({
      next: (res) => (this.projects = res),
    });
  }

  loadLogs(): void {
    this.isLoading = true;
    this.aiApi
      .getLogs({
        projectId: this.selectedProjectId || undefined,
        providerType: this.selectedProviderType || undefined,
        endpoint: this.selectedEndpoint || undefined,
        status: this.selectedStatus || undefined,
        page: this.page,
        pageSize: this.pageSize,
      })
      .subscribe({
        next: (res) => {
          this.logs = res.items;
          this.totalItems = res.totalItems;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  loadStats(): void {
    this.aiApi
      .getLogStats({
        projectId: this.selectedProjectId || undefined,
      })
      .subscribe({
        next: (res) => (this.stats = res),
      });
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadLogs();
    this.loadStats();
  }

  onPageChange(p: number): void {
    this.page = p;
    this.loadLogs();
  }
}
