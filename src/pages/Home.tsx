import { Link } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
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
      color: "from-blue-500 to-blue-600",
      link: "/prayer",
      loading: prayerTimesQuery.isPending,
    },
    {
      label: "Active Notices",
      value: noticesQuery.data?.length || 0,
      icon: "📢",
      color: "from-green-500 to-green-600",
      link: "/notice",
      loading: noticesQuery.isPending,
    },
    {
      label: "Languages",
      value: languagesQuery.data?.length || 0,
      icon: "🌐",
      color: "from-purple-500 to-purple-600",
      link: "/languages",
      loading: languagesQuery.isPending,
    },
    {
      label: "Translations",
      value: translationsQuery.data?.length || 0,
      icon: "🗣️",
      color: "from-orange-500 to-orange-600",
      link: "/translations",
      loading: translationsQuery.isPending,
    },
  ];

  const mainFeatures = [
    {
      title: "Prayer Times",
      description: "Manage daily prayer schedules and timings",
      icon: "🕌",
      color: "bg-blue-50 border-blue-200",
      iconBg: "bg-blue-100",
      link: "/prayer",
    },
    {
      title: "Ikamah Settings",
      description: "Configure ikamah times after adhan",
      icon: "⏰",
      color: "bg-green-50 border-green-200",
      iconBg: "bg-green-100",
      link: "/ikamah",
    },
    {
      title: "Ramadan Mode",
      description: "Special Ramadan timings and features",
      icon: "🌙",
      color: "bg-purple-50 border-purple-200",
      iconBg: "bg-purple-100",
      link: "/ramadan",
    },
    {
      title: "Languages",
      description: "Manage available languages",
      icon: "🌐",
      color: "bg-indigo-50 border-indigo-200",
      iconBg: "bg-indigo-100",
      link: "/languages",
    },
    {
      title: "Notices",
      description: "Create and manage mosque announcements",
      icon: "📢",
      color: "bg-yellow-50 border-yellow-200",
      iconBg: "bg-yellow-100",
      link: "/notice",
    },
    {
      title: "Settings",
      description: "Configure mosque and app settings",
      icon: "⚙️",
      color: "bg-gray-50 border-gray-200",
      iconBg: "bg-gray-100",
      link: "/settings",
    },
    {
      title: "Translations",
      description: "Manage multilingual content",
      icon: "🗣️",
      color: "bg-pink-50 border-pink-200",
      iconBg: "bg-pink-100",
      link: "/translations",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {settingsQuery.data?.mosque_name
              ? `Welcome to ${settingsQuery.data.mosque_name}`
              : "Welcome to Mosque Admin Dashboard"}
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your mosque's digital presence and prayer timings
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Link
              key={index}
              to={stat.link}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border-2 border-transparent hover:border-blue-200"
            >
              <div
                className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${stat.color} text-white mb-4`}
              >
                <span className="text-3xl">{stat.icon}</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stat.loading ? (
                  <span className="text-gray-400 animate-pulse">...</span>
                ) : (
                  stat.value
                )}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </Link>
          ))}
        </div>

        {/* Main Features Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Access
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainFeatures.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className={`${feature.color} border-2 rounded-xl p-6 hover:shadow-lg transition-all group`}
              >
                <div
                  className={`${feature.iconBg} w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <span className="text-3xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
                <div className="mt-4 text-blue-600 font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                  Manage
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
        </div>

        {/* Recent Activity / Tips Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Tips Card */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>💡</span>
              Quick Tips
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-blue-200 mt-1">•</span>
                <span>Update prayer times monthly for accuracy</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-200 mt-1">•</span>
                <span>Enable Ramadan mode during the holy month</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-200 mt-1">•</span>
                <span>Keep notices updated with mosque events</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-200 mt-1">•</span>
                <span>Add multiple languages for diverse congregation</span>
              </li>
            </ul>
          </div>

          {/* System Status Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
            <h3 className="text-xl font-bold mb-4 text-gray-900">
              System Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Prayer Times</span>
                {prayerTimesQuery.isPending ? (
                  <span className="text-gray-400 text-sm">Loading...</span>
                ) : prayerTimesQuery.data &&
                  prayerTimesQuery.data.length > 0 ? (
                  <span className="flex items-center gap-2 text-green-600 font-medium">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    {prayerTimesQuery.data.length} Days
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-red-600 font-medium">
                    <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                    Not Set
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Ramadan Mode</span>
                {settingsQuery.isPending ? (
                  <span className="text-gray-400 text-sm">Loading...</span>
                ) : settingsQuery.data?.is_ramadan ? (
                  <span className="flex items-center gap-2 text-purple-600 font-medium">
                    <span className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></span>
                    Active 🌙
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-gray-600 font-medium">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    Inactive
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active Notices</span>
                {noticesQuery.isPending ? (
                  <span className="text-gray-400 text-sm">Loading...</span>
                ) : (
                  <span className="flex items-center gap-2 text-green-600 font-medium">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    {noticesQuery.data?.length || 0} Active
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Languages</span>
                {languagesQuery.isPending ? (
                  <span className="text-gray-400 text-sm">Loading...</span>
                ) : (
                  <span className="text-gray-900 font-medium">
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
    </div>
  );
};

export default AdminDashboard;
