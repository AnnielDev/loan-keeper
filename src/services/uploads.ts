import { File } from "expo-file-system";

import { apiFetch } from "@/services/api";
import type { ApiSuccess } from "@/types/auth";

export function uploadImage(uri: string) {
  const formData = new FormData();
  formData.append("file", new File(uri));

  return apiFetch<ApiSuccess<{ url: string }>>("/uploads", {
    method: "POST",
    body: formData,
  });
}
