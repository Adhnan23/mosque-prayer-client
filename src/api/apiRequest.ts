import type { AxiosRequestConfig } from "axios";
import type { ApiResponse } from "./types";
import api from "./axios";

export interface ApiError extends Error {
  metadata?: any;
}

function normalizeApiError(error: any, messageFallback: string) {
  if (!error) return messageFallback;

  if (Array.isArray(error)) {
    return error.join(", ");
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error === "object") {
    // For dev mode, try to extract meaningful info
    if ("message" in error) return String(error.message);
    if ("detail" in error) return String(error.detail);
    // fallback: stringify
    return JSON.stringify(error);
  }

  return messageFallback;
}

export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const res = await api.request<ApiResponse<T>>(config);

  if (!res.data.success) {
    const err = new Error(
      normalizeApiError(res.data.error, res.data.message)
    ) as ApiError;
    if (res.data.error && typeof res.data.error === "object") {
      err.metadata = { ...res.data.error, status: res.status };
    }
    throw err;
  }

  if (res.data.data == null) {
    throw new Error("No data returned from server");
  }

  return res.data.data;
}
