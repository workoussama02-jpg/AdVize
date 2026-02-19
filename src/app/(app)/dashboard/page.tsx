/**
 * Dashboard page — campaign plan cards, recent analyses, quick actions.
 * PRD Section 6.4.
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  BarChart3,
  MoreVertical,
  FileText,
  Copy,
  Archive,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatRelativeTime, getStatusClass } from '@/lib/utils';

/** Plan status filter options */
const STATUS_FILTERS = ['All', 'Drafts', 'Approved', 'Exported'] as const;

/** Mock type for campaign plan card display */
interface PlanCardData {
  id: string;
  title: string;
  status: 'draft' | 'approved' | 'exported' | 'archived';
  objective: string;
  strategyType: string;
  createdAt: string;
}

/** Mock type for analysis card display */
interface AnalysisCardData {
  id: string;
  campaignName: string;
  healthScore: number;
  analyzedAt: string;
}

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  /* Placeholder — these would come from InsForge DB via server component or hook */
  const plans: PlanCardData[] = [];
  const analyses: AnalysisCardData[] = [];

  const filteredPlans = plans.filter((plan) => {
    if (activeFilter === 'All') return plan.status !== 'archived';
    return plan.status === activeFilter.toLowerCase();
  });

  const getHealthColor = (score: number) => {
    if (score >= 70) return 'health-good';
    if (score >= 40) return 'health-warning';
    return 'health-critical';
  };

  const getStatusVariant = (status: string) => {
    const map: Record<string, 'success' | 'warning' | 'info' | 'neutral'> = {
      draft: 'neutral',
      approved: 'success',
      exported: 'info',
      archived: 'neutral',
    };
    return map[status] ?? 'neutral';
  };

  const toggleMenu = (planId: string) => {
    setOpenMenu(openMenu === planId ? null : planId);
  };

  /* Empty state for first-time users */
  if (plans.length === 0 && analyses.length === 0) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Your campaign command center</p>
          </div>
        </div>
        <EmptyState
          icon={FileText}
          title="Create your first campaign plan"
          description="Tell AdVize what you're promoting and get a complete campaign architecture in minutes."
          action={
            <Link href="/builder" className="btn btn-primary" id="empty-create-plan">
              <Plus size={16} aria-hidden="true" />
              New Campaign Plan
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your campaign command center</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="quick-actions">
        <Link href="/builder" className="btn btn-primary" id="dashboard-new-plan">
          <Plus size={16} aria-hidden="true" />
          New Campaign Plan
        </Link>
        <Link href="/analyzer" className="btn btn-secondary" id="dashboard-analyze">
          <BarChart3 size={16} aria-hidden="true" />
          Analyze Campaign
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="tabs">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter}
            className={`tab ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter)}
            id={`filter-${filter.toLowerCase()}`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Campaign plans grid */}
      <h2 className="section-label">Campaign Plans</h2>
      <div className="grid-2">
        {filteredPlans.map((plan) => (
          <div key={plan.id} className="card card-hover plan-card">
            <div className="plan-card-header">
              <Link href={`/builder/${plan.id}`} className="plan-card-title" id={`plan-${plan.id}`}>
                {plan.title}
              </Link>
              <div className="dropdown">
                <button
                  className="three-dot-btn"
                  onClick={() => toggleMenu(plan.id)}
                  aria-label={`Actions for ${plan.title}`}
                  id={`plan-menu-${plan.id}`}
                >
                  <MoreVertical size={16} />
                </button>
                {openMenu === plan.id && (
                  <div className="dropdown-menu">
                    <button className="dropdown-item" id={`plan-duplicate-${plan.id}`}>
                      <Copy size={14} aria-hidden="true" />
                      Duplicate
                    </button>
                    <button className="dropdown-item" id={`plan-archive-${plan.id}`}>
                      <Archive size={14} aria-hidden="true" />
                      Archive
                    </button>
                    <div className="dropdown-separator" />
                    <button className="dropdown-item dropdown-item-danger" id={`plan-delete-${plan.id}`}>
                      <Trash2 size={14} aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="plan-card-meta">
              <Badge variant={getStatusVariant(plan.status)}>
                {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
              </Badge>
              <span className="plan-card-meta-separator" />
              <span>{plan.objective}</span>
              <span className="plan-card-meta-separator" />
              <span>{formatRelativeTime(plan.createdAt)}</span>
            </div>
            <p className="plan-card-objective">{plan.strategyType}</p>
          </div>
        ))}
      </div>

      {/* Recent analyses */}
      {analyses.length > 0 && (
        <>
          <div className="divider" />
          <h2 className="section-label">Recent Analyses</h2>
          <div className="grid-3">
            {analyses.map((analysis) => (
              <Link
                key={analysis.id}
                href={`/analyzer/${analysis.id}`}
                className="card card-hover analysis-card"
                id={`analysis-${analysis.id}`}
              >
                <span className={`analysis-health-score ${getHealthColor(analysis.healthScore)}`}>
                  {analysis.healthScore}
                </span>
                <div className="analysis-info">
                  <p className="analysis-name">{analysis.campaignName}</p>
                  <p className="analysis-date">{formatRelativeTime(analysis.analyzedAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
