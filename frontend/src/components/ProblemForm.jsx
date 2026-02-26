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
  createdAt: '',
};

const ProblemForm = ({ initialValue, onSubmit, loading, onCancel }) => {
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
      status: initialValue.status || 'Unsolved',
      revision: Boolean(initialValue.revision),
      notes: initialValue.notes || '',
      createdAt: initialValue.createdAt ? new Date(initialValue.createdAt).toISOString().slice(0, 10) : '',
    };
  }, [initialValue]);

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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
      createdAt: form.createdAt || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-4 space-y-3">
      <h2 className="text-lg font-semibold">{isEdit ? 'Edit Problem' : 'Add Problem'}</h2>

      <input
        className="w-full border rounded-md px-3 py-2"
        name="title"
        placeholder="Title"
        value={form.title}
        onChange={handleChange}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <select className="border rounded-md px-3 py-2" name="platform" value={form.platform} onChange={handleChange}>
          <option>CodeChef</option>
          <option>Codeforces</option>
          <option>LeetCode</option>
          <option>GFG</option>
        </select>

        <select className="border rounded-md px-3 py-2" name="difficulty" value={form.difficulty} onChange={handleChange}>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
      </div>

      <input
        type="url"
        className="w-full border rounded-md px-3 py-2"
        name="link"
        placeholder="Problem Link"
        value={form.link}
        onChange={handleChange}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="number"
          className="border rounded-md px-3 py-2"
          name="rating"
          placeholder="Rating"
          value={form.rating}
          onChange={handleChange}
          min={0}
        />

        <select className="border rounded-md px-3 py-2" name="status" value={form.status} onChange={handleChange}>
          <option>Solved</option>
          <option>Attempted</option>
          <option>Unsolved</option>
        </select>
      </div>

      <input
        className="w-full border rounded-md px-3 py-2"
        name="topics"
        placeholder="Topics (comma-separated)"
        value={form.topics}
        onChange={handleChange}
      />

      <input
        type="date"
        className="w-full border rounded-md px-3 py-2"
        name="createdAt"
        value={form.createdAt}
        onChange={handleChange}
      />

      <textarea
        className="w-full border rounded-md px-3 py-2"
        name="notes"
        placeholder="Notes"
        value={form.notes}
        onChange={handleChange}
        rows={3}
      />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="revision" checked={form.revision} onChange={handleChange} />
        Mark for revision
      </label>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-md disabled:opacity-60"
        >
          {loading ? 'Saving...' : isEdit ? 'Update Problem' : 'Add Problem'}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-slate-500 text-white rounded-md"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ProblemForm;
