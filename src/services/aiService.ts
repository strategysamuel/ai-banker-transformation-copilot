import { auth } from '../firebase/config';
import {
  AICopilotRequest,
  AICopilotResponse,
  MeetingPrepRequest,
  MeetingPrepResponse,
  EmailAssistantRequest,
  EmailAssistantResponse,
  ProcessOptimizerRequest,
  ProcessOptimizerResponse,
  TransformationAssessmentRequest,
  TransformationAssessmentResponse,
  TransformationPlanRequest,
  TransformationPlanResponse,
} from '../types';
import { ProjectCompassQueryRequest, ProjectCompassQueryResponse } from '../types/projectCompass';

export class AIServiceError extends Error {
  public code?: string;
  public status?: number;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = 'AIServiceError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Client-side heuristic helper to detect obvious sensitive financial info (PANs, SSNs, raw credentials)
 */
export function detectSensitiveData(text: string): boolean {
  if (!text) return false;
  const ccPattern = /\b(?:\d{4}[ -]?){3}\d{4}\b|\b\d{13,19}\b/;
  const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/;
  const keywordAccountPattern = /\b(?:card|pan|ssn|cvv|pin|account|acct|password|credential|passcode)\b[:\s#=-]+[0-9a-zA-Z]{5,}/i;

  return ccPattern.test(text) || ssnPattern.test(text) || keywordAccountPattern.test(text);
}

export async function sendCopilotMessage(
  payload: AICopilotRequest,
  signal?: AbortSignal
): Promise<AICopilotResponse> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new AIServiceError('User is not authenticated. Please sign in with your Google account.', 'AUTH_REQUIRED', 401);
  }

  // Helper to fetch with token
  const makeRequest = async (forceRefreshToken = false) => {
    const idToken = await currentUser.getIdToken(forceRefreshToken);
    return fetch('/api/ai/copilot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(payload),
      signal,
    });
  };

  try {
    let response = await makeRequest(false);

    // If 401 token error, attempt force refreshing the token once
    if (response.status === 401) {
      try {
        response = await makeRequest(true);
      } catch {
        // Fall through to parse original response
      }
    }

    if (!response.ok) {
      let errorData: { error?: string; code?: string } = {};
      try {
        errorData = await response.json();
      } catch {
        // Non-JSON response
      }

      const errorMessage =
        errorData.error ||
        (response.status === 429
          ? 'Rate limit reached. Please wait a moment and retry.'
          : response.status === 503
          ? 'AI Copilot is temporarily unavailable. Please retry.'
          : `Server returned error (${response.status})`);

      throw new AIServiceError(errorMessage, errorData.code, response.status);
    }

    const data = (await response.json()) as AICopilotResponse;
    return data;
  } catch (err: unknown) {
    if (err instanceof AIServiceError) {
      throw err;
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new AIServiceError('Request was cancelled.', 'CANCELLED');
    }
    const message = err instanceof Error ? err.message : 'Network error communicating with AI Copilot service.';
    throw new AIServiceError(message, 'NETWORK_ERROR');
  }
}

export async function generateMeetingPrep(
  payload: MeetingPrepRequest,
  signal?: AbortSignal
): Promise<MeetingPrepResponse> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new AIServiceError('User is not authenticated. Please sign in with your Google account.', 'AUTH_REQUIRED', 401);
  }

  const makeRequest = async (forceRefreshToken = false) => {
    const idToken = await currentUser.getIdToken(forceRefreshToken);
    return fetch('/api/ai/meeting-prep', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(payload),
      signal,
    });
  };

  try {
    let response = await makeRequest(false);

    if (response.status === 401) {
      try {
        response = await makeRequest(true);
      } catch {
        // Fall through
      }
    }

    if (!response.ok) {
      let errorData: { error?: string; code?: string } = {};
      try {
        errorData = await response.json();
      } catch {
        // Non-JSON response
      }

      const errorMessage =
        errorData.error ||
        (response.status === 429
          ? 'Rate limit reached. Please wait a moment and retry.'
          : response.status === 503
          ? 'Meeting Prep service is temporarily unavailable. Please retry.'
          : `Server returned error (${response.status})`);

      throw new AIServiceError(errorMessage, errorData.code, response.status);
    }

    const data = (await response.json()) as MeetingPrepResponse;
    return data;
  } catch (err: unknown) {
    if (err instanceof AIServiceError) {
      throw err;
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new AIServiceError('Request was cancelled.', 'CANCELLED');
    }
    const message = err instanceof Error ? err.message : 'Network error communicating with Meeting Prep service.';
    throw new AIServiceError(message, 'NETWORK_ERROR');
  }
}

