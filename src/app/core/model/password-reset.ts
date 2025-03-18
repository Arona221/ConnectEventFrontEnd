// models/password-reset.model.ts
export interface ForgotPasswordRequest {
    email: string;
  }
  
  export interface ResetPasswordRequest {
    email: string;
    code: string;
    newPassword: string;
  }
  
  export interface ApiResponse {
    message: string;
    success: boolean;
  }