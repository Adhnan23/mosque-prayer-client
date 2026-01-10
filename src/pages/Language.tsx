import { useState, useEffect } from "react";
import { useLanguages } from "../hooks";
import type { Languages, LanguageCode } from "../api/types";

const LanguagesTestPage = () => {
  const [searchCode, setSearchCode] = useState<string>("");
  const [debouncedCode, setDebouncedCode] = useState<string>("");

  // Insert form state
  const [insertData, setInsertData] = useState<Languages>({
    code: "",
    name: "",
  });

  // Delete form state
  const [deleteCode, setDeleteCode] = useState<string>("");

  // Debounce search code
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCode(searchCode);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchCode]);

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
  const getAllQuery = useLanguages.get();
  const getByCodeQuery = useLanguages.getByCode(debouncedCode as LanguageCode);

  // Mutations
  const insertMutation = useLanguages.insert();
  const deleteMutation = useLanguages.delete();

  const handleInsert = () => {
    if (!insertData.code || !insertData.name) {
      alert("Please fill in both code and name");
      return;
    }

    if (insertData.code.length < 2 || insertData.code.length > 4) {
      alert("Code must be between 2 and 4 characters");
      return;
    }

    insertMutation.mutate(
      { body: { code: insertData.code.toLowerCase(), name: insertData.name } },
      {
        onSuccess: () => {
          setInsertData({ code: "", name: "" });
        },
      }
    );
  };

  const handleDelete = () => {
    if (!deleteCode) {
      alert("Please enter a language code to delete");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete language with code "${deleteCode}"?`
      )
    ) {
      deleteMutation.mutate(
        { code: deleteCode.toLowerCase() as LanguageCode },
        {
          onSuccess: () => {
            setDeleteCode("");
          },
        }
      );
    }
  };

  const handleQuickDelete = (code: string) => {
    if (window.confirm(`Are you sure you want to delete "${code}"?`)) {
      deleteMutation.mutate({ code: code as LanguageCode });
    }
  };

  const handlePrefillInsert = (lang: Languages) => {
    setInsertData({ code: lang.code, name: lang.name });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Languages API Test Page
        </h1>

        {/* Query Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Get All Languages */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">
              All Languages
            </h2>
            {getAllQuery.isPending && <Loading />}
            {getAllQuery.error && (
              <ErrorMessage message={getAllQuery.error.message} />
            )}
            {getAllQuery.data && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <div className="text-sm text-gray-600 mb-3">
                  Total: {getAllQuery.data.length} languages
                </div>
                {getAllQuery.data.map((lang, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 transition"
                  >
                    <div>
                      <span className="font-mono font-bold text-blue-600">
                        {lang.code}
                      </span>
                      <span className="mx-2">—</span>
                      <span className="text-gray-700">{lang.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePrefillInsert(lang)}
                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleQuickDelete(lang.code)}
                        className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Get Language by Code */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">
              Search by Code
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Language Code
              </label>
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="e.g., en, es, fr"
                className="border rounded px-3 py-2 w-full"
                maxLength={4}
              />
              {searchCode !== debouncedCode && (
                <div className="text-orange-600 text-sm mt-1 animate-pulse">
                  ⏳ Typing...
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
                  <div className="bg-green-50 p-4 rounded border border-green-200">
                    <div className="text-sm text-gray-600 mb-2">
                      Language Name:
                    </div>
                    <div className="text-2xl font-bold text-green-700">
                      {getByCodeQuery.data}
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      Code:{" "}
                      <span className="font-mono font-semibold">
                        {debouncedCode}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}

            {!debouncedCode && (
              <div className="text-gray-400 text-center py-8">
                Enter a language code to search
              </div>
            )}
          </div>
        </div>

        {/* Mutation Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Insert Language */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">
              Insert/Update Language
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Language Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={insertData.code}
                  onChange={(e) =>
                    setInsertData({ ...insertData, code: e.target.value })
                  }
                  placeholder="e.g., en, es, fr"
                  className="border rounded px-3 py-2 w-full"
                  maxLength={4}
                />
                <div className="text-xs text-gray-500 mt-1">
                  2-4 characters, will be converted to lowercase
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Language Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={insertData.name}
                  onChange={(e) =>
                    setInsertData({ ...insertData, name: e.target.value })
                  }
                  placeholder="e.g., English, Spanish, French"
                  className="border rounded px-3 py-2 w-full"
                />
              </div>

              <button
                onClick={handleInsert}
                disabled={insertMutation.isPending}
                className="w-full bg-green-600 text-white py-3 rounded font-medium hover:bg-green-700 transition disabled:bg-gray-400"
              >
                {insertMutation.isPending ? "Inserting..." : "Insert Language"}
              </button>

              {insertMutation.error && (
                <ErrorMessage message={insertMutation.error.message} />
              )}
              {insertMutation.isSuccess && (
                <SuccessMessage message="Language inserted successfully!" />
              )}
            </div>
          </div>

          {/* Delete Language */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">
              Delete Language
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Language Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={deleteCode}
                  onChange={(e) => setDeleteCode(e.target.value)}
                  placeholder="e.g., en, es, fr"
                  className="border rounded px-3 py-2 w-full"
                  maxLength={4}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Enter the code of the language you want to delete
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                ⚠️ <strong>Warning:</strong> This action cannot be undone. The
                language will be permanently deleted.
              </div>

              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="w-full bg-red-600 text-white py-3 rounded font-medium hover:bg-red-700 transition disabled:bg-gray-400"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Language"}
              </button>

              {deleteMutation.error && (
                <ErrorMessage message={deleteMutation.error.message} />
              )}
              {deleteMutation.isSuccess && (
                <SuccessMessage message="Language deleted successfully!" />
              )}
            </div>
          </div>
        </div>

        {/* Helper Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Tips:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>
              Use the <strong>Edit</strong> button in the list to quickly
              prefill the insert form
            </li>
            <li>
              Use the <strong>Delete</strong> button in the list for quick
              deletion
            </li>
            <li>Language codes are automatically converted to lowercase</li>
            <li>Search has a 500ms debounce delay to reduce API calls</li>
            <li>All mutations automatically refresh the language list</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LanguagesTestPage;
