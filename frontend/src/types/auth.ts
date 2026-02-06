export interface User {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  user_metadata?: {
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface Session {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  expires_in?: number;
  provider_token?: string;
  provider_refresh_token?: string;
  user: User;
}
