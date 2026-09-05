import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AiApiService, DashboardMetrics } from '../../../core/services/ai-api.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  isLoading = false;
  metrics: DashboardMetrics | null = null;
  topModels: any[] = [];
  providersHealth: any[] = [];

  tokenChartOption: any = null;
  costChartOption: any = null;
  modelShareOption: any = null;

  hasTokenData = false;
  hasCostData = false;

  constructor(
    private readonly aiApi: AiApiService,
    private readonly message: NzMessageService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;

    // 1. Core Metrics
    this.aiApi.getDashboardMetrics().subscribe({
      next: (m) => {
        this.metrics = m;
        this.cdr.markForCheck();
      },
      error: () => {
        this.metrics = null;
        this.cdr.markForCheck();
      },
    });

    // 2. Token Consumption 14-day Chart
    this.aiApi.getTokensChart(14).subscribe({
      next: (data) => {
        this.initTokenChart(data || []);
        this.cdr.markForCheck();
      },
      error: () => {
        this.initTokenChart([]);
        this.cdr.markForCheck();
      },
    });

    // 3. Daily Cost 14-day Chart
    this.aiApi.getCostChart(14).subscribe({
      next: (data) => {
        this.initCostChart(data || []);
        this.cdr.markForCheck();
      },
      error: () => {
        this.initCostChart([]);
        this.cdr.markForCheck();
      },
    });

    // 4. Top 5 Models
    this.aiApi.getTopModels().subscribe({
      next: (data) => {
        this.topModels = data || [];
        this.initModelShareChart(this.topModels);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.topModels = [];
        this.modelShareOption = null;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });

    // 5. Providers Health
    this.aiApi.getProvidersHealth().subscribe({
      next: (data) => {
        this.providersHealth = data || [];
        this.cdr.markForCheck();
      },
      error: () => {
        this.providersHealth = [];
        this.cdr.markForCheck();
      },
    });
  }

  pingProvider(provider: any): void {
    provider.testing = true;
    this.aiApi.testProvider(provider.id).subscribe({
      next: (res) => {
        provider.testing = false;
        provider.healthStatus = res.success ? 'Healthy' : 'Unhealthy';
        provider.lastHealthAt = res.testedAt;
        if (res.success) {
          this.message.success(`Kết nối tới ${provider.name} thành công (${res.latencyMs}ms)`);
        } else {
          this.message.error(`Kết nối thất bại: ${res.message}`);
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        provider.testing = false;
        this.message.error(`Lỗi kiểm tra kết nối: ${err.message || 'Network error'}`);
        this.cdr.markForCheck();
      },
    });
  }

  private initTokenChart(data: any[]): void {
    const hasData = data && data.length > 0 && data.some((d) => d.totalTokens > 0);
    this.hasTokenData = hasData;

    const dates = data.map((d) => d.date);
    const inputTokens = data.map((d) => d.inputTokens);
    const outputTokens = data.map((d) => d.outputTokens);

    this.tokenChartOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        borderColor: '#334155',
        textStyle: { color: '#f8fafc', fontSize: 12 },
        formatter: (params: any[]) => {
          let s = `<div style="font-weight:700;margin-bottom:4px;">${params[0].axisValue}</div>`;
          params.forEach((p) => {
            s += `<div>${p.marker} ${p.seriesName}: <b>${p.value.toLocaleString()}</b> tokens</div>`;
          });
          return s;
        },
      },
      legend: {
        data: ['Input Tokens', 'Output Tokens'],
        top: 0,
        textStyle: { color: '#64748b', fontSize: 12 },
      },
      grid: { left: '2%', right: '4%', bottom: '3%', top: '16%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates.length ? dates : ['Hôm nay'],
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { color: '#64748b', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
        axisLabel: {
          color: '#64748b',
          fontSize: 11,
          formatter: (v: number) => (v >= 1000000 ? `${v / 1000000}M` : v >= 1000 ? `${v / 1000}k` : `${v}`),
        },
      },
      series: [
        {
          name: 'Input Tokens',
          type: 'line',
          smooth: true,
          data: inputTokens,
          itemStyle: { color: '#2563eb' },
          lineStyle: { width: 2.5, color: '#2563eb' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(37, 99, 235, 0.3)' },
                { offset: 1, color: 'rgba(37, 99, 235, 0.01)' },
              ],
            },
          },
        },
        {
          name: 'Output Tokens',
          type: 'line',
          smooth: true,
          data: outputTokens,
          itemStyle: { color: '#10b981' },
          lineStyle: { width: 2.5, color: '#10b981' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
                { offset: 1, color: 'rgba(16, 185, 129, 0.01)' },
              ],
            },
          },
        },
      ],
    };
  }

  private initCostChart(data: any[]): void {
    const hasData = data && data.length > 0 && data.some((d) => d.costUsd > 0);
    this.hasCostData = hasData;

    const dates = data.map((d) => d.date);
    const costs = data.map((d) => d.costUsd);

    this.costChartOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        borderColor: '#334155',
        textStyle: { color: '#f8fafc', fontSize: 12 },
        formatter: (params: any[]) => {
          const p = params[0];
          return `<div style="font-weight:700;">${p.axisValue}</div><div>Chi phí: <b style="color:#f59e0b;">$${p.value}</b></div>`;
        },
      },
      grid: { left: '2%', right: '4%', bottom: '3%', top: '16%', containLabel: true },
      xAxis: {
        type: 'category',
        data: dates.length ? dates : ['Hôm nay'],
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { color: '#64748b', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
        axisLabel: { color: '#64748b', fontSize: 11, formatter: '${value}' },
      },
      series: [
        {
          name: 'Chi phí USD',
          type: 'bar',
          barMaxWidth: 24,
          data: costs,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#f59e0b' },
                { offset: 1, color: '#d97706' },
              ],
            },
            borderRadius: [4, 4, 0, 0],
          },
        },
      ],
    };
  }

  private initModelShareChart(models: any[]): void {
    if (!models || models.length === 0) {
      this.modelShareOption = null;
      return;
    }

    const pieData = models.map((m) => ({
      name: m.modelName || m.modelId,
      value: m.totalTokens,
    }));

    this.modelShareOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} tokens ({d}%)',
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        borderColor: '#334155',
        textStyle: { color: '#f8fafc', fontSize: 12 },
      },
      legend: {
        bottom: '0%',
        left: 'center',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: '#64748b', fontSize: 11 },
      },
      series: [
        {
          name: 'Tỷ trọng Tokens',
          type: 'pie',
          radius: ['42%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#ffffff',
            borderWidth: 2,
          },
          label: { show: false },
          emphasis: {
            label: { show: true, fontSize: 13, fontWeight: 'bold' },
          },
          data: pieData,
        },
      ],
    };
  }
}
