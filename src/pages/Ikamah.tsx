import { useState, useEffect } from "react";
import { useIkamah } from "../hooks";
import type { TIkamahUpdate } from "../api/types";

const IkamahTestPage = () => {
  const [format, setFormat] = useState<12 | 24>(12);
  const [updateData, setUpdateData] = useState<TIkamahUpdate>({
    fajr: undefined,
    dhuhr: undefined,
    asr: undefined,
    maghrib: undefined,
    isha: undefined,
    jummah: undefined,
  });

  const Loading = () => (
    <div className="text-teal-600 font-semibold animate-pulse flex items-center justify-center gap-2 py-8">
      <div className="w-5 h-5 border-3 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
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

  const SuccessMessage = ({ message }: { message: string }) => (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-xl shadow-md">
      <div className="flex items-center gap-2">
        <span className="text-2xl">✅</span>
        <div>
          <p className="font-bold text-green-800">Success</p>
          <p className="text-green-600 text-sm">{message}</p>
        </div>
      </div>
    </div>
  );

  const getQuery = useIkamah.get();
  const timeQuery = useIkamah.time(format);
  const updateMutation = useIkamah.update();

  useEffect(() => {
    if (getQuery.data && !getQuery.isPending) {
      setUpdateData({
        fajr: getQuery.data.fajr,
        dhuhr: getQuery.data.dhuhr,
        asr: getQuery.data.asr,
        maghrib: getQuery.data.maghrib,
        isha: getQuery.data.isha,
        jummah: getQuery.data.jummah,
      });
    }
  }, [getQuery.data, getQuery.isPending]);

  const handleUpdate = () => {
    const body = Object.fromEntries(
      Object.entries(updateData).filter(
        ([_, v]) => v !== undefined && v !== null
      )
    ) as TIkamahUpdate;

    if (Object.keys(body).length === 0) {
      alert("Please enter at least one value to update");
      return;
    }

    updateMutation.mutate({ body });
  };

  const handleReset = () => {
    if (getQuery.data) {
      setUpdateData({
        fajr: getQuery.data.fajr,
        dhuhr: getQuery.data.dhuhr,
        asr: getQuery.data.asr,
        maghrib: getQuery.data.maghrib,
        isha: getQuery.data.isha,
        jummah: getQuery.data.jummah,
      });
    }
  };

  const prayers = [
    {
      key: "fajr",
      label: "Fajr",
      icon: "🌅",
      color: "from-orange-100 to-amber-100",
      border: "border-orange-300",
      text: "text-orange-900",
    },
    {
      key: "dhuhr",
      label: "Dhuhr",
      icon: "☀️",
      color: "from-yellow-100 to-amber-100",
      border: "border-yellow-300",
      text: "text-yellow-900",
    },
    {
      key: "asr",
      label: "Asr",
      icon: "🌤️",
      color: "from-amber-100 to-orange-100",
      border: "border-amber-300",
      text: "text-amber-900",
    },
    {
      key: "maghrib",
      label: "Maghrib",
      icon: "🌆",
      color: "from-pink-100 to-rose-100",
      border: "border-pink-300",
      text: "text-pink-900",
    },
    {
      key: "isha",
      label: "Isha",
      icon: "🌙",
      color: "from-indigo-100 to-purple-100",
      border: "border-indigo-300",
      text: "text-indigo-900",
    },
    {
      key: "jummah",
      label: "Jummah",
      icon: "🕌",
      color: "from-green-100 to-emerald-100",
      border: "border-green-300",
      text: "text-green-900",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-3 rounded-full shadow-lg mb-4">
            <h1 className="text-4xl font-black flex items-center gap-3">
              <span className="text-5xl">⏱️</span>
              Ikamah Times Management
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Configure waiting periods between Adhan and Ikamah
          </p>
        </div>

        {/* Format Selector */}
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 border-2 border-teal-100">
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
              className="border-2 border-teal-300 rounded-xl px-4 py-3 text-lg font-semibold bg-gradient-to-r from-teal-50 to-cyan-50 hover:border-teal-500 transition-all cursor-pointer focus:ring-4 focus:ring-teal-200 focus:outline-none"
            >
              <option value={12}>🕐 12 Hour (AM/PM)</option>
              <option value={24}>🕛 24 Hour</option>
            </select>
          </div>
        </div>

        {/* Query Results */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Raw Ikamah Data (Minutes) */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-blue-100">
            <h2 className="text-2xl font-black mb-6 pb-3 border-b-2 border-gray-200 flex items-center gap-3">
              <span className="text-3xl">⏲️</span>
              Waiting Minutes
              <span className="text-xs font-normal bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                After Adhan
              </span>
            </h2>
            {getQuery.isPending && <Loading />}
            {getQuery.error && (
              <ErrorMessage message={getQuery.error.message} />
            )}
            {getQuery.data && (
              <div className="space-y-3">
                {prayers.map(({ key, label, icon, color, border }) => (
                  <div
                    key={key}
                    className={`flex justify-between items-center p-4 bg-gradient-to-r ${color} rounded-xl border-2 ${border} shadow-sm`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{icon}</span>
                      <span className="font-bold text-gray-800 text-lg">
                        {label}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-blue-600">
                        {getQuery.data[key as keyof typeof getQuery.data]}
                      </span>
                      <span className="text-sm font-semibold text-gray-600">
                        min
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formatted Ikamah Times */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-green-100">
            <h2 className="text-2xl font-black mb-6 pb-3 border-b-2 border-gray-200 flex items-center gap-3">
              <span className="text-3xl">🕒</span>
              Calculated Times
              <span className="text-xs font-normal bg-green-100 text-green-700 px-3 py-1 rounded-full">
                {format}-hour format
              </span>
            </h2>
            {timeQuery.isPending && <Loading />}
            {timeQuery.error && (
              <ErrorMessage message={timeQuery.error.message} />
            )}
            {!timeQuery.data && !timeQuery.isPending && !timeQuery.error && (
              <div className="text-gray-400 text-center py-12 bg-gray-50 rounded-xl">
                <span className="text-5xl block mb-3">📭</span>
                <p className="text-sm">No ikamah times available</p>
              </div>
            )}
            {timeQuery.data && (
              <>
                <div className="space-y-3 mb-4">
                  {prayers.map(({ key, label, icon, text }) => (
                    <div
                      key={key}
                      className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{icon}</span>
                        <span className="font-bold text-gray-800 text-lg">
                          {label}
                        </span>
                      </div>
                      <span className="text-3xl font-black text-green-700">
                        {timeQuery.data![key as keyof typeof timeQuery.data]}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <p className="text-sm text-blue-800">
                      <span className="font-bold">Smart Calculation:</span>{" "}
                      These times are automatically calculated by adding the
                      waiting minutes to adhan times.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Update Section */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-teal-100">
          <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
              <span className="text-3xl">✏️</span>
              Update Waiting Minutes
            </h2>
            <button
              onClick={handleReset}
              className="bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 px-5 py-2 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              🔄 Reset
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {prayers.map(({ key, label, icon, color, border }) => (
              <div
                key={key}
                className={`bg-gradient-to-br ${color} p-5 rounded-xl border-2 ${border}`}
              >
                <label className="block text-sm font-bold mb-3 text-gray-800 flex items-center gap-2">
                  <span className="text-2xl">{icon}</span>
                  {label}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={updateData[key as keyof TIkamahUpdate] ?? ""}
                    onChange={(e) =>
                      setUpdateData({
                        ...updateData,
                        [key]: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="Minutes"
                    className="border-2 border-gray-300 rounded-xl px-4 py-3 w-full pr-14 text-xl font-bold focus:ring-4 focus:ring-teal-200 focus:border-teal-500 focus:outline-none transition-all"
                  />
                  <span className="absolute right-4 top-3 text-gray-500 font-semibold text-sm">
                    min
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 p-4 rounded-xl mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <p className="font-bold text-yellow-900 mb-1">How It Works</p>
                <p className="text-sm text-yellow-800">
                  Enter the number of minutes to wait after adhan before calling
                  ikamah. For example, if ikamah is 15 minutes after adhan,
                  enter 15.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleUpdate}
            disabled={updateMutation.isPending}
            className="w-full bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700 text-white py-4 rounded-xl font-black text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none"
          >
            {updateMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Updating...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span className="text-2xl">💾</span>
                Update Ikamah Times
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
              <SuccessMessage message="Ikamah times updated successfully!" />
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-gradient-to-r from-teal-100 via-cyan-100 to-blue-100 border-2 border-teal-300 rounded-2xl p-6 shadow-lg">
          <h3 className="font-black text-teal-900 mb-4 text-xl flex items-center gap-2">
            <span className="text-2xl">📖</span>
            Understanding Ikamah
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl">
              <p className="font-bold text-teal-900 mb-2 flex items-center gap-2">
                <span className="text-xl">⏲️</span>
                Waiting Minutes
              </p>
              <p className="text-sm text-teal-800">
                Shows the number of minutes to wait after each adhan before
                calling ikamah
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl">
              <p className="font-bold text-teal-900 mb-2 flex items-center gap-2">
                <span className="text-xl">🕒</span>
                Calculated Times
              </p>
              <p className="text-sm text-teal-800">
                Shows the actual ikamah times (adhan time + waiting minutes)
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl">
              <p className="font-bold text-teal-900 mb-2 flex items-center gap-2">
                <span className="text-xl">🕌</span>
                Jummah
              </p>
              <p className="text-sm text-teal-800">
                Special ikamah time for Friday congregational prayer
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl">
              <p className="font-bold text-teal-900 mb-2 flex items-center gap-2">
                <span className="text-xl">⏰</span>
                Format Toggle
              </p>
              <p className="text-sm text-teal-800">
                Switch between 12-hour (AM/PM) and 24-hour format for display
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IkamahTestPage;
