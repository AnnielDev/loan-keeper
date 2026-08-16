import { apiFetch } from "@/services/api";
import type { ApiSuccess } from "@/types/auth";
import type {
  CreateCustomerPayload,
  Customer,
  CustomerStatusFilter,
  CustomerSummary,
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
