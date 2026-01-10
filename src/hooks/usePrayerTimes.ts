import { useMutation, useQuery } from "@tanstack/react-query";
import { PrayerTimesApi } from "../api";
import { queryClient } from "../App";
import type { PrayerTimes, TimeFormat, TPrayerTimeUpdate } from "../api/types";

export const usePrayerTimes = {
  getAll: (format: TimeFormat = 24, limit?: number) =>
    useQuery<PrayerTimes[], Error>({
      queryKey: ["prayerTimes", "all", format, limit],
      queryFn: () => PrayerTimesApi.getAll(format, limit),
      staleTime: 1000 * 60 * 2,
    }),
  getMonthly: (month: number, format: TimeFormat = 24, limit?: number) =>
    useQuery<PrayerTimes[], Error>({
      queryKey: ["prayerTimes", "month", month, format, limit],
      queryFn: () => PrayerTimesApi.getMonthly(month, format, limit),
      enabled: !!month,
      staleTime: 1000 * 60 * 5,
    }),
  get: (month: number, day: number, format: TimeFormat = 24) =>
    useQuery<PrayerTimes, Error>({
      queryKey: ["prayerTimes", "day", month, day, format],
      queryFn: () => PrayerTimesApi.get(month, day, format),
      enabled: !!month && !!day,
      staleTime: 1000 * 60 * 5,
    }),
  getInRange: (
    sm: number,
    sd: number,
    em: number,
    ed: number,
    format: TimeFormat = 24
  ) =>
    useQuery<PrayerTimes[], Error>({
      queryKey: ["prayerTimes", "range", sm, sd, em, ed, format],
      queryFn: () => PrayerTimesApi.getInRange(sm, sd, em, ed, format),
      enabled: sm > 0 && sd > 0 && em > 0 && ed > 0,
      staleTime: 1000 * 60 * 5,
    }),
  today: (format: TimeFormat = 24) =>
    useQuery<PrayerTimes, Error>({
      queryKey: ["prayerTimes", "today", format],
      queryFn: () => PrayerTimesApi.today(format),
      staleTime: 1000 * 60 * 2,
    }),
  update: () => {
    return useMutation({
      mutationFn: ({
        month,
        day,
        body,
      }: {
        month: number;
        day: number;
        body: TPrayerTimeUpdate;
      }) => PrayerTimesApi.update(month, day, body),

      onSuccess: (_, { month, day }) => {
        queryClient.invalidateQueries({
          queryKey: ["prayerTimes"],
        });

        queryClient.invalidateQueries({
          queryKey: ["prayerTimes", "day", month, day],
        });
      },
    });
  },
  updateByRange: () => {
    return useMutation({
      mutationFn: ({
        sm,
        sd,
        em,
        ed,
        body,
      }: {
        sm: number;
        sd: number;
        em: number;
        ed: number;
        body: TPrayerTimeUpdate;
      }) => PrayerTimesApi.updateByRange(sm, sd, em, ed, body),

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["prayerTimes"],
        });
      },
    });
  },
};
