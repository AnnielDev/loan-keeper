export type LoanStatus = "active" | "overdue" | "paid";
export type LoanStatusFilter = "all" | "active" | "overdue" | "paid";
export type LoanOriginFilter = "all" | "new" | "legacy";

/** Single combined value driving the loans screen's one filter control —
 * splits into a status and an origin query param before hitting the API. */
export type LoanFilterValue = LoanStatusFilter | "new" | "legacy";

export type LoanType = "personal" | "micro_credito";
export type InterestType = "simple" | "compound";
export type PaymentFrequency = "monthly" | "every_2_months" | "every_3_months";
export type PaymentMethod = "cash" | "bank_transfer" | "card" | "other";
export type InstallmentStatus = "paid" | "overdue" | "pending";

export type LoanSummary = {
  _id: string;
  code: string;
  customerId: string;
  customerName: string;
  customerAvatarUrl: string | null;
  totalAmount: number;
  isLegacy: boolean;
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
  collectionDate: string;
  isLegacy: boolean;
};

export type Installment = {
  _id: string;
  dueDate: string;
  amount: number;
  paid: boolean;
  paidAt?: string;
  paidAmount?: number;
  paymentMethod?: PaymentMethod;
  referenceNumber?: string;
  receiptUrl?: string;
  notes?: string;
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
  collectionDate: string;
  totalInterest: number;
  totalAmount: number;
  isLegacy: boolean;
  installments: Installment[];
  registeredBy: string;
  createdAt: string;
  updatedAt: string;
};

export type LoanDetailInstallment = {
  _id: string;
  index: number;
  dueDate: string;
  amount: number;
  paid: boolean;
  paidAt: string | null;
  paidAmount: number | null;
  paymentMethod: PaymentMethod | null;
  referenceNumber: string | null;
  receiptUrl: string | null;
  notes: string | null;
  status: InstallmentStatus;
};

export type LoanDetail = {
  _id: string;
  code: string;
  type: LoanType;
  principal: number;
  interestRate: number;
  interestType: InterestType;
  frequency: PaymentFrequency;
  startDate: string;
  collectionDate: string;
  totalInterest: number;
  totalAmount: number;
  isLegacy: boolean;
  paidAmount: number;
  remainingBalance: number;
  progressPercent: number;
  status: LoanStatus;
  customerId: string;
  customerName: string;
  customerAvatarUrl: string | null;
  nextInstallmentId: string | null;
  nextInstallmentAmount: number | null;
  installments: LoanDetailInstallment[];
};

export type PayInstallmentPayload = {
  amount?: number;
  paymentMethod?: PaymentMethod;
  referenceNumber?: string;
  receiptUrl?: string;
  notes?: string;
  paymentDate?: string;
};

export type PaymentDetail = {
  installmentId: string;
  loanId: string;
  loanCode: string;
  loanType: LoanType;
  isLegacy: boolean;
  customerName: string;
  customerAvatarUrl: string | null;
  amount: number;
  paidAmount: number;
  paidAt: string | null;
  paymentMethod: PaymentMethod | null;
  referenceNumber: string | null;
  receiptUrl: string | null;
  notes: string | null;
  principal: number;
  totalInterest: number;
  totalAmount: number;
  principalPortion: number;
  interestPortion: number;
};
