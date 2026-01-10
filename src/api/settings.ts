import { apiRequest } from "./apiRequest";
import type {
  TSettingsValues,
  Settings,
  TSettingsColumn,
  TSettingsUpdate,
} from "./types";

export const SettingsApi = {
  get: async () => {
    const data = await apiRequest<Settings>({
      method: "GET",
      url: "/settings",
    });
    if (!data) throw new Error("Settings not found");
    return data;
  },
  getByColumn: async (column: TSettingsColumn) => {
    const data = await apiRequest<TSettingsValues>({
      method: "GET",
      url: `/settings/${column}`,
    });
    if (data === null) throw new Error("Settings not found");
    return data;
  },
  update: async (body: TSettingsUpdate) => {
    const data = await apiRequest<boolean>({
      method: "PUT",
      url: `/settings`,
      data: body,
    });
    if (!data) throw new Error("Failed to Update Settings");
    return data;
  },
};
