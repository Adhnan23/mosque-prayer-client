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
    <div className="text-purple-600 font-semibold animate-pulse flex items-center justify-center gap-2">
      <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      Loading...
    </div>
  );

  const ErrorMessage = ({ message }: { message: string }) => (
    <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-2xl">⚠️</span>
        <div>
          <p className="font-bold text-red-800">Error</p>
          <p className="text-red-600 text-sm">{message}</p>
        </div>
      </div>
    </div>
  );

  const SuccessMessage = ({ message }: { message: string }) => (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-lg shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-2xl">✅</span>
        <div>
          <p className="font-bold text-green-800">Success</p>
          <p className="text-green-600 text-sm">{message}</p>
        </div>
      </div>
    </div>
  );

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

  const getQuery = useRamadan.get(format);
  const updateMutation = useRamadan.update();

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-full shadow-lg mb-4">
            <h1 className="text-4xl font-black flex items-center gap-3">
              <span className="text-5xl">🌙</span>
              Ramadan Times Management
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Configure Suhur and Taraweeh prayer times for the blessed month
          </p>
        </div>

        {/* Format Selector */}
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 border-2 border-purple-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⏰</span>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Display Format
                </h2>
                <p className="text-sm text-gray-500">
                  Choose your preferred time format
                </p>
              </div>
            </div>
            <select
              value={format}
              onChange={(e) => setFormat(Number(e.target.value) as 12 | 24)}
              className="border-2 border-purple-300 rounded-xl px-4 py-3 text-lg font-semibold bg-gradient-to-r from-purple-50 to-indigo-50 hover:border-purple-500 transition-all cursor-pointer focus:ring-4 focus:ring-purple-200 focus:outline-none"
            >
              <option value={12}>🕐 12 Hour (AM/PM)</option>
              <option value={24}>🕛 24 Hour</option>
            </select>
          </div>
        </div>

        {/* Current Times Display */}
        <div className="bg-white p-8 rounded-2xl shadow-xl mb-6 border-2 border-purple-100">
          <h2 className="text-2xl font-black mb-6 text-gray-800 flex items-center gap-3">
            <span className="text-3xl">📋</span>
            Current Ramadan Times
            <span className="text-sm font-normal text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
              {format}-hour format
            </span>
          </h2>

          {getQuery.isPending && (
            <div className="py-12">
              <Loading />
            </div>
          )}

          {getQuery.error && <ErrorMessage message={getQuery.error.message} />}

          {getQuery.data && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Suhur End */}
              <div className="relative overflow-hidden bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100 p-8 rounded-2xl border-4 border-orange-300 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200 rounded-full -mr-16 -mt-16 opacity-50"></div>
                <div className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-6xl">🌅</span>
                    <div>
                      <h3 className="text-2xl font-black text-orange-900">
                        Suhur End Time
                      </h3>
                      <p className="text-sm text-orange-700">
                        Pre-dawn meal deadline
                      </p>
                    </div>
                  </div>
                  <div className="text-6xl font-black text-orange-600 mb-3 tracking-tight">
                    {getQuery.data.suhur_end}
                  </div>
                  <p className="text-sm text-orange-800 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-lg">
                    Last time to eat before fasting begins
                  </p>
                </div>
              </div>

              {/* Taraweeh */}
              <div className="relative overflow-hidden bg-gradient-to-br from-purple-100 via-indigo-50 to-blue-100 p-8 rounded-2xl border-4 border-purple-300 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full -mr-16 -mt-16 opacity-50"></div>
                <div className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-6xl">🕌</span>
                    <div>
                      <h3 className="text-2xl font-black text-purple-900">
                        Taraweeh Prayer
                      </h3>
                      <p className="text-sm text-purple-700">
                        Night prayer time
                      </p>
                    </div>
                  </div>
                  <div className="text-6xl font-black text-purple-600 mb-3 tracking-tight">
                    {getQuery.data.taraweeh}
                  </div>
                  <p className="text-sm text-purple-800 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-lg">
                    Special night prayer during Ramadan
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Update Section */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-purple-100">
          <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
              <span className="text-3xl">✏️</span>
              Update Ramadan Times
            </h2>
            <button
              onClick={handleReset}
              className="bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 px-5 py-2 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              🔄 Reset
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Suhur End Input */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-xl border-2 border-orange-200">
              <label className="block text-lg font-bold mb-3 text-orange-900 flex items-center gap-2">
                <span className="text-2xl">🌅</span>
                Suhur End Time
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
                className="border-2 border-orange-300 rounded-xl px-4 py-3 w-full text-xl font-bold focus:ring-4 focus:ring-orange-200 focus:border-orange-500 focus:outline-none transition-all"
              />
              <p className="text-xs text-orange-700 mt-2 bg-white/60 px-3 py-2 rounded-lg">
                ℹ️ Time when eating must stop (before Fajr)
              </p>
            </div>

            {/* Taraweeh Input */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border-2 border-purple-200">
              <label className="block text-lg font-bold mb-3 text-purple-900 flex items-center gap-2">
                <span className="text-2xl">🕌</span>
                Taraweeh Prayer Time
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
                className="border-2 border-purple-300 rounded-xl px-4 py-3 w-full text-xl font-bold focus:ring-4 focus:ring-purple-200 focus:border-purple-500 focus:outline-none transition-all"
              />
              <p className="text-xs text-purple-700 mt-2 bg-white/60 px-3 py-2 rounded-lg">
                ℹ️ Time for special Ramadan night prayer
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 p-4 rounded-xl mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="font-bold text-yellow-900 mb-1">Important Note</p>
                <p className="text-sm text-yellow-800">
                  Times are entered in 24-hour format (HH:mm) but will be
                  displayed in your selected format above.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleUpdate}
            disabled={updateMutation.isPending}
            className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 text-white py-4 rounded-xl font-black text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none"
          >
            {updateMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Updating...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span className="text-2xl">✨</span>
                Update Ramadan Times
              </span>
            )}
          </button>

          {updateMutation.error && (
            <div className="mt-6">
              <ErrorMessage message={updateMutation.error.message} />
            </div>
          )}
          {updateMutation.isSuccess && (
            <div className="mt-6">
              <SuccessMessage message="Ramadan times updated successfully!" />
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-gradient-to-r from-purple-100 via-indigo-100 to-blue-100 border-2 border-purple-300 rounded-2xl p-6 shadow-lg">
          <h3 className="font-black text-purple-900 mb-4 text-xl flex items-center gap-2">
            <span className="text-2xl">📖</span>
            About Ramadan Times
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl">
              <p className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                <span className="text-xl">🌅</span>
                Suhur End
              </p>
              <p className="text-sm text-purple-800">
                The time when Muslims must stop eating before the fast begins
                (usually a few minutes before Fajr prayer)
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl">
              <p className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                <span className="text-xl">🕌</span>
                Taraweeh
              </p>
              <p className="text-sm text-purple-800">
                Special night prayers performed during Ramadan, typically after
                Isha prayer
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl">
              <p className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                <span className="text-xl">⏰</span>
                Format Toggle
              </p>
              <p className="text-sm text-purple-800">
                Switch between 12-hour (AM/PM) and 24-hour format for display
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl">
              <p className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                <span className="text-xl">🔄</span>
                Auto-prefill
              </p>
              <p className="text-sm text-purple-800">
                Form automatically fills with current values when page loads
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RamadanTestPage;
