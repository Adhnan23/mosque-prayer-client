import type { PrayerTimes, TimeFormat, TPrayerTimeUpdate } from "./types";
import { apiRequest } from "./apiRequest";

export const PrayerTimesApi = {
  getAll: async (format: TimeFormat = 24, limit?: number) => {
    const data = await apiRequest<PrayerTimes[]>({
      url: "/prayer",
      method: "GET",
      params: { format, limit },
    });

    if (!data[0]) throw new Error("No prayer times found");
    return data;
  },
  getMonthly: async (
    month: number,
    format: TimeFormat = 24,
    limit?: number
  ) => {
    const data = await apiRequest<PrayerTimes[]>({
      url: `/prayer/${month}`,
      method: "GET",
      params: { format, limit },
    });

    if (!data[0]) throw new Error("No prayer times found");
    return data;
  },
  get: async (month: number, day: number, format: TimeFormat = 24) => {
    const data = await apiRequest<PrayerTimes[]>({
      url: `/prayer/${month}/${day}`,
      method: "GET",
      params: { format },
    });

    if (!data[0]) throw new Error("No prayer times found");
    return data[0];
  },
  getInRange: async (
    sm: number,
    sd: number,
    em: number,
    ed: number,
    format: TimeFormat = 24
  ) => {
    const data = await apiRequest<PrayerTimes[]>({
      url: `/prayer/range/${sm}/${sd}/${em}/${ed}`,
      method: "GET",
      params: { format },
    });

    if (!data[0]) throw new Error("No prayer times found");
    return data;
  },
  today: async (format: TimeFormat = 24) => {
    const data = await apiRequest<PrayerTimes[]>({
      url: "/prayer/today",
      method: "GET",
      params: { format },
    });

    if (!data[0]) throw new Error("No prayer times found");
    return data[0];
  },
  update: async (month: number, day: number, body: TPrayerTimeUpdate) => {
    const data = await apiRequest<boolean>({
      url: `/prayer/${month}/${day}`,
      method: "PUT",
      data: body,
    });

    if (!data) throw new Error("Failed to update prayer times");
    return data;
  },
  updateByRange: async (
    sm: number,
    sd: number,
    em: number,
    ed: number,
    body: TPrayerTimeUpdate
  ) => {
    const data = await apiRequest<boolean>({
      url: `/prayer/range/${sm}/${sd}/${em}/${ed}`,
      method: "PUT",
      data: body,
    });

    if (!data) throw new Error("Failed to update prayer times");
    return data;
  },
};
