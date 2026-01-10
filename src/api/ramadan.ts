import { apiRequest } from "./apiRequest";
import type { Ramadan, TimeFormat, TRamadanUpdate } from "./types";

export const RamadanApi = {
  get: async (format: TimeFormat = 24) => {
    const data = await apiRequest<Ramadan>({
      method: "GET",
      url: "/ramadan",
      params: { format },
    });

    if (!data) throw new Error("No Ramadan Times Found");
    return data;
  },
  update: async (body: TRamadanUpdate) => {
    const data = await apiRequest<boolean>({
      method: "PUT",
      url: `/ramadan`,
      data: body,
    });

    if (!data) throw new Error("Failed to Update Ramadan");
    return data;
  },
};
