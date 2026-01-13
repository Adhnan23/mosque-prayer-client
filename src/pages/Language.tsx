import { useState, useEffect } from "react";
import { useLanguages } from "../hooks";
import type { Languages, LanguageCode } from "../api/types";

const LanguagesTestPage = () => {
  const [searchCode, setSearchCode] = useState<string>("");
  const [debouncedCode, setDebouncedCode] = useState<string>("");
  const [insertData, setInsertData] = useState<Languages>({
    code: "",
    name: "",
  });
  const [deleteCode, setDeleteCode] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCode(searchCode);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchCode]);

  const Loading = () => (
    <div className="text-blue-600 font-semibold animate-pulse flex items-center justify-center gap-2 py-8">
      <div className="w-5 h-5 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
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

  const getAllQuery = useLanguages.get();
  const getByCodeQuery = useLanguages.getByCode(debouncedCode as LanguageCode);
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
      { onSuccess: () => setInsertData({ code: "", name: "" }) }
    );
  };

  const handleDelete = () => {
    if (!deleteCode) {
      alert("Please enter a language code to delete");
      return;
    }
    if (
      window.confirm(
        `Are you sure you want to delete language "${deleteCode}"?`
      )
    ) {
      deleteMutation.mutate(
        { code: deleteCode.toLowerCase() as LanguageCode },
        { onSuccess: () => setDeleteCode("") }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-full shadow-lg mb-4">
            <h1 className="text-4xl font-black flex items-center gap-3">
              <span className="text-5xl">🌍</span>
              Languages Management
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Manage application languages and translations
          </p>
        </div>

        {/* Query Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Get All Languages */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-blue-100">
            <h2 className="text-2xl font-black mb-4 pb-3 border-b-2 border-gray-200 flex items-center gap-3">
              <span className="text-3xl">📚</span>
              All Languages
            </h2>
            {getAllQuery.isPending && <Loading />}
            {getAllQuery.error && (
              <ErrorMessage message={getAllQuery.error.message} />
            )}
            {getAllQuery.data && (
              <div className="space-y-2">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-3 rounded-xl mb-4 border-2 border-blue-200">
                  <p className="text-sm font-bold text-blue-900">
                    Total:{" "}
                    <span className="text-2xl">{getAllQuery.data.length}</span>{" "}
                    languages
                  </p>
                </div>
                <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                  {getAllQuery.data.map((lang, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:border-blue-300 transition-all transform hover:-translate-y-0.5 shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🗣️</span>
                        <div>
                          <span className="font-mono font-black text-blue-600 text-lg">
                            {lang.code}
                          </span>
                          <span className="mx-2 text-gray-400">—</span>
                          <span className="text-gray-700 font-semibold">
                            {lang.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePrefillInsert(lang)}
                          className="bg-gradient-to-r from-blue-100 to-cyan-100 hover:from-blue-200 hover:to-cyan-200 text-blue-700 px-3 py-1.5 rounded-lg transition-all font-semibold text-sm shadow-sm hover:shadow-md"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleQuickDelete(lang.code)}
                          className="bg-gradient-to-r from-red-100 to-pink-100 hover:from-red-200 hover:to-pink-200 text-red-700 px-3 py-1.5 rounded-lg transition-all font-semibold text-sm shadow-sm hover:shadow-md"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Get Language by Code */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-cyan-100">
            <h2 className="text-2xl font-black mb-4 pb-3 border-b-2 border-gray-200 flex items-center gap-3">
              <span className="text-3xl">🔍</span>
              Search by Code
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2 text-gray-700">
                Language Code
              </label>
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="e.g., en, es, fr, ta, si"
                className="border-2 border-cyan-300 rounded-xl px-4 py-3 w-full font-semibold focus:ring-4 focus:ring-cyan-200 focus:border-cyan-500 focus:outline-none transition-all"
                maxLength={4}
              />
              {searchCode !== debouncedCode && (
                <div className="text-orange-600 text-sm mt-2 animate-pulse flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg">
                  <div className="w-3 h-3 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                  Searching...
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
                  <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-6 rounded-xl border-4 border-green-300 shadow-lg">
                    <div className="text-sm text-green-700 mb-2 font-semibold">
                      Language Name:
                    </div>
                    <div className="text-4xl font-black text-green-700 mb-3">
                      {getByCodeQuery.data}
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm px-3 py-2 rounded-lg inline-block">
                      <span className="text-sm text-green-600">Code: </span>
                      <span className="font-mono font-black text-green-800 text-lg">
                        {debouncedCode}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}

            {!debouncedCode && (
              <div className="text-gray-400 text-center py-12 bg-gray-50 rounded-xl">
                <span className="text-5xl block mb-3">🔎</span>
                <p className="text-sm">Enter a language code to search</p>
              </div>
            )}
          </div>
        </div>

        {/* Mutation Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Insert Language */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-green-100">
            <h2 className="text-2xl font-black mb-4 pb-3 border-b-2 border-gray-200 flex items-center gap-3">
              <span className="text-3xl">➕</span>
              Insert/Update Language
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700 flex items-center gap-2">
                  <span>Language Code</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={insertData.code}
                  onChange={(e) =>
                    setInsertData({ ...insertData, code: e.target.value })
                  }
                  placeholder="e.g., en, es, fr"
                  className="border-2 border-green-300 rounded-xl px-4 py-3 w-full font-semibold focus:ring-4 focus:ring-green-200 focus:border-green-500 focus:outline-none transition-all"
                  maxLength={4}
                />
                <div className="text-xs text-green-700 mt-2 bg-green-50 px-3 py-2 rounded-lg">
                  ℹ️ 2-4 characters, will be converted to lowercase
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700 flex items-center gap-2">
                  <span>Language Name</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={insertData.name}
                  onChange={(e) =>
                    setInsertData({ ...insertData, name: e.target.value })
                  }
                  placeholder="e.g., English, Spanish, French"
                  className="border-2 border-green-300 rounded-xl px-4 py-3 w-full font-semibold focus:ring-4 focus:ring-green-200 focus:border-green-500 focus:outline-none transition-all"
                />
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
                  "➕ Insert Language"
                )}
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
          <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-red-100">
            <h2 className="text-2xl font-black mb-4 pb-3 border-b-2 border-gray-200 flex items-center gap-3">
              <span className="text-3xl">🗑️</span>
              Delete Language
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700 flex items-center gap-2">
                  <span>Language Code</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={deleteCode}
                  onChange={(e) => setDeleteCode(e.target.value)}
                  placeholder="e.g., en, es, fr"
                  className="border-2 border-red-300 rounded-xl px-4 py-3 w-full font-semibold focus:ring-4 focus:ring-red-200 focus:border-red-500 focus:outline-none transition-all"
                  maxLength={4}
                />
                <div className="text-xs text-red-700 mt-2 bg-red-50 px-3 py-2 rounded-lg">
                  ℹ️ Enter the code of the language you want to delete
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <p className="font-bold text-yellow-900 mb-1">Warning</p>
                    <p className="text-sm text-yellow-800">
                      This action cannot be undone. The language will be
                      permanently deleted.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-4 rounded-xl font-black text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none"
              >
                {deleteMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </span>
                ) : (
                  "🗑️ Delete Language"
                )}
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
        <div className="mt-6 bg-gradient-to-r from-blue-100 via-cyan-100 to-teal-100 border-2 border-blue-300 rounded-2xl p-6 shadow-lg">
          <h3 className="font-black text-blue-900 mb-4 text-xl flex items-center gap-2">
            <span className="text-2xl">💡</span>
            Quick Tips
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-sm text-blue-800">
                <span className="font-bold">✏️ Edit:</span> Use the Edit button
                to quickly prefill the insert form
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-sm text-blue-800">
                <span className="font-bold">🗑️ Quick Delete:</span> Use the
                Delete button in the list for quick removal
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-sm text-blue-800">
                <span className="font-bold">🔤 Lowercase:</span> Language codes
                are automatically converted to lowercase
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-sm text-blue-800">
                <span className="font-bold">⏱️ Debounce:</span> Search has a
                500ms delay to reduce API calls
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguagesTestPage;
