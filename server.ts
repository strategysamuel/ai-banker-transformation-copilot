import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { authenticateFirebaseToken, AuthenticatedRequest } from './server/auth';
import {
  generateBankerCopilotResponse,
  generateMeetingPrepBrief,
  generateGroundedProjectCompassAnswer,
  generateEmailAssistantResponse,
  generateProcessOptimizerResponse,
  generateTransformationAssessmentInterpretation,
  evaluateAcademyExerciseWithGemini,
  MeetingPrepInput,
  EmailAssistantInput,
  ProcessOptimizerInput,
} from './server/gemini';
import {
  ASSESSMENT_QUESTIONS,
  calculateDeterministicScores,
} from './src/data/transformationAssessmentData';
import {
  TransformationAssessmentRequest,
  TransformationAssessmentOutput,
} from './src/types';
import {
  retrieveRelevantChunks,
  evaluatePolicyRisk,
  evaluateReviewDate,
  detectPolicyVersionConflicts,
  validateAndAlignCitations,
  logGovernanceAuditRecord,
} from './server/projectCompassRag';
import { SYNTHETIC_SOP_CATALOG } from './src/data/projectCompassData';
import { generate30DayTransformationPlanWithGemini } from './server/transformationPlanGenerator';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // JSON Body Parser with strict 1MB size limit
  app.use(express.json({ limit: '1mb' }));

  // Public Healthcheck Endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      service: 'ai-banker-transformation-copilot',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development',
      challengeLabel: 'cloud-run-ai-challenge',
      port: PORT,
      phase: 'Phase 3C - Project Compass Governance Guardrails & Policy Version Safety Live'
    });
  });

  // Project Compass Synthetic SOP Catalog Endpoint
  app.get('/api/project-compass/catalog', (_req: Request, res: Response) => {
    res.json({
      status: 'success',
      demoDataNotice: 'DEMO DATA ONLY — These synthetic SOPs are created for the Cloud Run AI Challenge and must not be treated as actual banking policy.',
      catalog: SYNTHETIC_SOP_CATALOG
    });
  });

  // Protected Project Compass RAG Query Endpoint
  app.post(
    '/api/project-compass/query',
    authenticateFirebaseToken,
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const startTime = Date.now();
      const requestId = Math.random().toString(36).substring(2, 10);
      const userId = req.user?.uid || 'anonymous-user';

      const demoDataNotice = 'DEMO DATA ONLY — These synthetic SOPs are created for the Cloud Run AI Challenge and must not be treated as actual banking policy.';
      const advisoryDisclaimer = 'AI-generated guidance is advisory only. The banker remains responsible for verifying the official policy before executing any banking action.';
      const blindTrustWarning = 'Do not rely on AI output alone. Open and verify the cited policy before completing the operational action.';

      try {
        if (!req.body || typeof req.body !== 'object') {
          res.status(400).json({
            error: 'Bad Request: Missing request body or invalid JSON format.',
            code: 'INVALID_REQUEST_BODY',
          });
          return;
        }

        const { query } = req.body as { query?: string };

        // 1. Query Validation
        if (typeof query !== 'string' || query.trim().length < 3) {
          res.status(400).json({
            error: 'Bad Request: "query" is required and must be at least 3 characters.',
            code: 'INVALID_QUERY',
          });
          return;
        }

        if (query.length > 4000) {
          res.status(400).json({
            error: 'Bad Request: "query" exceeds maximum limit of 4,000 characters.',
            code: 'QUERY_TOO_LONG',
          });
          return;
        }

        const trimmedQuery = query.trim();

        // 2. Sensitive Banking Data Protection
        if (containsSensitiveDataPattern(trimmedQuery)) {
          res.status(400).json({
            error: 'Potential sensitive banking information detected. Please remove confidential customer information, account numbers, or card data and try again.',
            code: 'SENSITIVE_DATA_DETECTED',
          });
          return;
        }

        // 3. Retrieve relevant chunks using Vector Similarity Search (Active policies only)
        console.log(`[Project Compass API] [${requestId}] Performing vector retrieval for user ${userId}: "${trimmedQuery.substring(0, 80)}..."`);
        const retrieval = await retrieveRelevantChunks(trimmedQuery, {
          userRole: 'Branch Banker',
          userRegion: 'ALL-DEMO-REGIONS',
          topK: 5,
        });

        // 4. Handle Policy Not Found / Insufficient Evidence (Gemini MUST NOT be called)
        if (retrieval.status === 'policy_not_found' || retrieval.chunks.length === 0) {
          const latencyMs = Date.now() - startTime;
          console.log(`[Project Compass API] [${requestId}] No policy match found (top similarity: ${retrieval.topScore.toFixed(4)}) in ${latencyMs}ms`);

          logGovernanceAuditRecord({
            authenticatedUid: userId,
            queryId: requestId,
            query: trimmedQuery,
            retrievedChunkIds: [],
            policyIds: [],
            policyVersions: [],
            similarityScores: [retrieval.topScore],
            citationAnchors: [],
            modelUsed: 'NONE (Policy Negative Gate)',
            responseStatus: 'policy_not_found',
            highRiskClassification: false,
            verificationRequired: false,
          });

          res.json({
            status: 'policy_not_found',
            message: 'I cannot find an authorized policy match for this request. Please consult your Supervisor or submit an operational ticket.',
            citations: [],
            requiresHumanVerification: false,
            topSimilarityScore: retrieval.topScore,
            retrievedCount: 0,
            demoDataNotice,
            advisoryDisclaimer,
            blindTrustWarning,
            timestamp: new Date().toISOString(),
          });
          return;
        }

        // 5. Version Conflict & Status Validation: Guard against conflicting versions before calling LLM
        const conflictCheck = detectPolicyVersionConflicts(retrieval.chunks);
        if (conflictCheck.hasConflict) {
          console.warn(`[Project Compass API] [${requestId}] Policy Version Conflict Detected: ${conflictCheck.reason}`);

          logGovernanceAuditRecord({
            authenticatedUid: userId,
            queryId: requestId,
            query: trimmedQuery,
            retrievedChunkIds: retrieval.chunks.map((c) => c.chunkId),
            policyIds: Array.from(new Set(retrieval.chunks.map((c) => c.policyId))),
            policyVersions: Array.from(new Set(retrieval.chunks.map((c) => c.version))),
            similarityScores: retrieval.chunks.map((c) => c.similarityScore),
            citationAnchors: [],
            modelUsed: 'NONE (Version Conflict Gate)',
            responseStatus: 'policy_conflict',
            highRiskClassification: true,
            verificationRequired: true,
          });

          res.json({
            status: 'policy_conflict',
            message: 'Multiple conflicting policy versions were detected. Please consult the current authorized policy repository or Policy Operations.',
            citations: [],
            requiresHumanVerification: true,
            verificationReason: 'Policy conflict resolution required before operational action.',
            topSimilarityScore: retrieval.topScore,
            retrievedCount: retrieval.chunks.length,
            demoDataNotice,
            advisoryDisclaimer,
            blindTrustWarning,
            timestamp: new Date().toISOString(),
          });
          return;
        }

        // 6. Effective Date & Review Date Analysis
        const primaryChunk = retrieval.chunks[0];
        if (!primaryChunk.effectiveDate || !primaryChunk.effectiveDate.trim()) {
          res.status(500).json({
            error: `Corrupt Policy Data: Policy ${primaryChunk.policyId} is missing mandatory effectiveDate.`,
            code: 'MISSING_EFFECTIVE_DATE',
          });
          return;
        }

        const reviewEval = evaluateReviewDate(primaryChunk.nextReviewDate);
        const riskEval = evaluatePolicyRisk(primaryChunk.policyId, primaryChunk.title);

        // 7. Generate Grounded Answer using Gemini
        const result = await generateGroundedProjectCompassAnswer(trimmedQuery, retrieval.chunks);
        const latencyMs = Date.now() - startTime;

        // 8. Server-side Citation Validation & Alignment
        const citationValidation = validateAndAlignCitations(result.output.citations, retrieval.chunks);
        const finalCitations = citationValidation.citations;

        // 9. Governance Audit Logging (No tokens, passwords, or secrets logged)
        logGovernanceAuditRecord({
          authenticatedUid: userId,
          queryId: requestId,
          query: trimmedQuery,
          retrievedChunkIds: retrieval.chunks.map((c) => c.chunkId),
          policyIds: Array.from(new Set(retrieval.chunks.map((c) => c.policyId))),
          policyVersions: Array.from(new Set(retrieval.chunks.map((c) => c.version))),
          similarityScores: retrieval.chunks.map((c) => c.similarityScore),
          citationAnchors: finalCitations.map((c) => c.citationAnchor),
          modelUsed: result.modelUsed,
          responseStatus: 'grounded',
          highRiskClassification: riskEval.isHighRisk,
          verificationRequired: riskEval.isHighRisk,
        });

        console.log(`[Project Compass API] [${requestId}] Successfully generated grounded answer with ${finalCitations.length} validated citations in ${latencyMs}ms using model ${result.modelUsed}`);

        res.json({
          status: 'grounded',
          answer: result.output.answer,
          keySteps: result.output.keySteps,
          cautions: result.output.cautions,
          citations: finalCitations,
          policyMetadata: {
            policyId: primaryChunk.policyId,
            title: primaryChunk.title,
            version: primaryChunk.version,
            status: 'ACTIVE',
            effectiveDate: primaryChunk.effectiveDate,
            nextReviewDate: primaryChunk.nextReviewDate,
            policyOwner: primaryChunk.policyOwner,
            applicableRegion: primaryChunk.applicableRegion,
            isHighRisk: riskEval.isHighRisk,
          },
          reviewNotice: reviewEval.message ? reviewEval : undefined,
          governanceMetadata: {
            groundedInAuthorizedSOP: true,
            activeVersionVerified: true,
            sourceCitationAvailable: finalCitations.length > 0,
            humanVerificationRequired: riskEval.isHighRisk,
            reviewStatus: reviewEval.type,
            riskLevel: riskEval.riskLevel,
          },
          requiresHumanVerification: riskEval.isHighRisk,
          verificationReason: riskEval.verificationReason,
          verificationAcknowledged: false,
          topSimilarityScore: retrieval.topScore,
          retrievedCount: retrieval.chunks.length,
          modelUsed: result.modelUsed,
          demoDataNotice,
          advisoryDisclaimer,
          blindTrustWarning,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        const latencyMs = Date.now() - startTime;
        const errMessage = error instanceof Error ? error.message : 'Internal server error';
        console.error(`[Project Compass API] [${requestId}] Query failed after ${latencyMs}ms:`, errMessage);

        res.status(500).json({
          error: errMessage,
          code: 'PROJECT_COMPASS_QUERY_FAILED',
        });
      }
    }
  );

  // Protected AI Banker Copilot Endpoint
  app.post(
    '/api/ai/copilot',
    authenticateFirebaseToken,
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const startTime = Date.now();
      const requestId = Math.random().toString(36).substring(2, 10);

      try {
        if (!req.body || typeof req.body !== 'object') {
          res.status(400).json({
            error: 'Bad Request: Missing request body or invalid JSON format.',
            code: 'INVALID_REQUEST_BODY',
          });
          return;
        }

        const { messages, topic } = req.body as {
          messages?: Array<{ role?: string; content?: string }>;
          topic?: string;
        };

        if (!Array.isArray(messages) || messages.length === 0) {
          res.status(400).json({
            error: 'Bad Request: "messages" must be a non-empty array of message objects.',
            code: 'INVALID_MESSAGES_ARRAY',
          });
          return;
        }

        // Limit conversation history to maximum 20 turns
        if (messages.length > 20) {
          res.status(400).json({
            error: 'Bad Request: Conversation history exceeds the maximum limit of 20 messages.',
            code: 'CONVERSATION_TOO_LONG',
          });
          return;
        }

        // Validate each message
        const validatedMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
        for (let i = 0; i < messages.length; i++) {
          const msg = messages[i];
          if (!msg || typeof msg !== 'object') {
            res.status(400).json({
              error: `Bad Request: Message at index ${i} is invalid.`,
              code: 'INVALID_MESSAGE_OBJECT',
            });
            return;
          }

          if (msg.role !== 'user' && msg.role !== 'assistant') {
            res.status(400).json({
              error: `Bad Request: Message role at index ${i} must be "user" or "assistant".`,
              code: 'INVALID_MESSAGE_ROLE',
            });
            return;
          }

          if (typeof msg.content !== 'string' || msg.content.trim().length === 0) {
            res.status(400).json({
              error: `Bad Request: Message content at index ${i} cannot be empty.`,
              code: 'EMPTY_MESSAGE_CONTENT',
            });
            return;
          }

          // Validate message length limit: allow up to 30,000 characters for rich assistant documents and detailed user prompts
          if (msg.content.length > 30000) {
            res.status(400).json({
              error: `Bad Request: Message at index ${i} exceeds maximum limit of 30,000 characters.`,
              code: 'MESSAGE_TOO_LONG',
            });
            return;
          }

          validatedMessages.push({
            role: msg.role as 'user' | 'assistant',
            content: msg.content.trim(),
          });
        }

        // Sanitize topic length if provided
        const validatedTopic = typeof topic === 'string' && topic.length <= 200 ? topic.trim() : undefined;

        // Generate response with Gemini
        const result = await generateBankerCopilotResponse(validatedMessages, validatedTopic);

        const latencyMs = Date.now() - startTime;
        console.log(`[Copilot API] Request ${requestId} completed successfully for user in ${latencyMs}ms using model ${result.modelUsed}`);

        res.json({
          reply: result.reply,
          model: result.modelUsed,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        const latencyMs = Date.now() - startTime;
        const errMessage = error instanceof Error ? error.message : 'Internal server error';
        console.error(`[Copilot API] Request ${requestId} failed after ${latencyMs}ms:`, errMessage);

        res.status(500).json({
          error: errMessage,
          code: 'AI_GENERATION_FAILED',
        });
      }
    }
  );

  // Helper to detect sensitive financial data patterns
  const containsSensitiveDataPattern = (text: string): boolean => {
    if (!text) return false;
    // 1. Credit card / PAN: 13-19 consecutive digits or 4x4 digit groups
    const ccPattern = /\b(?:\d{4}[ -]?){3}\d{4}\b|\b\d{13,19}\b/;
    // 2. SSN: XXX-XX-XXXX or 9 consecutive digits with SSN context
    const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/;
    // 3. Explicit card/account keywords followed by numbers
    const keywordAccountPattern = /\b(?:card|pan|ssn|cvv|pin|account|acct|password|credential|passcode)\b[:\s#=-]+[0-9a-zA-Z]{5,}/i;

    return ccPattern.test(text) || ssnPattern.test(text) || keywordAccountPattern.test(text);
  };

  // Protected Customer Meeting Prep Endpoint
  app.post(
    '/api/ai/meeting-prep',
    authenticateFirebaseToken,
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const startTime = Date.now();
      const requestId = Math.random().toString(36).substring(2, 10);

      try {
        if (!req.body || typeof req.body !== 'object') {
          res.status(400).json({
            error: 'Bad Request: Missing request body or invalid JSON format.',
            code: 'INVALID_REQUEST_BODY',
          });
          return;
        }

        const {
          customerSegment,
          meetingObjective,
          productService,
          customerConcerns,
          meetingDuration,
          additionalContext,
        } = req.body as Partial<MeetingPrepInput>;

        // 1. Customer Segment validation (required, max 100 chars)
        if (typeof customerSegment !== 'string' || customerSegment.trim().length === 0) {
          res.status(400).json({
            error: 'Bad Request: "customerSegment" is required and cannot be empty.',
            code: 'INVALID_CUSTOMER_SEGMENT',
          });
          return;
        }
        if (customerSegment.length > 100) {
          res.status(400).json({
            error: 'Bad Request: "customerSegment" exceeds maximum length of 100 characters.',
            code: 'CUSTOMER_SEGMENT_TOO_LONG',
          });
          return;
        }

        // 2. Meeting Objective validation (required, max 1000 chars)
        if (typeof meetingObjective !== 'string' || meetingObjective.trim().length === 0) {
          res.status(400).json({
            error: 'Bad Request: "meetingObjective" is required and cannot be empty.',
            code: 'INVALID_MEETING_OBJECTIVE',
          });
          return;
        }
        if (meetingObjective.length > 1000) {
          res.status(400).json({
            error: 'Bad Request: "meetingObjective" exceeds maximum length of 1000 characters.',
            code: 'MEETING_OBJECTIVE_TOO_LONG',
          });
          return;
        }

        // 3. Product / Service validation (required, max 1000 chars)
        if (typeof productService !== 'string' || productService.trim().length === 0) {
          res.status(400).json({
            error: 'Bad Request: "productService" is required and cannot be empty.',
            code: 'INVALID_PRODUCT_SERVICE',
          });
          return;
        }
        if (productService.length > 1000) {
          res.status(400).json({
            error: 'Bad Request: "productService" exceeds maximum length of 1000 characters.',
            code: 'PRODUCT_SERVICE_TOO_LONG',
          });
          return;
        }

        // 4. Customer Needs / Concerns validation (required, max 5000 chars)
        if (typeof customerConcerns !== 'string' || customerConcerns.trim().length === 0) {
          res.status(400).json({
            error: 'Bad Request: "customerConcerns" is required and cannot be empty.',
            code: 'INVALID_CUSTOMER_CONCERNS',
          });
          return;
        }
        if (customerConcerns.length > 5000) {
          res.status(400).json({
            error: 'Bad Request: "customerConcerns" exceeds maximum length of 5000 characters.',
            code: 'CUSTOMER_CONCERNS_TOO_LONG',
          });
          return;
        }

        // 5. Meeting Duration validation (allowed set)
        const allowedDurations = ['15 minutes', '30 minutes', '45 minutes', '60 minutes'];
        if (typeof meetingDuration !== 'string' || !allowedDurations.includes(meetingDuration.trim())) {
          res.status(400).json({
            error: 'Bad Request: "meetingDuration" must be one of: "15 minutes", "30 minutes", "45 minutes", "60 minutes".',
            code: 'INVALID_MEETING_DURATION',
          });
          return;
        }

        // 6. Additional Context validation (optional, max 5000 chars)
        if (additionalContext !== undefined && typeof additionalContext !== 'string') {
          res.status(400).json({
            error: 'Bad Request: "additionalContext" must be a string if provided.',
            code: 'INVALID_ADDITIONAL_CONTEXT',
          });
          return;
        }
        if (additionalContext && additionalContext.length > 5000) {
          res.status(400).json({
            error: 'Bad Request: "additionalContext" exceeds maximum length of 5000 characters.',
            code: 'ADDITIONAL_CONTEXT_TOO_LONG',
          });
          return;
        }

        // 7. Sensitive data protection layer
        const combinedInputText = `${customerSegment} ${meetingObjective} ${productService} ${customerConcerns} ${additionalContext || ''}`;
        if (containsSensitiveDataPattern(combinedInputText)) {
          res.status(400).json({
            error: 'Potential sensitive banking information detected. Please remove confidential customer information and try again.',
            code: 'SENSITIVE_DATA_DETECTED',
          });
          return;
        }

        const sanitizedInput: MeetingPrepInput = {
          customerSegment: customerSegment.trim(),
          meetingObjective: meetingObjective.trim(),
          productService: productService.trim(),
          customerConcerns: customerConcerns.trim(),
          meetingDuration: meetingDuration.trim(),
          additionalContext: additionalContext ? additionalContext.trim() : undefined,
        };

        // 8. Generate with Gemini
        const result = await generateMeetingPrepBrief(sanitizedInput);

        const latencyMs = Date.now() - startTime;
        console.log(`[Meeting Prep API] Request ${requestId} generated successfully in ${latencyMs}ms using model ${result.modelUsed}`);

        res.json({
          brief: result.brief,
          model: result.modelUsed,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        const latencyMs = Date.now() - startTime;
        const errMessage = error instanceof Error ? error.message : 'Internal server error';
        console.error(`[Meeting Prep API] Request ${requestId} failed after ${latencyMs}ms:`, errMessage);

        res.status(500).json({
          error: errMessage,
          code: 'AI_GENERATION_FAILED',
        });
      }
    }
  );

  // Protected Banking Email Assistant Endpoint (Phase 5A)
  app.post(
    '/api/ai/email-assistant',
    authenticateFirebaseToken,
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const startTime = Date.now();
      const requestId = Math.random().toString(36).substring(2, 10);
      const userId = req.user?.uid || 'anonymous-user';

      try {
        if (!req.body || typeof req.body !== 'object') {
          res.status(400).json({
            error: 'Bad Request: Missing request body or invalid JSON format.',
            code: 'INVALID_REQUEST_BODY',
          });
          return;
        }

        const {
          emailContent,
          customerSegment,
          emailPurpose,
          desiredOutcome,
          additionalContext,
        } = req.body as Partial<EmailAssistantInput>;

        // 1. Email Content validation (required, max 30,000 characters)
        if (typeof emailContent !== 'string' || emailContent.trim().length === 0) {
          res.status(400).json({
            error: 'Bad Request: "emailContent" is required and cannot be empty.',
            code: 'INVALID_EMAIL_CONTENT',
          });
          return;
        }
        if (emailContent.length > 30000) {
          res.status(400).json({
            error: 'Bad Request: "emailContent" exceeds maximum limit of 30,000 characters.',
            code: 'EMAIL_CONTENT_TOO_LONG',
          });
          return;
        }

        // 2. Customer Segment validation (optional, max 100 chars)
        if (customerSegment !== undefined) {
          if (typeof customerSegment !== 'string') {
            res.status(400).json({
              error: 'Bad Request: "customerSegment" must be a string if provided.',
              code: 'INVALID_CUSTOMER_SEGMENT',
            });
            return;
          }
          if (customerSegment.length > 100) {
            res.status(400).json({
              error: 'Bad Request: "customerSegment" exceeds maximum length of 100 characters.',
              code: 'CUSTOMER_SEGMENT_TOO_LONG',
            });
            return;
          }
        }

        // 3. Email Purpose validation (optional, max 100 chars)
        if (emailPurpose !== undefined) {
          if (typeof emailPurpose !== 'string') {
            res.status(400).json({
              error: 'Bad Request: "emailPurpose" must be a string if provided.',
              code: 'INVALID_EMAIL_PURPOSE',
            });
            return;
          }
          if (emailPurpose.length > 100) {
            res.status(400).json({
              error: 'Bad Request: "emailPurpose" exceeds maximum length of 100 characters.',
              code: 'EMAIL_PURPOSE_TOO_LONG',
            });
            return;
          }
        }

        // 4. Desired Outcome validation (optional, max 100 chars)
        if (desiredOutcome !== undefined) {
          if (typeof desiredOutcome !== 'string') {
            res.status(400).json({
              error: 'Bad Request: "desiredOutcome" must be a string if provided.',
              code: 'INVALID_DESIRED_OUTCOME',
            });
            return;
          }
          if (desiredOutcome.length > 100) {
            res.status(400).json({
              error: 'Bad Request: "desiredOutcome" exceeds maximum length of 100 characters.',
              code: 'DESIRED_OUTCOME_TOO_LONG',
            });
            return;
          }
        }

        // 5. Additional Context validation (optional, max 5,000 chars)
        if (additionalContext !== undefined) {
          if (typeof additionalContext !== 'string') {
            res.status(400).json({
              error: 'Bad Request: "additionalContext" must be a string if provided.',
              code: 'INVALID_ADDITIONAL_CONTEXT',
            });
            return;
          }
          if (additionalContext.length > 5000) {
            res.status(400).json({
              error: 'Bad Request: "additionalContext" exceeds maximum length of 5,000 characters.',
              code: 'ADDITIONAL_CONTEXT_TOO_LONG',
            });
            return;
          }
        }

        // 6. Sensitive Data Protection (Zero-Tolerance: Reject before LLM call)
        const combinedText = `${emailContent} ${customerSegment || ''} ${emailPurpose || ''} ${desiredOutcome || ''} ${additionalContext || ''}`;
        if (containsSensitiveDataPattern(combinedText)) {
          console.warn(`[Email Assistant API] Request ${requestId} from user ${userId} rejected due to sensitive data pattern detection.`);
          res.status(400).json({
            error: 'Potential sensitive banking information detected (e.g., credit card numbers, passwords, PINs, OTPs, or account numbers). Please remove confidential customer data and try again.',
            code: 'SENSITIVE_DATA_DETECTED',
          });
          return;
        }

        const sanitizedInput: EmailAssistantInput = {
          emailContent: emailContent.trim(),
          customerSegment: customerSegment ? customerSegment.trim() : undefined,
          emailPurpose: emailPurpose ? emailPurpose.trim() : undefined,
          desiredOutcome: desiredOutcome ? desiredOutcome.trim() : undefined,
          additionalContext: additionalContext ? additionalContext.trim() : undefined,
        };

        // 7. Generate structured email analysis and response
        console.log(`[Email Assistant API] [${requestId}] Analyzing email for user ${userId} (${sanitizedInput.emailContent.length} chars)...`);
        const responseData = await generateEmailAssistantResponse(sanitizedInput);

        const latencyMs = Date.now() - startTime;
        console.log(`[Email Assistant API] Request ${requestId} processed in ${latencyMs}ms using model ${responseData.modelUsed}`);

        res.json({
          result: responseData.result,
          model: responseData.modelUsed,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        const latencyMs = Date.now() - startTime;
        const errMessage = error instanceof Error ? error.message : 'Internal server error';
        console.error(`[Email Assistant API] Request ${requestId} failed after ${latencyMs}ms:`, errMessage);

        res.status(500).json({
          error: errMessage,
          code: 'AI_GENERATION_FAILED',
        });
      }
    }
  );

  // Protected Process Optimizer Endpoint (Phase 5B)
  app.post(
    '/api/ai/process-optimizer',
    authenticateFirebaseToken,
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const startTime = Date.now();
      const requestId = Math.random().toString(36).substring(2, 10);
      const userId = req.user?.uid || 'anonymous-user';

      try {
        if (!req.body || typeof req.body !== 'object') {
          res.status(400).json({
            error: 'Bad Request: Missing request body or invalid JSON format.',
            code: 'INVALID_REQUEST_BODY',
          });
          return;
        }

        const {
          processName,
          processDescription,
          businessArea,
          approximateVolume,
          frequency,
          currentProcessingTimeMinutes,
          numberOfPeopleInvolved,
          systemsUsed,
          majorPainPoints,
          additionalContext,
        } = req.body as Partial<ProcessOptimizerInput>;

        // 1. Process Name validation (required, max 200 chars)
        if (typeof processName !== 'string' || processName.trim().length === 0) {
          res.status(400).json({
            error: 'Bad Request: "processName" is required and cannot be empty.',
            code: 'INVALID_PROCESS_NAME',
          });
          return;
        }
        if (processName.length > 200) {
          res.status(400).json({
            error: 'Bad Request: "processName" exceeds maximum limit of 200 characters.',
            code: 'PROCESS_NAME_TOO_LONG',
          });
          return;
        }

        // 2. Process Description validation (required, max 40,000 chars)
        if (typeof processDescription !== 'string' || processDescription.trim().length === 0) {
          res.status(400).json({
            error: 'Bad Request: "processDescription" is required and cannot be empty.',
            code: 'INVALID_PROCESS_DESCRIPTION',
          });
          return;
        }
        if (processDescription.length > 40000) {
          res.status(400).json({
            error: 'Bad Request: "processDescription" exceeds maximum limit of 40,000 characters.',
            code: 'PROCESS_DESCRIPTION_TOO_LONG',
          });
          return;
        }

        // 3. Business Area validation (optional, max 100 chars, cannot be blank if provided)
        if (businessArea !== undefined) {
          if (typeof businessArea !== 'string' || businessArea.trim().length === 0) {
            res.status(400).json({
              error: 'Bad Request: "businessArea" must be a non-empty string if provided.',
              code: 'INVALID_BUSINESS_AREA',
            });
            return;
          }
          if (businessArea.length > 100) {
            res.status(400).json({
              error: 'Bad Request: "businessArea" exceeds maximum length of 100 characters.',
              code: 'BUSINESS_AREA_TOO_LONG',
            });
            return;
          }
        }

        // 4. Approximate Volume validation (optional, max 100 chars)
        if (approximateVolume !== undefined) {
          if (typeof approximateVolume !== 'string') {
            res.status(400).json({
              error: 'Bad Request: "approximateVolume" must be a string if provided.',
              code: 'INVALID_APPROXIMATE_VOLUME',
            });
            return;
          }
          if (approximateVolume.length > 100) {
            res.status(400).json({
              error: 'Bad Request: "approximateVolume" exceeds maximum length of 100 characters.',
              code: 'APPROXIMATE_VOLUME_TOO_LONG',
            });
            return;
          }
        }

        // 5. Frequency validation (optional, max 100 chars)
        if (frequency !== undefined) {
          if (typeof frequency !== 'string') {
            res.status(400).json({
              error: 'Bad Request: "frequency" must be a string if provided.',
              code: 'INVALID_FREQUENCY',
            });
            return;
          }
          if (frequency.length > 100) {
            res.status(400).json({
              error: 'Bad Request: "frequency" exceeds maximum length of 100 characters.',
              code: 'FREQUENCY_TOO_LONG',
            });
            return;
          }
        }

        // 6. Current Processing Time Minutes validation (optional number >= 0)
        if (currentProcessingTimeMinutes !== undefined) {
          if (typeof currentProcessingTimeMinutes !== 'number' || isNaN(currentProcessingTimeMinutes) || currentProcessingTimeMinutes < 0) {
            res.status(400).json({
              error: 'Bad Request: "currentProcessingTimeMinutes" must be a non-negative number if provided.',
              code: 'INVALID_PROCESSING_TIME',
            });
            return;
          }
          if (currentProcessingTimeMinutes > 100000) {
            res.status(400).json({
              error: 'Bad Request: "currentProcessingTimeMinutes" exceeds realistic upper limit.',
              code: 'PROCESSING_TIME_TOO_LARGE',
            });
            return;
          }
        }

        // 7. Number of People Involved validation (optional number >= 0)
        if (numberOfPeopleInvolved !== undefined) {
          if (typeof numberOfPeopleInvolved !== 'number' || isNaN(numberOfPeopleInvolved) || numberOfPeopleInvolved < 0) {
            res.status(400).json({
              error: 'Bad Request: "numberOfPeopleInvolved" must be a non-negative number if provided.',
              code: 'INVALID_PEOPLE_INVOLVED',
            });
            return;
          }
          if (numberOfPeopleInvolved > 10000) {
            res.status(400).json({
              error: 'Bad Request: "numberOfPeopleInvolved" exceeds realistic upper limit.',
              code: 'PEOPLE_INVOLVED_TOO_LARGE',
            });
            return;
          }
        }

        // 8. Systems Used validation (optional, max 1,000 chars)
        if (systemsUsed !== undefined) {
          if (typeof systemsUsed !== 'string') {
            res.status(400).json({
              error: 'Bad Request: "systemsUsed" must be a string if provided.',
              code: 'INVALID_SYSTEMS_USED',
            });
            return;
          }
          if (systemsUsed.length > 1000) {
            res.status(400).json({
              error: 'Bad Request: "systemsUsed" exceeds maximum length of 1,000 characters.',
              code: 'SYSTEMS_USED_TOO_LONG',
            });
            return;
          }
        }

        // 9. Major Pain Points validation (optional, max 5,000 chars)
        if (majorPainPoints !== undefined) {
          if (typeof majorPainPoints !== 'string') {
            res.status(400).json({
              error: 'Bad Request: "majorPainPoints" must be a string if provided.',
              code: 'INVALID_MAJOR_PAIN_POINTS',
            });
            return;
          }
          if (majorPainPoints.length > 5000) {
            res.status(400).json({
              error: 'Bad Request: "majorPainPoints" exceeds maximum length of 5,000 characters.',
              code: 'MAJOR_PAIN_POINTS_TOO_LONG',
            });
            return;
          }
        }

        // 10. Additional Context validation (optional, max 5,000 chars)
        if (additionalContext !== undefined) {
          if (typeof additionalContext !== 'string') {
            res.status(400).json({
              error: 'Bad Request: "additionalContext" must be a string if provided.',
              code: 'INVALID_ADDITIONAL_CONTEXT',
            });
            return;
          }
          if (additionalContext.length > 5000) {
            res.status(400).json({
              error: 'Bad Request: "additionalContext" exceeds maximum length of 5,000 characters.',
              code: 'ADDITIONAL_CONTEXT_TOO_LONG',
            });
            return;
          }
        }

        // 11. Sensitive Data Protection (Zero-Tolerance: Reject before LLM call)
        const combinedText = `${processName} ${processDescription} ${systemsUsed || ''} ${majorPainPoints || ''} ${additionalContext || ''}`;
        if (containsSensitiveDataPattern(combinedText)) {
          console.warn(`[Process Optimizer API] Request ${requestId} from user ${userId} rejected due to sensitive data pattern detection.`);
          res.status(400).json({
            error: 'Potential sensitive banking information detected (e.g., credit card numbers, passwords, PINs, OTPs, or account numbers). Please remove confidential customer data and try again.',
            code: 'SENSITIVE_DATA_DETECTED',
          });
          return;
        }

        const sanitizedInput: ProcessOptimizerInput = {
          processName: processName.trim(),
          processDescription: processDescription.trim(),
          businessArea: businessArea ? businessArea.trim() : undefined,
          approximateVolume: approximateVolume ? approximateVolume.trim() : undefined,
          frequency: frequency ? frequency.trim() : undefined,
          currentProcessingTimeMinutes,
          numberOfPeopleInvolved,
          systemsUsed: systemsUsed ? systemsUsed.trim() : undefined,
          majorPainPoints: majorPainPoints ? majorPainPoints.trim() : undefined,
          additionalContext: additionalContext ? additionalContext.trim() : undefined,
        };

        // 12. Generate structured process optimization assessment
        console.log(`[Process Optimizer API] [${requestId}] Analyzing process "${sanitizedInput.processName}" for user ${userId} (${sanitizedInput.processDescription.length} chars)...`);
        const responseData = await generateProcessOptimizerResponse(sanitizedInput);

        const latencyMs = Date.now() - startTime;
        console.log(`[Process Optimizer API] Request ${requestId} processed in ${latencyMs}ms using model ${responseData.modelUsed}`);

        res.json({
          result: responseData.result,
          model: responseData.modelUsed,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        const latencyMs = Date.now() - startTime;
        const errMessage = error instanceof Error ? error.message : 'Internal server error';
        console.error(`[Process Optimizer API] Request ${requestId} failed after ${latencyMs}ms:`, errMessage);

        res.status(500).json({
          error: errMessage,
          code: 'AI_GENERATION_FAILED',
        });
      }
    }
  );

  // Protected Transformation Assessment Endpoint (Phase 5C)
  app.post(
    '/api/ai/transformation-assessment',
    authenticateFirebaseToken,
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const startTime = Date.now();
      const requestId = Math.random().toString(36).substring(2, 10);
      const userId = req.user?.uid || 'anonymous-user';

      try {
        if (!req.body || typeof req.body !== 'object') {
          res.status(400).json({
            error: 'Bad Request: Missing request body or invalid JSON format.',
            code: 'INVALID_REQUEST_BODY',
          });
          return;
        }

        const {
          role,
          experienceLevel,
          businessArea,
          aiExperience,
          transformationGoals,
          operationalChallenge,
          answers,
        } = req.body as Partial<TransformationAssessmentRequest>;

        // 1. Role validation (required, max 100 chars)
        if (typeof role !== 'string' || role.trim().length === 0) {
          res.status(400).json({
            error: 'Bad Request: "role" is required and cannot be empty.',
            code: 'INVALID_ROLE',
          });
          return;
        }
        if (role.length > 100) {
          res.status(400).json({
            error: 'Bad Request: "role" exceeds maximum limit of 100 characters.',
            code: 'ROLE_TOO_LONG',
          });
          return;
        }

        // 2. Experience Level validation (required, max 100 chars)
        if (typeof experienceLevel !== 'string' || experienceLevel.trim().length === 0) {
          res.status(400).json({
            error: 'Bad Request: "experienceLevel" is required and cannot be empty.',
            code: 'INVALID_EXPERIENCE_LEVEL',
          });
          return;
        }
        if (experienceLevel.length > 100) {
          res.status(400).json({
            error: 'Bad Request: "experienceLevel" exceeds maximum limit of 100 characters.',
            code: 'EXPERIENCE_LEVEL_TOO_LONG',
          });
          return;
        }

        // 3. Business Area validation (required, max 100 chars)
        if (typeof businessArea !== 'string' || businessArea.trim().length === 0) {
          res.status(400).json({
            error: 'Bad Request: "businessArea" is required and cannot be empty.',
            code: 'INVALID_BUSINESS_AREA',
          });
          return;
        }
        if (businessArea.length > 100) {
          res.status(400).json({
            error: 'Bad Request: "businessArea" exceeds maximum limit of 100 characters.',
            code: 'BUSINESS_AREA_TOO_LONG',
          });
          return;
        }

        // 4. AI Experience validation (required, max 100 chars)
        if (typeof aiExperience !== 'string' || aiExperience.trim().length === 0) {
          res.status(400).json({
            error: 'Bad Request: "aiExperience" is required and cannot be empty.',
            code: 'INVALID_AI_EXPERIENCE',
          });
          return;
        }
        if (aiExperience.length > 100) {
          res.status(400).json({
            error: 'Bad Request: "aiExperience" exceeds maximum limit of 100 characters.',
            code: 'AI_EXPERIENCE_TOO_LONG',
          });
          return;
        }

        // 5. Transformation Goals validation (optional, max 5,000 chars)
        if (transformationGoals !== undefined) {
          if (typeof transformationGoals !== 'string') {
            res.status(400).json({
              error: 'Bad Request: "transformationGoals" must be a string if provided.',
              code: 'INVALID_TRANSFORMATION_GOALS',
            });
            return;
          }
          if (transformationGoals.length > 5000) {
            res.status(400).json({
              error: 'Bad Request: "transformationGoals" exceeds maximum limit of 5,000 characters.',
              code: 'TRANSFORMATION_GOALS_TOO_LONG',
            });
            return;
          }
        }

        // 6. Operational Challenge validation (optional, max 5,000 chars)
        if (operationalChallenge !== undefined) {
          if (typeof operationalChallenge !== 'string') {
            res.status(400).json({
              error: 'Bad Request: "operationalChallenge" must be a string if provided.',
              code: 'INVALID_OPERATIONAL_CHALLENGE',
            });
            return;
          }
          if (operationalChallenge.length > 5000) {
            res.status(400).json({
              error: 'Bad Request: "operationalChallenge" exceeds maximum limit of 5,000 characters.',
              code: 'OPERATIONAL_CHALLENGE_TOO_LONG',
            });
            return;
          }
        }

        // 7. Answers Array Validation
        if (!Array.isArray(answers) || answers.length === 0) {
          res.status(400).json({
            error: 'Bad Request: "answers" must be a non-empty array of question responses.',
            code: 'INVALID_ANSWERS_ARRAY',
          });
          return;
        }

        if (answers.length !== ASSESSMENT_QUESTIONS.length) {
          res.status(400).json({
            error: `Bad Request: Assessment requires exactly ${ASSESSMENT_QUESTIONS.length} answered questions (received ${answers.length}).`,
            code: 'MISSING_ANSWERS',
          });
          return;
        }

        const seenQuestionIds = new Set<string>();
        for (const ans of answers) {
          if (!ans || typeof ans !== 'object') {
            res.status(400).json({
              error: 'Bad Request: Each answer entry must be an object with questionId and optionId.',
              code: 'INVALID_ANSWER_ITEM',
            });
            return;
          }
          if (typeof ans.questionId !== 'string' || typeof ans.optionId !== 'string') {
            res.status(400).json({
              error: 'Bad Request: Answer item missing valid string questionId or optionId.',
              code: 'INVALID_ANSWER_STRUCTURE',
            });
            return;
          }
          if (seenQuestionIds.has(ans.questionId)) {
            res.status(400).json({
              error: `Bad Request: Duplicate answer detected for question "${ans.questionId}".`,
              code: 'DUPLICATE_QUESTION_ANSWER',
            });
            return;
          }
          seenQuestionIds.add(ans.questionId);
        }

        // 8. Sensitive Data Protection (Zero-Tolerance: Reject before LLM call)
        const combinedText = `${transformationGoals || ''} ${operationalChallenge || ''}`;
        if (containsSensitiveDataPattern(combinedText)) {
          console.warn(`[Transformation Assessment API] Request ${requestId} from user ${userId} rejected due to sensitive data pattern.`);
          res.status(400).json({
            error: 'Potential sensitive banking information detected (e.g., credit card numbers, passwords, PINs, OTPs, or account numbers). Please remove confidential customer data and try again.',
            code: 'SENSITIVE_DATA_DETECTED',
          });
          return;
        }

        // 9. Deterministic Server-Side Scoring (IMMUTABLE - Gemini cannot alter)
        let scoringResult;
        try {
          scoringResult = calculateDeterministicScores(answers);
        } catch (scoringError) {
          const scoringMsg = scoringError instanceof Error ? scoringError.message : 'Scoring calculation failed';
          res.status(400).json({
            error: `Bad Request: ${scoringMsg}`,
            code: 'SCORING_CALCULATION_ERROR',
          });
          return;
        }

        const { overallScore, maturityLevel, dimensionScores } = scoringResult;

        // Build question summary for Gemini's qualitative interpretation
        const answerMap = new Map(answers.map((a) => [a.questionId, a.optionId]));
        const answeredQuestionsSummary = ASSESSMENT_QUESTIONS.map((q) => {
          const optId = answerMap.get(q.id);
          const opt = q.options.find((o) => o.id === optId);
          return {
            dimension: q.dimensionKey,
            questionTitle: q.title,
            chosenOption: opt ? `${opt.label} - ${opt.description || ''}` : 'Unknown',
            score: opt ? opt.score : 0,
          };
        });

        // 10. Generate Qualitative Interpretation with Gemini
        console.log(`[Transformation Assessment API] [${requestId}] Generating qualitative interpretation for user ${userId} (${overallScore}/100, ${maturityLevel})...`);
        const interpretationResponse = await generateTransformationAssessmentInterpretation({
          role: role.trim(),
          experienceLevel: experienceLevel.trim(),
          businessArea: businessArea.trim(),
          aiExperience: aiExperience.trim(),
          transformationGoals: transformationGoals ? transformationGoals.trim() : undefined,
          operationalChallenge: operationalChallenge ? operationalChallenge.trim() : undefined,
          overallScore,
          maturityLevel,
          dimensionScores,
          answeredQuestionsSummary,
        });

        const output: TransformationAssessmentOutput = {
          id: `assessment-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          overallScore,
          maturityLevel,
          dimensionScores,
          strengths: interpretationResponse.output.strengths,
          developmentPriorities: interpretationResponse.output.developmentPriorities,
          roleSpecificRecommendations: interpretationResponse.output.roleSpecificRecommendations,
          quickWins: interpretationResponse.output.quickWins,
          governanceFocus: interpretationResponse.output.governanceFocus,
          recommendedLearningTopics: interpretationResponse.output.recommendedLearningTopics,
          recommendedTransformationAreas: interpretationResponse.output.recommendedTransformationAreas,
          executiveSummary: interpretationResponse.output.executiveSummary,
          humanReviewRequired: true,
          advisoryDisclaimer: 'Assessment is advisory and does not replace professional judgment.',
          decisionUseWarning: 'Results should not be used as the sole basis for employment, promotion, lending, compliance, or customer decisions.',
          role: role.trim(),
          experienceLevel: experienceLevel.trim(),
          businessArea: businessArea.trim(),
          aiExperience: aiExperience.trim(),
          calculatedAt: new Date().toISOString(),
        };

        const latencyMs = Date.now() - startTime;
        console.log(`[Transformation Assessment API] Request ${requestId} processed in ${latencyMs}ms using model ${interpretationResponse.modelUsed}`);

        res.json({
          result: output,
          model: interpretationResponse.modelUsed,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        const latencyMs = Date.now() - startTime;
        const errMessage = error instanceof Error ? error.message : 'Internal server error';
        console.error(`[Transformation Assessment API] Request ${requestId} failed after ${latencyMs}ms:`, errMessage);

        res.status(500).json({
          error: errMessage,
          code: 'AI_GENERATION_FAILED',
        });
      }
    }
  );

  // Protected AI Learning Academy Exercise Evaluation Endpoint
  app.post(
    '/api/ai/academy/evaluate-exercise',
    authenticateFirebaseToken,
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const startTime = Date.now();
      const requestId = Math.random().toString(36).substring(2, 10);

      try {
        const userId = req.user?.uid;
        if (!userId) {
          res.status(401).json({
            error: 'Unauthorized: Verified user token required.',
            code: 'AUTH_REQUIRED',
          });
          return;
        }

        if (!req.body || typeof req.body !== 'object') {
          res.status(400).json({
            error: 'Bad Request: Missing request body or invalid JSON format.',
            code: 'INVALID_REQUEST_BODY',
          });
          return;
        }

        const { moduleId, exerciseId, exerciseType, userSubmission, role } = req.body as {
          moduleId?: string;
          exerciseId?: string;
          exerciseType?: string;
          userSubmission?: string;
          role?: string;
        };

        if (typeof moduleId !== 'string' || moduleId.trim().length === 0) {
          res.status(400).json({
            error: 'Bad Request: "moduleId" is required and cannot be empty.',
            code: 'INVALID_MODULE_ID',
          });
          return;
        }

        if (typeof exerciseId !== 'string' || exerciseId.trim().length === 0) {
          res.status(400).json({
            error: 'Bad Request: "exerciseId" is required and cannot be empty.',
            code: 'INVALID_EXERCISE_ID',
          });
          return;
        }

        if (typeof exerciseType !== 'string' || exerciseType.trim().length === 0) {
          res.status(400).json({
            error: 'Bad Request: "exerciseType" is required and cannot be empty.',
            code: 'INVALID_EXERCISE_TYPE',
          });
          return;
        }

        if (typeof userSubmission !== 'string' || userSubmission.trim().length === 0) {
          res.status(400).json({
            error: 'Bad Request: "userSubmission" is required and cannot be empty.',
            code: 'EMPTY_SUBMISSION',
          });
          return;
        }

        if (userSubmission.length > 20000) {
          res.status(400).json({
            error: 'Bad Request: "userSubmission" exceeds maximum limit of 20,000 characters.',
            code: 'SUBMISSION_TOO_LONG',
          });
          return;
        }

        // Sensitive Data Filtering
        if (containsSensitiveDataPattern(userSubmission)) {
          console.warn(`[Academy API] Request ${requestId} from user ${userId} rejected due to sensitive data.`);
          res.status(400).json({
            error: 'Potential sensitive banking information detected (e.g., credit card numbers, passwords, PINs, OTPs, or account numbers). Please remove confidential data and use synthetic examples.',
            code: 'SENSITIVE_DATA_DETECTED',
          });
          return;
        }

        console.log(`[Academy API] Request ${requestId}: Evaluating exercise "${exerciseId}" for user ${userId} (${role || 'Banking Professional'})`);

        const evalResponse = await evaluateAcademyExerciseWithGemini({
          moduleId: moduleId.trim(),
          exerciseId: exerciseId.trim(),
          exerciseType: exerciseType.trim(),
          userSubmission: userSubmission.trim(),
          role: typeof role === 'string' ? role.trim() : undefined,
        });

        const latencyMs = Date.now() - startTime;
        console.log(`[Academy API] Request ${requestId} evaluated in ${latencyMs}ms using model ${evalResponse.modelUsed}`);

        res.json({
          result: evalResponse.output,
          model: evalResponse.modelUsed,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        const latencyMs = Date.now() - startTime;
        const errMessage = error instanceof Error ? error.message : 'Internal server error';
        console.error(`[Academy API] Request ${requestId} failed after ${latencyMs}ms:`, errMessage);

        res.status(500).json({
          error: errMessage,
          code: 'ACADEMY_EVALUATION_FAILED',
        });
      }
    }
  );

  // Protected AI Learning Academy Reflection Endpoint
  app.post(
    '/api/ai/academy/reflect',
    authenticateFirebaseToken,
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const requestId = Math.random().toString(36).substring(2, 10);

      try {
        const userId = req.user?.uid;
        if (!userId) {
          res.status(401).json({
            error: 'Unauthorized: Verified user token required.',
            code: 'AUTH_REQUIRED',
          });
          return;
        }

        if (!req.body || typeof req.body !== 'object') {
          res.status(400).json({
            error: 'Bad Request: Missing request body or invalid JSON format.',
            code: 'INVALID_REQUEST_BODY',
          });
          return;
        }

        const { moduleId, confidence, reflectionNotes, assessmentId, status } = req.body as {
          moduleId?: string;
          confidence?: number;
          reflectionNotes?: string;
          assessmentId?: string;
          status?: string;
        };

        if (typeof moduleId !== 'string' || moduleId.trim().length === 0) {
          res.status(400).json({
            error: 'Bad Request: "moduleId" is required and cannot be empty.',
            code: 'INVALID_MODULE_ID',
          });
          return;
        }

        if (typeof confidence !== 'number' || confidence < 1 || confidence > 5) {
          res.status(400).json({
            error: 'Bad Request: "confidence" must be a number between 1 and 5.',
            code: 'INVALID_CONFIDENCE_RATING',
          });
          return;
        }

        if (typeof reflectionNotes !== 'string' || reflectionNotes.trim().length === 0) {
          res.status(400).json({
            error: 'Bad Request: "reflectionNotes" is required and cannot be empty.',
            code: 'EMPTY_REFLECTION_NOTES',
          });
          return;
        }

        if (reflectionNotes.length > 10000) {
          res.status(400).json({
            error: 'Bad Request: "reflectionNotes" exceeds maximum limit of 10,000 characters.',
            code: 'REFLECTION_TOO_LONG',
          });
          return;
        }

        // Sensitive Data Filtering
        if (containsSensitiveDataPattern(reflectionNotes)) {
          console.warn(`[Academy API] Reflection ${requestId} from user ${userId} rejected due to sensitive data.`);
          res.status(400).json({
            error: 'Potential sensitive banking information detected in reflection notes (e.g. account numbers, passwords, PINs). Please remove confidential data.',
            code: 'SENSITIVE_DATA_DETECTED',
          });
          return;
        }

        const sanitizedNotes = reflectionNotes
          .trim()
          .replace(/[<>]/g, '')
          .substring(0, 5000);

        const encouragements = [
          'Excellent reflection! Integrating deliberate human verification into your workflow is what defines high-maturity banking professionals.',
          'Great insight. Applying structured boundary constraints to generative AI tools will significantly elevate your team operational velocity.',
          'Outstanding reflection on governance. Preserving maker-checker accountability protects both the customer and the institution.',
          'Thoughtful perspective. As you continue to practice these skills, you will find client discovery and communication workflows become increasingly streamlined.',
        ];
        const coachingEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];

        res.json({
          success: true,
          sanitizedNotes,
          confidence,
          completedAt: new Date().toISOString(),
          coachingEncouragement,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        const errMessage = error instanceof Error ? error.message : 'Internal server error';
        console.error(`[Academy API] Reflection ${requestId} failed:`, errMessage);

        res.status(500).json({
          error: errMessage,
          code: 'REFLECTION_PROCESSING_FAILED',
        });
      }
    }
  );

  // Protected 30-Day Transformation Plan Endpoint
  app.post(
    '/api/ai/transformation-plan',
    authenticateFirebaseToken,
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const startTime = Date.now();
      const requestId = Math.random().toString(36).substring(2, 10);

      try {
        const userId = req.user?.uid;
        if (!userId) {
          res.status(401).json({
            error: 'Unauthorized: Verified user token required.',
            code: 'AUTH_REQUIRED',
          });
          return;
        }

        if (!req.body || typeof req.body !== 'object') {
          res.status(400).json({
            error: 'Bad Request: Missing request body or invalid JSON format.',
            code: 'INVALID_REQUEST_BODY',
          });
          return;
        }

        const {
          assessmentId,
          transformationGoal,
          customGoal,
          role,
          maturityLevel,
          overallScore,
          prioritySkills,
          learningSummary,
          dimensionScores,
          quickWins,
          developmentPriorities,
        } = req.body as {
          assessmentId?: string;
          transformationGoal?: string;
          customGoal?: string;
          role?: string;
          maturityLevel?: any;
          overallScore?: number;
          prioritySkills?: string[];
          learningSummary?: any;
          dimensionScores?: any;
          quickWins?: string[];
          developmentPriorities?: string[];
        };

        // Source Data Check: Must have a valid assessmentId
        if (typeof assessmentId !== 'string' || assessmentId.trim().length === 0) {
          res.status(400).json({
            error: 'Bad Request: assessmentId is required. Complete your Transformation Assessment first to create your personalized 30-Day Transformation Plan.',
            code: 'NO_ASSESSMENT_FOUND',
          });
          return;
        }

        // Role Validation
        if (typeof role !== 'string' || role.trim().length === 0) {
          res.status(400).json({
            error: 'Bad Request: role is required and cannot be empty.',
            code: 'INVALID_ROLE',
          });
          return;
        }

        // Length validation for goals
        if (typeof transformationGoal === 'string' && transformationGoal.length > 2000) {
          res.status(400).json({
            error: 'Bad Request: "transformationGoal" exceeds maximum limit of 2,000 characters.',
            code: 'GOAL_TOO_LONG',
          });
          return;
        }

        if (typeof customGoal === 'string' && customGoal.length > 2000) {
          res.status(400).json({
            error: 'Bad Request: "customGoal" exceeds maximum limit of 2,000 characters.',
            code: 'GOAL_TOO_LONG',
          });
          return;
        }

        // Sensitive Data Filtering
        const textToCheck = `${transformationGoal || ''} ${customGoal || ''} ${role || ''}`;
        if (containsSensitiveDataPattern(textToCheck)) {
          console.warn(`[Transformation Plan API] Request ${requestId} from user ${userId} rejected due to sensitive data.`);
          res.status(400).json({
            error: 'Potential sensitive banking information detected (e.g., credit card numbers, passwords, PINs, OTPs, or account numbers). Please remove confidential data and use synthetic examples.',
            code: 'SENSITIVE_DATA_DETECTED',
          });
          return;
        }

        console.log(
          `[Transformation Plan API] Request ${requestId}: Generating 30-day plan for user ${userId} (role: ${role || 'Commercial Banker'}, score: ${overallScore ?? 50})`
        );

        const planResult = await generate30DayTransformationPlanWithGemini({
          assessmentId: assessmentId.trim(),
          role: typeof role === 'string' && role.trim().length > 0 ? role.trim() : 'Commercial Banker',
          maturityLevel: maturityLevel || 'AI Practitioner',
          overallScore: typeof overallScore === 'number' ? Math.max(0, Math.min(100, overallScore)) : 50,
          prioritySkills: Array.isArray(prioritySkills) ? prioritySkills.map(String) : [],
          transformationGoal: typeof transformationGoal === 'string' ? transformationGoal.trim() : undefined,
          customGoal: typeof customGoal === 'string' ? customGoal.trim() : undefined,
          learningSummary: typeof learningSummary === 'object' ? learningSummary : undefined,
          dimensionScores: typeof dimensionScores === 'object' ? dimensionScores : undefined,
          quickWins: Array.isArray(quickWins) ? quickWins.map(String) : undefined,
          developmentPriorities: Array.isArray(developmentPriorities) ? developmentPriorities.map(String) : undefined,
        });

        const latencyMs = Date.now() - startTime;
        console.log(
          `[Transformation Plan API] Request ${requestId} completed in ${latencyMs}ms using model ${planResult.modelUsed} (fallback: ${planResult.isFallback})`
        );

        res.json({
          plan: planResult.plan,
          model: planResult.modelUsed,
          isFallback: planResult.isFallback,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        const latencyMs = Date.now() - startTime;
        const errMessage = error instanceof Error ? error.message : 'Internal server error';
        console.error(`[Transformation Plan API] Request ${requestId} failed after ${latencyMs}ms:`, errMessage);

        res.status(500).json({
          error: errMessage,
          code: 'TRANSFORMATION_PLAN_GENERATION_FAILED',
        });
      }
    }
  );

  // Vite middleware in development vs static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Banker Transformation Copilot running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
