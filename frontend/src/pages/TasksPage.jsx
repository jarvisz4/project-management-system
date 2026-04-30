import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format, isPast } from 'date-fns';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import TaskStatusBadge from '../components/TaskStatusBadge';

const statusOptions = ['pending', 'in-progress', 'completed'];

export default function TasksPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [searchParams] = useSearchParams();
  const projectIdFilter = searchParams.get('projectId');

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProject, setFilterProject] = useState(projectIdFilter || 'all');
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = { title: '', description: '', projectId: projectIdFilter || '', assignedTo: '', status: 'pending', dueDate: '' };
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const load = useCallback(() => {
    const url = filterProject !== 'all' ? `/tasks?projectId=${filterProject}` : '/tasks';
    api.get(url)
      .then(({ data }) => setTasks(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filterProject]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (isAdmin) {
      api.get('/projects').then(({ data }) => setProjects(data));
      api.get('/users').then(({ data }) => setUsers(data));
    }
  }, [isAdmin]);

  // Members of currently selected project
  const projectMembers = users.filter(u => {
    const proj = projects.find(p => p._id === form.projectId);
    return proj?.members?.some(m => m._id === u._id || m === u._id);
  });

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.projectId) errs.projectId = 'Project is required';
    return errs;
  };

  const openCreate = () => {
    setEditTask(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      projectId: task.projectId?._id || '',
      assignedTo: task.assignedTo?._id || '',
      status: task.status,
      dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : ''
    });
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editTask && !isAdmin) {
      // Member: update status only
      setSaving(true);
      try {
        const { data } = await api.put(`/tasks/${editTask._id}`, { status: form.status });
        setTasks(tasks.map(t => t._id === data._id ? data : t));
        setShowModal(false);
        toast.success('Task updated!');
      } catch (err) {
        toast.error(err.response?.data?.msg || 'Failed to update');
      } finally {
        setSaving(false);
      }
      return;
    }

    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        projectId: form.projectId,
        assignedTo: form.assignedTo || null,
        status: form.status,
        dueDate: form.dueDate || null
      };

      if (editTask) {
        const { data } = await api.put(`/tasks/${editTask._id}`, payload);
        setTasks(tasks.map(t => t._id === data._id ? data : t));
        toast.success('Task updated!');
      } else {
        const { data } = await api.post('/tasks', payload);
        setTasks([data, ...tasks]);
        toast.success('Task created!');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
      toast.success('Task deleted');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to delete');
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const filtered = tasks.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="text-slate-500 text-sm mt-0.5">{filtered.length} task{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={openCreate}>+ New Task</button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select className="input !w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          {statusOptions.map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
        </select>
        {isAdmin && (
          <select className="input !w-auto" value={filterProject} onChange={e => setFilterProject(e.target.value)}>
            <option value="all">All Projects</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        )}
      </div>

      {/* Tasks Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-slate-900 font-semibold">No tasks found</p>
          <p className="text-slate-500 text-sm mt-1">
            {isAdmin ? 'Create your first task to get started.' : 'No tasks assigned to you yet.'}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Task</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Project</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden md:table-cell">Assignee</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden lg:table-cell">Due Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(task => {
                  const overdue = task.dueDate && task.status !== 'completed' && isPast(new Date(task.dueDate));
                  const canEdit = isAdmin || task.assignedTo?._id === user._id;
                  return (
                    <tr key={task._id} className={`hover:bg-slate-50 transition-colors ${overdue ? 'bg-red-50/30' : ''}`}>
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="font-medium text-slate-900">{task.title}</p>
                          {task.description && (
                            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{task.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Link
                          to={`/projects/${task.projectId?._id}`}
                          className="text-brand-600 hover:underline text-xs font-medium"
                        >
                          {task.projectId?.name || '—'}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        {task.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold flex-shrink-0">
                              {task.assignedTo.name[0].toUpperCase()}
                            </div>
                            <span className="text-slate-700">{task.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        {task.dueDate ? (
                          <span className={`text-xs font-medium ${overdue ? 'text-red-600' : 'text-slate-600'}`}>
                            {overdue && '⚠ '}
                            {format(new Date(task.dueDate), 'MMM d, yyyy')}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">No due date</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <TaskStatusBadge status={task.status} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 justify-end">
                          {canEdit && (
                            <button
                              onClick={() => openEdit(task)}
                              className="text-xs btn-ghost py-1 px-2"
                            >
                              Edit
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(task._id)}
                              className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                            >
                              🗑
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showModal && (
        <Modal
          title={editTask ? (isAdmin ? 'Edit Task' : 'Update Status') : 'Create New Task'}
          onClose={() => { setShowModal(false); setErrors({}); }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {(!editTask || isAdmin) && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
                  <input
                    className={`input ${errors.title ? 'border-red-400' : ''}`}
                    placeholder="Task title"
                    value={form.title}
                    onChange={set('title')}
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                  <textarea
                    className="input resize-none"
                    rows={2}
                    placeholder="Optional details..."
                    value={form.description}
                    onChange={set('description')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Project *</label>
                  <select
                    className={`input ${errors.projectId ? 'border-red-400' : ''}`}
                    value={form.projectId}
                    onChange={set('projectId')}
                  >
                    <option value="">Select project...</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                  {errors.projectId && <p className="text-red-500 text-xs mt-1">{errors.projectId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Assign To</label>
                  <select className="input" value={form.assignedTo} onChange={set('assignedTo')} disabled={!form.projectId}>
                    <option value="">Unassigned</option>
                    {projectMembers.map(u => (
                      <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                  {!form.projectId && <p className="text-xs text-slate-500 mt-1">Select a project first</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    className="input"
                    value={form.dueDate}
                    onChange={set('dueDate')}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <select className="input" value={form.status} onChange={set('status')}>
                {statusOptions.map(s => (
                  <option key={s} value={s}>{s.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" className="btn-secondary flex-1 justify-center" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1 justify-center" disabled={saving}>
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (editTask ? 'Update Task' : 'Create Task')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
