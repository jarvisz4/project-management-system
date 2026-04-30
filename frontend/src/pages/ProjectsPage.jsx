import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { format } from 'date-fns';

export default function ProjectsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const load = () => {
    api.get('/projects')
      .then(({ data }) => setProjects(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Project name is required';
    return errs;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const { data } = await api.post('/projects', form);
      setProjects([data, ...projects]);
      setShowModal(false);
      setForm({ name: '', description: '' });
      toast.success('Project created!');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter(p => p._id !== id));
      toast.success('Project deleted');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to delete');
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 text-sm mt-0.5">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + New Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-4xl mb-3">📁</p>
          <p className="text-slate-900 font-semibold">No projects yet</p>
          <p className="text-slate-500 text-sm mt-1">
            {isAdmin ? 'Create your first project to get started.' : 'You haven\'t been added to any projects yet.'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(proj => (
            <div key={proj._id} className="card p-5 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
                  {proj.name[0].toUpperCase()}
                </div>
                {isAdmin && proj.createdBy?._id === user?._id && (
                  <button
                    onClick={() => handleDelete(proj._id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 text-sm"
                  >
                    🗑
                  </button>
                )}
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{proj.name}</h3>
              <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                {proj.description || 'No description provided'}
              </p>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{proj.members?.length ?? 0} members</span>
                <span>{format(new Date(proj.createdAt), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Link to={`/projects/${proj._id}`} className="btn-primary text-xs py-1.5 flex-1 justify-center">
                  Open Project
                </Link>
                <Link to={`/tasks?projectId=${proj._id}`} className="btn-secondary text-xs py-1.5 flex-1 justify-center">
                  View Tasks
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Create New Project" onClose={() => { setShowModal(false); setErrors({}); }}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Project Name *</label>
              <input
                className={`input ${errors.name ? 'border-red-400' : ''}`}
                placeholder="e.g. Website Redesign"
                value={form.name}
                onChange={set('name')}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <textarea
                className="input resize-none"
                rows={3}
                placeholder="Brief description of the project..."
                value={form.description}
                onChange={set('description')}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" className="btn-secondary flex-1 justify-center" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1 justify-center" disabled={saving}>
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Project'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
