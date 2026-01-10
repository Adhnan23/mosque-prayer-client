import { BrowserRouter, Link } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider } from "./context/AppContext";
import AppRoutes from "./routes/AppRoutes";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: 500,
    },
    mutations: {
      retry: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <BrowserRouter>
          <nav className="p-4 bg-gray-200">
            <Link className="mr-4" to="/">
              Home
            </Link>
            <Link to="/ikamah" className="mr-4">
              Ikamah
            </Link>
            <Link to="/language" className="mr-4">
              Language
            </Link>
            <Link to="/prayer" className="mr-4">
              Prayer
            </Link>
            <Link to="/notice" className="mr-4">
              Notice
            </Link>
          </nav>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </QueryClientProvider>
  );
}
