import { apiFetch } from "@/services/api";
import type { ApiSuccess } from "@/types/auth";
import type {
  CreateLoanPayload,
  Loan,
  LoanDetail,
  LoanStatusFilter,
  LoanSummary,
  PayInstallmentPayload,
} from "@/types/loan";

export function getLoans(params: { search?: string; status?: LoanStatusFilter }) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.status && params.status !== "all") query.set("status", params.status);

  const qs = query.toString();
  return apiFetch<LoanSummary[]>(`/loans${qs ? `?${qs}` : ""}`);
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
