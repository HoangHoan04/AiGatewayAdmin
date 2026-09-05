import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NzMessageService } from "ng-zorro-antd/message";
import { AiApiService, ModelItem, ProviderItem } from "../../../core/services/ai-api.service";

@Component({
  selector: "app-models",
  standalone: false,
  templateUrl: "./models.component.html",
  styleUrls: ["./models.component.scss"],
})
export class ModelsComponent implements OnInit {
  isLoading = true;
  models: ModelItem[] = [];
  providers: ProviderItem[] = [];
  selectedProviderId: string | null = null;
  modalVisible = false;
  isSubmitting = false;
  editingModelId: string | null = null;
  form!: FormGroup;

  capabilitiesList = [
    { label: "Chat / Text", value: 1 },
    { label: "Vision / Multimodal", value: 2 },
    { label: "OCR Trích xuất", value: 4 },
    { label: "Embedding Vector", value: 8 },
    { label: "JSON Structured Mode", value: 16 },
    { label: "Function Calling / Tools", value: 32 },
  ];

  constructor(
    private fb: FormBuilder,
    private aiApi: AiApiService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadProviders();
    this.loadModels();
  }

  initForm(): void {
    this.form = this.fb.group({
      providerId: ["", [Validators.required]],
      modelCode: ["", [Validators.required]],
      displayName: ["", [Validators.required]],
      inputPricePer1M: [0.15, [Validators.required, Validators.min(0)]],
      outputPricePer1M: [0.60, [Validators.required, Validators.min(0)]],
      maxContextTokens: [128000, [Validators.required, Validators.min(1000)]],
      supportsStreaming: [true],
      capabilities: [1],
      isDefault: [false],
      sortOrder: [1],
      isActive: [true],
    });
  }

  loadProviders(): void {
    this.aiApi.getProviders().subscribe({
      next: (res) => (this.providers = res),
    });
  }

  loadModels(): void {
    this.isLoading = true;
    this.aiApi.getModels(this.selectedProviderId || undefined).subscribe({
      next: (res) => {
        this.models = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.message.error(`Không thể tải models: ${err.message || ""}`);
        this.isLoading = false;
      },
    });
  }

  openCreateModal(): void {
    this.editingModelId = null;
    this.form.reset({
      providerId: this.providers.length > 0 ? this.providers[0].id : "",
      modelCode: "",
      displayName: "",
      inputPricePer1M: 0.15,
      outputPricePer1M: 0.60,
      maxContextTokens: 128000,
      supportsStreaming: true,
      capabilities: 1,
      isDefault: false,
      sortOrder: this.models.length + 1,
      isActive: true,
    });
    this.modalVisible = true;
  }

  openEditModal(m: ModelItem): void {
    this.editingModelId = m.id;
    this.form.patchValue({
      providerId: m.providerId,
      modelCode: m.modelCode,
      displayName: m.displayName,
      inputPricePer1M: m.inputPricePer1M,
      outputPricePer1M: m.outputPricePer1M,
      maxContextTokens: m.maxContextTokens,
      supportsStreaming: m.supportsStreaming,
      capabilities: m.capabilities,
      isDefault: m.isDefault,
      sortOrder: m.sortOrder,
      isActive: m.isActive,
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
    const v = this.form.value;
    const payload = {
      ...v,
      inputPricePer1K: v.inputPricePer1M / 1000,
      outputPricePer1K: v.outputPricePer1M / 1000,
    };

    if (this.editingModelId) {
      this.aiApi.updateModel(this.editingModelId, payload).subscribe({
        next: () => {
          this.message.success("Cập nhật mô hình AI thành công");
          this.isSubmitting = false;
          this.modalVisible = false;
          this.loadModels();
        },
        error: (err) => {
          this.message.error(`Lỗi cập nhật: ${err.message || ""}`);
          this.isSubmitting = false;
        },
      });
    } else {
      this.aiApi.createModel(payload).subscribe({
        next: () => {
          this.message.success("Thêm mới mô hình AI thành công");
          this.isSubmitting = false;
          this.modalVisible = false;
          this.loadModels();
        },
        error: (err) => {
          this.message.error(`Lỗi thêm mới: ${err.message || ""}`);
          this.isSubmitting = false;
        },
      });
    }
  }

  deleteModel(m: ModelItem): void {
    this.aiApi.deleteModel(m.id).subscribe({
      next: () => {
        this.message.success(`Đã xóa model ${m.displayName}`);
        this.loadModels();
      },
      error: (err) => {
        this.message.error(`Lỗi: ${err.message || ""}`);
      },
    });
  }

  hasCapability(cap: number, flag: number): boolean {
    return (cap & flag) === flag;
  }
}
