import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  LanguageCode,
  Notice,
  TNoticeInsert,
  TNoticeUpdate,
} from "../api/types";
import { NoticeApi } from "../api";
import { queryClient } from "../App";

export const useNotice = {
  get: (isActive?: boolean) =>
    useQuery<Notice[], Error>({
      queryKey: isActive === undefined ? ["notices"] : ["notices", isActive],
      queryFn: () => NoticeApi.get(isActive),
      staleTime: 1000 * 60 * 2,
    }),
  getById: (id: number) =>
    useQuery<Notice, Error>({
      queryKey: ["notices", "id", id],
      queryFn: () => NoticeApi.getById(id),
      enabled: id > 0,
      staleTime: 1000 * 60 * 2,
    }),
  getByCode: (code: LanguageCode) =>
    useQuery<Notice[], Error>({
      queryKey: ["notices", "code", code],
      queryFn: () => NoticeApi.getByCode(code),
      enabled: !!code && code.length >= 2,
      staleTime: 1000 * 60 * 2,
    }),
  insert: () =>
    useMutation({
      mutationFn: ({ body }: { body: TNoticeInsert }) => NoticeApi.insert(body),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["notices"],
        });
      },
    }),
  update: () =>
    useMutation({
      mutationFn: ({ id, body }: { id: number; body: TNoticeUpdate }) =>
        NoticeApi.update(id, body),
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({
          queryKey: ["notices", id],
        });
        queryClient.invalidateQueries({
          queryKey: ["notices"],
        });
      },
    }),
  delete: () =>
    useMutation({
      mutationFn: ({ id }: { id: number }) => NoticeApi.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["notices"],
        });
      },
    }),
};
