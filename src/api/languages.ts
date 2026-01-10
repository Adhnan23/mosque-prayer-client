import { apiRequest } from "./apiRequest";
import type { LanguageCode, Languages } from "./types";

export const getLanguages = async () => {
  const data = await apiRequest<Languages[]>({
    method: "GET",
    url: "/languages",
  });

  if (data.length === 0) throw new Error("No languages found");
  return data;
};

export const getLanguageByCode = async (code: LanguageCode) => {
  const data = await apiRequest<string>({
    method: "GET",
    url: `/languages/${code}`,
  });

  if (!data) throw new Error("No language found");
  return data;
}