export async function queryProjectCompass(
  payload: ProjectCompassQueryRequest,
  signal?: AbortSignal
): Promise<ProjectCompassQueryResponse> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new AIServiceError('User is not authenticated. Please sign in with your Google account.', 'AUTH_REQUIRED', 401);
  }

  const makeRequest = async (forceRefreshToken = false) => {
    const idToken = await currentUser.getIdToken(forceRefreshToken);
    return fetch('/api/project-compass/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(payload),
      signal,
    });
  };

  try {
    let response = await makeRequest(false);

    if (response.status === 401) {
      try {
        response = await makeRequest(true);
      } catch {
        // Fall through
      }
    }

    if (!response.ok) {
      let errorData: { error?: string; code?: string } = {};
      try {
        errorData = await response.json();
      } catch {
        // Non-JSON response
      }

      const errorMessage =
        errorData.error ||
        (response.status === 429
          ? 'Rate limit reached. Please wait a moment and retry.'
          : response.status === 503
          ? 'Project Compass RAG service is temporarily unavailable. Please retry.'
          : `Server returned error (${response.status})`);

      throw new AIServiceError(errorMessage, errorData.code, response.status);
    }

    const data = (await response.json()) as ProjectCompassQueryResponse;
    return data;
  } catch (err: unknown) {
    if (err instanceof AIServiceError) {
      throw err;
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new AIServiceError('Request was cancelled.', 'CANCELLED');
    }
    const message = err instanceof Error ? err.message : 'Network error communicating with Project Compass RAG service.';
    throw new AIServiceError(message, 'NETWORK_ERROR');
  }
}

export async function generateEmailAssistantAnalysis(
  payload: EmailAssistantRequest,
  signal?: AbortSignal
): Promise<EmailAssistantResponse> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new AIServiceError('User is not authenticated. Please sign in with your Google account.', 'AUTH_REQUIRED', 401);
  }

  const makeRequest = async (forceRefreshToken = false) => {
    const idToken = await currentUser.getIdToken(forceRefreshToken);
    return fetch('/api/ai/email-assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(payload),
      signal,
    });
  };

  try {
    let response = await makeRequest(false);

    if (response.status === 401) {
      try {
        response = await makeRequest(true);
      } catch {
        // Fall through
      }
    }

    if (!response.ok) {
      let errorData: { error?: string; code?: string } = {};
      try {
        errorData = await response.json();
      } catch {
        // Non-JSON response
      }

      const errorMessage =
        errorData.error ||
        (response.status === 429
          ? 'Rate limit reached. Please wait a moment and retry.'
          : response.status === 503
          ? 'Banking Email Assistant is temporarily unavailable. Please retry.'
          : `Server returned error (${response.status})`);

      throw new AIServiceError(errorMessage, errorData.code, response.status);
    }

    const data = (await response.json()) as EmailAssistantResponse;
    return data;
  } catch (err: unknown) {
    if (err instanceof AIServiceError) {
      throw err;
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new AIServiceError('Request was cancelled.', 'CANCELLED');
    }
    const message = err instanceof Error ? err.message : 'Network error communicating with Banking Email Assistant service.';
    throw new AIServiceError(message, 'NETWORK_ERROR');
  }
}

export async function generateProcessOptimizerAnalysis(
  payload: ProcessOptimizerRequest,
  signal?: AbortSignal
): Promise<ProcessOptimizerResponse> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new AIServiceError('User is not authenticated. Please sign in with your Google account.', 'AUTH_REQUIRED', 401);
  }

  const makeRequest = async (forceRefreshToken = false) => {
    const idToken = await currentUser.getIdToken(forceRefreshToken);
    return fetch('/api/ai/process-optimizer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(payload),
      signal,
    });
  };

  try {
    let response = await makeRequest(false);

    if (response.status === 401) {
      try {
        response = await makeRequest(true);
      } catch {
        // Fall through
      }
    }

    if (!response.ok) {
      let errorData: { error?: string; code?: string } = {};
      try {
        errorData = await response.json();
      } catch {
        // Non-JSON response
      }

      const errorMessage =
        errorData.error ||
        (response.status === 429
          ? 'Rate limit reached. Please wait a moment and retry.'
          : response.status === 503
          ? 'Process Optimizer service is temporarily unavailable. Please retry.'
          : `Server returned error (${response.status})`);

      throw new AIServiceError(errorMessage, errorData.code, response.status);
    }

    const data = (await response.json()) as ProcessOptimizerResponse;
    return data;
  } catch (err: unknown) {
    if (err instanceof AIServiceError) {
      throw err;
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new AIServiceError('Request was cancelled.', 'CANCELLED');
    }
    const message = err instanceof Error ? err.message : 'Network error communicating with Process Optimizer service.';
    throw new AIServiceError(message, 'NETWORK_ERROR');
  }
}

