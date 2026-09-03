import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { Sparkles, Loader2 } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-xl shadow-blue-500/25 animate-pulse">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white tracking-tight">AI Banker Transformation Copilot</h3>
            <p className="text-xs text-slate-400">Verifying secure Firebase authentication state...</p>
          </div>
          <Loader2 className="w-5 h-5 text-blue-400 animate-spin mt-2" />
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <LandingPage />;
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
