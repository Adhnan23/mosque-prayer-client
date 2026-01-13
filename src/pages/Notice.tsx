import { useState, useEffect } from "react";
import { useNotice, useLanguages } from "../hooks";
import type {
  TNoticeInsert,
  TNoticeUpdate,
  LanguageCode,
  Notice,
} from "../api/types";

const NoticeTestPage = () => {
  // Filter states
  const [isActiveFilter, setIsActiveFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [searchId, setSearchId] = useState<string>("");
  const [searchCode, setSearchCode] = useState<string>("");

  // Debounced values
  const [debouncedId, setDebouncedId] = useState<string>("");
  const [debouncedCode, setDebouncedCode] = useState<string>("");

  // Insert form state
  const [insertData, setInsertData] = useState<TNoticeInsert>({
    language_code: "",
    content: "",
    start_date: "",
    end_date: "",
    is_active: true,
  });

  // Update form state
  const [updateId, setUpdateId] = useState<number | null>(null);
  const [updateData, setUpdateData] = useState<TNoticeUpdate>({
    language_code: undefined,
    content: undefined,
    start_date: undefined,
    end_date: undefined,
    is_active: undefined,
  });

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedId(searchId);
      setDebouncedCode(searchCode);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchId, searchCode]);

  const Loading = () => (
    <div className="text-emerald-600 font-semibold animate-pulse flex items-center justify-center gap-2 py-8">
      <div className="w-5 h-5 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
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

  // Determine query type based on filters
  const queryType = (() => {
    if (debouncedId && Number(debouncedId) > 0) return "id";
    if (debouncedCode) return "language";
    return "all";
  })();

  // Queries
  const activeFilterValue =
    isActiveFilter === "all" ? undefined : isActiveFilter === "active";
  const getAllQuery = useNotice.get(activeFilterValue);
  const getByIdQuery = useNotice.getById(debouncedId ? Number(debouncedId) : 0);
  const getByCodeQuery = useNotice.getByCode(debouncedCode as LanguageCode);
  const languagesQuery = useLanguages.get();

  // Select active query and data
  const activeQuery = (() => {
    switch (queryType) {
      case "id":
        return getByIdQuery;
      case "language":
        return getByCodeQuery;
      default:
        return getAllQuery;
    }
  })();

  const displayData = (() => {
    if (queryType === "id" && getByIdQuery.data) {
      return [getByIdQuery.data];
    }
    if (queryType === "language" && getByCodeQuery.data) {
      return getByCodeQuery.data;
    }
    if (getAllQuery.data) {
      return getAllQuery.data;
    }
    return [];
  })();

  // Mutations
  const insertMutation = useNotice.insert();
  const updateMutation = useNotice.update();
  const deleteMutation = useNotice.delete();

  const handleInsert = () => {
    if (
      !insertData.language_code ||
      !insertData.content ||
      !insertData.start_date ||
      !insertData.end_date
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const start = new Date(insertData.start_date);
    const end = new Date(insertData.end_date);
    if (start > end) {
      alert("End date must be after start date");
      return;
    }

    insertMutation.mutate(
      { body: insertData },
      {
        onSuccess: () => {
          setInsertData({
            language_code: "",
            content: "",
            start_date: "",
            end_date: "",
            is_active: true,
          });
        },
      }
    );
  };

  const handleUpdate = () => {
    if (!updateId) {
      alert("Please select a notice to update (use Edit button)");
      return;
    }

    const body = Object.fromEntries(
      Object.entries(updateData).filter(([_, v]) => v !== undefined)
    ) as TNoticeUpdate;

    if (Object.keys(body).length === 0) {
      alert("Please change at least one field");
      return;
    }

    if (body.start_date && body.end_date) {
      const start = new Date(body.start_date);
      const end = new Date(body.end_date);
      if (start > end) {
        alert("End date must be after start date");
        return;
      }
    }

    updateMutation.mutate(
      { id: updateId, body },
      {
        onSuccess: () => {
          setUpdateId(null);
          setUpdateData({
            language_code: undefined,
            content: undefined,
            start_date: undefined,
            end_date: undefined,
            is_active: undefined,
          });
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    if (window.confirm(`Are you sure you want to delete notice #${id}?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const handlePrefillUpdate = (notice: Notice) => {
    setUpdateId(notice.id);
    setUpdateData({
      language_code: notice.language_code,
      content: notice.content,
      start_date: notice.start_date.split("T")[0],
      end_date: notice.end_date.split("T")[0],
      is_active: notice.is_active,
    });
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSearchId("");
    setSearchCode("");
    setIsActiveFilter("all");
  };

  const NoticeCard = ({
    notice,
    onEdit,
    onDelete,
  }: {
    notice: Notice;
    onEdit: () => void;
    onDelete: () => void;
  }) => (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-5 hover:shadow-lg transition-all transform hover:-translate-y-1">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono bg-gray-800 text-white px-3 py-1 rounded-full font-bold">
            #{notice.id}
          </span>
          <span className="text-xs font-mono bg-blue-600 text-white px-3 py-1 rounded-full font-bold">
            {notice.language_code.toUpperCase()}
          </span>
          <span
            className={`text-xs px-3 py-1 rounded-full font-bold ${
              notice.is_active
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {notice.is_active ? "✓ Active" : "✗ Inactive"}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-3 py-1.5 rounded-lg transition-all font-semibold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            ✏️ Edit
          </button>
          <button
            onClick={onDelete}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-3 py-1.5 rounded-lg transition-all font-semibold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-800 mb-3 bg-white/60 backdrop-blur-sm p-3 rounded-lg font-medium">
        {notice.content}
      </p>
      <div className="flex gap-4 text-xs font-semibold text-gray-700">
        <span className="flex items-center gap-1">
          <span className="text-lg">📅</span>
          Start: {new Date(notice.start_date).toLocaleDateString()}
        </span>
        <span className="flex items-center gap-1">
          <span className="text-lg">📅</span>
          End: {new Date(notice.end_date).toLocaleDateString()}
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-full shadow-lg mb-4">
            <h1 className="text-4xl font-black flex items-center gap-3">
              <span className="text-5xl">📢</span>
              Notice Management
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Create and manage announcements and notifications
          </p>
        </div>

        {/* Unified Filter Controls */}
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 border-2 border-emerald-100">
          <div className="flex justify-between items-center mb-6 pb-3 border-b-2 border-gray-200">
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
              <span className="text-3xl">🔍</span>
              Search Filters
            </h2>
            <button
              onClick={clearFilters}
              className="bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 px-5 py-2 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              🗑️ Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">
                Status Filter
              </label>
              <select
                value={isActiveFilter}
                onChange={(e) =>
                  setIsActiveFilter(
                    e.target.value as "all" | "active" | "inactive"
                  )
                }
                className="border-2 border-emerald-300 rounded-xl px-4 py-3 w-full font-semibold focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 focus:outline-none transition-all"
              >
                <option value="all">📋 All Notices</option>
                <option value="active">✅ Active Only</option>
                <option value="inactive">❌ Inactive Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">
                Search by ID
              </label>
              <input
                type="number"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="e.g., 1, 2, 3"
                className="border-2 border-teal-300 rounded-xl px-4 py-3 w-full font-semibold focus:ring-4 focus:ring-teal-200 focus:border-teal-500 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">
                Search by Language
              </label>
              <select
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="border-2 border-cyan-300 rounded-xl px-4 py-3 w-full font-semibold focus:ring-4 focus:ring-cyan-200 focus:border-cyan-500 focus:outline-none transition-all"
              >
                <option value="">All Languages</option>
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
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-blue-900">Active Query:</span>
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-1 rounded-full font-bold text-sm">
                {queryType.toUpperCase()}
              </span>
              <span className="text-gray-600 text-sm">
                {queryType === "all" &&
                  `(${
                    isActiveFilter === "all"
                      ? "all notices"
                      : isActiveFilter === "active"
                      ? "active only"
                      : "inactive only"
                  })`}
                {queryType === "id" && `(notice #${debouncedId})`}
                {queryType === "language" && `(language: ${debouncedCode})`}
              </span>
              {(searchId !== debouncedId || searchCode !== debouncedCode) && (
                <span className="text-orange-600 animate-pulse flex items-center gap-1 bg-orange-100 px-3 py-1 rounded-full text-sm font-semibold">
                  <div className="w-3 h-3 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                  Typing...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Unified Results Display */}
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 border-2 border-emerald-100">
          <h2 className="text-2xl font-black mb-6 pb-3 border-b-2 border-gray-200 flex items-center justify-between">
            <span className="flex items-center gap-3">
              <span className="text-3xl">📋</span>
              Results
            </span>
            {displayData.length > 0 && (
              <span className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-bold border-2 border-emerald-300">
                Total: {displayData.length}
              </span>
            )}
          </h2>

          {activeQuery.isPending && <Loading />}
          {activeQuery.error && (
            <ErrorMessage message={activeQuery.error.message} />
          )}

          {!activeQuery.isPending &&
            !activeQuery.error &&
            displayData.length === 0 && (
              <div className="text-center py-16 bg-gray-50 rounded-xl">
                <span className="text-6xl block mb-4">📭</span>
                <p className="text-gray-500 text-lg font-semibold">
                  No notices found
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Try adjusting your filters
                </p>
              </div>
            )}

          {displayData.length > 0 && (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {displayData.map((notice) => (
                <NoticeCard
                  key={notice.id}
                  notice={notice}
                  onEdit={() => handlePrefillUpdate(notice)}
                  onDelete={() => handleDelete(notice.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Insert & Update Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Insert Notice */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-green-100">
            <h2 className="text-2xl font-black mb-6 pb-3 border-b-2 border-gray-200 flex items-center gap-3">
              <span className="text-3xl">➕</span>
              Insert Notice
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700 flex items-center gap-2">
                  <span>Language Code</span>
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={insertData.language_code}
                  onChange={(e) =>
                    setInsertData({
                      ...insertData,
                      language_code: e.target.value,
                    })
                  }
                  className="border-2 border-green-300 rounded-xl px-4 py-3 w-full font-semibold focus:ring-4 focus:ring-green-200 focus:border-green-500 focus:outline-none transition-all"
                >
                  <option value="">Select language</option>
                  {languagesQuery.data &&
                    languagesQuery.data.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name} ({lang.code})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700 flex items-center gap-2">
                  <span>Content</span>
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={insertData.content}
                  onChange={(e) =>
                    setInsertData({ ...insertData, content: e.target.value })
                  }
                  placeholder="Enter notice content..."
                  className="border-2 border-green-300 rounded-xl px-4 py-3 w-full h-32 resize-none font-medium focus:ring-4 focus:ring-green-200 focus:border-green-500 focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700 flex items-center gap-2">
                    <span>Start Date</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={insertData.start_date}
                    onChange={(e) =>
                      setInsertData({
                        ...insertData,
                        start_date: e.target.value,
                      })
                    }
                    className="border-2 border-green-300 rounded-xl px-4 py-3 w-full font-semibold focus:ring-4 focus:ring-green-200 focus:border-green-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700 flex items-center gap-2">
                    <span>End Date</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={insertData.end_date}
                    onChange={(e) =>
                      setInsertData({ ...insertData, end_date: e.target.value })
                    }
                    className="border-2 border-green-300 rounded-xl px-4 py-3 w-full font-semibold focus:ring-4 focus:ring-green-200 focus:border-green-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 bg-green-50 p-4 rounded-xl border-2 border-green-200">
                <input
                  type="checkbox"
                  id="insert-active"
                  checked={insertData.is_active}
                  onChange={(e) =>
                    setInsertData({
                      ...insertData,
                      is_active: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded"
                />
                <label
                  htmlFor="insert-active"
                  className="text-sm font-bold text-gray-700"
                >
                  ✓ Active Notice
                </label>
              </div>

              <button
                onClick={handleInsert}
                disabled={insertMutation.isPending}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-black text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none"
              >
                {insertMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Inserting...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-2xl">➕</span>
                    Insert Notice
                  </span>
                )}
              </button>

              {insertMutation.error && (
                <ErrorMessage message={insertMutation.error.message} />
              )}
              {insertMutation.isSuccess && (
                <SuccessMessage message="Notice inserted successfully!" />
              )}
            </div>
          </div>

          {/* Update Notice */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-blue-100">
            <h2 className="text-2xl font-black mb-6 pb-3 border-b-2 border-gray-200 flex items-center gap-3">
              <span className="text-3xl">✏️</span>
              Update Notice
              {updateId && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                  ID: {updateId}
                </span>
              )}
            </h2>
            <div className="space-y-4">
              {!updateId && (
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <p className="font-bold text-yellow-900 mb-1">
                        How to Update
                      </p>
                      <p className="text-sm text-yellow-800">
                        Click the <strong>Edit</strong> button on any notice
                        above to prefill this form
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
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
                  className="border-2 border-blue-300 rounded-xl px-4 py-3 w-full font-semibold focus:ring-4 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition-all"
                >
                  <option value="">Keep current language</option>
                  {languagesQuery.data &&
                    languagesQuery.data.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name} ({lang.code})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  Content
                </label>
                <textarea
                  value={updateData.content || ""}
                  onChange={(e) =>
                    setUpdateData({
                      ...updateData,
                      content: e.target.value || undefined,
                    })
                  }
                  placeholder="Leave empty to keep current"
                  className="border-2 border-blue-300 rounded-xl px-4 py-3 w-full h-32 resize-none font-medium focus:ring-4 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={updateData.start_date || ""}
                    onChange={(e) =>
                      setUpdateData({
                        ...updateData,
                        start_date: e.target.value || undefined,
                      })
                    }
                    className="border-2 border-blue-300 rounded-xl px-4 py-3 w-full font-semibold focus:ring-4 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={updateData.end_date || ""}
                    onChange={(e) =>
                      setUpdateData({
                        ...updateData,
                        end_date: e.target.value || undefined,
                      })
                    }
                    className="border-2 border-blue-300 rounded-xl px-4 py-3 w-full font-semibold focus:ring-4 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                <input
                  type="checkbox"
                  id="update-active"
                  checked={updateData.is_active ?? false}
                  onChange={(e) =>
                    setUpdateData({
                      ...updateData,
                      is_active: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded"
                />
                <label
                  htmlFor="update-active"
                  className="text-sm font-bold text-gray-700"
                >
                  ✓ Active Notice
                </label>
              </div>

              <button
                onClick={handleUpdate}
                disabled={updateMutation.isPending || !updateId}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-4 rounded-xl font-black text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none"
              >
                {updateMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-2xl">💾</span>
                    Update Notice
                  </span>
                )}
              </button>

              {updateMutation.error && (
                <ErrorMessage message={updateMutation.error.message} />
              )}
              {updateMutation.isSuccess && (
                <SuccessMessage message="Notice updated successfully!" />
              )}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 border-2 border-emerald-300 rounded-2xl p-6 shadow-lg">
          <h3 className="font-black text-emerald-900 mb-4 text-xl flex items-center gap-2">
            <span className="text-2xl">💡</span>
            Quick Tips
          </h3>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-sm text-emerald-800">
                <span className="font-bold">🔍 Unified Search:</span> All
                results show in one section based on your active filters
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-sm text-emerald-800">
                <span className="font-bold">🎯 Smart Filtering:</span> ID search
                takes priority, then language, then status filter
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-sm text-emerald-800">
                <span className="font-bold">⏱️ Debounce:</span> 500ms delay on
                search inputs to reduce API calls
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-sm text-emerald-800">
                <span className="font-bold">✏️ Quick Edit:</span> Click Edit
                button to auto-fill the update form
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-sm text-emerald-800">
                <span className="font-bold">📅 Date Validation:</span> Start
                date must be before end date
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-sm text-emerald-800">
                <span className="font-bold">🔄 Auto-Refresh:</span> All changes
                automatically update the results
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeTestPage;
