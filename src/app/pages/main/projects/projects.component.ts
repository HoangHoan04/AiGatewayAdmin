import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NzMessageService } from "ng-zorro-antd/message";
import { AiApiService, ModelItem, ProjectItem } from "../../../core/services/ai-api.service";

@Component({
  selector: "app-projects",
  standalone: false,
  templateUrl: "./projects.component.html",
  styleUrls: ["./projects.component.scss"],
})
export class ProjectsComponent implements OnInit {
  isLoading = true;
  projects: ProjectItem[] = [];
  models: ModelItem[] = [];

  // Project Modal
  projectModalVisible = false;
  isSubmittingProject = false;
  editingProjectId: string | null = null;
  projectForm!: FormGroup;

  // Keys Drawer
  keysDrawerVisible = false;
  selectedProject: any = null;
  keysList: any[] = [];
  isLoadingKeys = false;

  // Key Gen Modal
  genKeyModalVisible = false;
  isSubmittingKey = false;
  keyForm!: FormGroup;
  generatedPlaintextKey: string | null = null;

  // Quota Modal
  quotaModalVisible = false;
  isSubmittingQuota = false;
  quotaForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private aiApi: AiApiService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadModels();
    this.loadProjects();
  }

  initForms(): void {
    this.projectForm = this.fb.group({
      name: ["", [Validators.required]],
      code: ["", [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      description: [""],
      defaultModelId: [null],
      defaultTemperature: [0.7],
      tokenLimit: [20000000],
      requestLimit: [50000],
      costLimitUsd: [100.0],
      alertThreshold: [80.0],
      rateLimitRpm: [120],
      isActive: [true],
    });

    this.keyForm = this.fb.group({
      name: ["", [Validators.required]],
      allowedModels: [""],
      rateLimitRpm: [120],
      expiresInDays: [365],
    });

    this.quotaForm = this.fb.group({
      tokenLimit: [20000000, [Validators.required]],
      requestLimit: [50000, [Validators.required]],
      costLimitUsd: [100.0, [Validators.required]],
      alertThreshold: [80.0, [Validators.required]],
      rateLimitRpm: [120, [Validators.required]],
      softLimit: [false],
      alertWebhook: [""],
    });
  }

  loadModels(): void {
    this.aiApi.getModels(undefined, true).subscribe({
      next: (res) => (this.models = res),
    });
  }

  loadProjects(): void {
    this.isLoading = true;
    this.aiApi.getProjects().subscribe({
      next: (res) => {
        this.projects = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.message.error(`Lỗi tải dự án: ${err.message || ""}`);
        this.isLoading = false;
      },
    });
  }

  openCreateProjectModal(): void {
    this.editingProjectId = null;
    this.projectForm.reset({
      name: "",
      code: "",
      description: "",
      defaultModelId: this.models.length > 0 ? this.models[0].id : null,
      defaultTemperature: 0.7,
      tokenLimit: 20000000,
      requestLimit: 50000,
      costLimitUsd: 100.0,
      alertThreshold: 80.0,
      rateLimitRpm: 120,
      isActive: true,
    });
    this.projectModalVisible = true;
  }

  handleSaveProject(): void {
    if (this.projectForm.invalid) {
      Object.values(this.projectForm.controls).forEach((c) => {
        if (c.invalid) {
          c.markAsDirty();
          c.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.isSubmittingProject = true;
    const val = this.projectForm.value;

    this.aiApi.createProject(val).subscribe({
      next: () => {
        this.message.success("Tạo dự án thành công");
        this.isSubmittingProject = false;
        this.projectModalVisible = false;
        this.loadProjects();
      },
      error: (err) => {
        this.message.error(`Lỗi: ${err.message || ""}`);
        this.isSubmittingProject = false;
      },
    });
  }

  openKeysDrawer(p: ProjectItem): void {
    this.selectedProject = p;
    this.keysDrawerVisible = true;
    this.loadProjectDetails(p.id);
  }

  loadProjectDetails(id: string): void {
    this.isLoadingKeys = true;
    this.aiApi.getProject(id).subscribe({
      next: (res) => {
        this.selectedProject = res;
        this.keysList = res.apiKeys || [];
        this.isLoadingKeys = false;
      },
      error: () => (this.isLoadingKeys = false),
    });
  }

  openGenerateKeyModal(): void {
    this.generatedPlaintextKey = null;
    this.keyForm.reset({
      name: `${this.selectedProject?.code} API Key`,
      allowedModels: "",
      rateLimitRpm: 120,
      expiresInDays: 365,
    });
    this.genKeyModalVisible = true;
  }

  handleGenerateKey(): void {
    if (this.keyForm.invalid) return;

    this.isSubmittingKey = true;
    this.aiApi.generateApiKey(this.selectedProject.id, this.keyForm.value).subscribe({
      next: (res) => {
        this.isSubmittingKey = false;
        this.generatedPlaintextKey = res.apiKey;
        this.message.success("Khóa API đã được sinh thành công!");
        this.loadProjectDetails(this.selectedProject.id);
        this.loadProjects();
      },
      error: (err) => {
        this.message.error(`Lỗi sinh khóa: ${err.message || ""}`);
        this.isSubmittingKey = false;
      },
    });
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text);
    this.message.success("Đã sao chép khóa API vào Clipboard!");
  }

  revokeKey(key: any): void {
    this.aiApi.revokeApiKey(this.selectedProject.id, key.id).subscribe({
      next: () => {
        this.message.success("Đã thu hồi API Key");
        this.loadProjectDetails(this.selectedProject.id);
        this.loadProjects();
      },
      error: (err) => this.message.error(`Lỗi: ${err.message || ""}`),
    });
  }

  openQuotaModal(p: ProjectItem): void {
    this.selectedProject = p;
    this.quotaForm.patchValue({
      tokenLimit: p.quota?.tokenLimit || 20000000,
      requestLimit: p.quota?.requestLimit || 50000,
      costLimitUsd: p.quota?.costLimitUsd || 100.0,
      alertThreshold: p.quota?.alertThreshold || 80.0,
      rateLimitRpm: p.quota?.rateLimitRpm || 120,
      softLimit: p.quota?.softLimit || false,
    });
    this.quotaModalVisible = true;
  }

  handleSaveQuota(): void {
    if (this.quotaForm.invalid) return;
    this.isSubmittingQuota = true;

    this.aiApi.updateQuota(this.selectedProject.id, this.quotaForm.value).subscribe({
      next: () => {
        this.message.success("Cập nhật hạn mức Quota thành công");
        this.isSubmittingQuota = false;
        this.quotaModalVisible = false;
        this.loadProjects();
      },
      error: (err) => {
        this.message.error(`Lỗi: ${err.message || ""}`);
        this.isSubmittingQuota = false;
      },
    });
  }

  calcPercent(current: number, limit?: number): number {
    if (!limit || limit === 0) return 0;
    return Math.min(100, Math.round((current / limit) * 100));
  }
}
