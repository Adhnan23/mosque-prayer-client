import { useQuery } from "@tanstack/react-query";
import type { LanguageCode, Languages } from "../api/types";
import { getLanguageByCode, getLanguages } from "../api";

export const useGetLanguages = () =>
  useQuery<Languages[], Error>({
    queryKey: ["languages"],
    queryFn: () => getLanguages(),
    staleTime: 1000 * 60 * 2,
  });

export const useGetLanguageByCode = (code: LanguageCode) =>
  useQuery<string, Error>({
    queryKey: ["language", code],
    queryFn: () => getLanguageByCode(code),
    staleTime: 1000 * 60 * 2,
  });