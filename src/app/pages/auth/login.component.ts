import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  template: `
    <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #0f172a;">
      <div style="background: #ffffff; padding: 40px; border-radius: 12px; width: 400px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3);">
        <h2 style="color: #6366f1; font-weight: 700; margin-bottom: 8px;">AI GATEWAY</h2>
        <p style="color: #64748b; margin-bottom: 24px;">Hệ thống Quản trị & Điều phối AI ERP</p>
        <button nz-button nzType="primary" nzBlock (click)="login()" style="height: 44px; font-weight: 600;">
          Đăng nhập qua SSO Auth Service
        </button>
      </div>
    </div>
  `,
})
export class LoginComponent {
  constructor(private router: Router) {}
  login(): void {
    this.router.navigate(['/']);
  }
}
