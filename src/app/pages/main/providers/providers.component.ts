import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NzMessageService } from "ng-zorro-antd/message";
import { AiApiService, ProviderItem } from "../../../core/services/ai-api.service";

@Component({
  selector: "app-providers",
  standalone: false,
  templateUrl: "./providers.component.html",
  styleUrls: ["./providers.component.scss"],
})
export class ProvidersComponent implements OnInit {
  isLoading = true;
  providers: ProviderItem[] = [];
  modalVisible = false;
  isSubmitting = false;
  editingProviderId: string | null = null;
  form!: FormGroup;

  providerTypes = [
    { label: "OpenAI", value: "OpenAI" },
    { label: "Google Gemini", value: "Gemini" },
    { label: "Ollama (Self-Hosted)", value: "Ollama" },
    { label: "DeepSeek", value: "DeepSeek" },
    { label: "Azure OpenAI", value: "AzureOpenAI" },
    { label: "Anthropic Claude", value: "Anthropic" },
    { label: "OpenRouter", value: "OpenRouter" },
    { label: "Qwen / Alibaba", value: "Qwen" },
    { label: "Groq LPU", value: "Groq" },
    { label: "Custom OpenAI-Compatible", value: "CustomOpenAICompat" },
  ];

  constructor(
    private fb: FormBuilder,
    private aiApi: AiApiService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadProviders();
  }

  initForm(): void {
    this.form = this.fb.group({
      name: ["", [Validators.required]],
      providerType: ["OpenAI", [Validators.required]],
      baseUrl: ["https://api.openai.com/v1", [Validators.required]],
      apiKey: [""],
      priority: [1, [Validators.required]],
      timeoutMs: [60000, [Validators.required]],
      maxRetries: [2, [Validators.required]],
      notes: [""],
      organizationId: [""],
      azureDeployment: [""],
      isActive: [true],
    });
  }

  loadProviders(): void {
    this.isLoading = true;
    this.aiApi.getProviders().subscribe({
      next: (res) => {
        this.providers = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.message.error(`Không thể tải danh sách providers: ${err.message || ""}`);
        this.isLoading = false;
      },
    });
  }

  openCreateModal(): void {
    this.editingProviderId = null;
    this.form.reset({
      name: "",
      providerType: "OpenAI",
      baseUrl: "https://api.openai.com/v1",
      apiKey: "",
      priority: this.providers.length + 1,
      timeoutMs: 60000,
      maxRetries: 2,
      notes: "",
      isActive: true,
    });
    this.modalVisible = true;
  }

  openEditModal(p: ProviderItem): void {
    this.editingProviderId = p.id;
    this.form.patchValue({
      name: p.name,
      providerType: p.providerType,
      baseUrl: p.baseUrl,
      apiKey: "",
      priority: p.priority,
      timeoutMs: p.timeoutMs,
      maxRetries: p.maxRetries,
      notes: p.notes,
      isActive: p.isActive,
    });
    this.modalVisible = true;
  }

  handleSave(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => {
        if (c.invalid) {
          c.markAsDirty();
          c.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.isSubmitting = true;
    const val = this.form.value;

    if (this.editingProviderId) {
      this.aiApi.updateProvider(this.editingProviderId, val).subscribe({
        next: () => {
          this.message.success("Cập nhật Provider thành công");
          this.isSubmitting = false;
          this.modalVisible = false;
          this.loadProviders();
        },
        error: (err) => {
          this.message.error(`Lỗi cập nhật: ${err.message || ""}`);
          this.isSubmitting = false;
        },
      });
    } else {
      this.aiApi.createProvider(val).subscribe({
        next: () => {
          this.message.success("Thêm mới Provider thành công");
          this.isSubmitting = false;
          this.modalVisible = false;
          this.loadProviders();
        },
        error: (err) => {
          this.message.error(`Lỗi thêm mới: ${err.message || ""}`);
          this.isSubmitting = false;
        },
      });
    }
  }

  deleteProvider(p: ProviderItem): void {
    this.aiApi.deleteProvider(p.id).subscribe({
      next: () => {
        this.message.success(`Đã xóa provider ${p.name}`);
        this.loadProviders();
      },
      error: (err) => {
        this.message.error(`Lỗi xóa provider: ${err.message || ""}`);
      },
    });
  }

  testConnection(p: any): void {
    p.testing = true;
    this.aiApi.testProvider(p.id).subscribe({
      next: (res) => {
        p.testing = false;
        p.healthStatus = res.success ? "Healthy" : "Unhealthy";
        p.lastHealthAt = res.testedAt;
        if (res.success) {
          this.message.success(`Kết nối tới ${p.name} thành công (${res.latencyMs}ms)`);
        } else {
          this.message.error(`Kết nối thất bại: ${res.message}`);
        }
      },
      error: (err) => {
        p.testing = false;
        this.message.error(`Lỗi kiểm tra kết nối: ${err.message}`);
      },
    });
  }
}
