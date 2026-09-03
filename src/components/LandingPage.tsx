import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  Zap, 
  Cpu, 
  FileText, 
  TrendingUp, 
  GraduationCap, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Database,
  Server
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { loginWithGoogle, loading, authError, clearError } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Enterprise Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">AI Banker</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-blue-950 text-blue-400 font-medium border border-blue-800/50">
                  Transformation Copilot
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Enterprise Generative AI Workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Google Cloud Run & Firebase Active</span>
            </div>
            <button
              id="header-google-signin-btn"
              onClick={loginWithGoogle}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-md shadow-blue-600/30 disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>{loading ? 'Authenticating...' : 'Sign In with Google'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex flex-col justify-center">
        {authError && (
          <div className="mb-8 p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 flex items-start justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">Authentication Notice</h4>
                <p className="text-sm text-red-300 mt-0.5">{authError}</p>
              </div>
            </div>
            <button
              onClick={clearError}
              className="text-xs px-2.5 py-1 rounded bg-red-900/60 hover:bg-red-900 text-red-200"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Copy & CTA */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/80 border border-blue-800/60 text-blue-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Enterprise Grade • Zero-Trust Security • Cloud Run Native</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                AI Banker <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">
                  Transformation Copilot
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl">
                Transform everyday banking work with secure, practical Generative AI.
              </p>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
              Equip commercial, retail, and private bankers with intelligent multi-turn workflows, meeting preparation, automated email drafting, process optimization, and a structured 30-day AI upskilling roadmap.
            </p>

            {/* Primary Action Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                id="hero-google-signin-btn"
                onClick={loginWithGoogle}
                disabled={loading}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base transition-all shadow-xl shadow-blue-600/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#ffffff"/>
                </svg>
                <span>{loading ? 'Initializing Secure Session...' : 'Sign In with Google Account'}</span>
                <ArrowRight className="w-5 h-5 text-blue-200" />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-slate-300 font-medium">UID-Isolated Firestore</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-xs text-slate-300 font-medium">Gemini 2.5/Flash AI</span>
              </div>
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-xs text-slate-300 font-medium">Cloud Run Ready</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Foundation Preview Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl shadow-blue-950/40">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Production Architecture</span>
              </div>

              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800/60 flex items-center justify-center text-blue-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Firebase Authentication</div>
                      <div className="text-xs text-slate-400">Google Sign-In with OAuth Token Exchange</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                    ONLINE
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Cloud Firestore DB</div>
                      <div className="text-xs text-slate-400">ABAC Hardened Rules & User Isolation</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                    CONNECTED
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800/60 flex items-center justify-center text-purple-400">
                      <Server className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Google Cloud Run</div>
                      <div className="text-xs text-slate-400">Containerized Runtime with Secret Manager</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                    ONLINE
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-800/60 flex items-center justify-center text-amber-400">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Gemini AI Engine</div>
                      <div className="text-xs text-slate-400">Server-Side Proxy & Prompt Shielding</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                    ACTIVE
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800">
                <button
                  onClick={loginWithGoogle}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <span>Authenticate to Access Banking Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Modules Overview Grid */}
        <section className="mt-20 pt-12 border-t border-slate-800/80">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Enterprise AI Transformation Modules
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Integrated capabilities engineered for high-compliance commercial and retail banking workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-lg bg-blue-950 border border-blue-800/60 flex items-center justify-center text-blue-400 mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-white">AI Banker Copilot</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Multi-turn intelligence assistant for regulatory queries, credit inquiries, and day-to-day banker advisory.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400 mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-white">Meeting & Email Prep</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Automated agendas, customer objection handling, and tone-tailored professional banking email correspondence.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400 mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-white">Process Optimizer</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Deconstruct manual loan approvals, KYC, and underwriting workflows into automated AI-enhanced pipelines.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-lg bg-purple-950 border border-purple-800/60 flex items-center justify-center text-purple-400 mb-4">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-white">30-Day Transformation</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                AI awareness assessment scorecards (0-100) and structured 4-week milestones to build lasting AI proficiency.
              </p>
            </div>
          </div>
        </section>

        {/* Security & Data Privacy Mandatory Banner */}
        <section className="mt-16 p-6 rounded-2xl bg-amber-950/30 border border-amber-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-amber-900/50 border border-amber-600/40 text-amber-300 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-200 uppercase tracking-wide">
                Enterprise Banking Data Privacy Notice
              </h4>
              <p className="text-xs text-amber-300/90 mt-1 leading-relaxed max-w-3xl">
                Do not enter confidential customer information, account numbers, passwords, card numbers or other sensitive banking data.
                This application uses isolated, owner-bound data models and server-side protected AI proxies for secure workflow acceleration.
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-900/60 text-amber-200 border border-amber-600/50">
              Zero-Trust Policy
            </span>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 AI Banker Transformation Copilot. Built with Google Cloud Run & Firebase.</p>
          <div className="flex items-center gap-6">
            <span>dev-tutorial=cloud-run-ai-challenge</span>
            <span>Zero-Trust ABAC</span>
            <span>Gemini API</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
