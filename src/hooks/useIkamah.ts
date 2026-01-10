import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  IkamahTime,
  Ikamah,
  TimeFormat,
  TIkamahUpdate,
} from "../api/types";
import { IkamahApi } from "../api";
import { queryClient } from "../App";

export const useIkamah = {
  get: () =>
    useQuery<Ikamah, Error>({
      queryKey: ["ikamah"],
      queryFn: () => IkamahApi.get(),
      staleTime: 1000 * 60 * 2,
    }),
  time: (format: TimeFormat = 24) =>
    useQuery<IkamahTime, Error>({
      queryKey: ["ikamah", "time", format],
      queryFn: () => IkamahApi.time(format),
      staleTime: 1000 * 60 * 5,
    }),
  update: () =>
    useMutation({
      mutationFn: ({ body }: { body: TIkamahUpdate }) => IkamahApi.update(body),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["ikamah"],
        });
      },
    }),
};
