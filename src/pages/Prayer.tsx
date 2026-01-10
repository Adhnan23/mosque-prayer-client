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

  // Debounced values
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

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMonth(month);
      setDebouncedDay(day);
      setDebouncedEndMonth(endMonth);
      setDebouncedEndDay(endDay);
      setDebouncedLimit(limit);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [month, day, endMonth, endDay, limit]);

  const Loading = () => (
    <div className="text-blue-500 font-semibold animate-pulse">Loading...</div>
  );

  const ErrorMessage = ({ message }: { message: string }) => (
    <div className="text-red-500 font-semibold bg-red-50 p-3 rounded">
      Error: {message}
    </div>
  );

  const PrayerTimeCard = ({ data, title }: { data: any; title: string }) => (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <h3 className="font-bold text-lg mb-3 text-gray-800 border-b pb-2">
        {title}
      </h3>
      {Array.isArray(data) ? (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {data.map((item, idx) => (
            <div key={idx} className="text-sm border-b pb-2">
              <div className="font-semibold text-gray-700">
                {item.month}/{item.day}
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                <div>Fajr: {item.fajr}</div>
                <div>Sunrise: {item.sunrise}</div>
                <div>Dhuhr: {item.dhuhr}</div>
                <div>Asr: {item.asr}</div>
                <div>Maghrib: {item.maghrib}</div>
                <div>Isha: {item.isha}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">Month/Day:</span>
            <span>
              {data.month}/{data.day}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Fajr:</span>
            <span>{data.fajr}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Sunrise:</span>
            <span>{data.sunrise}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Dhuhr:</span>
            <span>{data.dhuhr}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Asr:</span>
            <span>{data.asr}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Maghrib:</span>
            <span>{data.maghrib}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Isha:</span>
            <span>{data.isha}</span>
          </div>
        </div>
      )}
    </div>
  );

  // Determine which query to use based on filled inputs
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

  // Fetch data based on query type (using debounced values)
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

  // Select active query based on type
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

  // Update Mutations
  const updateMutation = usePrayerTimes.update();
  const updateByRangeMutation = usePrayerTimes.updateByRange();

  // Convert 12-hour format to 24-hour format (HH:mm)
  const convertTo24Hour = (time12h: string): string => {
    if (!time12h) return "";

    // If already in 24-hour format (HH:mm), return as is
    if (/^\d{2}:\d{2}$/.test(time12h)) return time12h;

    // Parse 12-hour format
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

  // Prefill update form when specific day data is loaded
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Prayer Times API Test Page
        </h1>

        {/* Unified Query Controls */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Query Filters</h2>
            <button
              onClick={clearFilters}
              className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded transition"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(Number(e.target.value) as 12 | 24)}
                className="border rounded px-3 py-2 w-full"
              >
                <option value={12}>12 Hour</option>
                <option value={24}>24 Hour</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Limit</label>
              <input
                type="number"
                value={limit || ""}
                onChange={(e) =>
                  setLimit(e.target.value ? Number(e.target.value) : undefined)
                }
                placeholder="No limit"
                className="border rounded px-3 py-2 w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Month</label>
              <input
                type="number"
                min="1"
                max="12"
                value={month || ""}
                onChange={(e) =>
                  setMonth(e.target.value ? Number(e.target.value) : undefined)
                }
                placeholder="Any"
                className="border rounded px-3 py-2 w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Day</label>
              <input
                type="number"
                min="1"
                max="31"
                value={day || ""}
                onChange={(e) =>
                  setDay(e.target.value ? Number(e.target.value) : undefined)
                }
                placeholder="Any"
                className="border rounded px-3 py-2 w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
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
                className="border rounded px-3 py-2 w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">End Day</label>
              <input
                type="number"
                min="1"
                max="31"
                value={endDay || ""}
                onChange={(e) =>
                  setEndDay(e.target.value ? Number(e.target.value) : undefined)
                }
                placeholder="Range end"
                className="border rounded px-3 py-2 w-full"
              />
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
            <span className="font-semibold">Active Query: </span>
            <span className="text-blue-700">{queryType.toUpperCase()}</span>
            <span className="text-gray-600 ml-2">
              {queryType === "all" && "(fetching all records)"}
              {queryType === "monthly" && `(fetching month ${debouncedMonth})`}
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
              <span className="text-orange-600 ml-2 animate-pulse">
                ⏳ Typing...
              </span>
            )}
          </div>
        </div>

        {/* Query Results */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Dynamic Query Result</h3>
            {activeQuery.isPending && <Loading />}
            {activeQuery.error && (
              <ErrorMessage message={activeQuery.error.message} />
            )}
            {activeQuery.data && (
              <PrayerTimeCard data={activeQuery.data} title={getQueryTitle()} />
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Today's Prayer Times</h3>
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
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-3">Update Single Day</h2>
            <div className="space-y-3">
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <p className="font-medium mb-1">Using query filters above:</p>
                {month && day ? (
                  <p className="text-green-700">
                    Will update {month}/{day}
                  </p>
                ) : (
                  <p className="text-red-600">
                    Please fill Month and Day in the filters above
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"].map(
                  (prayer) => (
                    <div key={prayer}>
                      <label className="block text-sm font-medium mb-1 capitalize">
                        {prayer}
                      </label>
                      <input
                        type="time"
                        value={
                          updateData[prayer as keyof TPrayerTimeUpdate] || ""
                        }
                        onChange={(e) =>
                          setUpdateData({
                            ...updateData,
                            [prayer]: e.target.value,
                          })
                        }
                        className="border rounded px-3 py-2 w-full text-sm"
                      />
                    </div>
                  )
                )}
              </div>
              <button
                onClick={handleUpdate}
                disabled={updateMutation.isPending || !month || !day}
                className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {updateMutation.isPending
                  ? "Updating..."
                  : "Update Prayer Times"}
              </button>
              {updateMutation.error && (
                <ErrorMessage message={updateMutation.error.message} />
              )}
            </div>
          </div>

          {/* Update Range */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-3">Update Range</h2>
            <div className="space-y-3">
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <p className="font-medium mb-1">Using query filters above:</p>
                {month && day && endMonth && endDay ? (
                  <p className="text-green-700">
                    Will update from {month}/{day} to {endMonth}/{endDay}
                  </p>
                ) : (
                  <p className="text-red-600">
                    Please fill Month, Day, End Month, and End Day in the
                    filters above
                  </p>
                )}
              </div>
              <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                Using prayer times from single update form (left side)
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
                className="w-full bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700 transition disabled:bg-gray-400"
              >
                {updateByRangeMutation.isPending
                  ? "Updating..."
                  : "Update Range"}
              </button>
              {updateByRangeMutation.error && (
                <ErrorMessage message={updateByRangeMutation.error.message} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrayerTimesTestPage;
