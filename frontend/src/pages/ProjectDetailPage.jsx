import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import TaskStatusBadge from '../components/TaskStatusBadge';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [adding, setAdding] = useState(false);

  const loadProject = () => api.get(`/projects/${id}`).then(({ data }) => setProject(data));
  const loadTasks = () => api.get(`/tasks?projectId=${id}`).then(({ data }) => setTasks(data));

  useEffect(() => {
    Promise.all([
      loadProject(),
      loadTasks(),
      isAdmin ? api.get('/users').then(({ data }) => setAllUsers(data)) : Promise.resolve()
    ])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setAdding(true);
    try {
      const { data } = await api.post(`/projects/${id}/members`, { userId: selectedUser });
      setProject(data);
      setShowAddMember(false);
      setSelectedUser('');
      toast.success('Member added');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to add member');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      const { data } = await api.delete(`/projects/${id}/members/${userId}`);
      setProject(data);
      toast.success('Member removed');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to remove');
    }
  };

  const nonMembers = allUsers.filter(u => !project?.members?.some(m => m._id === u._id));

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!project) return <p className="text-slate-500">Project not found.</p>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Link to="/projects" className="hover:text-brand-600">Projects</Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">{project.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
          {project.description && <p className="text-slate-500 mt-1">{project.description}</p>}
        </div>
        {isAdmin && (
          <Link to={`/tasks?projectId=${id}`} className="btn-primary flex-shrink-0">
            Manage Tasks
          </Link>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Team Members */}
        <div className="md:col-span-1">
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Team ({project.members?.length})</h2>
              {isAdmin && (
                <button
                  className="text-xs btn-primary py-1 px-2"
                  onClick={() => setShowAddMember(true)}
                  disabled={nonMembers.length === 0}
                >
                  + Add
                </button>
              )}
            </div>
            <div className="divide-y divide-slate-100">
              {project.members?.map(member => (
                <div key={member._id} className="flex items-center gap-3 px-4 py-3 group">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm flex-shrink-0">
                    {member.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{member.name}</p>
                    <p className="text-xs text-slate-500 truncate">{member.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge text-xs ${member.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                      {member.role}
                    </span>
                    {isAdmin && member._id !== user._id && project.createdBy?._id === user._id && (
                      <button
                        onClick={() => handleRemoveMember(member._id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Project Tasks */}
        <div className="md:col-span-2">
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Tasks ({tasks.length})</h2>
              <Link to={`/tasks?projectId=${id}`} className="text-xs text-brand-600 hover:underline font-medium">
                View all →
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {tasks.length === 0 && (
                <div className="px-5 py-12 text-center">
                  <p className="text-slate-400 text-sm">No tasks in this project</p>
                  {isAdmin && (
                    <Link to={`/tasks?projectId=${id}`} className="btn-primary text-xs mt-3 inline-flex">
                      Create First Task
                    </Link>
                  )}
                </div>
              )}
              {tasks.slice(0, 8).map(task => (
                <div key={task._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{task.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {task.assignedTo ? `→ ${task.assignedTo.name}` : 'Unassigned'}
                      {task.dueDate && ` · Due ${new Date(task.dueDate).toLocaleDateString()}`}
                    </p>
                  </div>
                  <TaskStatusBadge status={task.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <Modal title="Add Team Member" onClose={() => setShowAddMember(false)}>
          <form onSubmit={handleAddMember} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Select User</label>
              <select className="input" value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
                <option value="">Choose a user...</option>
                {nonMembers.map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" className="btn-secondary flex-1 justify-center" onClick={() => setShowAddMember(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1 justify-center" disabled={adding || !selectedUser}>
                {adding ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Add Member'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
