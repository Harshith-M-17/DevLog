import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEntries, deleteEntry } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

import type { DailyEntry } from '../types';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await getEntries();
      setEntries(response.data);
      setError('');
    } catch (err: any) {
      console.error('Error fetching entries:', err);
      setError('Failed to fetch entries. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // const handleLogout = () => {
  //   logout();
  //   navigate('/login');
  // };

  const handleAddEntry = () => {
    navigate('/add-entry');
  };

  const handleEditEntry = (entryId: string) => {
    navigate(`/edit-entry/${entryId}`);
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteEntry(entryId);
        setEntries(entries.filter((entry) => entry.id !== entryId));
      } catch (err) {
        console.error('Error deleting entry:', err);
        setError('Failed to delete entry.');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderEntry = (entry: DailyEntry) => (
    <div key={entry.id} className="entry-card">
      <div className="entry-header">
        <div className="entry-user">
          <h3>{entry.userName}</h3>
          <span className="entry-date">{formatDate(entry.date)}</span>
        </div>
        {user?.id === entry.userId && (
          <div className="entry-actions">
            <button
              onClick={() => handleEditEntry(entry.id)}
              className="edit-btn"
              title="Edit entry"
            >
              ✏️
            </button>
            <button
              onClick={() => handleDeleteEntry(entry.id)}
              className="delete-btn"
              title="Delete entry"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      <div className="entry-content">
        <div className="entry-section">
          <h4>Work Done</h4>
          <p>{entry.workDone}</p>
        </div>

        {entry.blockers && (
          <div className="entry-section">
            <h4>Blockers</h4>
            <p>{entry.blockers}</p>
          </div>
        )}

        {entry.learnings && (
          <div className="entry-section">
            <h4>Learnings</h4>
            <p>{entry.learnings}</p>
          </div>
        )}

        {entry.githubCommitLink && (
          <div className="entry-section">
            <h4>GitHub Commit</h4>
            <a
              href={entry.githubCommitLink}
              target="_blank"
              rel="noopener noreferrer"
              className="github-link"
            >
              View Commit
            </a>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <main className="dashboard-main">
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner">Loading entries...</div>
          </div>
        )}

        {!loading && entries.length > 0 && (
          <div className="entries-list">
            <div className="entries-header">
              <h2>Daily Entries ({entries.length})</h2>
              <button onClick={fetchEntries} className="refresh-btn" title="Refresh">
                🔄
              </button>
            </div>
            <div className="entries-grid">
              {entries.map(renderEntry)}
            </div>
            {error && (
              <div className="error-state">
                <p>{error}</p>
                <button onClick={fetchEntries} className="retry-btn">
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}

        {!loading && entries.length === 0 && (
          <div className="empty-state">
            <h2>No entries yet</h2>
            <p>Be the first to add a daily entry!</p>
            <button onClick={handleAddEntry} className="add-first-btn">
              Add Your First Entry
            </button>
            {error && (
              <div className="error-state">
                <p>{error}</p>
                <button onClick={fetchEntries} className="retry-btn">
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <button
        onClick={handleAddEntry}
        className="floating-add-btn"
        title="Add new entry"
      >
        +
      </button>
    </div>
  );
};