export interface User {
  id: string;
  email?: string;
  full_name?: string;
  [key: string]: unknown;
}

export interface Session {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user: User;
}
