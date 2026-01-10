import z from "zod";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
  error: any | null;
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

export type Ramadan = {
  suhur_end: string;
  taraweeh: string;
};

export type TRamadanUpdate = {
  suhur_end?: string | undefined;
  taraweeh?: string | undefined;
};

export type Settings = {
  mosque_name: string;
  language_code: string;
  time_format: number;
  is_ramadan: boolean;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  foreground_color: string;
} | null;

export type TSettingsColumn =
  | "mosque_name"
  | "language_code"
  | "time_format"
  | "is_ramadan"
  | "primary_color"
  | "secondary_color"
  | "accent_color"
  | "background_color"
  | "foreground_color";

export type TSettingsValues = string | boolean | 24 | 12 | null | undefined;

export type TSettingsUpdate = {
  mosque_name?: string | undefined;
  language_code?: string | undefined;
  time_format?: 24 | 12 | undefined;
  is_ramadan?: boolean | undefined;
  primary_color?: string | undefined;
  secondary_color?: string | undefined;
  accent_color?: string | undefined;
  background_color?: string | undefined;
  foreground_color?: string | undefined;
};

export type Translations = {
  language_code: string;
  category: string;
  key: string;
  value: string;
};

export type TTranslationsInsert = {
  language_code: string;
  category: string;
  key: string;
  value: string;
};

export type TTranslationsUpdate = {
  value?: string | undefined;
};
