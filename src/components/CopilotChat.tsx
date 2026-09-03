import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import { ChatMessage, InteractionSession } from '../types';
import { sendCopilotMessage, AIServiceError } from '../services/aiService';
import { saveInteraction } from '../services/interactionService';
import {
  Sparkles,
  Send,
  RefreshCw,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  Square,
  ShieldCheck,
  Bot,
  User as UserIcon,
  Copy,
  Check,
  Flame,
  History,
  Database
} from 'lucide-react';

interface CopilotChatProps {
  initialSession?: InteractionSession | null;
  onSessionUpdated?: (session: InteractionSession) => void;
  onNavigateToHistory?: () => void;
}

const STARTER_PROMPTS = [
  'Identify repetitive banking processes that could benefit from AI.',
  'Help me prepare for a customer meeting.',
  'Explain Generative AI to a banking professional.',
  'Identify AI opportunities in a manual banking workflow.',
  'Create an AI adoption roadmap for my team.',
];

// Sensitive keyword/format regex for client-side privacy guard
const SENSITIVE_PATTERNS = [
  /\b(?:\d[ -]*?){13,19}\b/, // Credit card / PAN numbers
  /\b\d{3}-\d{2}-\d{4}\b/,   // SSN
  /\b(?:password|passwd|pin|cvv|cvc)\s*[:=]\s*\S+/i,
];

export type CopilotPersistenceStatus =
  | 'idle'
  | 'generating'
  | 'response_generated'
  | 'saving_session'
  | 'session_saved'
  | 'save_error';

