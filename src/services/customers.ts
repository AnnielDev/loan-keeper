import { apiFetch } from "@/services/api";
import type { ApiSuccess } from "@/types/auth";
import type {
  CreateCustomerPayload,
  Customer,
  CustomerDetail,
  CustomerStatusFilter,
  CustomerSummary,
  UpdateCustomerPayload,
} from "@/types/customer";

export function getCustomers(params: { search?: string; status?: CustomerStatusFilter }) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.status && params.status !== "all") query.set("status", params.status);

  const qs = query.toString();
  return apiFetch<CustomerSummary[]>(`/customers${qs ? `?${qs}` : ""}`);
}

export function createCustomer(payload: CreateCustomerPayload) {
  return apiFetch<ApiSuccess<Customer>>("/customers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getCustomerDetail(id: string) {
  return apiFetch<CustomerDetail>(`/customers/${id}/detail`);
}

export function getCustomer(id: string) {
  return apiFetch<Customer>(`/customers/${id}`);
}

export function updateCustomer(id: string, payload: UpdateCustomerPayload) {
  return apiFetch<ApiSuccess<Customer>>(`/customers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteCustomer(id: string) {
  return apiFetch<{ message?: string }>(`/customers/${id}`, { method: "DELETE" });
}
