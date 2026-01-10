import { apiRequest } from "./apiRequest";
import type { IkamahTime, Ikamah, TimeFormat, TIkamahUpdate } from "./types";

export const IkamahApi = {
  get: async () => {
    const data = await apiRequest<Ikamah>({
      method: "GET",
      url: "/ikamah",
    });

    if (!data) throw new Error("No Ikamah Found");
    return data;
  },
  time: async (format: TimeFormat = 24) => {
    const data = await apiRequest<IkamahTime>({
      method: "GET",
      url: "/ikamah/time",
      params: { format },
    });

    if (!data) throw new Error("No Ikamah Times Found");
    return data;
  },
  update: async (body: TIkamahUpdate) => {
    const data = await apiRequest<boolean>({
      method: "PUT",
      url: `/ikamah`,
      data: body,
    });

    if (!data) throw new Error("Failed to Update Ikamah");
    return data;
  },
};
