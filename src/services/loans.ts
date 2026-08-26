import { apiFetch } from "@/services/api";
import type { PaginatedResponse } from "@/types/api";
import type { ApiSuccess } from "@/types/auth";
import type {
  CreateLoanPayload,
  Loan,
  LoanDetail,
  LoanOriginFilter,
  LoanStatusFilter,
  LoanSummary,
  PayInstallmentPayload,
  PaymentDetail,
} from "@/types/loan";

type LoansFilterParams = {
  search?: string;
  status?: LoanStatusFilter;
  origin?: LoanOriginFilter;
};

export function getLoans(params: LoansFilterParams): Promise<LoanSummary[]>;
export function getLoans(
  params: LoansFilterParams & { page: number; limit: number },
): Promise<PaginatedResponse<LoanSummary>>;
export function getLoans(
  params: LoansFilterParams & { page?: number; limit?: number },
) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.status && params.status !== "all") query.set("status", params.status);
  if (params.origin && params.origin !== "all") query.set("origin", params.origin);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const qs = query.toString();
  return apiFetch<LoanSummary[] | PaginatedResponse<LoanSummary>>(
    `/loans/mine${qs ? `?${qs}` : ""}`,
  );
}

export function getLoan(id: string) {
  return apiFetch<LoanDetail>(`/loans/${id}`);
}

export function createLoan(payload: CreateLoanPayload) {
  return apiFetch<ApiSuccess<Loan>>("/loans", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteLoan(id: string) {
  return apiFetch<{ message?: string }>(`/loans/${id}`, { method: "DELETE" });
}

export function payInstallment(loanId: string, installmentId: string, payload: PayInstallmentPayload) {
  return apiFetch<ApiSuccess<Loan>>(`/loans/${loanId}/installments/${installmentId}/pay`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function getPaymentDetail(loanId: string, installmentId: string) {
  return apiFetch<PaymentDetail>(`/loans/${loanId}/installments/${installmentId}`);
}