export async function submitTransformationAssessment(
  payload: TransformationAssessmentRequest,
  signal?: AbortSignal
): Promise<TransformationAssessmentResponse> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new AIServiceError(
      'User is not authenticated. Please sign in with your Google account.',
      'AUTH_REQUIRED',
      401
    );
  }

  const makeRequest = async (forceRefreshToken = false) => {
    const idToken = await currentUser.getIdToken(forceRefreshToken);
    return fetch('/api/ai/transformation-assessment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(payload),
      signal,
    });
  };

  try {
    let response = await makeRequest(false);

    if (response.status === 401) {
      try {
        response = await makeRequest(true);
      } catch {
        // Fall through
      }
    }

    if (!response.ok) {
      let errorData: { error?: string; code?: string } = {};
      try {
        errorData = await response.json();
      } catch {
        // Non-JSON response
      }

      const errorMessage =
        errorData.error ||
        (response.status === 429
          ? 'Rate limit reached. Please wait a moment and retry.'
          : response.status === 503
          ? 'Transformation Assessment service is temporarily unavailable. Please retry.'
          : `Server returned error (${response.status})`);

      throw new AIServiceError(errorMessage, errorData.code, response.status);
    }

    const data = (await response.json()) as TransformationAssessmentResponse;
    return data;
  } catch (err: unknown) {
    if (err instanceof AIServiceError) {
      throw err;
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new AIServiceError('Request was cancelled.', 'CANCELLED');
    }
    const message =
      err instanceof Error
        ? err.message
        : 'Network error communicating with Transformation Assessment service.';
    throw new AIServiceError(message, 'NETWORK_ERROR');
  }
}

/**
 * Phase 5D: AI Learning Academy - Evaluate Practical Exercise
 */
export async function evaluateAcademyExercise(
  payload: {
    moduleId: string;
    exerciseId: string;
    exerciseType: string;
    userSubmission: string;
    role?: string;
  },
  signal?: AbortSignal
): Promise<{
  result: import('../types').ExerciseEvaluationResult;
  model: string;
  timestamp: string;
}> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new AIServiceError('User is not authenticated. Please sign in with your Google account.', 'AUTH_REQUIRED', 401);
  }

  if (detectSensitiveData(payload.userSubmission)) {
    throw new AIServiceError(
      'Potential sensitive banking data detected (e.g. credit card PAN, SSN, PIN, password). Please sanitize your input and use synthetic placeholders.',
      'SENSITIVE_DATA_DETECTED',
      400
    );
  }

  const makeRequest = async (forceRefreshToken = false) => {
    const idToken = await currentUser.getIdToken(forceRefreshToken);
    return fetch('/api/ai/academy/evaluate-exercise', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(payload),
      signal,
    });
  };

  try {
    let response = await makeRequest();

    if (response.status === 401) {
      try {
        response = await makeRequest(true);
      } catch {
        // Fall through
      }
    }

    if (!response.ok) {
      let errorData: { error?: string; code?: string } = {};
      try {
        errorData = await response.json();
      } catch {
        // Non-JSON response
      }

      const errorMessage =
        errorData.error ||
        (response.status === 429
          ? 'Rate limit reached. Please wait a moment and retry.'
          : response.status === 503
          ? 'Academy AI evaluation service is temporarily unavailable. Please retry.'
          : `Server returned error (${response.status})`);

      throw new AIServiceError(errorMessage, errorData.code, response.status);
    }

    return await response.json();
  } catch (err: unknown) {
    if (err instanceof AIServiceError) {
      throw err;
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new AIServiceError('Request was cancelled.', 'CANCELLED');
    }
    const message =
      err instanceof Error
        ? err.message
        : 'Network error communicating with Academy Evaluation service.';
    throw new AIServiceError(message, 'NETWORK_ERROR');
  }
}

