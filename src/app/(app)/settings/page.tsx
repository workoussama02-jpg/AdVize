/**
 * Settings page — business profile, Meta connection, data management.
 * PRD Section 6.10.
 */
'use client';

import { useState } from 'react';
import {
  Save,
  RefreshCw,
  Link2,
  Link2Off,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { INDUSTRY_OPTIONS, settingsUpdateSchema } from '@/lib/validators';

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* Placeholder state — loaded from InsForge in production */
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [dailyBudget, setDailyBudget] = useState<number>(20);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const metaConnected = false;
  const metaAccountId = '';

  const handleSave = async () => {
    setErrors({});
    setIsSaving(true);

    const result = settingsUpdateSchema.safeParse({
      business_name: businessName,
      industry,
      daily_budget: dailyBudget,
      website_url: websiteUrl || undefined,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      setIsSaving(false);
      return;
    }

    /* Save via InsForge SDK */
    setIsSaving(false);
  };

  const handleDeleteAction = (action: string) => {
    /* Execute deletion via InsForge SDK */
    setDeleteModal(null);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your profile, connections, and data</p>
        </div>
      </div>

      {/* Business Profile */}
      <section className="settings-section">
        <h2 className="settings-section-title">Business Profile</h2>
        <div className="card">
          <div className="settings-form">
            <Input
              inputId="settings-business-name"
              label="Business Name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              error={errors.business_name}
            />
            <Select
              inputId="settings-industry"
              label="Industry"
              options={INDUSTRY_OPTIONS.map((ind) => ({ value: ind, label: ind }))}
              value={industry}
              onChange={(e) => setIndustry((e.target as HTMLSelectElement).value)}
              error={errors.industry}
            />
            <Input
              inputId="settings-budget"
              label="Default Daily Budget"
              type="number"
              value={dailyBudget}
              onChange={(e) => setDailyBudget(Number(e.target.value))}
              error={errors.daily_budget}
              min={1}
              max={10000}
              step={0.01}
            />
            <Input
              inputId="settings-website"
              label="Website URL"
              type="url"
              placeholder="https://yourbusiness.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              error={errors.website_url}
            />
            <Button
              variant="primary"
              onClick={handleSave}
              loading={isSaving}
              id="settings-save"
            >
              <Save size={16} aria-hidden="true" />
              Save Changes
            </Button>
          </div>
        </div>
      </section>

      {/* Meta Connection */}
      <section className="settings-section">
        <h2 className="settings-section-title">Meta Connection</h2>
        <div className="card">
          <div className="settings-row">
            <div className="settings-connection">
              <span className={`settings-connection-dot ${metaConnected ? 'settings-connected' : 'settings-disconnected'}`} />
              <span className="settings-label">
                {metaConnected ? `Connected — Account ${metaAccountId}` : 'Not connected'}
              </span>
            </div>
            <Button
              variant={metaConnected ? 'secondary' : 'primary'}
              id="settings-meta-connect"
            >
              {metaConnected ? (
                <>
                  <Link2Off size={16} aria-hidden="true" />
                  Disconnect
                </>
              ) : (
                <>
                  <Link2 size={16} aria-hidden="true" />
                  Connect Meta Account
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Website Data */}
      <section className="settings-section">
        <h2 className="settings-section-title">Website Data</h2>
        <div className="card">
          <div className="settings-row">
            <span className="settings-label">Scraped website content for AI personalization</span>
            <div className="quick-actions">
              <Button variant="secondary" size="sm" id="settings-refresh-website">
                <RefreshCw size={14} aria-hidden="true" />
                Refresh
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteModal('website')}
                id="settings-delete-website"
              >
                <Trash2 size={14} aria-hidden="true" />
                Delete All
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="settings-section">
        <div className="settings-danger-zone">
          <h2 className="settings-danger-title">
            <AlertTriangle size={18} aria-hidden="true" />
            {' '}Danger Zone
          </h2>
          <div className="settings-danger-item">
            <span className="settings-danger-label">Delete all campaign plans</span>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteModal('plans')}
              id="settings-delete-plans"
            >
              Delete Plans
            </Button>
          </div>
          <div className="settings-danger-item">
            <span className="settings-danger-label">Delete all analyses</span>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteModal('analyses')}
              id="settings-delete-analyses"
            >
              Delete Analyses
            </Button>
          </div>
          <div className="settings-danger-item">
            <span className="settings-danger-label">Delete account and all data</span>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteModal('account')}
              id="settings-delete-account"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </section>

      {/* Delete confirmation modal */}
      <Modal
        open={deleteModal !== null}
        title="Confirm Deletion"
        onClose={() => setDeleteModal(null)}
        footer={
          <div className="modal-footer">
            <Button variant="ghost" onClick={() => setDeleteModal(null)} id="delete-cancel">
              Cancel
            </Button>
            <Button variant="danger" onClick={() => { if (deleteModal) handleDeleteAction(deleteModal); }} id="delete-confirm">
              <Trash2 size={14} aria-hidden="true" />
              Delete Permanently
            </Button>
          </div>
        }
      >
        <p className="page-subtitle">
          {deleteModal === 'account'
            ? 'This will permanently delete your account and all associated data. This action cannot be undone.'
            : deleteModal === 'plans'
            ? 'This will permanently delete all your campaign plans. This action cannot be undone.'
            : deleteModal === 'analyses'
            ? 'This will permanently delete all your campaign analyses. This action cannot be undone.'
            : 'This will permanently delete all scraped website data. This action cannot be undone.'}
        </p>
      </Modal>
    </div>
  );
}
