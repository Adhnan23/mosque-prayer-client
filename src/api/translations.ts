import { apiRequest } from "./apiRequest";
import type { LanguageCode, Translations, TTranslationsUpdate } from "./types";

export const TranslationsApi = {
  get: async () => {
    const data = await apiRequest<Translations[]>({
      method: "GET",
      url: "/translations",
    });

    if (data.length === 0) throw new Error("No translations found");
    return data;
  },
  getByCode: async (code: LanguageCode) => {
    const data = await apiRequest<Translations[]>({
      method: "GET",
      url: `/translations/${code}`,
    });
    if (data.length === 0) throw new Error("No translations found");
    return data;
  },
  getByCategory: async (code: LanguageCode, category: string) => {
    const data = await apiRequest<Translations[]>({
      method: "GET",
      url: `/translations/${code}/${category}`,
    });
    if (data.length === 0) throw new Error("No translations found");
    return data;
  },
  getByKey: async (code: LanguageCode, key: string) => {
    const data = await apiRequest<string>({
      method: "GET",
      url: `/translations/value/${code}/${key}`,
    });
    if (!data) throw new Error("No translation found");
    return data;
  },
  insert: async (
    code: LanguageCode,
    category: string,
    key: string,
    value: string
  ) => {
    const data = await apiRequest<boolean>({
      method: "POST",
      url: `/translations/${code}/${category}/${key}`,
      data: { value },
    });

    if (!data) throw new Error("Faild to insert translation");
    return data;
  },
  update: async (
    code: LanguageCode,
    category: string,
    key: string,
    body: TTranslationsUpdate
  ) => {
    const data = await apiRequest<boolean>({
      method: "PUT",
      url: `/translations/${code}/${category}/${key}`,
      data: body,
    });

    if (!data) throw new Error("Faild to update translation");
    return data;
  },
  delete: async (code: LanguageCode, category: string, key: string) => {
    const data = await apiRequest<boolean>({
      method: "DELETE",
      url: `/translations/${code}/${category}/${key}`,
    });
    if (!data) throw new Error("Faild to delete translation");
    return data;
  },
};
