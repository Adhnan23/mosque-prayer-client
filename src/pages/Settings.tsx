import { useState, useEffect } from "react";
import { useSettings, useLanguages } from "../hooks";
import type { TSettingsUpdate, TSettingsColumn } from "../api/types";

const SettingsTestPage = () => {
  const [searchColumn, setSearchColumn] =
    useState<TSettingsColumn>("mosque_name");
  const [updateData, setUpdateData] = useState<TSettingsUpdate>({
    mosque_name: undefined,
    language_code: undefined,
    time_format: undefined,
    is_ramadan: undefined,
    hijri_offset: undefined,
    primary_color: undefined,
    secondary_color: undefined,
    accent_color: undefined,
    background_color: undefined,
    foreground_color: undefined,
  });

  const Loading = () => (
    <div className="text-violet-600 font-semibold animate-pulse flex items-center justify-center gap-2 py-8">
      <div className="w-5 h-5 border-3 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
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

  const getQuery = useSettings.get();
  const getByColumnQuery = useSettings.getByColumn(searchColumn);
  const languagesQuery = useLanguages.get();
  const updateMutation = useSettings.update();

  useEffect(() => {
    if (getQuery.data && !getQuery.isPending) {
      setUpdateData({
        mosque_name: getQuery.data.mosque_name,
        language_code: getQuery.data.language_code,
        time_format: getQuery.data.time_format as 12 | 24,
        is_ramadan: getQuery.data.is_ramadan,
        hijri_offset: getQuery.data.hijri_offset,
        primary_color: getQuery.data.primary_color,
        secondary_color: getQuery.data.secondary_color,
        accent_color: getQuery.data.accent_color,
        background_color: getQuery.data.background_color,
        foreground_color: getQuery.data.foreground_color,
      });
    }
  }, [getQuery.data, getQuery.isPending]);

  const handleUpdate = () => {
    const body = Object.fromEntries(
      Object.entries(updateData).filter(([_, v]) => v !== undefined)
    ) as TSettingsUpdate;

    if (Object.keys(body).length === 0) {
      alert("Please change at least one setting");
      return;
    }

    updateMutation.mutate({ body });
  };

  const handleReset = () => {
    if (getQuery.data) {
      setUpdateData({
        mosque_name: getQuery.data.mosque_name,
        language_code: getQuery.data.language_code,
        time_format: getQuery.data.time_format as 12 | 24,
        is_ramadan: getQuery.data.is_ramadan,
        hijri_offset: getQuery.data.hijri_offset,
        primary_color: getQuery.data.primary_color,
        secondary_color: getQuery.data.secondary_color,
        accent_color: getQuery.data.accent_color,
        background_color: getQuery.data.background_color,
        foreground_color: getQuery.data.foreground_color,
      });
    }
  };

  const columns: { value: TSettingsColumn; label: string }[] = [
    { value: "mosque_name", label: "Mosque Name" },
    { value: "language_code", label: "Language Code" },
    { value: "time_format", label: "Time Format" },
    { value: "is_ramadan", label: "Is Ramadan" },
    { value: "hijri_offset", label: "Hijri Offset" },
    { value: "primary_color", label: "Primary Color" },
    { value: "secondary_color", label: "Secondary Color" },
    { value: "accent_color", label: "Accent Color" },
    { value: "background_color", label: "Background Color" },
    { value: "foreground_color", label: "Foreground Color" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-3 rounded-full shadow-lg mb-4">
            <h1 className="text-4xl font-black flex items-center gap-3">
              <span className="text-5xl">⚙️</span>
              Settings Management
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Configure application settings and preferences
          </p>
        </div>

        {/* Query Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* All Settings */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-violet-100">
            <h2 className="text-2xl font-black mb-6 pb-3 border-b-2 border-gray-200 flex items-center gap-3">
              <span className="text-3xl">📋</span>
              Current Settings
            </h2>
            {getQuery.isPending && <Loading />}
            {getQuery.error && (
              <ErrorMessage message={getQuery.error.message} />
            )}
            {!getQuery.data && !getQuery.isPending && !getQuery.error && (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <span className="text-5xl block mb-3">📭</span>
                <p className="text-gray-400">No settings found</p>
              </div>
            )}
            {getQuery.data && (
              <div className="space-y-4">
                {/* General Settings */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-5 rounded-xl border-2 border-blue-200">
                  <h3 className="font-black text-blue-900 mb-3 flex items-center gap-2 text-lg">
                    <span className="text-2xl">🏢</span>
                    General
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center bg-white/60 backdrop-blur-sm p-2 rounded-lg">
                      <span className="text-gray-700 font-semibold">
                        Mosque Name:
                      </span>
                      <span className="font-bold text-blue-900">
                        {getQuery.data.mosque_name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-white/60 backdrop-blur-sm p-2 rounded-lg">
                      <span className="text-gray-700 font-semibold">
                        Language:
                      </span>
                      <span className="font-mono font-bold text-blue-900">
                        {getQuery.data.language_code}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-white/60 backdrop-blur-sm p-2 rounded-lg">
                      <span className="text-gray-700 font-semibold">
                        Time Format:
                      </span>
                      <span className="font-bold text-blue-900">
                        {getQuery.data.time_format}h
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-white/60 backdrop-blur-sm p-2 rounded-lg">
                      <span className="text-gray-700 font-semibold">
                        Hijri Offset:
                      </span>
                      <span className="font-bold text-blue-900">
                        {getQuery.data.hijri_offset}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-white/60 backdrop-blur-sm p-2 rounded-lg">
                      <span className="text-gray-700 font-semibold">
                        Ramadan Mode:
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          getQuery.data.is_ramadan
                            ? "bg-green-600 text-white"
                            : "bg-gray-600 text-white"
                        }`}
                      >
                        {getQuery.data.is_ramadan ? "🌙 Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Color Settings */}
                <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 p-5 rounded-xl border-2 border-purple-200">
                  <h3 className="font-black text-purple-900 mb-3 flex items-center gap-2 text-lg">
                    <span className="text-2xl">🎨</span>
                    Theme Colors
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "Primary", value: getQuery.data.primary_color },
                      {
                        label: "Secondary",
                        value: getQuery.data.secondary_color,
                      },
                      { label: "Accent", value: getQuery.data.accent_color },
                      {
                        label: "Background",
                        value: getQuery.data.background_color,
                      },
                      {
                        label: "Foreground",
                        value: getQuery.data.foreground_color,
                      },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between bg-white/60 backdrop-blur-sm p-3 rounded-lg"
                      >
                        <span className="text-gray-700 font-semibold">
                          {label}:
                        </span>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg border-3 border-white shadow-md"
                            style={{ backgroundColor: value }}
                          />
                          <span className="font-mono text-xs font-bold text-purple-900">
                            {value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Get by Column */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-purple-100">
            <h2 className="text-2xl font-black mb-6 pb-3 border-b-2 border-gray-200 flex items-center gap-3">
              <span className="text-3xl">🔍</span>
              Search by Column
            </h2>
            <div className="mb-6">
              <label className="block text-sm font-bold mb-2 text-gray-700">
                Select Setting
              </label>
              <select
                value={searchColumn}
                onChange={(e) =>
                  setSearchColumn(e.target.value as TSettingsColumn)
                }
                className="border-2 border-purple-300 rounded-xl px-4 py-3 w-full font-semibold focus:ring-4 focus:ring-purple-200 focus:border-purple-500 focus:outline-none transition-all"
              >
                {columns.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {getByColumnQuery.isPending && <Loading />}
            {getByColumnQuery.error && (
              <ErrorMessage message={getByColumnQuery.error.message} />
            )}
            {getByColumnQuery.data !== undefined &&
              getByColumnQuery.data !== null && (
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-6 rounded-xl border-4 border-green-300 shadow-lg">
                  <div className="text-sm text-green-700 mb-2 font-semibold">
                    {columns.find((c) => c.value === searchColumn)?.label}:
                  </div>
                  <div className="flex items-center gap-4">
                    {searchColumn.includes("color") &&
                      typeof getByColumnQuery.data === "string" && (
                        <div
                          className="w-16 h-16 rounded-xl border-4 border-white shadow-lg"
                          style={{ backgroundColor: getByColumnQuery.data }}
                        />
                      )}
                    <div className="text-3xl font-black text-green-700">
                      {typeof getByColumnQuery.data === "boolean"
                        ? getByColumnQuery.data
                          ? "✓ Yes"
                          : "✗ No"
                        : getByColumnQuery.data}
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Update Section */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-violet-100">
          <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
              <span className="text-3xl">✏️</span>
              Update Settings
            </h2>
            <button
              onClick={handleReset}
              className="bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 px-5 py-2 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              🔄 Reset
            </button>
          </div>

          <div className="space-y-8">
            {/* General Settings */}
            <div>
              <h3 className="font-black text-gray-700 mb-4 flex items-center gap-2 text-xl">
                <span className="text-2xl">🏢</span>
                General Settings
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-blue-200">
                  <label className="block text-sm font-bold mb-2 text-gray-800">
                    Mosque Name
                  </label>
                  <input
                    type="text"
                    value={updateData.mosque_name || ""}
                    onChange={(e) =>
                      setUpdateData({
                        ...updateData,
                        mosque_name: e.target.value || undefined,
                      })
                    }
                    placeholder="Enter mosque name"
                    className="border-2 border-blue-300 rounded-lg px-4 py-3 w-full font-semibold focus:ring-4 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-blue-200">
                  <label className="block text-sm font-bold mb-2 text-gray-800">
                    Language Code
                  </label>
                  <select
                    value={updateData.language_code || ""}
                    onChange={(e) =>
                      setUpdateData({
                        ...updateData,
                        language_code: e.target.value || undefined,
                      })
                    }
                    className="border-2 border-blue-300 rounded-lg px-4 py-3 w-full font-semibold focus:ring-4 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition-all"
                  >
                    <option value="">Select language</option>
                    {languagesQuery.data &&
                      languagesQuery.data.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name} ({lang.code})
                        </option>
                      ))}
                  </select>
                  {languagesQuery.isPending && (
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <div className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                      Loading languages...
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-blue-200">
                  <label className="block text-sm font-bold mb-2 text-gray-800">
                    Time Format
                  </label>
                  <select
                    value={updateData.time_format || ""}
                    onChange={(e) =>
                      setUpdateData({
                        ...updateData,
                        time_format: e.target.value
                          ? (Number(e.target.value) as 12 | 24)
                          : undefined,
                      })
                    }
                    className="border-2 border-blue-300 rounded-lg px-4 py-3 w-full font-semibold focus:ring-4 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition-all"
                  >
                    <option value="">Select format</option>
                    <option value="12">🕐 12 Hour</option>
                    <option value="24">🕛 24 Hour</option>
                  </select>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-blue-200">
                  <label className="block text-sm font-bold mb-2 text-gray-800">
                    Hijri Offset
                  </label>
                  <input
                    type="number"
                    value={updateData.hijri_offset ?? ""}
                    onChange={(e) =>
                      setUpdateData({
                        ...updateData,
                        hijri_offset:
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                    placeholder="Enter hijri offset"
                    className="border-2 border-blue-300 rounded-lg px-4 py-3 w-full font-semibold focus:ring-4 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-blue-200 md:col-span-2">
                  <label className="block text-sm font-bold mb-3 text-gray-800">
                    Ramadan Mode
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer bg-white/60 backdrop-blur-sm p-3 rounded-lg">
                    <input
                      type="checkbox"
                      checked={updateData.is_ramadan ?? false}
                      onChange={(e) =>
                        setUpdateData({
                          ...updateData,
                          is_ramadan: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded"
                    />
                    <span className="font-semibold">
                      🌙 Enable Ramadan Mode
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Color Settings */}
            <div>
              <h3 className="font-black text-gray-700 mb-4 flex items-center gap-2 text-xl">
                <span className="text-2xl">🎨</span>
                Theme Colors
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    key: "primary_color",
                    label: "Primary Color",
                    gradient: "from-violet-100 to-purple-100",
                    border: "border-violet-300",
                  },
                  {
                    key: "secondary_color",
                    label: "Secondary Color",
                    gradient: "from-blue-100 to-cyan-100",
                    border: "border-blue-300",
                  },
                  {
                    key: "accent_color",
                    label: "Accent Color",
                    gradient: "from-pink-100 to-rose-100",
                    border: "border-pink-300",
                  },
                  {
                    key: "background_color",
                    label: "Background Color",
                    gradient: "from-gray-100 to-slate-100",
                    border: "border-gray-300",
                  },
                  {
                    key: "foreground_color",
                    label: "Foreground Color",
                    gradient: "from-emerald-100 to-teal-100",
                    border: "border-emerald-300",
                  },
                ].map(({ key, label, gradient, border }) => (
                  <div
                    key={key}
                    className={`bg-gradient-to-r ${gradient} p-4 rounded-xl border-2 ${border}`}
                  >
                    <label className="block text-sm font-bold mb-3 text-gray-800">
                      {label}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={
                          (updateData[
                            key as keyof TSettingsUpdate
                          ] as string) || "#000000"
                        }
                        onChange={(e) =>
                          setUpdateData({
                            ...updateData,
                            [key]: e.target.value,
                          })
                        }
                        className="w-16 h-12 rounded-lg border-2 border-gray-300 cursor-pointer shadow-md"
                      />
                      <input
                        type="text"
                        value={
                          (updateData[
                            key as keyof TSettingsUpdate
                          ] as string) || ""
                        }
                        onChange={(e) =>
                          setUpdateData({
                            ...updateData,
                            [key]: e.target.value || undefined,
                          })
                        }
                        placeholder="#000000"
                        className="border-2 border-gray-300 rounded-lg px-3 py-2 flex-1 font-mono text-sm font-bold focus:ring-4 focus:ring-purple-200 focus:border-purple-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 p-4 rounded-xl">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="font-bold text-yellow-900 mb-1">Pro Tip</p>
                  <p className="text-sm text-yellow-800">
                    Use the color picker or enter hex codes manually. Leave
                    fields empty to keep current values.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
              className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 text-white py-4 rounded-xl font-black text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none"
            >
              {updateMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span className="text-2xl">💾</span>
                  Update Settings
                </span>
              )}
            </button>

            {updateMutation.error && (
              <ErrorMessage message={updateMutation.error.message} />
            )}
            {updateMutation.isSuccess && (
              <SuccessMessage message="Settings updated successfully!" />
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-gradient-to-r from-violet-100 via-purple-100 to-fuchsia-100 border-2 border-violet-300 rounded-2xl p-6 shadow-lg">
          <h3 className="font-black text-violet-900 mb-4 text-xl flex items-center gap-2">
            <span className="text-2xl">📖</span>
            Settings Guide
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-sm text-violet-800">
                <span className="font-bold">🏢 Mosque Name:</span> Display name
                of your mosque or Islamic center
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-sm text-violet-800">
                <span className="font-bold">🌍 Language Code:</span> Default
                language for the application (2-4 characters)
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-sm text-violet-800">
                <span className="font-bold">⏰ Time Format:</span> Choose
                between 12-hour (AM/PM) or 24-hour format
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-sm text-violet-800">
                <span className="font-bold">🌙 Ramadan Mode:</span> Toggle
                special Ramadan features and displays
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-sm text-violet-800">
                <span className="font-bold">📅 Hijri Offset:</span> Adjust the
                Hijri calendar by +/- days (including 0)
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-sm text-violet-800">
                <span className="font-bold">🎨 Theme Colors:</span> Customize
                the application's color scheme
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTestPage;
