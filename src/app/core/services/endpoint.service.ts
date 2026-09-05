import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class EndpointService {
  private readonly baseUrl = environment.apiUrl;
  private readonly authBaseUrl = environment.authApiUrl;

  AUTH = {
    LOGIN: `${this.authBaseUrl}/admin/auth/login`,
    REFRESH: `${this.authBaseUrl}/admin/auth/refresh`,
    CHANGE_PASSWORD: `${this.authBaseUrl}/admin/auth/change-password`,
    CHANGE_PASSWORD_TWO_FA: `${this.authBaseUrl}/admin/auth/change-password`,
    FORGOT_PASSWORD: `${this.authBaseUrl}/admin/auth/forgot-password`,
    RESET_PASSWORD: `${this.authBaseUrl}/admin/auth/reset-password`,
    RESET_PASSWORD_WITH_OTP: `${this.authBaseUrl}/admin/auth/reset-password`,
    RESET_TWO_FA: `${this.authBaseUrl}/admin/auth/reset-password`,
    ME: `${this.authBaseUrl}/admin/auth/me`,
    PROFILE: `${this.authBaseUrl}/admin/auth/profile`,
    TWO_FA_SETUP: `${this.authBaseUrl}/admin/auth/2fa/setup`,
    TWO_FA_ENABLE: `${this.authBaseUrl}/admin/auth/2fa/enable`,
    TWO_FA_DISABLE: `${this.authBaseUrl}/admin/auth/2fa/disable`,
    TWO_FA_VERIFY: `${this.authBaseUrl}/admin/auth/2fa/verify`,
    SSO_STATUS: `${this.authBaseUrl}/admin/auth/sso/status`,
    SESSIONS_LIST: `${this.authBaseUrl}/admin/auth/sessions/list`,
    SESSIONS_REVOKE: `${this.authBaseUrl}/admin/auth/sessions/revoke`,
  };

  LOGS = {
    LIST: `${this.authBaseUrl}/admin/logs`,
  };

  ACTION_LOG = {
    BASE: `${this.authBaseUrl}/admin/logs`,
  };

  UPLOAD_FILE = {
    UPLOAD_SINGLE: `${this.authBaseUrl}/upload/single-s3`,
    UPLOAD_MULTI: `${this.authBaseUrl}/upload/multi-s3`,
    UPLOAD_IMAGE: `${this.authBaseUrl}/upload/image`,
    UPLOAD_AUDIO: `${this.authBaseUrl}/upload/audio`,
    UPLOAD_DOCUMENT: `${this.authBaseUrl}/upload/document`,
    UPLOAD_CATBOX: `${this.authBaseUrl}/upload/catbox`,
    UPLOAD_CATBOX_URL: `${this.authBaseUrl}/upload/catbox-url`,
    UPLOAD_S3: `${this.authBaseUrl}/upload/s3`,
    UPLOAD_SINGLE_S3: `${this.authBaseUrl}/upload/single-s3`,
    UPLOAD_MULTI_S3: `${this.authBaseUrl}/upload/multi-s3`,
  };

  SECURITY = {
    JWKS: `${this.authBaseUrl}/jwks`,
    WELL_KNOWN_JWKS: `${this.authBaseUrl.replace("/api", "")}/.well-known/jwks.json`,
  };
}
