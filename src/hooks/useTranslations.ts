import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  LanguageCode,
  Translations,
  TTranslationsUpdate,
} from "../api/types";
import { TranslationsApi } from "../api";
import { queryClient } from "../App";

export const useTranslations = {
  get: () =>
    useQuery<Translations[], Error>({
      queryKey: ["translations"],
      queryFn: () => TranslationsApi.get(),
      staleTime: 1000 * 60 * 2,
    }),
  getByCode: (code: LanguageCode) =>
    useQuery<Translations[], Error>({
      queryKey: ["translations", "code", code],
      queryFn: () => TranslationsApi.getByCode(code),
      enabled: !!code && code.length >= 2,
      staleTime: 1000 * 60 * 2,
    }),
  getByCategory: (code: LanguageCode, category: string) =>
    useQuery<Translations[], Error>({
      queryKey: ["translations", "code", code, "category", category],
      queryFn: () => TranslationsApi.getByCategory(code, category),
      enabled: !!code && code.length >= 2,
      staleTime: 1000 * 60 * 2,
    }),
  getByKey: (code: LanguageCode, key: string) =>
    useQuery<string, Error>({
      queryKey: ["translations", "code", code, "key", key],
      queryFn: () => TranslationsApi.getByKey(code, key),
      enabled: !!code && code.length >= 2,
      staleTime: 1000 * 60 * 2,
    }),
  insert: () =>
    useMutation({
      mutationFn: ({
        code,
        category,
        key,
        value,
      }: {
        code: LanguageCode;
        category: string;
        key: string;
        value: string;
      }) => TranslationsApi.insert(code, category, key, value),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["translations"],
        });
      },
    }),
  update: () =>
    useMutation({
      mutationFn: ({
        code,
        category,
        key,
        body,
      }: {
        code: LanguageCode;
        category: string;
        key: string;
        body: TTranslationsUpdate;
      }) => TranslationsApi.update(code, category, key, body),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["translations"],
        });
      },
    }),
  delete: () =>
    useMutation({
      mutationFn: ({
        code,
        category,
        key,
      }: {
        code: LanguageCode;
        category: string;
        key: string;
      }) => TranslationsApi.delete(code, category, key),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["translations"],
        });
      },
    }),
};
