import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { InteractionSession, InteractionType } from '../types';
import { getUserInteractions, deleteInteraction } from '../services/interactionService';
import {
  History,
  Search,
  MessageSquare,
  Trash2,
  Calendar,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface SessionHistoryProps {
  onSelectSession: (session: InteractionSession) => void;
  onStartNewChat: () => void;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({
  onSelectSession,
  onStartNewChat,
}) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<InteractionSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getUserInteractions(
        user.uid,
        filterType !== 'all' ? (filterType as InteractionType) : undefined
      );
      setSessions(data);
    } catch (err: unknown) {
      console.error('Failed to load session history:', err);
      setError('Unable to load session history from Firestore. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user, filterType]);

  const handleDelete = async (sessionId: string) => {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteInteraction(user.uid, sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Failed to delete session:', err);
      setError('Failed to delete session. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const query = searchQuery.toLowerCase();
    const titleMatch = s.title.toLowerCase().includes(query);
    const summaryMatch = s.summary?.toLowerCase().includes(query) || false;
    return titleMatch || summaryMatch;
  });

  // Helper for friendly date formatting
  const formatFriendlyDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  // Helper for module display name
  const formatModuleName = (type: string) => {
    switch (type) {
      case 'copilot':
        return 'AI Banker Copilot';
      case 'meeting_prep':
        return 'Customer Meeting Prep';
      case 'email_assistant':
        return 'Banking Email Assistant';
      case 'process_optimizer':
        return 'Process Optimizer';
      case 'transformation_assessment':
        return 'Transformation Assessment';
      case 'transformation_plan':
        return '30-Day Transformation Plan';
      case 'learning_assistant':
        return 'AI Learning Assistant';
      default:
        return 'Banking AI Session';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search Bar */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Session History</h3>
              <p className="text-xs text-slate-400">
                Securely persisted AI sessions under your Google UID
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="history-refresh-btn"
              onClick={fetchSessions}
              disabled={loading}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              title="Refresh sessions"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              id="history-start-new-chat-btn"
              onClick={onStartNewChat}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer shadow-md shadow-blue-600/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Copilot Session</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="history-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sessions..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            id="history-filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-auto px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Modules</option>
            <option value="copilot">AI Banker Copilot</option>
            <option value="meeting_prep">Meeting Prep</option>
            <option value="email_assistant">Email Assistant</option>
            <option value="process_optimizer">Process Optimizer</option>
            <option value="transformation_assessment">Transformation Assessment</option>
            <option value="transformation_plan">30-Day Transformation Plan</option>
            <option value="learning_assistant">Learning Assistant</option>
          </select>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchSessions}
            className="underline hover:text-white cursor-pointer font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Sessions List */}
      {loading ? (
        <div className="p-12 text-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-400 mx-auto" />
          <p className="text-xs text-slate-400">Loading sessions from Firestore...</p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-4 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-white text-sm">No Saved Sessions</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? 'No sessions match your search. Try adjusting the keywords or clear the filter.'
                : 'Conversations and AI tasks are automatically saved to your Firestore account.'}
            </p>
          </div>
          <button
            onClick={onStartNewChat}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer"
          >
            Start First Session
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              id={`session-card-${session.id}`}
              className="p-5 rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4 group shadow-lg"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/50">
                    {formatModuleName(session.type)}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>{formatFriendlyDate(session.updatedAt)}</span>
                  </div>
                </div>

                <h4 className="font-bold text-sm text-white group-hover:text-blue-300 transition line-clamp-1">
                  {session.title}
                </h4>

                {session.summary && (
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {session.summary}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    {session.type === 'process_optimizer'
                      ? 'Process Assessment'
                      : session.type === 'transformation_assessment'
                      ? 'Transformation Scorecard'
                      : session.type === 'meeting_prep'
                      ? 'Meeting Prep Brief'
                      : session.type === 'email_assistant'
                      ? 'Email Analysis'
                      : `${session.messages?.length || 0} messages`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id={`delete-session-btn-${session.id}`}
                    onClick={() => setDeleteConfirmId(session.id)}
                    className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-800/60 text-xs font-medium transition cursor-pointer flex items-center gap-1"
                    title="Delete this session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>

                  <button
                    id={`open-session-btn-${session.id}`}
                    onClick={() => onSelectSession(session)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition cursor-pointer text-xs shadow-md shadow-blue-600/20"
                  >
                    <span>Open</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-800/80 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Delete Session?</h4>
                <p className="text-[11px] text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This will permanently remove this session and its persisted conversation from your isolated Firestore subcollection.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                id="cancel-delete-modal-btn"
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleting}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-modal-btn"
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleting}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
