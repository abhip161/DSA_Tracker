import { useEffect, useMemo, useState } from 'react';

const defaultForm = {
  title: '',
  platform: 'LeetCode',
  link: '',
  difficulty: 'Easy',
  rating: 0,
  topics: '',
  status: 'Unsolved',
  revision: false,
  notes: '',
};

const AddProblemModal = ({ isOpen, onClose, onSubmit, loading, initialValue }) => {
  const isEdit = Boolean(initialValue?._id);

  const initialForm = useMemo(() => {
    if (!initialValue) return defaultForm;
    return {
      title: initialValue.title || '',
      platform: initialValue.platform || 'LeetCode',
      link: initialValue.link || '',
      difficulty: initialValue.difficulty || 'Easy',
      rating: initialValue.rating || 0,
      topics: Array.isArray(initialValue.topics) ? initialValue.topics.join(', ') : '',
      status: initialValue.status === 'Solved' ? 'Solved' : 'Unsolved',
      revision: Boolean(initialValue.revision),
      notes: initialValue.notes || '',
    };
  }, [initialValue]);

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSolvedChange = (e) => {
    setForm((prev) => ({
      ...prev,
      status: e.target.checked ? 'Solved' : 'Unsolved',
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      rating: Number(form.rating || 0),
      topics: form.topics
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-dark-700 border border-dark-400/50 rounded-2xl shadow-card p-6 max-h-[90vh] overflow-y-auto animate-fade-in">
        <h2 className="text-xl font-semibold text-white mb-5">
          {isEdit ? 'Edit Problem' : 'Add New Problem'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Title</label>
            <input
              className="w-full bg-dark-600 border border-dark-400/50 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50"
              name="title"
              placeholder="Two Sum"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Platform & Difficulty */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Platform</label>
              <select
                className="w-full bg-dark-600 border border-dark-400/50 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50"
                name="platform"
                value={form.platform}
                onChange={handleChange}
              >
                <option value="LeetCode">LeetCode</option>
                <option value="Codeforces">Codeforces</option>
                <option value="CodeChef">CodeChef</option>
                <option value="GFG">GFG</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Difficulty</label>
              <select
                className="w-full bg-dark-600 border border-dark-400/50 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50"
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Rating</label>
            <input
              type="number"
              className="w-full bg-dark-600 border border-dark-400/50 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50"
              name="rating"
              placeholder="1200"
              value={form.rating}
              onChange={handleChange}
              min={0}
            />
          </div>

          {/* Link */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Link</label>
            <input
              type="url"
              className="w-full bg-dark-600 border border-dark-400/50 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50"
              name="link"
              placeholder="https://leetcode.com/problems/two-sum"
              value={form.link}
              onChange={handleChange}
              required
            />
          </div>

          {/* Topics */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Topics</label>
            <input
              className="w-full bg-dark-600 border border-dark-400/50 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50"
              name="topics"
              placeholder="Array, Hash Map, Two Pointers"
              value={form.topics}
              onChange={handleChange}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Notes</label>
            <textarea
              className="w-full bg-dark-600 border border-dark-400/50 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 resize-none"
              name="notes"
              placeholder="Key observations, approach used..."
              value={form.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {/* Checkboxes */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={form.status === 'Solved'}
                onChange={handleSolvedChange}
                className="w-4 h-4 rounded border-dark-400 bg-dark-600 text-emerald-500 focus:ring-emerald-500/50 cursor-pointer"
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Mark as Solved</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                name="revision"
                checked={form.revision}
                onChange={handleChange}
                className="w-4 h-4 rounded border-dark-400 bg-dark-600 text-amber-500 focus:ring-amber-500/50 cursor-pointer"
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Mark for Revision</span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white border border-dark-400/50 rounded-xl hover:bg-dark-500 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-brand-500 rounded-xl hover:from-brand-500 hover:to-brand-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow transition-all"
            >
              {loading ? 'Saving...' : isEdit ? 'Update Problem' : 'Add Problem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProblemModal;
