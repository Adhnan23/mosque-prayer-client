import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  Settings,
  TSettingsColumn,
  TSettingsUpdate,
  TSettingsValues,
} from "../api/types";
import { SettingsApi } from "../api";
import { queryClient } from "../App";

export const useSettings = {
  get: (refetchInterval?: number) =>
    useQuery<Settings, Error>({
      queryKey: ["settings"],
      queryFn: () => SettingsApi.get(),
      staleTime: 1000 * 20,
      refetchInterval: refetchInterval || false,
    }),
  getByColumn: (column: TSettingsColumn) =>
    useQuery<TSettingsValues, Error>({
      queryKey: ["settings", column],
      queryFn: () => SettingsApi.getByColumn(column),
      staleTime: 1000 * 60 * 2,
    }),
  update: () =>
    useMutation({
      mutationFn: ({ body }: { body: TSettingsUpdate }) =>
        SettingsApi.update(body),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["settings"],
        });
      },
    }),
};
