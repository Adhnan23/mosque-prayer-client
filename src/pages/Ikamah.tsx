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

  // Queries
  const getQuery = useIkamah.get();
  const timeQuery = useIkamah.time(format);

  // Mutation
  const updateMutation = useIkamah.update();

  // Prefill form with current data
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
    { key: "fajr", label: "Fajr" },
    { key: "dhuhr", label: "Dhuhr" },
    { key: "asr", label: "Asr" },
    { key: "maghrib", label: "Maghrib" },
    { key: "isha", label: "Isha" },
    { key: "jummah", label: "Jummah" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Ikamah Times Test Page
        </h1>

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

        {/* Query Results */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Raw Ikamah Data (Minutes) */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">
              Ikamah Settings (Minutes After Adhan)
            </h2>
            {getQuery.isPending && <Loading />}
            {getQuery.error && (
              <ErrorMessage message={getQuery.error.message} />
            )}
            {getQuery.data && (
              <div className="space-y-3">
                {prayers.map(({ key, label }) => (
                  <div
                    key={key}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded"
                  >
                    <span className="font-medium text-gray-700">{label}:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {getQuery.data[key as keyof typeof getQuery.data]} min
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formatted Ikamah Times */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">
              Calculated Ikamah Times ({format}-hour format)
            </h2>
            {timeQuery.isPending && <Loading />}
            {timeQuery.error && (
              <ErrorMessage message={timeQuery.error.message} />
            )}
            {!timeQuery.data && !timeQuery.isPending && !timeQuery.error && (
              <div className="text-gray-400 text-center py-8">
                No ikamah times available
              </div>
            )}
            {timeQuery.data && (
              <div className="space-y-3">
                {prayers.map(({ key, label }) => (
                  <div
                    key={key}
                    className="flex justify-between items-center p-3 bg-green-50 rounded border border-green-200"
                  >
                    <span className="font-medium text-gray-700">{label}:</span>
                    <span className="text-2xl font-bold text-green-700">
                      {timeQuery.data![key as keyof typeof timeQuery.data]}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded">
              💡 These are the actual ikamah times calculated by adding the
              minutes to adhan times.
            </div>
          </div>
        </div>

        {/* Update Section */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-xl font-bold">Update Ikamah Minutes</h2>
            <button
              onClick={handleReset}
              className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded transition"
            >
              Reset to Current
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {prayers.map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-2">
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
                    className="border rounded px-3 py-2 w-full pr-12"
                  />
                  <span className="absolute right-3 top-2 text-gray-500 text-sm">
                    min
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800 mb-4">
            ℹ️ <strong>Note:</strong> Enter the number of minutes after adhan
            when ikamah should be called. For example, if ikamah is 15 minutes
            after adhan, enter 15.
          </div>

          <button
            onClick={handleUpdate}
            disabled={updateMutation.isPending}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {updateMutation.isPending ? "Updating..." : "Update Ikamah Times"}
          </button>

          {updateMutation.error && (
            <div className="mt-4">
              <ErrorMessage message={updateMutation.error.message} />
            </div>
          )}
          {updateMutation.isSuccess && (
            <div className="mt-4">
              <SuccessMessage message="Ikamah times updated successfully!" />
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            💡 How Ikamah Works:
          </h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>
              <strong>Ikamah Settings:</strong> Shows the number of minutes to
              wait after each adhan
            </li>
            <li>
              <strong>Calculated Times:</strong> Shows the actual ikamah times
              (adhan time + minutes)
            </li>
            <li>
              <strong>Jummah:</strong> Special ikamah time for Friday prayer
            </li>
            <li>
              <strong>Update:</strong> Modify the minutes for any prayer and
              click update
            </li>
            <li>
              <strong>Format Toggle:</strong> Switch between 12-hour (AM/PM) and
              24-hour format for display
            </li>
            <li>
              <strong>Auto-prefill:</strong> Form automatically fills with
              current values when page loads
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IkamahTestPage;
