import { useState, useEffect } from "react";
import { useTranslations, useLanguages } from "../hooks";
import type { LanguageCode, TTranslationsUpdate } from "../api/types";

const TranslationsTestPage = () => {
  const [searchCode, setSearchCode] = useState<string>("");
  const [searchCategory, setSearchCategory] = useState<string>("");
  const [searchKey, setSearchKey] = useState<string>("");
  const [debouncedCode, setDebouncedCode] = useState<string>("");
  const [debouncedCategory, setDebouncedCategory] = useState<string>("");
  const [debouncedKey, setDebouncedKey] = useState<string>("");

  const [insertData, setInsertData] = useState({
    code: "",
    category: "",
    key: "",
    value: "",
  });

  const [updateData, setUpdateData] = useState({
    code: "",
    category: "",
    key: "",
    value: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCode(searchCode);
      setDebouncedCategory(searchCategory);
      setDebouncedKey(searchKey);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchCode, searchCategory, searchKey]);

  const Loading = () => (
    <div className="text-amber-600 font-semibold animate-pulse flex items-center justify-center gap-2 py-8">
      <div className="w-5 h-5 border-3 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
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

  // Determine query type
  const queryType = (() => {
    if (debouncedCode && debouncedKey) return "key";
    if (debouncedCode && debouncedCategory) return "category";
    if (debouncedCode) return "language";
    return "all";
  })();

  // Queries
  const getAllQuery = useTranslations.get();
  const getByCodeQuery = useTranslations.getByCode(
    debouncedCode as LanguageCode
  );
  const getByCategoryQuery = useTranslations.getByCategory(
    debouncedCode as LanguageCode,
    debouncedCategory
  );
  const getByKeyQuery = useTranslations.getByKey(
    debouncedCode as LanguageCode,
    debouncedKey
  );
  const languagesQuery = useLanguages.get();

  // Active query and data
  const activeQuery = (() => {
    switch (queryType) {
      case "key":
        return getByKeyQuery;
      case "category":
        return getByCategoryQuery;
      case "language":
        return getByCodeQuery;
      default:
        return getAllQuery;
    }
  })();

  const displayData = (() => {
    if (queryType === "key" && typeof getByKeyQuery.data === "string") {
      return null; // Special case for single value
    }
    if (queryType === "category" && getByCategoryQuery.data) {
      return getByCategoryQuery.data;
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
  const insertMutation = useTranslations.insert();
  const updateMutation = useTranslations.update();
  const deleteMutation = useTranslations.delete();

  const handleInsert = () => {
    if (
      !insertData.code ||
      !insertData.category ||
      !insertData.key ||
      !insertData.value
    ) {
      alert("Please fill in all fields");
      return;
    }

    insertMutation.mutate(
      {
        code: insertData.code as LanguageCode,
        category: insertData.category,
        key: insertData.key,
        value: insertData.value,
      },
      {
        onSuccess: () => {
          setInsertData({ code: "", category: "", key: "", value: "" });
        },
      }
    );
  };

  const handleUpdate = () => {
    if (!updateData.code || !updateData.category || !updateData.key) {
      alert("Please fill in code, category, and key");
      return;
    }

    if (!updateData.value) {
      alert("Please provide a value to update");
      return;
    }

    const body: TTranslationsUpdate = { value: updateData.value };

    updateMutation.mutate(
      {
        code: updateData.code as LanguageCode,
        category: updateData.category,
        key: updateData.key,
        body,
      },
      {
        onSuccess: () => {
          setUpdateData({ code: "", category: "", key: "", value: "" });
        },
      }
    );
  };

  const handleDelete = (code: string, category: string, key: string) => {
    if (window.confirm(`Delete translation: ${code}/${category}/${key}?`)) {
      deleteMutation.mutate({ code: code as LanguageCode, category, key });
    }
  };

  const handlePrefillUpdate = (
    code: string,
    category: string,
    key: string,
    value: string
  ) => {
    setUpdateData({ code, category, key, value });
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSearchCode("");
    setSearchCategory("");
    setSearchKey("");
  };

  const TranslationCard = ({ trans, onEdit, onDelete }: any) => (
    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-4 hover:shadow-lg transition-all transform hover:-translate-y-1">
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-mono bg-blue-600 text-white px-3 py-1 rounded-full font-bold">
            {trans.language_code.toUpperCase()}
          </span>
          <span className="text-xs font-mono bg-purple-600 text-white px-3 py-1 rounded-full font-bold">
            {trans.category}
          </span>
          <span className="text-xs font-mono bg-gray-700 text-white px-3 py-1 rounded-full font-bold">
            {trans.key}
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
      <div className="text-sm text-gray-800 bg-white/70 backdrop-blur-sm p-3 rounded-lg font-mono">
        {trans.value}
      </div>
    </div>
  );

  const categories = Array.from(
    new Set(getAllQuery.data?.map((t) => t.category) || [])
  ).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-full shadow-lg mb-4">
            <h1 className="text-4xl font-black flex items-center gap-3">
              <span className="text-5xl">🌐</span>
              Translations Management
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Manage multilingual content and translations
          </p>
        </div>

        {/* Unified Search Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 border-2 border-amber-100">
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

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">
                Language Code
              </label>
              <select
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="border-2 border-amber-300 rounded-xl px-4 py-3 w-full font-semibold focus:ring-4 focus:ring-amber-200 focus:border-amber-500 focus:outline-none transition-all"
              >
                <option value="">All Languages</option>
                {languagesQuery.data?.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">
                Category
              </label>
              <input
                type="text"
                list="categories-search"
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                placeholder="e.g., common, prayers"
                className="border-2 border-yellow-300 rounded-xl px-4 py-3 w-full font-semibold focus:ring-4 focus:ring-yellow-200 focus:border-yellow-500 focus:outline-none transition-all"
              />
              <datalist id="categories-search">
                {categories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">
                Key
              </label>
              <input
                type="text"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                placeholder="e.g., welcome, title"
                className="border-2 border-orange-300 rounded-xl px-4 py-3 w-full font-semibold focus:ring-4 focus:ring-orange-200 focus:border-orange-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-blue-900">Active Query:</span>
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-1 rounded-full font-bold text-sm">
                {queryType.toUpperCase()}
              </span>
              <span className="text-gray-600 text-sm">
                {queryType === "all" && "(all translations)"}
                {queryType === "language" && `(language: ${debouncedCode})`}
                {queryType === "category" &&
                  `(${debouncedCode}/${debouncedCategory})`}
                {queryType === "key" && `(${debouncedCode}/${debouncedKey})`}
              </span>
              {(searchCode !== debouncedCode ||
                searchCategory !== debouncedCategory ||
                searchKey !== debouncedKey) && (
                <span className="text-orange-600 animate-pulse flex items-center gap-1 bg-orange-100 px-3 py-1 rounded-full text-sm font-semibold">
                  <div className="w-3 h-3 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                  Typing...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Unified Results Display */}
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 border-2 border-amber-100">
          <h2 className="text-2xl font-black mb-6 pb-3 border-b-2 border-gray-200 flex items-center justify-between">
            <span className="flex items-center gap-3">
              <span className="text-3xl">📋</span>
              Results
            </span>
            {displayData && displayData.length > 0 && (
              <span className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 px-4 py-2 rounded-full text-sm font-bold border-2 border-amber-300">
                Total: {displayData.length}
              </span>
            )}
          </h2>

          {activeQuery.isPending && <Loading />}
          {activeQuery.error && (
            <ErrorMessage message={activeQuery.error.message} />
          )}

          {/* Special case: Single key value */}
          {queryType === "key" &&
            !activeQuery.isPending &&
            !activeQuery.error &&
            typeof getByKeyQuery.data === "string" && (
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-6 rounded-xl border-4 border-green-300 shadow-lg">
                <div className="text-sm text-green-700 mb-2 font-semibold flex items-center gap-2">
                  <span className="text-xl">🔑</span>
                  Translation Value for:{" "}
                  <span className="font-mono font-bold">
                    {debouncedCode} / {debouncedKey}
                  </span>
                </div>
                <div className="text-2xl font-mono text-green-900 bg-white/70 backdrop-blur-sm p-4 rounded-lg">
                  {getByKeyQuery.data}
                </div>
              </div>
            )}

          {/* Array results */}
          {!activeQuery.isPending &&
            !activeQuery.error &&
            displayData &&
            displayData.length === 0 &&
            queryType !== "key" && (
              <div className="text-center py-16 bg-gray-50 rounded-xl">
                <span className="text-6xl block mb-4">📭</span>
                <p className="text-gray-500 text-lg font-semibold">
                  No translations found
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Try adjusting your filters
                </p>
              </div>
            )}

          {displayData && displayData.length > 0 && (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {displayData.map((trans: any, idx: number) => (
                <TranslationCard
                  key={idx}
                  trans={trans}
                  onEdit={() =>
                    handlePrefillUpdate(
                      trans.language_code,
                      trans.category,
                      trans.key,
                      trans.value
                    )
                  }
                  onDelete={() =>
                    handleDelete(trans.language_code, trans.category, trans.key)
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Insert & Update Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Insert */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-green-100">
            <h2 className="text-2xl font-black mb-6 pb-3 border-b-2 border-gray-200 flex items-center gap-3">
              <span className="text-3xl">➕</span>
              Insert Translation
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700 flex items-center gap-2">
                  <span>Language Code</span>
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={insertData.code}
                  onChange={(e) =>
                    setInsertData({ ...insertData, code: e.target.value })
                  }
                  className="border-2 border-green-300 rounded-xl px-4 py-3 w-full font-semibold focus:ring-4 focus:ring-green-200 focus:border-green-500 focus:outline-none transition-all"
                >
                  <option value="">Select language</option>
                  {languagesQuery.data?.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} ({lang.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700 flex items-center gap-2">
                  <span>Category</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  list="categories"
                  value={insertData.category}
                  onChange={(e) =>
                    setInsertData({ ...insertData, category: e.target.value })
                  }
                  placeholder="e.g., common, prayers"
                  className="border-2 border-green-300 rounded-xl px-4 py-3 w-full font-semibold focus:ring-4 focus:ring-green-200 focus:border-green-500 focus:outline-none transition-all"
                />
                <datalist id="categories">
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700 flex items-center gap-2">
                  <span>Key</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={insertData.key}
                  onChange={(e) =>
                    setInsertData({ ...insertData, key: e.target.value })
                  }
                  placeholder="e.g., welcome_message"
                  className="border-2 border-green-300 rounded-xl px-4 py-3 w-full font-semibold focus:ring-4 focus:ring-green-200 focus:border-green-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700 flex items-center gap-2">
                  <span>Value</span>
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={insertData.value}
                  onChange={(e) =>
                    setInsertData({ ...insertData, value: e.target.value })
                  }
                  placeholder="Translation text"
                  className="border-2 border-green-300 rounded-xl px-4 py-3 w-full h-32 resize-none font-medium focus:ring-4 focus:ring-green-200 focus:border-green-500 focus:outline-none transition-all"
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
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-2xl">➕</span>
                    Insert Translation
                  </span>
                )}
              </button>

              {insertMutation.error && (
                <ErrorMessage message={insertMutation.error.message} />
              )}
              {insertMutation.isSuccess && (
                <SuccessMessage message="Translation inserted!" />
              )}
            </div>
          </div>

          {/* Update */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-blue-100">
            <h2 className="text-2xl font-black mb-6 pb-3 border-b-2 border-gray-200 flex items-center gap-3">
              <span className="text-3xl">✏️</span>
              Update Translation
              {updateData.code && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                  {updateData.code}/{updateData.category}/{updateData.key}
                </span>
              )}
            </h2>
            <div className="space-y-4">
              {!updateData.code && (
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <p className="font-bold text-yellow-900 mb-1">
                        How to Update
                      </p>
                      <p className="text-sm text-yellow-800">
                        Click the <strong>Edit</strong> button on any
                        translation to prefill this form
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
                  value={updateData.code}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, code: e.target.value })
                  }
                  className="border-2 border-blue-300 rounded-xl px-4 py-3 w-full font-semibold focus:ring-4 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition-all"
                >
                  <option value="">Select language</option>
                  {languagesQuery.data?.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} ({lang.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  Category
                </label>
                <input
                  type="text"
                  list="categories"
                  value={updateData.category}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, category: e.target.value })
                  }
                  placeholder="e.g., common, prayers"
                  className="border-2 border-blue-300 rounded-xl px-4 py-3 w-full font-semibold focus:ring-4 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  Key
                </label>
                <input
                  type="text"
                  value={updateData.key}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, key: e.target.value })
                  }
                  placeholder="e.g., welcome_message"
                  className="border-2 border-blue-300 rounded-xl px-4 py-3 w-full font-semibold focus:ring-4 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  New Value
                </label>
                <textarea
                  value={updateData.value}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, value: e.target.value })
                  }
                  placeholder="Updated translation text"
                  className="border-2 border-blue-300 rounded-xl px-4 py-3 w-full h-32 resize-none font-medium focus:ring-4 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>

              <button
                onClick={handleUpdate}
                disabled={updateMutation.isPending || !updateData.code}
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
                    Update Translation
                  </span>
                )}
              </button>

              {updateMutation.error && (
                <ErrorMessage message={updateMutation.error.message} />
              )}
              {updateMutation.isSuccess && (
                <SuccessMessage message="Translation updated!" />
              )}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 border-2 border-amber-300 rounded-2xl p-6 shadow-lg">
          <h3 className="font-black text-amber-900 mb-4 text-xl flex items-center gap-2">
            <span className="text-2xl">💡</span>
            Translation Guide
          </h3>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-sm text-amber-800">
                <span className="font-bold">📂 Categories:</span> Group related
                translations (e.g., "common", "prayers")
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-sm text-amber-800">
                <span className="font-bold">🔑 Keys:</span> Unique identifiers
                for each translation
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-sm text-amber-800">
                <span className="font-bold">🔍 Smart Search:</span> Filter by
                language, category, or specific key
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-sm text-amber-800">
                <span className="font-bold">⏱️ Debounce:</span> 500ms delay on
                search to reduce API calls
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-sm text-amber-800">
                <span className="font-bold">📝 Auto-suggest:</span> Category
                field shows existing categories
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslationsTestPage;
