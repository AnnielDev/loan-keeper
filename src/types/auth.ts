export type User = {
  _id: string;
  email: string;
  name: string;
  language: string;
  currency: string;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export type SignInPayload = {
  email: string;
  password: string;
};

export type SignUpPayload = {
  email: string;
  password: string;
  name: string;
  language?: string;
};
