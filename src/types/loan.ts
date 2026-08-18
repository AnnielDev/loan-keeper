export type LoanStatus = "active" | "overdue" | "paid";
export type LoanStatusFilter = "all" | "active" | "overdue" | "paid";

export type LoanType = "personal" | "micro_credito";
export type InterestType = "simple" | "compound";
export type PaymentFrequency = "weekly" | "biweekly" | "monthly";

export type LoanSummary = {
  _id: string;
  code: string;
  customerId: string;
  customerName: string;
  customerAvatarUrl: string | null;
  totalAmount: number;
  progressPercent: number;
  status: LoanStatus;
  nextPaymentDate: string | null;
  daysOverdue: number | null;
};

export type CreateLoanPayload = {
  customerId: string;
  type: LoanType;
  principal: number;
  interestRate: number;
  interestType: InterestType;
  frequency: PaymentFrequency;
  installmentsCount: number;
  startDate: string;
};

export type Installment = {
  _id: string;
  dueDate: string;
  amount: number;
  paid: boolean;
  paidAt?: string;
  paidAmount?: number;
};

export type Loan = {
  _id: string;
  code: string;
  customer: string;
  type: LoanType;
  principal: number;
  interestRate: number;
  interestType: InterestType;
  frequency: PaymentFrequency;
  startDate: string;
  totalInterest: number;
  totalAmount: number;
  installments: Installment[];
  registeredBy: string;
  createdAt: string;
  updatedAt: string;
};
