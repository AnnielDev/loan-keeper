import { apiFetch } from "@/services/api";
import type { ApiSuccess } from "@/types/auth";

export function uploadImage(uri: string, fileName: string, mimeType: string) {
  const formData = new FormData();
  formData.append("file", {
    uri,
    name: fileName,
    type: mimeType,
  } as unknown as Blob);

  return apiFetch<ApiSuccess<{ url: string }>>("/uploads", {
    method: "POST",
    body: formData,
  });
}
