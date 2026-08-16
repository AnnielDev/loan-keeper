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

export type Customer = CreateCustomerPayload & {
  _id: string;
  riskLevel: string;
  createdAt: string;
  updatedAt: string;
};
