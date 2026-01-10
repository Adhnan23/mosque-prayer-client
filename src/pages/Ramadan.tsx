import { useState, useEffect } from "react";
import { useRamadan } from "../hooks";
import type { TRamadanUpdate } from "../api/types";

const RamadanTestPage = () => {
  const [format, setFormat] = useState<12 | 24>(12);
  const [updateData, setUpdateData] = useState<TRamadanUpdate>({
    suhur_end: undefined,
    taraweeh: undefined,
  });

  const Loading = () => (
    <div className="text-blue-500 font-semibold animate-pulse">Loading...</div>
  );

  const ErrorMessage = ({ message }: { message: string }) => (
    <div className="text-red-500 font-semibold bg-red-50 p-3 rounded">
      Error: {message}
    </div>
  );

  const SuccessMessage = ({ message }: { message: string }) => (
    <div className="text-green-700 font-semibold bg-green-50 p-3 rounded">
      {message}
    </div>
  );

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

  // Query
  const getQuery = useRamadan.get(format);

  // Mutation
  const updateMutation = useRamadan.update();

  // Prefill form with current data
  useEffect(() => {
    if (getQuery.data && !getQuery.isPending) {
      setUpdateData({
        suhur_end: convertTo24Hour(getQuery.data.suhur_end || ""),
        taraweeh: convertTo24Hour(getQuery.data.taraweeh || ""),
      });
    }
  }, [getQuery.data, getQuery.isPending]);

  const handleUpdate = () => {
    const body = Object.fromEntries(
      Object.entries(updateData).filter(([_, v]) => v !== undefined && v !== "")
    ) as TRamadanUpdate;

    if (Object.keys(body).length === 0) {
      alert("Please enter at least one time to update");
      return;
    }

    updateMutation.mutate({ body });
  };

  const handleReset = () => {
    if (getQuery.data) {
      setUpdateData({
        suhur_end: convertTo24Hour(getQuery.data.suhur_end || ""),
        taraweeh: convertTo24Hour(getQuery.data.taraweeh || ""),
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🌙 Ramadan Times
          </h1>
          <p className="text-gray-600">
            Manage Suhur and Taraweeh prayer times
          </p>
        </div>

        {/* Format Selector */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-3">Display Format</h2>
          <select
            value={format}
            onChange={(e) => setFormat(Number(e.target.value) as 12 | 24)}
            className="border rounded px-3 py-2"
          >
            <option value={12}>12 Hour</option>
            <option value={24}>24 Hour</option>
          </select>
        </div>

        {/* Current Ramadan Times */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">
            Current Ramadan Times ({format}-hour format)
          </h2>
          {getQuery.isPending && <Loading />}
          {getQuery.error && <ErrorMessage message={getQuery.error.message} />}
          {getQuery.data && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Suhur End */}
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-lg border-2 border-orange-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">🌅</span>
                  <h3 className="text-lg font-semibold text-gray-700">
                    Suhur End Time
                  </h3>
                </div>
                <div className="text-4xl font-bold text-orange-600 mt-4">
                  {getQuery.data.suhur_end}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Last time to eat before fasting begins
                </p>
              </div>

              {/* Taraweeh */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-lg border-2 border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">🕌</span>
                  <h3 className="text-lg font-semibold text-gray-700">
                    Taraweeh Prayer
                  </h3>
                </div>
                <div className="text-4xl font-bold text-purple-600 mt-4">
                  {getQuery.data.taraweeh}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Special night prayer during Ramadan
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Update Section */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-xl font-bold">Update Ramadan Times</h2>
            <button
              onClick={handleReset}
              className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded transition"
            >
              Reset to Current
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Suhur End Input */}
            <div>
              <label className="block text-sm font-medium mb-2">
                🌅 Suhur End Time
              </label>
              <input
                type="time"
                value={updateData.suhur_end || ""}
                onChange={(e) =>
                  setUpdateData({
                    ...updateData,
                    suhur_end: e.target.value || undefined,
                  })
                }
                className="border rounded px-3 py-2 w-full text-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Time when eating must stop (before Fajr)
              </p>
            </div>

            {/* Taraweeh Input */}
            <div>
              <label className="block text-sm font-medium mb-2">
                🕌 Taraweeh Prayer Time
              </label>
              <input
                type="time"
                value={updateData.taraweeh || ""}
                onChange={(e) =>
                  setUpdateData({
                    ...updateData,
                    taraweeh: e.target.value || undefined,
                  })
                }
                className="border rounded px-3 py-2 w-full text-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Time for special Ramadan night prayer
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800 mb-4">
            ℹ️ <strong>Note:</strong> Times are in 24-hour format (HH:mm). The
            display will show them in your selected format.
          </div>

          <button
            onClick={handleUpdate}
            disabled={updateMutation.isPending}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition disabled:from-gray-400 disabled:to-gray-400"
          >
            {updateMutation.isPending
              ? "Updating..."
              : "✨ Update Ramadan Times"}
          </button>

          {updateMutation.error && (
            <div className="mt-4">
              <ErrorMessage message={updateMutation.error.message} />
            </div>
          )}
          {updateMutation.isSuccess && (
            <div className="mt-4">
              <SuccessMessage message="Ramadan times updated successfully!" />
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900 mb-2">
            🌙 About Ramadan Times:
          </h3>
          <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
            <li>
              <strong>Suhur End:</strong> The time when Muslims must stop eating
              before the fast begins (usually a few minutes before Fajr prayer)
            </li>
            <li>
              <strong>Taraweeh:</strong> Special night prayers performed during
              Ramadan, typically after Isha prayer
            </li>
            <li>
              <strong>Format Toggle:</strong> Switch between 12-hour (AM/PM) and
              24-hour format for display
            </li>
            <li>
              <strong>Auto-prefill:</strong> Form automatically fills with
              current values when page loads
            </li>
            <li>
              <strong>Time Input:</strong> Use the time picker for easy time
              selection in 24-hour format
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RamadanTestPage;
