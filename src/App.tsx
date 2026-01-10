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
            <Link to="/about" className="mr-4">
              About
            </Link>
            <Link to="/sample" className="mr-4">
              Sample
            </Link>
            <Link to="/prayer">Prayer</Link>
          </nav>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </QueryClientProvider>
  );
}
