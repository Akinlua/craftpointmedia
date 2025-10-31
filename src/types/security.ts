export interface SecuritySettings {
  id: string;
  userId: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  backupCodes?: string[];
  passwordLastChanged: string;
  loginSessions: LoginSession[];
  apiKeys: ApiKey[];
  updatedAt: string;
}

export interface LoginSession {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  location?: string;
  userAgent: string;
  current: boolean;
  lastActivity: string;
  createdAt: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string; // Masked in UI
  permissions: string[];
  lastUsed?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}