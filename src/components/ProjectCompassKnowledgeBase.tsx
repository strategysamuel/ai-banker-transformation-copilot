import React, { useState, useMemo } from 'react';
import {
  Compass,
  FileText,
  ShieldAlert,
  Layers,
  CheckCircle2,
  AlertTriangle,
  History,
  Tag,
  BookOpen,
  Filter,
  ExternalLink,
  ChevronRight,
  Info,
  Building,
  UserCheck,
  Calendar,
  Lock,
  ArrowRight,
  Search,
  Sparkles
} from 'lucide-react';
import { SYNTHETIC_SOP_CATALOG, ALL_SYNTHETIC_SOPS, getAllVersionsForPolicy } from '../data/projectCompassData';
import { SOPCatalogItem, SOPDocument } from '../types/projectCompass';
import { ProjectCompassQuery } from './ProjectCompassQuery';

export const ProjectCompassKnowledgeBase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'explorer'>('search');
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>('PC-WIRE-001');
  const [selectedVersion, setSelectedVersion] = useState<string>('4.2');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Compute unique roles across catalog
  const allRoles = useMemo(() => {
    const roleSet = new Set<string>();
    SYNTHETIC_SOP_CATALOG.policies.forEach((p) => {
      p.applicableRoles.forEach((r) => roleSet.add(r));
    });
    return Array.from(roleSet).sort();
  }, []);

  // Filter catalog items
  const filteredCatalog = useMemo(() => {
    if (roleFilter === 'ALL') {
      return SYNTHETIC_SOP_CATALOG.policies;
    }
    return SYNTHETIC_SOP_CATALOG.policies.filter((p) =>
      p.applicableRoles.includes(roleFilter)
    );
  }, [roleFilter]);

  // Selected SOP document
  const currentSop = useMemo<SOPDocument | undefined>(() => {
    return ALL_SYNTHETIC_SOPS.find(
      (s) => s.policyId === selectedPolicyId && s.version === selectedVersion
    );
  }, [selectedPolicyId, selectedVersion]);

  // Available versions for the selected policy
  const availableVersions = useMemo(() => {
    return getAllVersionsForPolicy(selectedPolicyId);
  }, [selectedPolicyId]);

  const handleSelectPolicy = (policy: SOPCatalogItem) => {
    setSelectedPolicyId(policy.policyId);
    setSelectedVersion(policy.currentVersion);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-blue-900/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-900/60 border border-blue-700/50 text-blue-300 text-xs font-semibold">
              <Compass className="w-4 h-4 text-blue-400 animate-spin-slow" />
              <span>Project Compass • RAG Live</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/80 border border-amber-800/60 text-amber-300 text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>DEMO DATA ONLY</span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>PROJECT COMPASS</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                Vector RAG Live
              </span>
            </h2>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Frontline SOP Knowledge Copilot — Standard Operating Procedures repository with genuine vector retrieval, section-aware chunking, and grounded citations powered by Gemini.
            </p>
          </div>

          {/* Mandatory Synthetic Data Notice */}
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-200/90 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300">DEMO DATA NOTICE:</span>{' '}
              These synthetic SOPs are created exclusively for the Cloud Run AI Challenge and must not be treated as actual banking policy. 
              No real bank documents, customer PII, or internal credentials are used.
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">Synthetic Policies</div>
              <div className="text-xl font-bold text-white mt-0.5">{SYNTHETIC_SOP_CATALOG.totalPolicies} SOPs</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">Vector Chunks</div>
              <div className="text-xl font-bold text-blue-400 mt-0.5">35 Chunks</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">Active Policy Index</div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">31 Chunks</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">Embedding Model</div>
              <div className="text-xs font-mono font-semibold text-purple-300 mt-1.5 truncate">
                gemini-embedding-2
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('search')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'search'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Policy Search & Grounded Q&A</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('explorer')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'explorer'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>SOP Catalog & Document Explorer</span>
        </button>
      </div>

      {/* Tab 1: Interactive RAG Search */}
      {activeTab === 'search' && <ProjectCompassQuery />}

      {/* Tab 2: SOP Catalog & Document Explorer */}
      {activeTab === 'explorer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Catalog Browser */}
        <div className="lg:col-span-5 space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-blue-400" />
                <span>Filter by Role</span>
              </div>
              <span className="text-[11px] text-slate-400">
                {filteredCatalog.length} of {SYNTHETIC_SOP_CATALOG.totalPolicies} SOPs
              </span>
            </div>

            <select
              id="project-compass-role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800/90 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Roles ({SYNTHETIC_SOP_CATALOG.totalPolicies} Policies)</option>
              {allRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Policy List */}
          <div className="space-y-2.5">
            {filteredCatalog.map((policy) => {
              const isSelected = policy.policyId === selectedPolicyId;
              const hasMultipleVersions = policy.totalVersions > 1;

              return (
                <div
                  key={policy.policyId}
                  id={`sop-card-${policy.policyId.toLowerCase()}`}
                  onClick={() => handleSelectPolicy(policy)}
                  className={`p-4 rounded-xl border transition cursor-pointer text-left ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-600/70 shadow-md shadow-blue-950/50'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/40">
                          {policy.policyId}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40 font-semibold">
                          v{policy.currentVersion} ACTIVE
                        </span>
                        {hasMultipleVersions && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40 flex items-center gap-1">
                            <History className="w-2.5 h-2.5" />
                            <span>{policy.totalVersions} vers</span>
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white pt-1">{policy.title}</h4>
                    </div>
                    <ChevronRight className={`w-4 h-4 mt-1 transition ${isSelected ? 'text-blue-400 translate-x-0.5' : 'text-slate-600'}`} />
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {policy.summary}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-800/60">
                    {policy.applicableRoles.slice(0, 2).map((role) => (
                      <span
                        key={role}
                        className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 font-medium"
                      >
                        {role}
                      </span>
                    ))}
                    {policy.applicableRoles.length > 2 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                        +{policy.applicableRoles.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected SOP Inspector */}
        <div className="lg:col-span-7 space-y-4">
          {currentSop ? (
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-lg">
              {/* Document Header & Version Switcher */}
              <div className="space-y-4 pb-5 border-b border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950 px-2.5 py-1 rounded-md border border-blue-800/50">
                      {currentSop.policyId}
                    </span>
                    <span
                      className={`text-xs font-bold font-mono px-2.5 py-1 rounded-md border ${
                        currentSop.status === 'ACTIVE'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
                          : 'bg-rose-950 text-rose-300 border-rose-800/60'
                      }`}
                    >
                      {currentSop.status}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-amber-800/40">
                      demoData: true
                    </span>
                  </div>

                  {/* Version Picker */}
                  {availableVersions.length > 1 && (
                    <div className="flex items-center gap-2 p-1 rounded-lg bg-slate-800/90 border border-slate-700">
                      <span className="text-[10px] text-slate-400 font-semibold px-2">Version:</span>
                      {availableVersions.map((v) => {
                        const isVerSelected = v.version === selectedVersion;
                        return (
                          <button
                            key={v.version}
                            id={`version-btn-${currentSop.policyId.toLowerCase()}-${v.version}`}
                            onClick={() => setSelectedVersion(v.version)}
                            className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition cursor-pointer ${
                              isVerSelected
                                ? v.status === 'ACTIVE'
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'bg-rose-700 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            v{v.version} ({v.status})
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Superseded Warning Banner */}
                {currentSop.status === 'SUPERSEDED' && (
                  <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-200 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-rose-300">HISTORICAL SUPERSEDED POLICY:</span>{' '}
                      This version (v{currentSop.version}) was superseded by active policy version v
                      {availableVersions.find((v) => v.status === 'ACTIVE')?.version || 'latest'}. 
                      The future Project Compass RAG engine will use this test data to verify active vs. outdated policy disambiguation.
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight">{currentSop.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{currentSop.summary}</p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3 text-blue-400" />
                      <span>Effective Date</span>
                    </div>
                    <div className="text-xs font-mono font-semibold text-white mt-1">{currentSop.effectiveDate}</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3 text-indigo-400" />
                      <span>Next Review</span>
                    </div>
                    <div className="text-xs font-mono font-semibold text-white mt-1">{currentSop.nextReviewDate}</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                      <Building className="w-3 h-3 text-cyan-400" />
                      <span>Region Scope</span>
                    </div>
                    <div className="text-xs font-mono font-semibold text-cyan-300 mt-1">{currentSop.applicableRegion}</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 sm:col-span-2">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                      <UserCheck className="w-3 h-3 text-emerald-400" />
                      <span>Policy Owner</span>
                    </div>
                    <div className="text-xs font-medium text-slate-200 mt-1">{currentSop.policyOwner}</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                      <History className="w-3 h-3 text-purple-400" />
                      <span>Supersedes</span>
                    </div>
                    <div className="text-xs font-mono font-semibold text-purple-300 mt-1">{currentSop.supersedes || 'None'}</div>
                  </div>
                </div>

                {/* Applicable Roles Chips */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Authorized Applicable Roles
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {currentSop.applicableRoles.map((role) => (
                      <span
                        key={role}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-blue-300 border border-blue-800/40"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Purpose & Scope */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                    <span>Purpose & Scope</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                    {currentSop.purpose}
                  </p>
                </div>

                {/* Definitions */}
                {currentSop.definitions.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Synthetic Definitions & Thresholds
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {currentSop.definitions.map((def, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 text-xs">
                          <span className="font-mono font-bold text-cyan-300">{def.term}</span>: <span className="text-slate-300">{def.definition}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Procedures & Citation Sections */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Chunking-Ready Policy Sections & Citations</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {currentSop.sections.length} Sections
                  </span>
                </div>

                <div className="space-y-3">
                  {currentSop.sections.map((section) => (
                    <div
                      key={section.id}
                      className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                            Sec {section.sectionNumber}
                          </span>
                          <span>{section.title}</span>
                        </div>
                        <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-700 flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5" />
                          <span>{section.citationId}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed font-sans">
                        {section.content}
                      </p>

                      <div className="pt-2 border-t border-slate-700/40 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                        <span className="font-mono text-slate-400">
                          URI: {section.sourceUri}
                        </span>
                        {section.governanceGuidance && (
                          <span className="italic text-amber-300/90">
                            {section.governanceGuidance}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Thresholds, Approvals & Governance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {/* Approval Requirements */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Approval Authority Matrix</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {currentSop.approvalRequirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Escalation Rules */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Escalation Rules</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {currentSop.escalationRules.map((rule, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Compliance Guidance Notice */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5 text-xs">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-400" />
                  <span>Compliance & Governance Guidance</span>
                </div>
                {currentSop.complianceNotes.map((note, idx) => (
                  <p key={idx} className="text-slate-300 text-[11px] leading-relaxed">
                    {note}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-slate-900/80 border border-slate-800 text-center text-slate-400 space-y-3">
              <FileText className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs">Select a standard operating procedure to view its structured policy brief.</p>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};
