export type SubscriptionStatus = "trialing" | "active" | "expired" | "canceled";

export type User = {
  _id: string;
  email: string;
  name: string;
  language: string;
  currency: string;
  balance: number;
  country?: string;
  timezone?: string;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: string;
  subscriptionExpiresAt?: string;
};

export type AuthResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export type ApiSuccess<T> = {
  message?: string;
  data: T;
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
  balance: number;
  currency: string;
};

export type UpdateLocationPayload = {
  country?: string;
  timezone?: string;
};

export type Language = {
  code: string;
  name: string;
};

export type UpdateLanguagePayload = {
  language: string;
};

export type Currency = {
  code: string;
  symbol: string;
};

export type UpdateCurrencyPayload = {
  currency: string;
};

export type UpdateNamePayload = {
  name: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type VerifyEmailPayload = {
  email: string;
  code: string;
};

export type ResendVerificationPayload = {
  email: string;
};

export type VerifyResetCodePayload = {
  email: string;
  code: string;
};

export type ResetPasswordPayload = {
  email: string;
  password: string;
};

export type GoogleSignInPayload = {
  idToken: string;
};

export type SubscriptionStatusResponse = {
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: string;
  subscriptionExpiresAt?: string;
};

export type VerifyPurchasePayload = {
  purchaseToken: string;
  productId: string;
};
