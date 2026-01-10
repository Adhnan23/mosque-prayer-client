import z from "zod";

export type ApiResponse<T> = {
  success: boolean; // true if request succeeded
  message: string; // success or error message
  data: T | null; // the actual payload
  error: any | null; // backend error or validation info
};

export type PrayerTimes = {
  month: number;
  day: number;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
};

export type Languages = {
  code: string;
  name: string;
};

export type TimeFormat = 12 | 24;

export const languageCode = z.string().min(2).max(4).toLowerCase();
export type LanguageCode = z.infer<typeof languageCode>;

export type TPrayerTimeUpdate = {
  fajr?: string | undefined;
  sunrise?: string | undefined;
  dhuhr?: string | undefined;
  asr?: string | undefined;
  maghrib?: string | undefined;
  isha?: string | undefined;
};
