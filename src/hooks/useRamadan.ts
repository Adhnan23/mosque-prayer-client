import { useMutation, useQuery } from "@tanstack/react-query";
import type { Ramadan, TimeFormat, TRamadanUpdate } from "../api/types";
import { RamadanApi } from "../api";
import { queryClient } from "../App";

export const useRamadan = {
  get: (format: TimeFormat = 24) =>
    useQuery<Ramadan, Error>({
      queryKey: ["ramadan", format],
      queryFn: () => RamadanApi.get(format),
      staleTime: 1000 * 60 * 2,
    }),
  update: () =>
    useMutation({
      mutationFn: ({ body }: { body: TRamadanUpdate }) =>
        RamadanApi.update(body),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["ramadan"],
        });
      },
    }),
};
