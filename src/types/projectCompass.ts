export type SOPStatus = 'ACTIVE' | 'SUPERSEDED' | 'DRAFT' | 'ARCHIVED';

export interface SOPSection {
  id: string;
  sectionNumber: string;
  title: string;
  citationId: string;
  sourceUri: string;
  content: string;
  applicableRoles?: string[];
  governanceGuidance?: string;
}

export interface SOPDocument {
  policyId: string;
  title: string;
  version: string;
  status: SOPStatus;
  effectiveDate: string;
  nextReviewDate: string;
  policyOwner: string;
  applicableRoles: string[];
  applicableRegion: string;
  documentType: 'Standard Operating Procedure' | 'Policy Guideline';
  sourceType: 'Synthetic Knowledge Base';
  sourceUri: string;
  supersedes: string | null;
  demoData: true;
  summary: string;
  purpose: string;
  scope: string;
  definitions: { term: string; definition: string }[];
  sections: SOPSection[];
  exceptions: string[];
  approvalRequirements: string[];
  escalationRules: string[];
  complianceNotes: string[];
}

export interface SOPCatalogItem {
  policyId: string;
  title: string;
  currentVersion: string;
  status: SOPStatus;
  effectiveDate: string;
  nextReviewDate: string;
  policyOwner: string;
  applicableRoles: string[];
  applicableRegion: string;
  summary: string;
  totalVersions: number;
  availableVersions: string[];
  demoData: true;
}

export interface SOPCatalog {
  repositoryName: string;
  version: string;
  lastUpdated: string;
  repositoryNotice: string;
  totalPolicies: number;
  totalActivePolicies: number;
  totalVersions: number;
  policies: SOPCatalogItem[];
}

export interface PolicyChunk {
  chunkId: string;
  policyId: string;
  title: string;
  version: string;
  status: SOPStatus;
  effectiveDate: string;
  nextReviewDate: string;
  policyOwner: string;
  applicableRoles: string[];
  applicableRegion: string;
  sectionNumber: string;
  sectionTitle: string;
  sourceUri: string;
  citationAnchor: string;
  text: string;
  embedding?: number[];
  demoData: true;
}

export interface ProjectCompassCitation {
  policyId: string;
  title: string;
  version: string;
  status?: SOPStatus;
  sectionNumber: string;
  sectionTitle: string;
  effectiveDate: string;
  nextReviewDate?: string;
  sourceUri: string;
  citationAnchor: string;
}

export interface ProjectCompassPolicyMetadata {
  policyId: string;
  title: string;
  version: string;
  status: SOPStatus;
  effectiveDate: string;
  nextReviewDate: string;
  policyOwner?: string;
  applicableRegion?: string;
  isHighRisk?: boolean;
}

export interface ProjectCompassReviewNotice {
  type: 'APPROACHING_REVIEW' | 'PAST_REVIEW' | 'CURRENT';
  message: string;
  nextReviewDate: string;
  daysUntilReview?: number;
}

export interface ProjectCompassGovernanceMetadata {
  groundedInAuthorizedSOP: boolean;
  activeVersionVerified: boolean;
  sourceCitationAvailable: boolean;
  humanVerificationRequired: boolean;
  reviewStatus: 'CURRENT' | 'APPROACHING_REVIEW' | 'PAST_REVIEW';
  riskLevel: 'HIGH_OPERATIONAL_RISK' | 'STANDARD_OPERATIONAL';
}

export interface ProjectCompassAuditRecord {
  auditId: string;
  authenticatedUid: string;
  timestamp: string;
  queryId: string;
  query: string;
  retrievedChunkIds: string[];
  policyIds: string[];
  policyVersions: string[];
  similarityScores: number[];
  citationAnchors: string[];
  modelUsed: string;
  responseStatus: 'grounded' | 'policy_not_found' | 'policy_conflict';
  highRiskClassification: boolean;
  verificationRequired: boolean;
}

export interface ProjectCompassQueryRequest {
  query: string;
  userRole?: string;
  userRegion?: string;
}

export interface ProjectCompassQueryResponse {
  status: 'grounded' | 'policy_not_found' | 'policy_conflict';
  answer?: string;
  message?: string;
  keySteps?: string[];
  cautions?: string[];
  citations: ProjectCompassCitation[];
  policyMetadata?: ProjectCompassPolicyMetadata;
  reviewNotice?: ProjectCompassReviewNotice;
  governanceMetadata?: ProjectCompassGovernanceMetadata;
  requiresHumanVerification: boolean;
  verificationReason?: string;
  verificationAcknowledged?: boolean;
  topSimilarityScore?: number;
  retrievedCount?: number;
  modelUsed?: string;
  demoDataNotice: string;
  advisoryDisclaimer: string;
  blindTrustWarning: string;
  timestamp: string;
}

export interface VectorIndexData {
  indexVersion: string;
  embeddingModel: string;
  embeddingDimension: number;
  generatedAt: string;
  chunkCount: number;
  activeChunks: number;
  supersededChunks: number;
  chunks: PolicyChunk[];
  // Legacy aliases for backward compatibility if needed
  version?: string;
  indexedAt?: string;
  totalChunks?: number;
}

