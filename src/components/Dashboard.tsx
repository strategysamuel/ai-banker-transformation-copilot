import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AppModuleType, InteractionSession } from '../types';
import { CopilotChat } from './CopilotChat';
import { CustomerMeetingPrep } from './CustomerMeetingPrep';
import { BankingEmailAssistant } from './BankingEmailAssistant';
import { ProcessOptimizer } from './ProcessOptimizer';
import { TransformationAssessment } from './TransformationAssessment';
import { LearningAcademy } from './LearningAcademy';
import { TransformationPlan } from './TransformationPlan';
import { ProjectCompassKnowledgeBase } from './ProjectCompassKnowledgeBase';
import { SessionHistory } from './SessionHistory';
import {
  Sparkles,
  ShieldCheck,
  LogOut,
  User,
  Database,
  Cpu,
  Server,
  FileText,
  Mail,
  TrendingUp,
  GraduationCap,
  ClipboardCheck,
  Calendar,
  History,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Edit3,
  Save,
  X,
  ExternalLink,
  Layers,
  ChevronRight,
  Compass,
  Info,
  MessageSquare
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, userProfile, logout, updateProfileData } = useAuth();
  const [activeTab, setActiveTab] = useState<AppModuleType>('overview');
  const [selectedSessionForCopilot, setSelectedSessionForCopilot] = useState<InteractionSession | null>(null);
  const [selectedSessionForMeetingPrep, setSelectedSessionForMeetingPrep] = useState<InteractionSession | null>(null);
  const [selectedSessionForEmailAssistant, setSelectedSessionForEmailAssistant] = useState<InteractionSession | null>(null);
  const [selectedSessionForProcessOptimizer, setSelectedSessionForProcessOptimizer] = useState<InteractionSession | null>(null);
  const [selectedSessionForAssessment, setSelectedSessionForAssessment] = useState<InteractionSession | null>(null);
  const [selectedSessionForTransformationPlan, setSelectedSessionForTransformationPlan] = useState<InteractionSession | null>(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({
    displayName: userProfile?.displayName || '',
    role: userProfile?.role || 'Commercial & Retail Banking Specialist',
    department: userProfile?.department || 'Digital Banking & Innovation',
    institution: userProfile?.institution || 'Global Financial Services',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setSaveSuccessMessage(null);
    try {
      await updateProfileData({
        displayName: editFormData.displayName,
        role: editFormData.role,
        department: editFormData.department,
        institution: editFormData.institution,
      });
      setSaveSuccessMessage('Profile updated in Firestore successfully!');
      setTimeout(() => {
        setIsEditingProfile(false);
        setSaveSuccessMessage(null);
      }, 1200);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  const navItems = [
    { id: 'overview' as AppModuleType, label: 'Dashboard Overview', icon: Layers, phase: 1, ready: true, statusText: 'LIVE' },
    { id: 'copilot' as AppModuleType, label: 'AI Banker Copilot', icon: Sparkles, phase: 2, ready: true, statusText: 'LIVE' },
    { id: 'meeting_prep' as AppModuleType, label: 'Customer Meeting Prep', icon: FileText, phase: 2, ready: true, statusText: 'LIVE' },
    { id: 'project_compass' as AppModuleType, label: 'Project Compass (SOPs)', icon: Compass, phase: 3, ready: true, statusText: 'RAG LIVE' },
    { id: 'email_assistant' as AppModuleType, label: 'Banking Email Assistant', icon: Mail, phase: 3, ready: true, statusText: 'LIVE' },
    { id: 'process_optimizer' as AppModuleType, label: 'Process Optimizer', icon: TrendingUp, phase: 5, ready: true, statusText: 'LIVE' },
    { id: 'session_history' as AppModuleType, label: 'Session History', icon: History, phase: 2, ready: true, statusText: 'LIVE' },
    { id: 'transformation_assessment' as AppModuleType, label: 'Transformation Assessment', icon: ClipboardCheck, phase: 5, ready: true, statusText: 'LIVE' },
    { id: 'learning_assistant' as AppModuleType, label: 'AI Learning Academy', icon: GraduationCap, phase: '5D', ready: true, statusText: 'LIVE' },
    { id: 'transformation_plan' as AppModuleType, label: '30-Day Transformation Plan', icon: Calendar, phase: '5E', ready: true, statusText: 'LIVE' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Enterprise App Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white">AI Banker</span>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-md bg-blue-950 text-blue-400 font-medium border border-blue-800/50">
                  Transformation Copilot
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Enterprise Workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Status Badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Cloud Run Live • Gemini Active</span>
            </div>

            {/* Profile Pill */}
            <button
              id="dashboard-user-profile-btn"
              onClick={() => setIsEditingProfile(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700/80 transition cursor-pointer text-left"
            >
              {userProfile?.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt={userProfile.displayName || 'User'}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-blue-500/50"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-blue-950 border border-blue-700/60 flex items-center justify-center text-blue-300 text-xs font-bold">
                  {userProfile?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
              )}
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-white truncate max-w-[130px]">
                  {userProfile?.displayName || user?.displayName || 'Banker'}
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                  {userProfile?.role || 'Banking Specialist'}
                </div>
              </div>
              <Edit3 className="w-3.5 h-3.5 text-slate-400 ml-1 hidden sm:block" />
            </button>

            {/* Logout Button */}
            <button
              id="dashboard-logout-btn"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-850 hover:bg-red-950/60 hover:text-red-300 border border-slate-700/80 text-xs font-medium text-slate-300 transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Navigation Sidebar */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
              Workspace Modules
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    onClick={() => {
                      if (item.id === 'copilot' && activeTab !== 'copilot') {
                        // Keep or fresh
                      }
                      setActiveTab(item.id);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                        item.ready
                          ? isActive
                            ? 'bg-blue-800 text-blue-100'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                          : isActive
                          ? 'bg-blue-800 text-blue-200'
                          : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                      }`}
                    >
                      {item.statusText}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Metrics / AI Maturity Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">AI Transformation</span>
              <span className="text-xs font-mono font-bold text-blue-400">
                {userProfile?.transformationScore ?? 15}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${userProfile?.transformationScore ?? 15}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 text-center">
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                <div className="text-base font-bold text-white">{userProfile?.sessionsCount ?? 0}</div>
                <div className="text-[10px] text-slate-400">AI Sessions</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                <div className="text-base font-bold text-white">{userProfile?.completedTasksCount ?? 0}</div>
                <div className="text-[10px] text-slate-400">Tasks Done</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Main Content Panel */}
        <main className="lg:col-span-9 space-y-6">
          {/* Compliance & Sensitive Data Notice */}
          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/50 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200/90 leading-relaxed">
              <span className="font-bold text-amber-200 uppercase tracking-wide">Enterprise Banking Security: </span>
              Do not enter confidential customer information, account numbers, passwords, card numbers, PANs or other sensitive banking data. All activity is bound to your verified Google UID.
            </div>
          </div>

          {activeTab === 'overview' && (
            /* Overview Tab: Foundation & System Architecture Status */
            <div className="space-y-6">
              {/* Welcome Header */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-900/40 relative overflow-hidden">
                <div className="relative z-10 space-y-3">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-900/60 border border-blue-700/50 text-blue-300 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>AI Banker Copilot, Meeting Prep & Project Compass RAG Live</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Welcome, {userProfile?.displayName || user?.displayName || 'Banking Specialist'}
                  </h2>
                  <p className="text-sm text-slate-300 max-w-2xl">
                    Your authenticated enterprise banking environment is connected to Gemini API with verified Firebase token security and Firestore session persistence.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      id="overview-launch-copilot-btn"
                      onClick={() => {
                        setSelectedSessionForCopilot(null);
                        setActiveTab('copilot');
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Launch AI Banker Copilot</span>
                    </button>

                    <button
                      id="overview-launch-meeting-prep-btn"
                      onClick={() => {
                        setSelectedSessionForMeetingPrep(null);
                        setActiveTab('meeting_prep');
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Customer Meeting Prep</span>
                    </button>

                    <button
                      id="overview-launch-email-assistant-btn"
                      onClick={() => {
                        setSelectedSessionForEmailAssistant(null);
                        setActiveTab('email_assistant');
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/25 transition cursor-pointer"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Banking Email Assistant</span>
                    </button>

                    <button
                      id="overview-launch-process-optimizer-btn"
                      onClick={() => {
                        setSelectedSessionForProcessOptimizer(null);
                        setActiveTab('process_optimizer');
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-lg shadow-teal-600/25 transition cursor-pointer"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>Process Optimizer</span>
                    </button>

                    <button
                      id="overview-launch-project-compass-btn"
                      onClick={() => {
                        setActiveTab('project_compass');
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-semibold shadow-lg shadow-blue-700/25 transition cursor-pointer"
                    >
                      <Compass className="w-4 h-4 text-blue-200" />
                      <span>Project Compass SOPs</span>
                    </button>

                    <button
                      id="overview-launch-assessment-btn"
                      onClick={() => {
                        setSelectedSessionForAssessment(null);
                        setActiveTab('transformation_assessment');
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition cursor-pointer"
                    >
                      <ClipboardCheck className="w-4 h-4 text-white" />
                      <span>Transformation Assessment</span>
                    </button>

                    <button
                      id="overview-launch-academy-btn"
                      onClick={() => {
                        setActiveTab('learning_assistant');
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/25 transition cursor-pointer"
                    >
                      <GraduationCap className="w-4 h-4 text-white" />
                      <span>AI Learning Academy</span>
                    </button>

                    <button
                      id="overview-launch-plan-btn"
                      onClick={() => {
                        setActiveTab('transformation_plan');
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition cursor-pointer"
                    >
                      <Calendar className="w-4 h-4 text-white" />
                      <span>30-Day Plan</span>
                    </button>

                    <button
                      id="overview-view-history-btn"
                      onClick={() => {
                        setActiveTab('session_history');
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                    >
                      <History className="w-4 h-4 text-indigo-400" />
                      <span>View Session History</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800/60 flex items-center justify-center text-blue-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                      LIVE
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-white">Gemini Banker Copilot</div>
                  <p className="text-[11px] text-slate-400">
                    Model: <span className="font-mono text-blue-300">gemini-flash-latest</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Context: Multi-Turn Conversation
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                      LIVE
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-white">Customer Meeting Prep</div>
                  <p className="text-[11px] text-slate-400">
                    Endpoint: <span className="font-mono text-cyan-300">/api/ai/meeting-prep</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Output: Agendas, Discovery & Objections
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800/60 flex items-center justify-center text-blue-400">
                      <Compass className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                      RAG LIVE
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-white">Project Compass SOPs</div>
                  <p className="text-[11px] text-slate-400">
                    Vector Index: <span className="font-mono text-purple-300">3,072-dim</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Guardrails: Version Safety & HITL
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-teal-950 border border-teal-800/60 flex items-center justify-center text-teal-400">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                      LIVE
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-white">Process Optimizer</div>
                  <p className="text-[11px] text-slate-400">
                    Endpoint: <span className="font-mono text-teal-300">/api/ai/process-optimizer</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Output: Bottlenecks & HITL Roadmap
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
                      <Database className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                      PERSISTED
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-white">Firestore Subcollections</div>
                  <p className="text-[11px] text-slate-400 truncate">
                    Path: <span className="font-mono text-indigo-300">/users/{user?.uid}/interactions</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Sessions: <span className="text-slate-300">{userProfile?.sessionsCount ?? 0} saved</span>
                  </p>
                </div>
              </div>

              {/* Verified Firestore Profile Card */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-400" />
                    <h3 className="font-bold text-base text-white">Banker Profile & Institutional Data</h3>
                  </div>
                  <button
                    id="edit-profile-btn"
                    onClick={() => setIsEditingProfile(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile Data</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60">
                    <span className="text-slate-400">Full Name:</span>
                    <p className="font-semibold text-white mt-0.5">{userProfile?.displayName || 'N/A'}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60">
                    <span className="text-slate-400">Designation / Role:</span>
                    <p className="font-semibold text-white mt-0.5">{userProfile?.role || 'N/A'}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60">
                    <span className="text-slate-400">Department:</span>
                    <p className="font-semibold text-white mt-0.5">{userProfile?.department || 'N/A'}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60">
                    <span className="text-slate-400">Institution:</span>
                    <p className="font-semibold text-white mt-0.5">{userProfile?.institution || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'copilot' && (
            <CopilotChat
              initialSession={selectedSessionForCopilot}
              onSessionUpdated={(session) => {
                setSelectedSessionForCopilot(session);
              }}
              onNavigateToHistory={() => {
                setActiveTab('session_history');
              }}
            />
          )}

          {activeTab === 'meeting_prep' && (
            <CustomerMeetingPrep
              initialSession={selectedSessionForMeetingPrep}
              onSessionUpdated={(session) => {
                setSelectedSessionForMeetingPrep(session);
              }}
              onNavigateToHistory={() => {
                setActiveTab('session_history');
              }}
            />
          )}

          {activeTab === 'email_assistant' && (
            <BankingEmailAssistant
              initialSession={selectedSessionForEmailAssistant}
              onSessionUpdated={(session) => {
                setSelectedSessionForEmailAssistant(session);
              }}
              onNavigateToHistory={() => {
                setActiveTab('session_history');
              }}
            />
          )}

          {activeTab === 'process_optimizer' && (
            <ProcessOptimizer
              initialSession={selectedSessionForProcessOptimizer}
              onSessionUpdated={(session) => {
                setSelectedSessionForProcessOptimizer(session);
              }}
              onNavigateToHistory={() => {
                setActiveTab('session_history');
              }}
            />
          )}

          {activeTab === 'project_compass' && (
            <ProjectCompassKnowledgeBase />
          )}

          {activeTab === 'session_history' && (
            <SessionHistory
              onSelectSession={(session) => {
                if (session.type === 'meeting_prep') {
                  setSelectedSessionForMeetingPrep(session);
                  setActiveTab('meeting_prep');
                } else if (session.type === 'email_assistant') {
                  setSelectedSessionForEmailAssistant(session);
                  setActiveTab('email_assistant');
                } else if (session.type === 'process_optimizer') {
                  setSelectedSessionForProcessOptimizer(session);
                  setActiveTab('process_optimizer');
                } else if (session.type === 'transformation_assessment') {
                  setSelectedSessionForAssessment(session);
                  setActiveTab('transformation_assessment');
                } else if (session.type === 'transformation_plan') {
                  setSelectedSessionForTransformationPlan(session);
                  setActiveTab('transformation_plan');
                } else {
                  setSelectedSessionForCopilot(session);
                  setActiveTab('copilot');
                }
              }}
              onStartNewChat={() => {
                setSelectedSessionForCopilot(null);
                setActiveTab('copilot');
              }}
            />
          )}

          {activeTab === 'transformation_assessment' && (
            <TransformationAssessment
              userId={user?.uid || ''}
              initialSession={selectedSessionForAssessment}
              onSessionUpdated={(updatedSession) => {
                setSelectedSessionForAssessment(updatedSession);
              }}
              onNavigateToAcademy={() => {
                setActiveTab('learning_assistant');
              }}
            />
          )}

          {activeTab === 'learning_assistant' && (
            <LearningAcademy
              userId={user?.uid || ''}
              onNavigateToModule={(targetModule) => {
                setActiveTab(targetModule);
              }}
              onNavigateToAssessment={() => {
                setActiveTab('transformation_assessment');
              }}
            />
          )}

          {activeTab === 'transformation_plan' && (
            <TransformationPlan
              initialSession={selectedSessionForTransformationPlan}
              onNavigateToAssessment={() => {
                setActiveTab('transformation_assessment');
              }}
              onNavigateToAcademy={() => {
                setActiveTab('learning_assistant');
              }}
              onNavigateToModule={(targetModule) => {
                setActiveTab(targetModule);
              }}
              onSessionUpdated={(updatedSession) => {
                setSelectedSessionForTransformationPlan(updatedSession);
              }}
            />
          )}

          {activeTab !== 'overview' && activeTab !== 'copilot' && activeTab !== 'meeting_prep' && activeTab !== 'email_assistant' && activeTab !== 'process_optimizer' && activeTab !== 'project_compass' && activeTab !== 'session_history' && activeTab !== 'transformation_assessment' && activeTab !== 'learning_assistant' && activeTab !== 'transformation_plan' && (
            /* Module Readiness Preview State for roadmap modules */
            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                <Sparkles className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                  <span>ROADMAP MODULE</span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  {navItems.find((n) => n.id === activeTab)?.label}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  This capability is part of the future enterprise transformation roadmap and is not included in the current challenge implementation.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 max-w-md mx-auto text-left text-xs space-y-2">
                <div className="font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Configured Data Binding</span>
                </div>
                <div className="font-mono text-[11px] text-slate-400">
                  Subcollection: <span className="text-indigo-300">/users/{user?.uid}/interactions</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Security: Access strictly isolated to authenticated UID
                </div>
              </div>

              <button
                onClick={() => setActiveTab('copilot')}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition cursor-pointer"
              >
                Go to AI Banker Copilot
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base text-white">Edit Banker Profile</h3>
              </div>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {saveSuccessMessage && (
              <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{saveSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Display Name</label>
                <input
                  type="text"
                  value={editFormData.displayName}
                  onChange={(e) => setEditFormData({ ...editFormData, displayName: e.target.value })}
                  maxLength={150}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Job Title / Designation</label>
                <input
                  type="text"
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  maxLength={50}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Department</label>
                <input
                  type="text"
                  value={editFormData.department}
                  onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                  maxLength={100}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Financial Institution</label>
                <input
                  type="text"
                  value={editFormData.institution}
                  onChange={(e) => setEditFormData({ ...editFormData, institution: e.target.value })}
                  maxLength={150}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingProfile ? 'Saving...' : 'Save to Firestore'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