/**
 * Phase 5D: AI Learning Academy - Submit Reflection
 */
export async function submitAcademyReflection(
  payload: {
    moduleId: string;
    confidence: number;
    reflectionNotes: string;
    assessmentId?: string;
    status?: string;
  },
  signal?: AbortSignal
): Promise<{
  success: boolean;
  sanitizedNotes: string;
  confidence: number;
  completedAt: string;
  coachingEncouragement: string;
  timestamp: string;
}> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new AIServiceError('User is not authenticated. Please sign in with your Google account.', 'AUTH_REQUIRED', 401);
  }

  if (detectSensitiveData(payload.reflectionNotes)) {
    throw new AIServiceError(
      'Potential sensitive banking data detected in reflection notes. Please remove confidential customer details.',
      'SENSITIVE_DATA_DETECTED',
      400
    );
  }

  const makeRequest = async (forceRefreshToken = false) => {
    const idToken = await currentUser.getIdToken(forceRefreshToken);
    return fetch('/api/ai/academy/reflect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(payload),
      signal,
    });
  };

  try {
    let response = await makeRequest();

    if (response.status === 401) {
      try {
        response = await makeRequest(true);
      } catch {
        // Fall through
      }
    }

    if (!response.ok) {
      let errorData: { error?: string; code?: string } = {};
      try {
        errorData = await response.json();
      } catch {
        // Non-JSON response
      }

      const errorMessage =
        errorData.error ||
        (response.status === 429
          ? 'Rate limit reached. Please wait a moment and retry.'
          : `Server returned error (${response.status})`);

      throw new AIServiceError(errorMessage, errorData.code, response.status);
    }

    return await response.json();
  } catch (err: unknown) {
    if (err instanceof AIServiceError) {
      throw err;
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new AIServiceError('Request was cancelled.', 'CANCELLED');
    }
    const message =
      err instanceof Error
        ? err.message
        : 'Network error communicating with Academy service.';
    throw new AIServiceError(message, 'NETWORK_ERROR');
  }
}

/**
 * Phase 5E: Request personalized 30-Day Transformation Plan
 */
export async function generateTransformationPlan(
  payload: TransformationPlanRequest,
  signal?: AbortSignal
): Promise<TransformationPlanResponse> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new AIServiceError(
      'User is not authenticated. Please sign in with your Google account.',
      'AUTH_REQUIRED',
      401
    );
  }

  // Pre-flight client check for sensitive financial info
  const combinedText = `${payload.transformationGoal || ''} ${payload.customGoal || ''} ${payload.role || ''}`;
  if (detectSensitiveData(combinedText)) {
    throw new AIServiceError(
      'Potential sensitive banking information detected (e.g. credit card numbers, passwords, PINs, or account numbers). Please remove confidential data and use synthetic examples.',
      'SENSITIVE_DATA_DETECTED',
      400
    );
  }

  const makeRequest = async (forceRefreshToken = false) => {
    const idToken = await currentUser.getIdToken(forceRefreshToken);
    return fetch('/api/ai/transformation-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(payload),
      signal,
    });
  };

  try {
    let response = await makeRequest(false);

    if (response.status === 401) {
      console.warn('[Transformation Plan API] 401 received, forcing ID token refresh...');
      response = await makeRequest(true);
    }

    if (!response.ok) {
      let errorData: { error?: string; code?: string } = {};
      try {
        errorData = await response.json();
      } catch {
        // Non-JSON response
      }

      const errorMessage =
        errorData.error ||
        (response.status === 429
          ? 'Transformation plan generation rate limited. Please wait a moment and retry.'
          : `Transformation Plan API returned error (${response.status})`);

      throw new AIServiceError(errorMessage, errorData.code, response.status);
    }

    return await response.json();
  } catch (err: unknown) {
    if (err instanceof AIServiceError) {
      throw err;
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new AIServiceError('Transformation plan request cancelled.', 'CANCELLED');
    }
    const message =
      err instanceof Error
        ? err.message
        : 'Network error communicating with Transformation Plan service.';
    throw new AIServiceError(message, 'NETWORK_ERROR');
  }
}






