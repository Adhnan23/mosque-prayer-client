import { useState, useEffect } from "react";
import { useNotice, useLanguages } from "../hooks";
import type {
  TNoticeInsert,
  TNoticeUpdate,
  LanguageCode,
  Notice,
} from "../api/types";

const NoticeTestPage = () => {
  const [isActiveFilter, setIsActiveFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [searchId, setSearchId] = useState<string>("");
  const [searchCode, setSearchCode] = useState<string>("");
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

  // Debounce search inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedId(searchId);
      setDebouncedCode(searchCode);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchId, searchCode]);

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
  const activeFilterValue =
    isActiveFilter === "all" ? undefined : isActiveFilter === "active";
  const getAllQuery = useNotice.get(activeFilterValue);
  const getByIdQuery = useNotice.getById(debouncedId ? Number(debouncedId) : 0);
  const getByCodeQuery = useNotice.getByCode(debouncedCode as LanguageCode);
  const languagesQuery = useLanguages.get();

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

  const NoticeCard = ({
    notice,
    onEdit,
    onDelete,
  }: {
    notice: Notice;
    onEdit: () => void;
    onDelete: () => void;
  }) => (
    <div className="border rounded-lg p-4 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded">
            #{notice.id}
          </span>
          <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded">
            {notice.language_code}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded ${
              notice.is_active
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {notice.is_active ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition"
          >
            Delete
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-700 mb-2">{notice.content}</p>
      <div className="flex gap-4 text-xs text-gray-500">
        <span>
          📅 Start: {new Date(notice.start_date).toLocaleDateString()}
        </span>
        <span>📅 End: {new Date(notice.end_date).toLocaleDateString()}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Notice Management Test Page
        </h1>

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-3">Filters</h2>
          <div className="flex gap-4 items-center">
            <div>
              <label className="block text-sm font-medium mb-1">
                Status Filter
              </label>
              <select
                value={isActiveFilter}
                onChange={(e) =>
                  setIsActiveFilter(
                    e.target.value as "all" | "active" | "inactive"
                  )
                }
                className="border rounded px-3 py-2"
              >
                <option value="all">All Notices</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Query Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* All Notices */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">
              All Notices
              {isActiveFilter !== "all" && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  ({isActiveFilter === "active" ? "Active" : "Inactive"})
                </span>
              )}
            </h2>
            {getAllQuery.isPending && <Loading />}
            {getAllQuery.error && (
              <ErrorMessage message={getAllQuery.error.message} />
            )}
            {getAllQuery.data && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <div className="text-sm text-gray-600 mb-2">
                  Total: {getAllQuery.data.length} notices
                </div>
                {getAllQuery.data.map((notice) => (
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

          {/* Get by ID */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">
              Search by ID
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Notice ID
              </label>
              <input
                type="number"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="e.g., 1, 2, 3"
                className="border rounded px-3 py-2 w-full"
              />
              {searchId !== debouncedId && (
                <div className="text-orange-600 text-sm mt-1 animate-pulse">
                  ⏳ Typing...
                </div>
              )}
            </div>

            {debouncedId && Number(debouncedId) > 0 && (
              <>
                {getByIdQuery.isPending && <Loading />}
                {getByIdQuery.error && (
                  <ErrorMessage message={getByIdQuery.error.message} />
                )}
                {getByIdQuery.data && (
                  <NoticeCard
                    notice={getByIdQuery.data}
                    onEdit={() => handlePrefillUpdate(getByIdQuery.data)}
                    onDelete={() => handleDelete(getByIdQuery.data.id)}
                  />
                )}
              </>
            )}

            {(!debouncedId || Number(debouncedId) === 0) && (
              <div className="text-gray-400 text-center py-8">
                Enter a notice ID to search
              </div>
            )}
          </div>

          {/* Get by Language Code */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">
              Search by Language
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Language Code
              </label>
              <select
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
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
            </div>

            {debouncedCode && (
              <>
                {getByCodeQuery.isPending && <Loading />}
                {getByCodeQuery.error && (
                  <ErrorMessage message={getByCodeQuery.error.message} />
                )}
                {getByCodeQuery.data && (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    <div className="text-sm text-gray-600 mb-2">
                      Found: {getByCodeQuery.data.length} notices
                    </div>
                    {getByCodeQuery.data.map((notice) => (
                      <NoticeCard
                        key={notice.id}
                        notice={notice}
                        onEdit={() => handlePrefillUpdate(notice)}
                        onDelete={() => handleDelete(notice.id)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {!debouncedCode && (
              <div className="text-gray-400 text-center py-8">
                Select a language code to search
              </div>
            )}
          </div>
        </div>

        {/* Insert & Update Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Insert Notice */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">
              Insert Notice
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Language Code <span className="text-red-500">*</span>
                </label>
                <select
                  value={insertData.language_code}
                  onChange={(e) =>
                    setInsertData({
                      ...insertData,
                      language_code: e.target.value,
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
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={insertData.content}
                  onChange={(e) =>
                    setInsertData({ ...insertData, content: e.target.value })
                  }
                  placeholder="Enter notice content..."
                  className="border rounded px-3 py-2 w-full h-24 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Start Date <span className="text-red-500">*</span>
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
                    className="border rounded px-3 py-2 w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={insertData.end_date}
                    onChange={(e) =>
                      setInsertData({ ...insertData, end_date: e.target.value })
                    }
                    className="border rounded px-3 py-2 w-full"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
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
                  className="w-4 h-4"
                />
                <label htmlFor="insert-active" className="text-sm font-medium">
                  Active
                </label>
              </div>

              <button
                onClick={handleInsert}
                disabled={insertMutation.isPending}
                className="w-full bg-green-600 text-white py-3 rounded font-medium hover:bg-green-700 transition disabled:bg-gray-400"
              >
                {insertMutation.isPending ? "Inserting..." : "Insert Notice"}
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
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">
              Update Notice
              {updateId && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  (ID: {updateId})
                </span>
              )}
            </h2>
            <div className="space-y-4">
              {!updateId && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                  ℹ️ Click the <strong>Edit</strong> button on any notice above
                  to prefill this form
                </div>
              )}

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
                  <option value="">Keep current language</option>
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
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
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
                  className="border rounded px-3 py-2 w-full h-24 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
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
                    className="border rounded px-3 py-2 w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
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
                    className="border rounded px-3 py-2 w-full"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
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
                  className="w-4 h-4"
                />
                <label htmlFor="update-active" className="text-sm font-medium">
                  Active
                </label>
              </div>

              <button
                onClick={handleUpdate}
                disabled={updateMutation.isPending || !updateId}
                className="w-full bg-blue-600 text-white py-3 rounded font-medium hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {updateMutation.isPending ? "Updating..." : "Update Notice"}
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
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Tips:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>
              Use the <strong>Status Filter</strong> to view all, active, or
              inactive notices
            </li>
            <li>
              Click <strong>Edit</strong> on any notice to prefill the update
              form
            </li>
            <li>Search by ID or language code has 500ms debounce delay</li>
            <li>Date validation ensures start date is before end date</li>
            <li>All mutations automatically refresh the notice lists</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NoticeTestPage;
