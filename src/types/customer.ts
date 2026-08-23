import type { LoanStatus, LoanType } from "@/types/loan";

export type CustomerStatus = "active" | "overdue";
export type CustomerStatusFilter = "all" | "active" | "overdue";

export type CustomerSummary = {
  _id: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  pendingBalance: number;
  status: CustomerStatus;
};

export type CreateCustomerPayload = {
  fullName: string;
  documentId: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  occupation?: string;
  monthlyIncome?: number;
  avatarUrl?: string;
  documentUrls?: string[];
};

export type UpdateCustomerPayload = Partial<CreateCustomerPayload>;

export type RiskLevel = "bajo" | "medio" | "alto";

export type Customer = CreateCustomerPayload & {
  _id: string;
  riskLevel: RiskLevel;
  createdAt: string;
  updatedAt: string;
};

export type CustomerLoanSummary = {
  _id: string;
  code: string;
  type: LoanType;
  principal: number;
  totalAmount: number;
  paidAmount: number;
  progressPercent: number;
  status: LoanStatus;
  startDate: string;
  nextPaymentDate: string | null;
  daysOverdue: number | null;
  nextInstallmentId: string | null;
  nextInstallmentAmount: number | null;
};

export type CustomerDetail = {
  _id: string;
  fullName: string;
  documentId: string;
  phone: string | null;
  address: string | null;
  occupation: string | null;
  monthlyIncome: number | null;
  avatarUrl: string | null;
  documentUrls: string[];
  riskLevel: RiskLevel;
  createdAt: string;
  pendingBalance: number;
  totalLoaned: number;
  totalCollected: number;
  loans: CustomerLoanSummary[];
};
