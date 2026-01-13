import { useState, useEffect } from "react";
import { usePrayerTimes } from "../hooks";
import type { TPrayerTimeUpdate } from "../api/types";

const PrayerTimesTestPage = () => {
  const [format, setFormat] = useState<12 | 24>(12);
  const [limit, setLimit] = useState<number | undefined>(undefined);
  const [month, setMonth] = useState<number | undefined>(undefined);
  const [day, setDay] = useState<number | undefined>(undefined);
  const [endMonth, setEndMonth] = useState<number | undefined>(undefined);
  const [endDay, setEndDay] = useState<number | undefined>(undefined);

  const [debouncedMonth, setDebouncedMonth] = useState<number | undefined>(
    undefined
  );
  const [debouncedDay, setDebouncedDay] = useState<number | undefined>(
    undefined
  );
  const [debouncedEndMonth, setDebouncedEndMonth] = useState<
    number | undefined
  >(undefined);
  const [debouncedEndDay, setDebouncedEndDay] = useState<number | undefined>(
    undefined
  );
  const [debouncedLimit, setDebouncedLimit] = useState<number | undefined>(
    undefined
  );

  const [updateData, setUpdateData] = useState<TPrayerTimeUpdate>({
    fajr: "",
    sunrise: "",
    dhuhr: "",
    asr: "",
    maghrib: "",
    isha: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMonth(month);
      setDebouncedDay(day);
      setDebouncedEndMonth(endMonth);
      setDebouncedEndDay(endDay);
      setDebouncedLimit(limit);
    }, 500);
    return () => clearTimeout(timer);
  }, [month, day, endMonth, endDay, limit]);

  const Loading = () => (
    <div className="text-indigo-600 font-semibold animate-pulse flex items-center justify-center gap-2 py-8">
      <div className="w-5 h-5 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      Loading...
    </div>
  );

  const ErrorMessage = ({ message }: { message: string }) => (
    <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 p-4 rounded-xl shadow-md">
      <div className="flex items-center gap-2">
        <span className="text-2xl">⚠️</span>
        <div>
          <p className="font-bold text-red-800">Error</p>
          <p className="text-red-600 text-sm">{message}</p>
        </div>
      </div>
    </div>
  );

  const PrayerTimeCard = ({ data, title }: { data: any; title: string }) => (
    <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-indigo-100">
      <h3 className="font-black text-xl mb-4 pb-3 text-indigo-900 border-b-2 border-gray-200 flex items-center gap-2">
        <span className="text-2xl">📋</span>
        {title}
      </h3>
      {Array.isArray(data) ? (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {data.map((item, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border-2 border-indigo-200"
            >
              <div className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                <span className="text-lg">📅</span>
                {item.month}/{item.day}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  { label: "Fajr", value: item.fajr, icon: "🌅" },
                  { label: "Sunrise", value: item.sunrise, icon: "☀️" },
                  { label: "Dhuhr", value: item.dhuhr, icon: "🌞" },
                  { label: "Asr", value: item.asr, icon: "🌤️" },
                  { label: "Maghrib", value: item.maghrib, icon: "🌆" },
                  { label: "Isha", value: item.isha, icon: "🌙" },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="flex items-center gap-1">
                    <span>{icon}</span>
                    <span className="font-medium text-gray-700">{label}:</span>
                    <span className="text-indigo-700 font-semibold">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-3 rounded-xl border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-700 flex items-center gap-2">
                <span className="text-xl">📅</span>
                Date:
              </span>
              <span className="text-xl font-black text-blue-700">
                {data.month}/{data.day}
              </span>
            </div>
          </div>
          {[
            {
              label: "Fajr",
              value: data.fajr,
              icon: "🌅",
              color: "from-orange-100 to-amber-100",
              border: "border-orange-300",
            },
            {
              label: "Sunrise",
              value: data.sunrise,
              icon: "☀️",
              color: "from-yellow-100 to-amber-100",
              border: "border-yellow-300",
            },
            {
              label: "Dhuhr",
              value: data.dhuhr,
              icon: "🌞",
              color: "from-yellow-100 to-orange-100",
              border: "border-yellow-300",
            },
            {
              label: "Asr",
              value: data.asr,
              icon: "🌤️",
              color: "from-amber-100 to-orange-100",
              border: "border-amber-300",
            },
            {
              label: "Maghrib",
              value: data.maghrib,
              icon: "🌆",
              color: "from-pink-100 to-rose-100",
              border: "border-pink-300",
            },
            {
              label: "Isha",
              value: data.isha,
              icon: "🌙",
              color: "from-indigo-100 to-purple-100",
              border: "border-indigo-300",
            },
          ].map(({ label, value, icon, color, border }) => (
            <div
              key={label}
              className={`flex justify-between items-center bg-gradient-to-r ${color} p-4 rounded-xl border-2 ${border}`}
            >
              <span className="font-bold text-gray-800 flex items-center gap-2">
                <span className="text-2xl">{icon}</span>
                {label}:
              </span>
              <span className="text-2xl font-black text-indigo-700">
                {value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const queryType = (() => {
    if (
      debouncedEndMonth &&
      debouncedEndDay &&
      debouncedMonth &&
      debouncedDay
    ) {
      return "range";
    }
    if (debouncedMonth && debouncedDay) {
      return "specific";
    }
    if (debouncedMonth) {
      return "monthly";
    }
    return "all";
  })();

  const getAllQuery = usePrayerTimes.getAll(format, debouncedLimit);
  const getMonthlyQuery = usePrayerTimes.getMonthly(
    debouncedMonth || 1,
    format,
    debouncedLimit
  );
  const getSpecificQuery = usePrayerTimes.get(
    debouncedMonth || 1,
    debouncedDay || 1,
    format
  );
  const getRangeQuery = usePrayerTimes.getInRange(
    debouncedMonth || 1,
    debouncedDay || 1,
    debouncedEndMonth || 1,
    debouncedEndDay || 1,
    format
  );
  const getTodayQuery = usePrayerTimes.today(format);

  const activeQuery = (() => {
    switch (queryType) {
      case "range":
        return getRangeQuery;
      case "specific":
        return getSpecificQuery;
      case "monthly":
        return getMonthlyQuery;
      default:
        return getAllQuery;
    }
  })();

  const getQueryTitle = () => {
    switch (queryType) {
      case "range":
        return `Range: ${debouncedMonth}/${debouncedDay} to ${debouncedEndMonth}/${debouncedEndDay}`;
      case "specific":
        return `Specific Day: ${debouncedMonth}/${debouncedDay}`;
      case "monthly":
        return `Monthly: Month ${debouncedMonth}`;
      default:
        return `All Prayer Times${
          debouncedLimit ? ` (limit: ${debouncedLimit})` : ""
        }`;
    }
  };

  const updateMutation = usePrayerTimes.update();
  const updateByRangeMutation = usePrayerTimes.updateByRange();

  const convertTo24Hour = (time12h: string): string => {
    if (!time12h) return "";
    if (/^\d{2}:\d{2}$/.test(time12h)) return time12h;

    const match = time12h.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return time12h;

    let [_, hours, minutes, period] = match;
    let hour = parseInt(hours);

    if (period.toUpperCase() === "PM" && hour !== 12) {
      hour += 12;
    } else if (period.toUpperCase() === "AM" && hour === 12) {
      hour = 0;
    }

    return `${hour.toString().padStart(2, "0")}:${minutes}`;
  };

  useEffect(() => {
    if (
      queryType === "specific" &&
      getSpecificQuery.data &&
      !getSpecificQuery.isPending
    ) {
      const data = getSpecificQuery.data;
      setUpdateData({
        fajr: convertTo24Hour(data.fajr || ""),
        sunrise: convertTo24Hour(data.sunrise || ""),
        dhuhr: convertTo24Hour(data.dhuhr || ""),
        asr: convertTo24Hour(data.asr || ""),
        maghrib: convertTo24Hour(data.maghrib || ""),
        isha: convertTo24Hour(data.isha || ""),
      });
    }
  }, [queryType, getSpecificQuery.data, getSpecificQuery.isPending]);

  const handleUpdate = () => {
    if (!month || !day) {
      alert("Please fill in Month and Day in the filters above");
      return;
    }

    const body = Object.fromEntries(
      Object.entries(updateData).filter(([_, v]) => v !== "")
    ) as TPrayerTimeUpdate;

    if (Object.keys(body).length === 0) {
      alert("Please enter at least one prayer time to update");
      return;
    }
    updateMutation.mutate({ month, day, body });
  };

  const handleRangeUpdate = () => {
    const body = Object.fromEntries(
      Object.entries(updateData).filter(([_, v]) => v !== "")
    ) as TPrayerTimeUpdate;

    if (Object.keys(body).length === 0) {
      alert("Please enter at least one prayer time to update");
      return;
    }

    if (!month || !day || !endMonth || !endDay) {
      alert("Please fill in start and end dates for range update");
      return;
    }

    updateByRangeMutation.mutate({
      sm: month,
      sd: day,
      em: endMonth,
      ed: endDay,
      body,
    });
  };

  const clearFilters = () => {
    setMonth(undefined);
    setDay(undefined);
    setEndMonth(undefined);
    setEndDay(undefined);
    setLimit(undefined);
  };

  const prayerFields = [
    {
      key: "fajr",
      label: "Fajr",
      icon: "🌅",
      color: "from-orange-100 to-amber-100",
      border: "border-orange-300",
    },
    {
      key: "sunrise",
      label: "Sunrise",
      icon: "☀️",
      color: "from-yellow-100 to-amber-100",
      border: "border-yellow-300",
    },
    {
      key: "dhuhr",
      label: "Dhuhr",
      icon: "🌞",
      color: "from-yellow-100 to-orange-100",
      border: "border-yellow-300",
    },
    {
      key: "asr",
      label: "Asr",
      icon: "🌤️",
      color: "from-amber-100 to-orange-100",
      border: "border-amber-300",
    },
    {
      key: "maghrib",
      label: "Maghrib",
      icon: "🌆",
      color: "from-pink-100 to-rose-100",
      border: "border-pink-300",
    },
    {
      key: "isha",
      label: "Isha",
      icon: "🌙",
      color: "from-indigo-100 to-purple-100",
      border: "border-indigo-300",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full shadow-lg mb-4">
            <h1 className="text-4xl font-black flex items-center gap-3">
              <span className="text-5xl">🕌</span>
              Prayer Times Management
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Query and manage prayer times with powerful filtering options
          </p>
        </div>

        {/* Unified Query Controls */}
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 border-2 border-indigo-100">
          <div className="flex justify-between items-center mb-6 pb-3 border-b-2 border-gray-200">
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
              <span className="text-3xl">🔍</span>
              Query Filters
            </h2>
            <button
              onClick={clearFilters}
              className="bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 px-5 py-2 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              🗑️ Clear All
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(Number(e.target.value) as 12 | 24)}
                className="border-2 border-indigo-300 rounded-xl px-3 py-2 w-full font-semibold focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 focus:outline-none transition-all"
              >
                <option value={12}>🕐 12 Hour</option>
                <option value={24}>🕛 24 Hour</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">
                Limit
              </label>
              <input
                type="number"
                value={limit || ""}
                onChange={(e) =>
                  setLimit(e.target.value ? Number(e.target.value) : undefined)
                }
                placeholder="No limit"
                className="border-2 border-indigo-300 rounded-xl px-3 py-2 w-full font-semibold focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">
                Month
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={month || ""}
                onChange={(e) =>
                  setMonth(e.target.value ? Number(e.target.value) : undefined)
                }
                placeholder="Any"
                className="border-2 border-purple-300 rounded-xl px-3 py-2 w-full font-semibold focus:ring-4 focus:ring-purple-200 focus:border-purple-500 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">
                Day
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={day || ""}
                onChange={(e) =>
                  setDay(e.target.value ? Number(e.target.value) : undefined)
                }
                placeholder="Any"
                className="border-2 border-purple-300 rounded-xl px-3 py-2 w-full font-semibold focus:ring-4 focus:ring-purple-200 focus:border-purple-500 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">
                End Month
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={endMonth || ""}
                onChange={(e) =>
                  setEndMonth(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                placeholder="Range end"
                className="border-2 border-pink-300 rounded-xl px-3 py-2 w-full font-semibold focus:ring-4 focus:ring-pink-200 focus:border-pink-500 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">
                End Day
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={endDay || ""}
                onChange={(e) =>
                  setEndDay(e.target.value ? Number(e.target.value) : undefined)
                }
                placeholder="Range end"
                className="border-2 border-pink-300 rounded-xl px-3 py-2 w-full font-semibold focus:ring-4 focus:ring-pink-200 focus:border-pink-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-blue-900">Active Query:</span>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full font-bold text-sm">
                {queryType.toUpperCase()}
              </span>
              <span className="text-gray-600 text-sm">
                {queryType === "all" && "(fetching all records)"}
                {queryType === "monthly" &&
                  `(fetching month ${debouncedMonth})`}
                {queryType === "specific" &&
                  `(fetching ${debouncedMonth}/${debouncedDay})`}
                {queryType === "range" &&
                  `(fetching ${debouncedMonth}/${debouncedDay} to ${debouncedEndMonth}/${debouncedEndDay})`}
              </span>
              {(month !== debouncedMonth ||
                day !== debouncedDay ||
                endMonth !== debouncedEndMonth ||
                endDay !== debouncedEndDay ||
                limit !== debouncedLimit) && (
                <span className="text-orange-600 animate-pulse flex items-center gap-1 bg-orange-100 px-3 py-1 rounded-full text-sm font-semibold">
                  <div className="w-3 h-3 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                  Typing...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Query Results */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-xl font-black mb-4 text-gray-800 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Dynamic Query Result
            </h3>
            {activeQuery.isPending && <Loading />}
            {activeQuery.error && (
              <ErrorMessage message={activeQuery.error.message} />
            )}
            {activeQuery.data && (
              <PrayerTimeCard data={activeQuery.data} title={getQueryTitle()} />
            )}
          </div>

          <div>
            <h3 className="text-xl font-black mb-4 text-gray-800 flex items-center gap-2">
              <span className="text-2xl">📅</span>
              Today's Prayer Times
            </h3>
            {getTodayQuery.isPending && <Loading />}
            {getTodayQuery.error && (
              <ErrorMessage message={getTodayQuery.error.message} />
            )}
            {getTodayQuery.data && (
              <PrayerTimeCard data={getTodayQuery.data} title="Today" />
            )}
          </div>
        </div>

        {/* Update Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Update Single Day */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-green-100">
            <h2 className="text-2xl font-black mb-4 pb-3 border-b-2 border-gray-200 flex items-center gap-3">
              <span className="text-3xl">✏️</span>
              Update Single Day
            </h2>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-blue-200">
                <p className="font-bold mb-2 text-blue-900">
                  Using query filters above:
                </p>
                {month && day ? (
                  <p className="text-green-700 font-semibold flex items-center gap-2">
                    <span className="text-xl">✅</span>
                    Will update {month}/{day}
                  </p>
                ) : (
                  <p className="text-red-700 font-semibold flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    Please fill Month and Day in the filters above
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {prayerFields.map(({ key, label, icon, color, border }) => (
                  <div
                    key={key}
                    className={`bg-gradient-to-br ${color} p-3 rounded-xl border-2 ${border}`}
                  >
                    <label className="block text-sm font-bold mb-2 text-gray-800 flex items-center gap-1">
                      <span>{icon}</span>
                      {label}
                    </label>
                    <input
                      type="time"
                      value={updateData[key as keyof TPrayerTimeUpdate] || ""}
                      onChange={(e) =>
                        setUpdateData({
                          ...updateData,
                          [key]: e.target.value,
                        })
                      }
                      className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full font-semibold focus:ring-4 focus:ring-green-200 focus:border-green-500 focus:outline-none transition-all"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handleUpdate}
                disabled={
                  updateMutation.isPending ||
                  !month ||
                  !day ||
                  !!endMonth ||
                  !!endDay
                }
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-black text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none"
              >
                {updateMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-2xl">💾</span>
                    Update Prayer Times
                  </span>
                )}
              </button>

              {updateMutation.error && (
                <ErrorMessage message={updateMutation.error.message} />
              )}
            </div>
          </div>

          {/* Update Range */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-purple-100">
            <h2 className="text-2xl font-black mb-4 pb-3 border-b-2 border-gray-200 flex items-center gap-3">
              <span className="text-3xl">📆</span>
              Update Range
            </h2>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200">
                <p className="font-bold mb-2 text-purple-900">
                  Using query filters above:
                </p>
                {month && day && endMonth && endDay ? (
                  <p className="text-green-700 font-semibold flex items-center gap-2">
                    <span className="text-xl">✅</span>
                    Will update from {month}/{day} to {endMonth}/{endDay}
                  </p>
                ) : (
                  <p className="text-red-700 font-semibold flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    Please fill Month, Day, End Month, and End Day
                  </p>
                )}
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-4 rounded-xl">
                <p className="text-sm text-blue-800 font-semibold flex items-center gap-2">
                  <span className="text-lg">ℹ️</span>
                  Using prayer times from single update form (left side)
                </p>
              </div>

              <button
                onClick={handleRangeUpdate}
                disabled={
                  updateByRangeMutation.isPending ||
                  !month ||
                  !day ||
                  !endMonth ||
                  !endDay
                }
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-black text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none"
              >
                {updateByRangeMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-2xl">📆</span>
                    Update Range
                  </span>
                )}
              </button>

              {updateByRangeMutation.error && (
                <ErrorMessage message={updateByRangeMutation.error.message} />
              )}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 border-2 border-indigo-300 rounded-2xl p-6 shadow-lg">
          <h3 className="font-black text-indigo-900 mb-4 text-xl flex items-center gap-2">
            <span className="text-2xl">💡</span>
            Quick Tips
          </h3>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-sm text-indigo-800">
                <span className="font-bold">📆 Range Update:</span> Apply
                changes to multiple days at once using date ranges
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-sm text-indigo-800">
                <span className="font-bold">🔄 Auto-prefill:</span> Form fills
                automatically when selecting a specific day
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-sm text-indigo-800">
                <span className="font-bold">⏰ 24H Format:</span> All times are
                stored in 24-hour format (HH:mm)
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-sm text-indigo-800">
                <span className="font-bold">📅 Today Query:</span> Separate
                query shows current day's prayer times
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrayerTimesTestPage;
