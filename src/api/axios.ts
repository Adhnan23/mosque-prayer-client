import axios from "axios";
import type { ApiResponse } from "./types";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 2000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data) {
      const data = error.response.data as ApiResponse<unknown>;

      if (data.error?.length) {
        return Promise.reject(new Error(data.error.join(", ")));
      }

      if (data.message) {
        return Promise.reject(new Error(data.message));
      }
    }

    return Promise.reject(error);
  }
);

export default api;
