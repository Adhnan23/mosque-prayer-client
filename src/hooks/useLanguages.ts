import { useMutation, useQuery } from "@tanstack/react-query";
import type { LanguageCode, Languages } from "../api/types";
import { LanguagesApi } from "../api";
import { queryClient } from "../App";

export const useLanguages = {
  get: () =>
    useQuery<Languages[], Error>({
      queryKey: ["languages"],
      queryFn: () => LanguagesApi.get(),
      staleTime: 1000 * 60 * 2,
    }),
  getByCode: (code: LanguageCode) =>
    useQuery<string, Error>({
      queryKey: ["languages", code],
      queryFn: () => LanguagesApi.getByCode(code),
      staleTime: 1000 * 60 * 2,
    }),
  insert: () => {
    return useMutation({
      mutationFn: ({ body }: { body: Languages }) => LanguagesApi.insert(body),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["languages"],
        });
      },
    });
  },
  delete: () =>
    useMutation({
      mutationFn: ({ code }: { code: LanguageCode }) =>
        LanguagesApi.delete(code),
      onSuccess: (_, { code }) => {
        queryClient.invalidateQueries({
          queryKey: ["languages", code],
        });
        queryClient.invalidateQueries({
          queryKey: ["languages"],
        });
      },
    }),
};
