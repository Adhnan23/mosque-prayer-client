import { Link } from "react-router-dom";
import {
  usePrayerTimes,
  useNotice,
  useLanguages,
  useTranslations,
  useSettings,
} from "../hooks";

function isLeapYear(date: Date) {
  const year = date.getFullYear();
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

const AdminDashboard = () => {
  // Fetch real data
  const days = isLeapYear(new Date()) ? 366 : 365;
  const prayerTimesQuery = usePrayerTimes.getAll(24, days);
  const noticesQuery = useNotice.get(true); // Active notices only
  const languagesQuery = useLanguages.get();
  const translationsQuery = useTranslations.get();
  const settingsQuery = useSettings.get();

  const quickStats = [
    {
      label: "Prayer Times",
      value: prayerTimesQuery.data?.length || 0,
      icon: "🕌",
      gradient: "from-blue-500 via-blue-600 to-cyan-600",
      borderColor: "border-blue-300",
      bgGradient: "from-blue-50 to-cyan-50",
      link: "/prayer",
      loading: prayerTimesQuery.isPending,
    },
    {
      label: "Active Notices",
      value: noticesQuery.data?.length || 0,
      icon: "📢",
      gradient: "from-green-500 via-emerald-600 to-teal-600",
      borderColor: "border-green-300",
      bgGradient: "from-green-50 to-emerald-50",
      link: "/notice",
      loading: noticesQuery.isPending,
    },
    {
      label: "Languages",
      value: languagesQuery.data?.length || 0,
      icon: "🌐",
      gradient: "from-purple-500 via-violet-600 to-fuchsia-600",
      borderColor: "border-purple-300",
      bgGradient: "from-purple-50 to-fuchsia-50",
      link: "/languages",
      loading: languagesQuery.isPending,
    },
    {
      label: "Translations",
      value: translationsQuery.data?.length || 0,
      icon: "🗣️",
      gradient: "from-orange-500 via-amber-600 to-yellow-600",
      borderColor: "border-orange-300",
      bgGradient: "from-orange-50 to-amber-50",
      link: "/translations",
      loading: translationsQuery.isPending,
    },
  ];

  const mainFeatures = [
    {
      title: "Prayer Times",
      description: "Manage daily prayer schedules and timings",
      icon: "🕌",
      gradient: "from-blue-100 to-cyan-100",
      borderColor: "border-blue-300",
      iconBg: "from-blue-500 to-cyan-600",
      link: "/prayer",
    },
    {
      title: "Iqamath Settings",
      description: "Configure iqamath times after adhan",
      icon: "⏰",
      gradient: "from-green-100 to-emerald-100",
      borderColor: "border-green-300",
      iconBg: "from-green-500 to-emerald-600",
      link: "/ikamah",
    },
    {
      title: "Ramadan Mode",
      description: "Special Ramadan timings and features",
      icon: "🌙",
      gradient: "from-purple-100 to-violet-100",
      borderColor: "border-purple-300",
      iconBg: "from-purple-500 to-violet-600",
      link: "/ramadan",
    },
    {
      title: "Languages",
      description: "Manage available languages",
      icon: "🌐",
      gradient: "from-indigo-100 to-blue-100",
      borderColor: "border-indigo-300",
      iconBg: "from-indigo-500 to-blue-600",
      link: "/languages",
    },
    {
      title: "Notices",
      description: "Create and manage mosque announcements",
      icon: "📢",
      gradient: "from-yellow-100 to-amber-100",
      borderColor: "border-yellow-300",
      iconBg: "from-yellow-500 to-amber-600",
      link: "/notice",
    },
    {
      title: "Settings",
      description: "Configure mosque and app settings",
      icon: "⚙️",
      gradient: "from-gray-100 to-slate-100",
      borderColor: "border-gray-300",
      iconBg: "from-gray-500 to-slate-600",
      link: "/settings",
    },
    {
      title: "Translations",
      description: "Manage multilingual content",
      icon: "🗣️",
      gradient: "from-pink-100 to-rose-100",
      borderColor: "border-pink-300",
      iconBg: "from-pink-500 to-rose-600",
      link: "/translations",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white px-8 py-4 rounded-full shadow-xl mb-4">
            <h1 className="text-4xl font-black flex items-center gap-3">
              <span className="text-5xl">🕌</span>
              {settingsQuery.isPending ? (
                <span className="animate-pulse">Loading...</span>
              ) : settingsQuery.data?.mosque_name ? (
                settingsQuery.data.mosque_name
              ) : (
                "Mosque Admin"
              )}
            </h1>
          </div>
          <p className="text-gray-700 text-xl font-semibold">
            ✨ Manage your mosque's digital presence and prayer timings ✨
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Link
              key={index}
              to={stat.link}
              className={`bg-gradient-to-br ${stat.bgGradient} rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 p-6 border-3 ${stat.borderColor} group`}
            >
              <div
                className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${stat.gradient} text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}
              >
                <span className="text-4xl">{stat.icon}</span>
              </div>
              <div className="text-4xl font-black text-gray-900 mb-2">
                {stat.loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 border-3 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-400 text-2xl">...</span>
                  </div>
                ) : (
                  stat.value
                )}
              </div>
              <div className="text-gray-700 font-bold text-lg">
                {stat.label}
              </div>
              <div className="mt-3 text-sm font-semibold text-gray-600 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to manage
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Main Features Grid */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
            <span className="text-4xl">⚡</span>
            Quick Access
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainFeatures.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className={`bg-gradient-to-br ${feature.gradient} border-3 ${feature.borderColor} rounded-2xl p-6 hover:shadow-2xl transition-all transform hover:-translate-y-2 group`}
              >
                <div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.iconBg} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all`}
                >
                  <span className="text-5xl">{feature.icon}</span>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-700 font-semibold mb-4">
                  {feature.description}
                </p>
                <div className="text-violet-600 font-black flex items-center gap-2 group-hover:gap-4 transition-all">
                  Manage Now
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Section - Tips & Status */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Tips Card */}
          <div className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-8 text-white border-4 border-white/20">
            <h3 className="text-3xl font-black mb-6 flex items-center gap-3">
              <span className="text-4xl">💡</span>
              Quick Tips
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                <span className="text-2xl">•</span>
                <span className="font-semibold">
                  Update prayer times monthly for accuracy
                </span>
              </li>
              <li className="flex items-start gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                <span className="text-2xl">•</span>
                <span className="font-semibold">
                  Enable Ramadan mode during the holy month
                </span>
              </li>
              <li className="flex items-start gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                <span className="text-2xl">•</span>
                <span className="font-semibold">
                  Keep notices updated with mosque events
                </span>
              </li>
              <li className="flex items-start gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                <span className="text-2xl">•</span>
                <span className="font-semibold">
                  Add multiple languages for diverse congregation
                </span>
              </li>
            </ul>
          </div>

          {/* System Status Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 border-3 border-violet-200">
            <h3 className="text-3xl font-black mb-6 text-gray-900 flex items-center gap-3">
              <span className="text-4xl">📊</span>
              System Status
            </h3>
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-800 font-bold flex items-center gap-2">
                    <span className="text-xl">🕌</span>
                    Prayer Times
                  </span>
                  {prayerTimesQuery.isPending ? (
                    <span className="flex items-center gap-2 text-gray-500 text-sm">
                      <div className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </span>
                  ) : prayerTimesQuery.data &&
                    prayerTimesQuery.data.length > 0 ? (
                    <span className="flex items-center gap-2 text-green-700 font-black">
                      <span className="w-3 h-3 bg-green-600 rounded-full shadow-lg"></span>
                      {prayerTimesQuery.data.length} Days
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-red-700 font-black">
                      <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
                      Not Set
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border-2 border-purple-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-800 font-bold flex items-center gap-2">
                    <span className="text-xl">🌙</span>
                    Ramadan Mode
                  </span>
                  {settingsQuery.isPending ? (
                    <span className="flex items-center gap-2 text-gray-500 text-sm">
                      <div className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </span>
                  ) : settingsQuery.data?.is_ramadan ? (
                    <span className="flex items-center gap-2 text-purple-700 font-black">
                      <span className="w-3 h-3 bg-purple-600 rounded-full animate-pulse shadow-lg"></span>
                      Active 🌙
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-gray-600 font-bold">
                      <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-800 font-bold flex items-center gap-2">
                    <span className="text-xl">📢</span>
                    Active Notices
                  </span>
                  {noticesQuery.isPending ? (
                    <span className="flex items-center gap-2 text-gray-500 text-sm">
                      <div className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-green-700 font-black">
                      <span className="w-3 h-3 bg-green-600 rounded-full shadow-lg"></span>
                      {noticesQuery.data?.length || 0} Active
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border-2 border-orange-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-800 font-bold flex items-center gap-2">
                    <span className="text-xl">🌐</span>
                    Languages
                  </span>
                  {languagesQuery.isPending ? (
                    <span className="flex items-center gap-2 text-gray-500 text-sm">
                      <div className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </span>
                  ) : (
                    <span className="text-gray-900 font-black text-sm">
                      {languagesQuery.data
                        ?.map((lang) => lang.code)
                        .join(", ")
                        .toUpperCase() || "None"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 bg-gradient-to-r from-violet-100 via-purple-100 to-fuchsia-100 border-3 border-violet-300 rounded-2xl p-6 shadow-lg">
          <h3 className="font-black text-violet-900 mb-4 text-xl flex items-center gap-2">
            <span className="text-2xl">ℹ️</span>
            Dashboard Guide
          </h3>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-sm text-violet-800">
                <span className="font-bold">📊 Stats:</span> View real-time
                counts of your mosque data
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-sm text-violet-800">
                <span className="font-bold">⚡ Quick Access:</span> Jump
                directly to any management section
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-sm text-violet-800">
                <span className="font-bold">📊 Status:</span> Monitor system
                health at a glance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
