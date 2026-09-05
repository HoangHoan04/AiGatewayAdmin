import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NzMessageService } from "ng-zorro-antd/message";
import { AiApiService, ModelItem, ProjectItem, PromptTemplateItem } from "../../../core/services/ai-api.service";

@Component({
  selector: "app-templates",
  standalone: false,
  templateUrl: "./templates.component.html",
  styleUrls: ["./templates.component.scss"],
})
export class TemplatesComponent implements OnInit {
  isLoading = true;
  templates: PromptTemplateItem[] = [];
  projects: ProjectItem[] = [];
  models: ModelItem[] = [];

  // Create Template Modal
  createModalVisible = false;
  isSubmitting = false;
  createForm!: FormGroup;

  // Versions Drawer
  versionsDrawerVisible = false;
  selectedTemplate: any = null;
  versionsList: any[] = [];
  isLoadingVersions = false;

  // New Version Modal
  newVersionModalVisible = false;
  isSubmittingVersion = false;
  versionForm!: FormGroup;

  // Test Runner Drawer
  testDrawerVisible = false;
  testForm!: FormGroup;
  isTesting = false;
  testResult: any = null;
  extractedVariables: string[] = [];

  constructor(
    private fb: FormBuilder,
    private aiApi: AiApiService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadProjects();
    this.loadModels();
    this.loadTemplates();
  }

  initForms(): void {
    this.createForm = this.fb.group({
      projectId: [null],
      code: ["", [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      name: ["", [Validators.required]],
      description: [""],
      sourceSystem: ["HRM"],
      module: ["Recruitment"],
      variablesSchemaJson: ["{}"],
      systemPrompt: ["", [Validators.required]],
      userPromptTemplate: ["", [Validators.required]],
    });

    this.versionForm = this.fb.group({
      systemPrompt: ["", [Validators.required]],
      userPromptTemplate: ["", [Validators.required]],
      changeNote: ["", [Validators.required]],
      publishImmediately: [true],
    });

    this.testForm = this.fb.group({
      modelCode: [null],
      temperature: [0.7],
      maxTokens: [1024],
      variables: this.fb.group({}),
    });
  }

  loadProjects(): void {
    this.aiApi.getProjects().subscribe({ next: (res) => (this.projects = res) });
  }

  loadModels(): void {
    this.aiApi.getModels(undefined, true).subscribe({ next: (res) => (this.models = res) });
  }

  loadTemplates(): void {
    this.isLoading = true;
    this.aiApi.getTemplates().subscribe({
      next: (res) => {
        this.templates = res;
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  openCreateModal(): void {
    this.createForm.reset({
      projectId: this.projects.length > 0 ? this.projects[0].id : null,
      code: "",
      name: "",
      description: "",
      sourceSystem: "HRM",
      module: "General",
      variablesSchemaJson: "{}",
      systemPrompt: "Bạn là trợ lý AI chuyên nghiệp phục vụ doanh nghiệp.",
      userPromptTemplate: "Nội dung yêu cầu: {{content}}",
    });
    this.createModalVisible = true;
  }

  handleCreateTemplate(): void {
    if (this.createForm.invalid) return;
    this.isSubmitting = true;

    this.aiApi.createTemplate(this.createForm.value).subscribe({
      next: () => {
        this.message.success("Tạo Prompt Template thành công");
        this.isSubmitting = false;
        this.createModalVisible = false;
        this.loadTemplates();
      },
      error: (err) => {
        this.message.error(`Lỗi: ${err.message || ""}`);
        this.isSubmitting = false;
      },
    });
  }

  openVersionsDrawer(t: PromptTemplateItem): void {
    this.selectedTemplate = t;
    this.versionsDrawerVisible = true;
    this.loadTemplateDetails(t.id);
  }

  loadTemplateDetails(id: string): void {
    this.isLoadingVersions = true;
    this.aiApi.getTemplate(id).subscribe({
      next: (res) => {
        this.selectedTemplate = res;
        this.versionsList = res.versions || [];
        this.isLoadingVersions = false;
      },
      error: () => (this.isLoadingVersions = false),
    });
  }

  publishVersion(versionId: string): void {
    this.aiApi.publishVersion(this.selectedTemplate.id, versionId).subscribe({
      next: () => {
        this.message.success("Đã xuất bản (Publish) phiên bản này!");
        this.loadTemplateDetails(this.selectedTemplate.id);
        this.loadTemplates();
      },
      error: (err) => this.message.error(`Lỗi: ${err.message || ""}`),
    });
  }

  openNewVersionModal(): void {
    const pub = this.selectedTemplate?.publishedVersion;
    this.versionForm.reset({
      systemPrompt: pub?.systemPrompt || "",
      userPromptTemplate: pub?.userPromptTemplate || "",
      changeNote: "",
      publishImmediately: true,
    });
    this.newVersionModalVisible = true;
  }

  handleCreateVersion(): void {
    if (this.versionForm.invalid) return;
    this.isSubmittingVersion = true;

    this.aiApi.createVersion(this.selectedTemplate.id, this.versionForm.value).subscribe({
      next: () => {
        this.message.success("Tạo phiên bản mới thành công!");
        this.isSubmittingVersion = false;
        this.newVersionModalVisible = false;
        this.loadTemplateDetails(this.selectedTemplate.id);
        this.loadTemplates();
      },
      error: (err) => {
        this.message.error(`Lỗi: ${err.message || ""}`);
        this.isSubmittingVersion = false;
      },
    });
  }

  openTestDrawer(t: PromptTemplateItem): void {
    this.selectedTemplate = t;
    this.testResult = null;
    this.testDrawerVisible = true;

    // Extract variables from {{var}}
    const rawTemplate = t.userPromptTemplate || "";
    const matches = rawTemplate.match(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g) || [];
    this.extractedVariables = Array.from(new Set(matches.map((m) => m.replace(/[{}]/g, "").trim())));

    const varGroup: Record<string, any> = {};
    this.extractedVariables.forEach((v) => {
      varGroup[v] = ["", Validators.required];
    });

    this.testForm = this.fb.group({
      modelCode: [this.models.length > 0 ? this.models[0].modelCode : null],
      temperature: [0.7],
      maxTokens: [1024],
      variables: this.fb.group(varGroup),
    });
  }

  runTest(): void {
    if (this.testForm.invalid) return;
    this.isTesting = true;
    this.testResult = null;

    const val = this.testForm.value;
    const payload = {
      modelCode: val.modelCode,
      temperature: val.temperature,
      maxTokens: val.maxTokens,
      variables: val.variables,
    };

    this.aiApi.testTemplate(this.selectedTemplate.id, payload).subscribe({
      next: (res) => {
        this.testResult = res;
        this.isTesting = false;
      },
      error: (err) => {
        this.message.error(`Lỗi kiểm tra prompt: ${err.message || ""}`);
        this.isTesting = false;
      },
    });
  }
}
