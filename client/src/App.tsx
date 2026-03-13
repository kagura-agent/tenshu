import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { Office } from "./pages/Office";
import { Sessions } from "./pages/Sessions";
import { Cron } from "./pages/Cron";
import { Results } from "./pages/Results";
import { System } from "./pages/System";
import { Activity } from "./pages/Activity";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex h-screen bg-zinc-950 text-zinc-100">
          <Sidebar />
          <main className="flex-1 overflow-auto p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/command" element={<Office />} />
              <Route path="/sessions" element={<Sessions />} />
              <Route path="/cron" element={<Cron />} />
              <Route path="/results" element={<Results />} />
              <Route path="/system" element={<System />} />
              <Route path="/activity" element={<Activity />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
