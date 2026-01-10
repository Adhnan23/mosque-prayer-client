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
    primary_color: undefined,
    secondary_color: undefined,
    accent_color: undefined,
    background_color: undefined,
    foreground_color: undefined,
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
  const getQuery = useSettings.get();
  const getByColumnQuery = useSettings.getByColumn(searchColumn);
  const languagesQuery = useLanguages.get(); // Fetch all languages

  // Mutation
  const updateMutation = useSettings.update();

  // Prefill form with current data
  useEffect(() => {
    if (getQuery.data && !getQuery.isPending) {
      setUpdateData({
        mosque_name: getQuery.data.mosque_name,
        language_code: getQuery.data.language_code,
        time_format: getQuery.data.time_format as 12 | 24,
        is_ramadan: getQuery.data.is_ramadan,
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
    { value: "primary_color", label: "Primary Color" },
    { value: "secondary_color", label: "Secondary Color" },
    { value: "accent_color", label: "Accent Color" },
    { value: "background_color", label: "Background Color" },
    { value: "foreground_color", label: "Foreground Color" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          ⚙️ Settings Management Test Page
        </h1>

        {/* Query Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* All Settings */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">
              All Settings
            </h2>
            {getQuery.isPending && <Loading />}
            {getQuery.error && (
              <ErrorMessage message={getQuery.error.message} />
            )}
            {!getQuery.data && !getQuery.isPending && !getQuery.error && (
              <div className="text-gray-400 text-center py-8">
                No settings found
              </div>
            )}
            {getQuery.data && (
              <div className="space-y-3">
                {/* General Settings */}
                <div className="bg-blue-50 p-3 rounded">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    📋 General
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mosque Name:</span>
                      <span className="font-medium">
                        {getQuery.data.mosque_name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Language:</span>
                      <span className="font-mono font-medium">
                        {getQuery.data.language_code}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time Format:</span>
                      <span className="font-medium">
                        {getQuery.data.time_format}h
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ramadan Mode:</span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          getQuery.data.is_ramadan
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {getQuery.data.is_ramadan ? "🌙 Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Color Settings */}
                <div className="bg-purple-50 p-3 rounded">
                  <h3 className="font-semibold text-purple-900 mb-2">
                    🎨 Colors
                  </h3>
                  <div className="space-y-2">
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
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-600">{label}:</span>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded border-2 border-gray-300"
                            style={{ backgroundColor: value }}
                          />
                          <span className="font-mono text-xs">{value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Get by Column */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">
              Search by Column
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Select Setting
              </label>
              <select
                value={searchColumn}
                onChange={(e) =>
                  setSearchColumn(e.target.value as TSettingsColumn)
                }
                className="border rounded px-3 py-2 w-full"
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
                <div className="bg-green-50 p-4 rounded border border-green-200">
                  <div className="text-sm text-gray-600 mb-2">
                    {columns.find((c) => c.value === searchColumn)?.label}:
                  </div>
                  <div className="flex items-center gap-3">
                    {searchColumn.includes("color") &&
                      typeof getByColumnQuery.data === "string" && (
                        <div
                          className="w-12 h-12 rounded border-2 border-gray-300"
                          style={{ backgroundColor: getByColumnQuery.data }}
                        />
                      )}
                    <div className="text-2xl font-bold text-green-700">
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
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-xl font-bold">Update Settings</h2>
            <button
              onClick={handleReset}
              className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded transition"
            >
              Reset to Current
            </button>
          </div>

          <div className="space-y-6">
            {/* General Settings */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">
                📋 General Settings
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
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
                    className="border rounded px-3 py-2 w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
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
                    className="border rounded px-3 py-2 w-full"
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
                    <div className="text-xs text-gray-500 mt-1">
                      Loading languages...
                    </div>
                  )}
                  {languagesQuery.error && (
                    <div className="text-xs text-red-500 mt-1">
                      Failed to load languages
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
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
                    className="border rounded px-3 py-2 w-full"
                  >
                    <option value="">Select format</option>
                    <option value="12">12 Hour</option>
                    <option value="24">24 Hour</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ramadan Mode
                  </label>
                  <div className="flex items-center gap-4 h-10">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={updateData.is_ramadan ?? false}
                        onChange={(e) =>
                          setUpdateData({
                            ...updateData,
                            is_ramadan: e.target.checked,
                          })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm">🌙 Enable Ramadan Mode</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Color Settings */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">
                🎨 Theme Colors
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { key: "primary_color", label: "Primary Color" },
                  { key: "secondary_color", label: "Secondary Color" },
                  { key: "accent_color", label: "Accent Color" },
                  { key: "background_color", label: "Background Color" },
                  { key: "foreground_color", label: "Foreground Color" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-2">
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
                        className="w-14 h-10 rounded border cursor-pointer"
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
                        className="border rounded px-3 py-2 flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
              ℹ️ <strong>Tip:</strong> Use the color picker or enter hex codes
              manually. Leave fields empty to keep current values.
            </div>

            <button
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {updateMutation.isPending ? "Updating..." : "💾 Update Settings"}
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
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            💡 Settings Guide:
          </h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>
              <strong>Mosque Name:</strong> Display name of your mosque or
              Islamic center
            </li>
            <li>
              <strong>Language Code:</strong> Default language for the
              application (2-4 characters)
            </li>
            <li>
              <strong>Time Format:</strong> Choose between 12-hour (AM/PM) or
              24-hour format
            </li>
            <li>
              <strong>Ramadan Mode:</strong> Toggle special Ramadan features and
              displays
            </li>
            <li>
              <strong>Theme Colors:</strong> Customize the application's color
              scheme
            </li>
            <li>
              <strong>Column Search:</strong> Query individual settings by
              column name
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SettingsTestPage;
