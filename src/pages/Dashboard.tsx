import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dailyEntriesAPI } from '../services/api';
import type { DailyEntry } from '../types';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const data = await dailyEntriesAPI.getAll();
      setEntries(data);
      setError('');
    } catch (err: any) {
      console.error('Error fetching entries:', err);
      // For testing, show mock data when API is not available
      const mockEntries: DailyEntry[] = [
        {
          id: '1',
          userId: 'test-user-1',
          userName: 'Test User',
          date: new Date().toISOString(),
          workDone: 'Implemented user authentication and login flow. Created reusable components for form validation.',
          blockers: 'Had some issues with TypeScript type definitions, but resolved them by importing types correctly.',
          learnings: 'Learned about React Context API and how to manage global state effectively. Also discovered best practices for form validation.',
          githubCommitLink: 'https://github.com/username/repo/commit/abc123def456',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          userId: 'test-user-2',
          userName: 'Jane Developer',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          workDone: 'Built the dashboard component with responsive design. Added floating action button for adding new entries.',
          blockers: 'CSS Grid layout was tricky on mobile devices. Spent time debugging responsive breakpoints.',
          learnings: 'Learned advanced CSS Grid techniques and mobile-first responsive design principles.',
          githubCommitLink: '',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          userId: 'test-user-3',
          userName: 'Mike Coder',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          workDone: 'Set up API integration with Axios. Created service layer for all HTTP requests.',
          blockers: 'CORS issues when connecting to backend API. Had to configure proper headers.',
          learnings: 'Understanding of HTTP interceptors and how to handle authentication tokens in API requests.',
          githubCommitLink: 'https://github.com/username/repo/commit/def456ghi789',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      setEntries(mockEntries);
      setError('Using mock data - backend API not available');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddEntry = () => {
    navigate('/add-entry');
  };

  const handleEditEntry = (entryId: string) => {
    navigate(`/edit-entry/${entryId}`);
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
          <button
            onClick={() => handleEditEntry(entry.id)}
            className="edit-btn"
            title="Edit entry"
          >
            ✏️
          </button>
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
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Team DevLog</h1>
          <div className="user-info">
            <span>Welcome, {user?.name}!</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner">Loading entries...</div>
          </div>
        )}

        {/* Always show cards if entries exist, even if error */}
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