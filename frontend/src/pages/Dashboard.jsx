import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dashboardAPI, problemsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AddProblemModal from '../components/AddProblemModal';

const difficultyColor = {
  Easy: 'bg-emerald-500',
  Medium: 'bg-amber-500',
  Hard: 'bg-red-500',
};

const difficultyTextColor = {
  Easy: 'text-emerald-400',
  Medium: 'text-amber-400',
  Hard: 'text-red-400',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [stats, setStats] = useState({
    totalSolved: 0,
    platformStats: [],
    difficultyStats: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await dashboardAPI.getStats();
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  const totalProblems = stats.difficultyStats.reduce((sum, d) => sum + d.count, 0);
  const solvedPercent = totalProblems > 0 ? Math.round((stats.totalSolved / totalProblems) * 100) : 0;

  const getDifficultyCount = (level) => {
    const found = stats.difficultyStats.find((d) => d.difficulty === level);
    return found ? found.count : 0;
  };

  const handleAddProblem = async (payload) => {
    try {
      setSubmitting(true);
      await problemsAPI.create(payload);
      setModalOpen(false);
      await loadStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add problem');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 pointer-events-none" />

      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
              <p className="text-gray-400 text-sm mt-1">
                Welcome back, <span className="text-brand-400">{user?.name}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                className="px-4 py-2.5 text-sm font-medium text-gray-300 border border-dark-400/50 rounded-xl hover:bg-dark-600 hover:text-white transition-all"
                to="/problems"
              >
                View Problems
              </Link>
              <button
                className="px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-red-400 border border-dark-400/50 rounded-xl hover:border-red-500/30 hover:bg-red-500/10 transition-all"
                onClick={onLogout}
              >
                Logout
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Main Stats Card */}
              <div className="bg-dark-700 border border-dark-400/30 rounded-2xl shadow-card p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  {/* Left: Numbers */}
                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total Problems</p>
                        <p className="text-4xl font-bold text-white">{totalProblems}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total Solved</p>
                        <p className="text-4xl font-bold text-emerald-400">{stats.totalSolved}</p>
                      </div>
                    </div>

                    {/* Difficulty breakdown */}
                    <div className="flex items-center gap-6 mt-5">
                      {['Easy', 'Medium', 'Hard'].map((level) => (
                        <div key={level} className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${difficultyColor[level]}`} />
                          <span className="text-sm text-gray-400">{level}</span>
                          <span className={`text-sm font-semibold ${difficultyTextColor[level]}`}>
                            {getDifficultyCount(level)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Progress Ring */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative w-28 h-28">
                      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="#2a2a38"
                          strokeWidth="10"
                        />
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="url(#progressGradient)"
                          strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray={`${solvedPercent * 3.14} ${314 - solvedPercent * 3.14}`}
                          className="transition-all duration-700 ease-out"
                        />
                        <defs>
                          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#10b981" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{solvedPercent}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">Solved</p>
                  </div>
                </div>
              </div>

              {/* Platform & Difficulty Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Platform Stats */}
                <div className="bg-dark-700 border border-dark-400/30 rounded-2xl shadow-card p-6">
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Platform Breakdown
                  </h2>
                  <div className="space-y-3">
                    {stats.platformStats.length === 0 ? (
                      <p className="text-sm text-gray-500">No data yet</p>
                    ) : (
                      stats.platformStats.map((item) => {
                        const pct = totalProblems > 0 ? Math.round((item.count / totalProblems) * 100) : 0;
                        return (
                          <div key={item.platform}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-300">{item.platform}</span>
                              <span className="text-gray-400 font-medium">{item.count}</span>
                            </div>
                            <div className="w-full h-1.5 bg-dark-500 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Difficulty Stats */}
                <div className="bg-dark-700 border border-dark-400/30 rounded-2xl shadow-card p-6">
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Difficulty Breakdown
                  </h2>
                  <div className="space-y-3">
                    {stats.difficultyStats.length === 0 ? (
                      <p className="text-sm text-gray-500">No data yet</p>
                    ) : (
                      stats.difficultyStats.map((item) => {
                        const pct = totalProblems > 0 ? Math.round((item.count / totalProblems) * 100) : 0;
                        return (
                          <div key={item.difficulty}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className={difficultyTextColor[item.difficulty] || 'text-gray-300'}>
                                {item.difficulty}
                              </span>
                              <span className="text-gray-400 font-medium">{item.count}</span>
                            </div>
                            <div className="w-full h-1.5 bg-dark-500 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  item.difficulty === 'Easy'
                                    ? 'bg-emerald-500'
                                    : item.difficulty === 'Medium'
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-8 right-8 z-40 w-14 h-14 bg-gradient-to-br from-brand-600 to-brand-500 rounded-full shadow-glow flex items-center justify-center text-white hover:scale-110 hover:shadow-lg transition-all duration-200 group"
        title="Add Problem"
      >
        <svg
          className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Add Problem Modal */}
      <AddProblemModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddProblem}
        loading={submitting}
      />
    </div>
  );
};

export default Dashboard;
