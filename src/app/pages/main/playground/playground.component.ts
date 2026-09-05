import { Component, OnInit } from "@angular/core";
import { NzMessageService } from "ng-zorro-antd/message";
import { AiApiService, ModelItem } from "../../../core/services/ai-api.service";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
  tokens?: number;
  latencyMs?: number;
  costUsd?: number;
}

@Component({
  selector: "app-playground",
  standalone: false,
  templateUrl: "./playground.component.html",
  styleUrls: ["./playground.component.scss"],
})
export class PlaygroundComponent implements OnInit {
  models: ModelItem[] = [];
  selectedModel: string = "gpt-4o";
  systemPrompt: string = "Bạn là trợ lý AI thông minh, hỗ trợ nghiệp vụ ERP, HRM, WMS, TMS và xử lý tự động hóa.";
  temperature: number = 0.7;
  maxTokens: number = 1024;
  stream: boolean = false;

  messages: ChatMessage[] = [];
  userInput: string = "";
  isLoading: boolean = false;

  constructor(
    private aiApi: AiApiService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadModels();
  }

  loadModels(): void {
    this.aiApi.getModels(undefined, true).subscribe({
      next: (res) => {
        this.models = res;
        if (res.length > 0) {
          const defaultModel = res.find((m) => m.isDefault) || res[0];
          this.selectedModel = defaultModel.modelCode;
        }
      },
    });
  }

  sendMessage(): void {
    if (!this.userInput.trim() || this.isLoading) return;

    const userText = this.userInput.trim();
    this.userInput = "";

    this.messages.push({
      role: "user",
      content: userText,
    });

    this.isLoading = true;

    const apiMessages = [];
    if (this.systemPrompt.trim()) {
      apiMessages.push({ role: "system", content: this.systemPrompt.trim() });
    }
    this.messages.forEach((m) => {
      apiMessages.push({ role: m.role, content: m.content });
    });

    const payload = {
      model: this.selectedModel,
      temperature: this.temperature,
      maxTokens: this.maxTokens,
      stream: false,
      messages: apiMessages,
    };

    const startTime = Date.now();

    this.aiApi.chatComplete(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.messages.push({
          role: "assistant",
          content: res.content || "",
          tokens: res.totalTokens,
          latencyMs: res.latencyMs || (Date.now() - startTime),
          costUsd: res.costUsd,
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.message.error(`Lỗi từ AI Gateway: ${err.message || err.error?.error || "Unknown error"}`);
        this.messages.push({
          role: "assistant",
          content: `⚠️ Lỗi xử lý từ mô hình AI: ${err.error?.error || err.message || "Không thể kết nối đến AI Gateway"}`,
        });
      },
    });
  }

  clearChat(): void {
    this.messages = [];
    this.message.info("Đã xóa hội thoại.");
  }

  quickPrompt(text: string): void {
    this.userInput = text;
    this.sendMessage();
  }
}
