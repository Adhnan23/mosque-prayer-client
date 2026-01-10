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

export type Ikamah = {
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
  jummah: number;
};

export type TIkamahUpdate = {
  fajr?: number | undefined;
  dhuhr?: number | undefined;
  asr?: number | undefined;
  maghrib?: number | undefined;
  isha?: number | undefined;
  jummah?: number | undefined;
};

export type IkamahTime = {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  jummah: string;
} | null;

export type Notice = {
  id: number;
  language_code: string;
  content: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

export type TNoticeInsert = {
  language_code: string;
  content: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

export type TNoticeUpdate = {
  language_code?: string | undefined;
  content?: string | undefined;
  start_date?: string | undefined;
  end_date?: string | undefined;
  is_active?: boolean | undefined;
};
