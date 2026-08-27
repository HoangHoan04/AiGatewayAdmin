import { Component } from "@angular/core";

@Component({
  selector: "app-not-found",
  standalone: false,
  template: `
    <div style="text-align: center; padding: 80px 20px;">
      <h1 style="font-size: 72px; color: #6366f1; margin: 0;">404</h1>
      <h2>Trang Không Tồn Tại</h2>
      <p style="color: #64748b;">
        Đường dẫn bạn yêu cầu không tồn tại trong hệ thống AI Gateway.
      </p>
      <a nz-button nzType="primary" routerLink="/">Quay Về Trang Chủ</a>
    </div>
  `,
})
export class NotFoundComponent {}

@Component({
  selector: "app-access-denied",
  standalone: false,
  template: `
    <div style="text-align: center; padding: 80px 20px;">
      <h1 style="font-size: 72px; color: #ef4444; margin: 0;">403</h1>
      <h2>Truy Cập Bị Từ Chối</h2>
      <p style="color: #64748b;">
        Bạn không có đủ quyền để truy cập tính năng AI này.
      </p>
      <a nz-button nzType="primary" routerLink="/">Quay Về Trang Chủ</a>
    </div>
  `,
})
export class AccessDeniedComponent {}

@Component({
  selector: "app-coming-soon",
  standalone: false,
  template: `
    <div style="text-align: center; padding: 80px 20px;">
      <h2>Tính Năng Đang Phát Triển</h2>
      <p style="color: #64748b;">
        Tính năng này sẽ được cập nhật trong phiên bản tiếp theo.
      </p>
      <a nz-button nzType="primary" routerLink="/">Quay Về Trang Chủ</a>
    </div>
  `,
})
export class ComingSoonComponent {}

@Component({
  selector: "app-server-error",
  standalone: false,
  template: `
    <div style="text-align: center; padding: 80px 20px;">
      <h1 style="font-size: 72px; color: #f59e0b; margin: 0;">500</h1>
      <h2>Lỗi Máy Chủ</h2>
      <p style="color: #64748b;">
        Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại sau.
      </p>
      <a nz-button nzType="primary" routerLink="/">Quay Về Trang Chủ</a>
    </div>
  `,
})
export class ServerErrorComponent {}