export const CopilotChat: React.FC<CopilotChatProps> = ({
  initialSession,
  onSessionUpdated,
  onNavigateToHistory,
}) => {
  const { user } = useAuth();

  const [currentSessionId, setCurrentSessionId] = useState<string>(
    initialSession?.id || `copilot-${Date.now()}`
  );
  const [sessionTitle, setSessionTitle] = useState<string>(
    initialSession?.title || 'New AI Banker Session'
  );
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialSession?.messages || []
  );
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeModel, setActiveModel] = useState<string>('gemini-3.7-flash');

  // Exact step-by-step UI workflow status:
  // "Generating..." -> "Response generated" -> "Saving session..." -> "Session saved" or "Response generated, but the session could not be saved."
  const [persistenceStatus, setPersistenceStatus] = useState<CopilotPersistenceStatus>(
    initialSession ? 'session_saved' : 'idle'
  );
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  // Generation errors
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Copied indicator
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Privacy warning banner
  const [hasSensitiveInputWarning, setHasSensitiveInputWarning] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Load initial session if passed
  useEffect(() => {
    if (initialSession) {
      setCurrentSessionId(initialSession.id);
      setSessionTitle(initialSession.title);
      setMessages(initialSession.messages);
      setPersistenceStatus('session_saved');
    }
  }, [initialSession]);

  // Auto-scroll on new messages or status changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, persistenceStatus]);

  // Check for sensitive keywords on input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputText(val);

    const isSensitive = SENSITIVE_PATTERNS.some((pattern) => pattern.test(val));
    setHasSensitiveInputWarning(isSensitive);

    // Auto-adjust textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  // Derive a title from the first prompt
  const generateTitleFromPrompt = (prompt: string): string => {
    const cleaned = prompt.replace(/[^\w\s]/gi, '').trim();
    const words = cleaned.split(/\s+/).slice(0, 6).join(' ');
    return words.length > 0 ? words : 'Banking AI Consultation';
  };

  // Save session to Firestore
  const persistSessionToFirestore = async (
    sessionId: string,
    title: string,
    chatMessages: ChatMessage[],
    modelUsed: string,
    isNew: boolean
  ) => {
    if (!user) return;

    setPersistenceStatus('saving_session');
    setSaveErrorMessage(null);

    const sessionPayload: InteractionSession = {
      id: sessionId,
      userId: user.uid,
      type: 'copilot',
      title,
      summary: chatMessages.length > 0 ? chatMessages[chatMessages.length - 1].content.slice(0, 300) : null,
      messages: chatMessages,
      metadata: {
        modelUsed,
        totalTurns: chatMessages.length,
        topic: 'AI Banker Transformation Copilot',
        generatedAt: new Date().toISOString(),
      },
      createdAt: initialSession?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveInteraction(user.uid, sessionPayload, isNew);
      setPersistenceStatus('session_saved');
      if (onSessionUpdated) onSessionUpdated(sessionPayload);
    } catch (err: unknown) {
      console.error('Firestore session persistence failed:', err);
      setPersistenceStatus('save_error');
      setSaveErrorMessage(
        err instanceof Error ? err.message : 'Unable to save session to Firestore.'
      );
    }
  };

  // Handle message submission
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt !== undefined ? customPrompt : inputText).trim();
    if (!textToSend || isLoading) return;

    setGenerationError(null);
    setHasSensitiveInputWarning(false);

    const isFirstMessage = messages.length === 0;
    const newTitle = isFirstMessage ? generateTitleFromPrompt(textToSend) : sessionTitle;
    if (isFirstMessage) {
      setSessionTitle(newTitle);
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setIsLoading(true);
    setPersistenceStatus('generating');
    abortControllerRef.current = new AbortController();

    try {
      // Send conversation history to backend Gemini API
      const response = await sendCopilotMessage(
        {
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          topic: newTitle,
        },
        abortControllerRef.current.signal
      );

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: response.timestamp || new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      setActiveModel(response.model);

      // Transition through "Response generated"
      setPersistenceStatus('response_generated');

      // Small optical pause then transition to "Saving session..." & persist
      await new Promise((res) => setTimeout(res, 200));

      // Separate Firestore persistence step
      await persistSessionToFirestore(
        currentSessionId,
        newTitle,
        finalMessages,
        response.model,
        isFirstMessage
      );
    } catch (err: unknown) {
      console.error('Gemini generation error:', err);
      if (err instanceof AIServiceError && err.code === 'CANCELLED') {
        setPersistenceStatus('idle');
        return;
      }
      const message =
        err instanceof AIServiceError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Failed to generate response. Please retry.';
      setGenerationError(message);
      setPersistenceStatus('idle');
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Stop generation handler
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setPersistenceStatus('idle');
    }
  };

  // Retry the last turn
  const handleRetryLast = () => {
    if (messages.length === 0) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      const cleaned = messages.filter(
        (m, idx) => !(idx === messages.length - 1 && m.role === 'assistant')
      );
      setMessages(cleaned);
      handleSendMessage(lastUserMsg.content);
    }
  };

  // Manual Retry Save
  const handleManualRetrySave = () => {
    persistSessionToFirestore(
      currentSessionId,
      sessionTitle,
      messages,
      activeModel,
      messages.length <= 2
    );
  };

  // Initialize a fresh new conversation
  const handleNewConversation = () => {
    if (isLoading) handleStopGeneration();
    const newId = `copilot-${Date.now()}`;
    setCurrentSessionId(newId);
    setSessionTitle('New AI Banker Session');
    setMessages([]);
    setInputText('');
    setGenerationError(null);
    setPersistenceStatus('idle');
    setSaveErrorMessage(null);
    setHasSensitiveInputWarning(false);
  };

  // Copy message text to clipboard
  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[580px] bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Copilot Header */}
      <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white truncate max-w-[200px] sm:max-w-[320px]">
                {sessionTitle}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60">
                {activeModel}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>Multi-Turn Copilot</span>
              <span>•</span>
              <span className="font-mono text-slate-400 text-[10px]">
                ID: {currentSessionId}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs">
          {/* Persistence status indicator badge */}
          {persistenceStatus === 'generating' && (
            <div
              id="status-generating"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/80 border border-blue-800/80 text-blue-300 text-xs font-medium"
            >
              <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
              <span>Generating...</span>
            </div>
          )}

          {persistenceStatus === 'response_generated' && (
            <div
              id="status-response-generated"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-medium"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Response generated</span>
            </div>
          )}

          {persistenceStatus === 'saving_session' && (
            <div
              id="status-saving-session"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium"
            >
              <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />
              <span>Saving session...</span>
            </div>
          )}

          {persistenceStatus === 'session_saved' && (
            <div
              id="status-session-saved"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-medium"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Session saved</span>
            </div>
          )}

          {persistenceStatus === 'save_error' && (
            <div
              id="status-save-error"
              className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-800 text-amber-300 text-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Response generated, but the session could not be saved.</span>
              <span className="sm:hidden">Save failed.</span>
              <button
                id="copilot-header-retry-save-btn"
                onClick={handleManualRetrySave}
                className="underline hover:text-white font-semibold cursor-pointer ml-1"
              >
                Retry Save
              </button>
            </div>
          )}

          {/* Quick link to Session History */}
          {onNavigateToHistory && (
            <button
              id="copilot-view-history-btn"
              onClick={onNavigateToHistory}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition cursor-pointer border border-slate-700/60"
              title="View all saved sessions"
            >
              <History className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">History</span>
            </button>
          )}

          {/* New Conversation Button */}
          <button
            id="copilot-new-chat-btn"
            onClick={handleNewConversation}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer shadow-md shadow-blue-600/20"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          /* Empty State / Starter Prompts */
          <div className="max-w-2xl mx-auto py-8 text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400 mx-auto shadow-inner">
              <Bot className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h4 className="text-lg font-bold text-white">
                Start a Conversation with your AI Banker Copilot
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed max-w-lg mx-auto">
                Ask about retail & commercial banking workflows, process optimization, client meeting agendas, Generative AI adoption, or banking communication.
              </p>
            </div>

            <div className="pt-2 text-left">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 px-1">
                Suggested Banking Inquiries
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {STARTER_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    id={`starter-prompt-${idx}`}
                    onClick={() => handleSendMessage(prompt)}
                    className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-700/60 text-left transition cursor-pointer group"
                  >
                    <div className="flex items-start gap-2">
                      <Flame className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-slate-300 group-hover:text-white leading-snug">
                        {prompt}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Conversation Stream */
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-md">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3.5 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-sm shadow-md shadow-blue-900/30'
                        : 'bg-slate-950 border border-slate-800 text-slate-100 rounded-tl-sm shadow-xl space-y-2'
                    }`}
                  >
                    {isUser ? (
                      <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                    ) : (
                      <div className="prose prose-invert prose-xs max-w-none text-slate-200">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}

                    <div
                      className={`flex items-center justify-between gap-4 pt-1 text-[10px] ${
                        isUser ? 'text-blue-200' : 'text-slate-500 border-t border-slate-900'
                      }`}
                    >
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      {!isUser && (
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="hover:text-slate-300 transition flex items-center gap-1 cursor-pointer"
                          title="Copy response"
                        >
                          {copiedMessageId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* In-stream Generation Status */}
            {isLoading && (
              <div className="flex gap-3.5 justify-start items-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shrink-0 animate-pulse">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="p-3 rounded-2xl rounded-tl-sm bg-slate-950 border border-slate-800 flex items-center gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="font-mono text-[11px] text-slate-400">
                    Generating...
                  </span>
                  <button
                    onClick={handleStopGeneration}
                    className="ml-3 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 cursor-pointer"
                  >
                    <Square className="w-2.5 h-2.5 text-red-400 fill-red-400" />
                    <span>Stop</span>
                  </button>
                </div>
              </div>
            )}

            {/* Generation Error Banner with Retry */}
            {generationError && (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/80 text-red-200 text-xs flex items-start justify-between gap-3 animate-in fade-in duration-200">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">AI Generation Notice: </span>
                    <span>{generationError}</span>
                  </div>
                </div>
                <button
                  id="copilot-retry-btn"
                  onClick={handleRetryLast}
                  className="px-3 py-1 rounded-lg bg-red-900 hover:bg-red-800 text-white font-semibold text-xs shrink-0 transition flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry Prompt</span>
                </button>
              </div>
            )}

            {/* Firestore Save Error Notice Banner */}
            {persistenceStatus === 'save_error' && (
              <div className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-800 text-amber-200 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Response generated, but the session could not be saved.
                  </span>
                </div>
                <button
                  id="copilot-retry-save-btn"
                  onClick={handleManualRetrySave}
                  className="px-3 py-1 rounded-lg bg-amber-900 hover:bg-amber-800 text-white font-semibold text-xs shrink-0 transition cursor-pointer"
                >
                  Retry Save
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Sensitive Input Warning Badge */}
      {hasSensitiveInputWarning && (
        <div className="px-4 py-2 bg-amber-950/90 border-t border-amber-700 text-amber-200 text-[11px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>Security Guard:</strong> Input appears to contain card numbers or sensitive credentials. Please remove sensitive customer data before sending.
            </span>
          </div>
        </div>
      )}

      {/* Persistent Banking Data Safety Banner */}
      <div className="px-4 py-1.5 bg-slate-950 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <span className="truncate">
          <strong>Banking Data Safety:</strong> Do not enter confidential customer information, account numbers, passwords, card numbers, PANs, or credentials.
        </span>
      </div>

      {/* Input Form Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-slate-950 border-t border-slate-800 flex items-end gap-2"
      >
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            id="copilot-prompt-input"
            rows={1}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask your AI Banker Copilot anything on workflows, meeting prep, or AI adoption... (Press Enter to send)"
            maxLength={8000}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-blue-500 resize-none max-h-36 overflow-y-auto leading-relaxed"
          />
          <div className="absolute right-3 bottom-2 text-[10px] text-slate-500 font-mono">
            {inputText.length}/8000
          </div>
        </div>

        {isLoading ? (
          <button
            type="button"
            onClick={handleStopGeneration}
            className="p-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white transition cursor-pointer flex items-center justify-center shrink-0"
            title="Stop generation"
          >
            <Square className="w-4 h-4 fill-white" />
          </button>
        ) : (
          <button
            type="submit"
            id="copilot-send-btn"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white transition cursor-pointer flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20"
            title="Send prompt"
          >
            <Send className="w-4 h-4" />
          </button>
        )}
      </form>
    </div>
  );
};
