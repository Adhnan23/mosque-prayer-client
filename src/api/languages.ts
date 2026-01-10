import { apiRequest } from "./apiRequest";
import type { LanguageCode, Languages } from "./types";

export const LanguagesApi = {
  get: async () => {
    const data = await apiRequest<Languages[]>({
      method: "GET",
      url: "/languages",
    });

    if (data.length === 0) throw new Error("No languages found");
    return data;
  },
  getByCode: async (code: LanguageCode) => {
    const data = await apiRequest<string>({
      method: "GET",
      url: `/languages/${code}`,
    });

    if (!data) throw new Error("No language found");
    return data;
  },
  insert: async (body: Languages) => {
    const data = await apiRequest<boolean>({
      method: "POST",
      url: "/languages",
      data: body,
    });

    if (!data) throw new Error("Faild to insert language");
    return data;
  },
  delete: async (code: LanguageCode) => {
    const data = await apiRequest<boolean>({
      method: "DELETE",
      url: `/languages/${code}`,
    });

    if (!data) throw new Error("Faild to delete language");
    return data;
  },
};
