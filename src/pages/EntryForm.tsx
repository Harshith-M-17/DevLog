import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createEntry, getEntry, updateEntry } from '../services/api';
import { validateRequired, validateGitHubLink } from '../utils/auth';
import type { CreateDailyEntryRequest } from '../types';
import './EntryForm.css';

interface FormData {
  workDone: string;
  blockers: string;
  learnings: string;
  githubCommitLink: string;
}

interface FormErrors {
  workDone?: string;
  blockers?: string;
  learnings?: string;
  githubCommitLink?: string;
  general?: string;
}

export const EntryForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    workDone: '',
    blockers: '',
    learnings: '',
    githubCommitLink: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [loadingEntry, setLoadingEntry] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  useEffect(() => {
    if (isEditing && id) {
      loadEntry(id);
    }
  }, [isEditing, id]);

  const loadEntry = async (entryId: string) => {
    try {
      setLoadingEntry(true);
      const response = await getEntry(entryId);
      const { workDone, blockers, learnings, githubCommitLink } = response.data;
      setFormData({ workDone, blockers, learnings, githubCommitLink: githubCommitLink || '' });
    } catch (error: any) {
      console.error('Error loading entry:', error);
      setErrors({ general: 'Failed to load entry' });
    } finally {
      setLoadingEntry(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!validateRequired(formData.workDone)) {
      newErrors.workDone = 'Work done is required';
    }

    if (!validateRequired(formData.blockers)) {
      newErrors.blockers = 'Blockers field is required';
    }

    if (!validateRequired(formData.learnings)) {
      newErrors.learnings = 'Learnings field is required';
    }

    if (formData.githubCommitLink && !validateGitHubLink(formData.githubCommitLink)) {
      newErrors.githubCommitLink = 'Please enter a valid GitHub commit URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const entryData: CreateDailyEntryRequest = {
        workDone: formData.workDone.trim(),
        blockers: formData.blockers.trim(),
        learnings: formData.learnings.trim(),
        githubCommitLink: formData.githubCommitLink.trim() || undefined,
      };

      if (isEditing && id) {
        await updateEntry(id, entryData);
      } else {
        await createEntry(entryData);
      }
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error(`${isEditing ? 'Update' : 'Create'} error:`, error);
      setErrors({ general: error?.response?.data?.error || `Failed to ${isEditing ? 'update' : 'create'} entry` });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  if (loadingEntry) {
    return (
      <div className="form-container">
        <div className="loading-state">
          <div className="loading-spinner">Loading entry...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="form-card">
        <div className="form-header">
          <h1>{isEditing ? 'Edit Daily Entry' : 'Add Daily Entry'}</h1>
          <p>Share your daily progress with your team</p>
        </div>

        <form onSubmit={handleSubmit} className="entry-form">
          <div className="form-group">
            <label htmlFor="workDone">Work Done *</label>
            <textarea
              id="workDone"
              name="workDone"
              value={formData.workDone}
              onChange={handleInputChange}
              className={errors.workDone ? 'error' : ''}
              placeholder="Describe what you accomplished today..."
              rows={4}
            />
            {errors.workDone && <span className="error-message">{errors.workDone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="blockers">Blockers *</label>
            <textarea
              id="blockers"
              name="blockers"
              value={formData.blockers}
              onChange={handleInputChange}
              className={errors.blockers ? 'error' : ''}
              placeholder="Any challenges or blockers you faced..."
              rows={3}
            />
            {errors.blockers && <span className="error-message">{errors.blockers}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="learnings">Learnings *</label>
            <textarea
              id="learnings"
              name="learnings"
              value={formData.learnings}
              onChange={handleInputChange}
              className={errors.learnings ? 'error' : ''}
              placeholder="What did you learn today..."
              rows={3}
            />
            {errors.learnings && <span className="error-message">{errors.learnings}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="githubCommitLink">GitHub Commit Link</label>
            <input
              type="url"
              id="githubCommitLink"
              name="githubCommitLink"
              value={formData.githubCommitLink}
              onChange={handleInputChange}
              className={errors.githubCommitLink ? 'error' : ''}
              placeholder="https://github.com/username/repo/commit/abc123..."
            />
            {errors.githubCommitLink && <span className="error-message">{errors.githubCommitLink}</span>}
            <small className="help-text">Optional: Link to your main commit for today</small>
          </div>

          {errors.general && (
            <div className="error-message general-error">{errors.general}</div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Entry' : 'Save Entry')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};