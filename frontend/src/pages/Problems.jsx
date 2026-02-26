import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { problemsAPI } from '../services/api';
import AddProblemModal from '../components/AddProblemModal';

const difficultyBadge = {
  Easy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  Hard: 'bg-red-500/15 text-red-400 border-red-500/20',
};

const Problems = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    platform: '',
    difficulty: '',
    revision: '',
  });

  const queryParams = useMemo(() => {
    const params = {};
    if (filters.platform) params.platform = filters.platform;
    if (filters.difficulty) params.difficulty = filters.difficulty;
    if (filters.revision !== '') params.revision = filters.revision;
    return params;
  }, [filters]);

  const loadProblems = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await problemsAPI.getAll(queryParams);
      setProblems(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load problems');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProblems();
  }, [queryParams.platform, queryParams.difficulty, queryParams.revision]);

  const handleCreateOrUpdate = async (payload) => {
    try {
      setSubmitting(true);
      if (selectedProblem?._id) {
        await problemsAPI.update(selectedProblem._id, payload);
      } else {
        await problemsAPI.create(payload);
      }
      setSelectedProblem(null);
      setModalOpen(false);
      await loadProblems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save problem');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this problem?');
    if (!confirmed) return;

    try {
      await problemsAPI.remove(id);
      if (selectedProblem?._id === id) {
        setSelectedProblem(null);
      }
      await loadProblems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete problem');
    }
  };

  const handleToggleRevision = async (problem) => {
    const original = [...problems];
    // Optimistic update
    setProblems((prev) =>
      prev.map((p) => (p._id === problem._id ? { ...p, revision: !p.revision } : p))
    );
    try {
      await problemsAPI.update(problem._id, { revision: !problem.revision });
    } catch {
      setProblems(original);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ platform: '', difficulty: '', revision: '' });
  };

  const hasActiveFilters = filters.platform || filters.difficulty || filters.revision !== '';

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  const openEditModal = (problem) => {
    setSelectedProblem(problem);
    setModalOpen(true);
  };

  const openAddModal = () => {
    setSelectedProblem(null);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 pointer-events-none" />

      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Problems</h1>
              <p className="text-gray-400 text-sm mt-1">
                {problems.length} problem{problems.length !== 1 ? 's' : ''} tracked
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={openAddModal}
                className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-brand-500 rounded-xl hover:from-brand-500 hover:to-brand-400 shadow-glow transition-all"
              >
                + Add Problem
              </button>
              <Link
                className="px-4 py-2.5 text-sm font-medium text-gray-300 border border-dark-400/50 rounded-xl hover:bg-dark-600 hover:text-white transition-all"
                to="/dashboard"
              >
                Dashboard
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
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="bg-dark-700 border border-dark-400/30 rounded-2xl shadow-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Filters</h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                name="platform"
                value={filters.platform}
                onChange={handleFilterChange}
                className="bg-dark-600 border border-dark-400/50 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50"
              >
                <option value="">All Platforms</option>
                <option value="LeetCode">LeetCode</option>
                <option value="Codeforces">Codeforces</option>
                <option value="CodeChef">CodeChef</option>
                <option value="GFG">GFG</option>
              </select>

              <select
                name="difficulty"
                value={filters.difficulty}
                onChange={handleFilterChange}
                className="bg-dark-600 border border-dark-400/50 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50"
              >
                <option value="">All Difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              <select
                name="revision"
                value={filters.revision}
                onChange={handleFilterChange}
                className="bg-dark-600 border border-dark-400/50 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50"
              >
                <option value="">All Revision</option>
                <option value="true">Revision: Yes</option>
                <option value="false">Revision: No</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-dark-700 border border-dark-400/30 rounded-2xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-400/30">
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Platform</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Difficulty</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-center px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Revision</th>
                    <th className="text-right px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-400/20">
                  {loading ? (
                    <tr>
                      <td className="px-5 py-12 text-center" colSpan={6}>
                        <div className="flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      </td>
                    </tr>
                  ) : problems.length === 0 ? (
                    <tr>
                      <td className="px-5 py-12 text-center text-gray-500" colSpan={6}>
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p>No problems found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    problems.map((problem) => (
                      <tr
                        key={problem._id}
                        className="hover:bg-dark-600/50 transition-colors duration-150"
                      >
                        {/* Title */}
                        <td className="px-5 py-3.5">
                          <a
                            href={problem.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
                          >
                            {problem.title}
                          </a>
                          {problem.topics?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {problem.topics.slice(0, 3).map((t) => (
                                <span
                                  key={t}
                                  className="text-[10px] px-1.5 py-0.5 bg-dark-500 text-gray-500 rounded"
                                >
                                  {t}
                                </span>
                              ))}
                              {problem.topics.length > 3 && (
                                <span className="text-[10px] text-gray-600">
                                  +{problem.topics.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Platform */}
                        <td className="px-5 py-3.5 text-gray-300">{problem.platform}</td>

                        {/* Difficulty */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              difficultyBadge[problem.difficulty] || 'bg-gray-500/15 text-gray-400 border-gray-500/20'
                            }`}
                          >
                            {problem.difficulty}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          {problem.status === 'Solved' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Solved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/15 text-gray-400 border border-gray-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                              {problem.status}
                            </span>
                          )}
                        </td>

                        {/* Revision */}
                        <td className="px-5 py-3.5 text-center">
                          <button
                            onClick={() => handleToggleRevision(problem)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                              problem.revision
                                ? 'bg-amber-500 border-amber-500'
                                : 'border-dark-300 hover:border-amber-500/50'
                            }`}
                          >
                            {problem.revision && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(problem)}
                              className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-500/15 transition-colors"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(problem._id)}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/15 transition-colors"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Problem Modal */}
      <AddProblemModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedProblem(null);
        }}
        onSubmit={handleCreateOrUpdate}
        loading={submitting}
        initialValue={selectedProblem}
      />
    </div>
  );
};

export default Problems;
