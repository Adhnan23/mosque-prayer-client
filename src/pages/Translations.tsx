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

  // Insert form
  const [insertData, setInsertData] = useState({
    code: "",
    category: "",
    key: "",
    value: "",
  });

  // Update form
  const [updateData, setUpdateData] = useState({
    code: "",
    category: "",
    key: "",
    value: "",
  });

  // Debounce search inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCode(searchCode);
      setDebouncedCategory(searchCategory);
      setDebouncedKey(searchKey);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchCode, searchCategory, searchKey]);

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

  const TranslationCard = ({ trans, onEdit, onDelete }: any) => (
    <div className="border rounded-lg p-3 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-wrap gap-1">
          <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded">
            {trans.language_code}
          </span>
          <span className="text-xs font-mono bg-purple-100 text-purple-700 px-2 py-1 rounded">
            {trans.category}
          </span>
          <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded">
            {trans.key}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded"
          >
            Delete
          </button>
        </div>
      </div>
      <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded font-mono">
        {trans.value}
      </div>
    </div>
  );

  // Get unique categories from all translations
  const categories = Array.from(
    new Set(getAllQuery.data?.map((t) => t.category) || [])
  ).sort();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          🌐 Translations Management
        </h1>

        {/* Search Controls */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-3">Search Filters</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Language Code
              </label>
              <select
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="border rounded px-3 py-2 w-full"
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
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                type="text"
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                placeholder="e.g., common, prayers"
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Key</label>
              <input
                type="text"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                placeholder="e.g., welcome, title"
                className="border rounded px-3 py-2 w-full"
              />
            </div>
          </div>
          {(searchCode !== debouncedCode ||
            searchCategory !== debouncedCategory ||
            searchKey !== debouncedKey) && (
            <div className="text-orange-600 text-sm mt-2 animate-pulse">
              ⏳ Typing...
            </div>
          )}
        </div>

        {/* Query Results */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* All Translations */}
          <div className="bg-white p-6 rounded-lg shadow-lg lg:col-span-2">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">
              All Translations
            </h2>
            {getAllQuery.isPending && <Loading />}
            {getAllQuery.error && (
              <ErrorMessage message={getAllQuery.error.message} />
            )}
            {getAllQuery.data && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <div className="text-sm text-gray-600 mb-2">
                  Total: {getAllQuery.data.length} translations
                </div>
                {getAllQuery.data.map((trans, idx) => (
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
                      handleDelete(
                        trans.language_code,
                        trans.category,
                        trans.key
                      )
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* By Code */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">
              By Language
            </h2>
            {debouncedCode ? (
              <>
                {getByCodeQuery.isPending && <Loading />}
                {getByCodeQuery.error && (
                  <ErrorMessage message={getByCodeQuery.error.message} />
                )}
                {getByCodeQuery.data && (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    <div className="text-sm text-gray-600 mb-2">
                      Found: {getByCodeQuery.data.length}
                    </div>
                    {getByCodeQuery.data.map((trans, idx) => (
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
                          handleDelete(
                            trans.language_code,
                            trans.category,
                            trans.key
                          )
                        }
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-gray-400 text-center py-8">
                Select a language
              </div>
            )}
          </div>

          {/* By Category */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">
              By Category
            </h2>
            {debouncedCode && debouncedCategory ? (
              <>
                {getByCategoryQuery.isPending && <Loading />}
                {getByCategoryQuery.error && (
                  <ErrorMessage message={getByCategoryQuery.error.message} />
                )}
                {getByCategoryQuery.data && (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    <div className="text-sm text-gray-600 mb-2">
                      Found: {getByCategoryQuery.data.length}
                    </div>
                    {getByCategoryQuery.data.map((trans, idx) => (
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
                          handleDelete(
                            trans.language_code,
                            trans.category,
                            trans.key
                          )
                        }
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-gray-400 text-center py-8">
                {!debouncedCode ? "Select a language" : "Enter a category"}
              </div>
            )}
          </div>
        </div>

        {/* Get by Key */}
        {debouncedCode && debouncedKey && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">
              Translation Value
            </h2>
            {getByKeyQuery.isPending && <Loading />}
            {getByKeyQuery.error && (
              <ErrorMessage message={getByKeyQuery.error.message} />
            )}
            {getByKeyQuery.data && (
              <div className="bg-green-50 p-4 rounded border border-green-200">
                <div className="text-sm text-gray-600 mb-1">
                  {debouncedCode} / {debouncedKey}
                </div>
                <div className="text-lg font-mono text-green-700">
                  {getByKeyQuery.data}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Insert & Update */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Insert */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">
              Insert Translation
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Language Code <span className="text-red-500">*</span>
                </label>
                <select
                  value={insertData.code}
                  onChange={(e) =>
                    setInsertData({ ...insertData, code: e.target.value })
                  }
                  className="border rounded px-3 py-2 w-full"
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
                <label className="block text-sm font-medium mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  list="categories"
                  value={insertData.category}
                  onChange={(e) =>
                    setInsertData({ ...insertData, category: e.target.value })
                  }
                  placeholder="e.g., common, prayers"
                  className="border rounded px-3 py-2 w-full"
                />
                <datalist id="categories">
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={insertData.key}
                  onChange={(e) =>
                    setInsertData({ ...insertData, key: e.target.value })
                  }
                  placeholder="e.g., welcome_message"
                  className="border rounded px-3 py-2 w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Value <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={insertData.value}
                  onChange={(e) =>
                    setInsertData({ ...insertData, value: e.target.value })
                  }
                  placeholder="Translation text"
                  className="border rounded px-3 py-2 w-full h-24 resize-none"
                />
              </div>

              <button
                onClick={handleInsert}
                disabled={insertMutation.isPending}
                className="w-full bg-green-600 text-white py-3 rounded font-medium hover:bg-green-700 transition disabled:bg-gray-400"
              >
                {insertMutation.isPending
                  ? "Inserting..."
                  : "Insert Translation"}
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
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">
              Update Translation
            </h2>
            <div className="space-y-4">
              {!updateData.code && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                  ℹ️ Click <strong>Edit</strong> on any translation to prefill
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Language Code
                </label>
                <select
                  value={updateData.code}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, code: e.target.value })
                  }
                  className="border rounded px-3 py-2 w-full"
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
                <label className="block text-sm font-medium mb-2">
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
                  className="border rounded px-3 py-2 w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Key</label>
                <input
                  type="text"
                  value={updateData.key}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, key: e.target.value })
                  }
                  placeholder="e.g., welcome_message"
                  className="border rounded px-3 py-2 w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  New Value
                </label>
                <textarea
                  value={updateData.value}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, value: e.target.value })
                  }
                  placeholder="Updated translation text"
                  className="border rounded px-3 py-2 w-full h-24 resize-none"
                />
              </div>

              <button
                onClick={handleUpdate}
                disabled={updateMutation.isPending || !updateData.code}
                className="w-full bg-blue-600 text-white py-3 rounded font-medium hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {updateMutation.isPending
                  ? "Updating..."
                  : "Update Translation"}
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

        {/* Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Tips:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>
              <strong>Categories:</strong> Group related translations (e.g.,
              "common", "prayers", "settings")
            </li>
            <li>
              <strong>Keys:</strong> Unique identifiers for each translation
              (e.g., "welcome_message")
            </li>
            <li>
              <strong>Search:</strong> Filter by language, category, or key with
              500ms debounce
            </li>
            <li>
              <strong>Edit:</strong> Click Edit button to prefill the update
              form
            </li>
            <li>
              <strong>Auto-suggest:</strong> Category input shows existing
              categories
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TranslationsTestPage;
