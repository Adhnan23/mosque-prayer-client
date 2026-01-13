import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-6">
      {/* Big emoji / illustration */}
      <div className="text-9xl mb-6 animate-bounce">🚫</div>

      {/* Main message */}
      <h1 className="text-5xl font-black text-gray-800 mb-4 text-center">
        Oops! Page Not Found
      </h1>

      {/* Subtext */}
      <p className="text-lg text-gray-600 mb-8 text-center">
        The page you are looking for might have moved, or never existed.
        <span className="block mt-2">Try going back home!</span>
      </p>

      {/* Action button */}
      <button
        onClick={() => navigate("/display")}
        className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700 text-white py-4 px-8 rounded-xl font-black text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
      >
        📺 Go Home
      </button>

      {/* Optional fun footer */}
      <div className="mt-12 text-gray-400 text-center">
        <span className="text-2xl">🤷‍♂️</span> Nothing to see here, move along!
      </div>
    </div>
  );
};

export default NotFoundPage;
