import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './app/queryClient';
import AppRoutes from './routes/AppRoutes';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-[#f6f7fb]">
          <Navbar />
          <main className="app-container py-6 pb-28 md:py-8 md:pb-10">
            <AppRoutes />
          </main>
          <BottomNav />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
