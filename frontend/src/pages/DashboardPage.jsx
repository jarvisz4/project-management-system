import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, isPast } from 'date-fns';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import TaskStatusBadge from '../components/TaskStatusBadge';

const StatCard = ({ label, value, color, icon }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { stats, recentTasks, projects } = data || {};

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Good day, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-slate-500 mt-0.5">Here's what's happening in your workspace.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total Tasks" value={stats?.total ?? 0} icon="📋" color="bg-blue-50" />
        <StatCard label="Completed" value={stats?.completed ?? 0} icon="✅" color="bg-green-50" />
        <StatCard label="In Progress" value={stats?.inProgress ?? 0} icon="🔄" color="bg-yellow-50" />
        <StatCard label="Pending" value={stats?.pending ?? 0} icon="⏳" color="bg-orange-50" />
        <StatCard label="Overdue" value={stats?.overdue ?? 0} icon="🚨" color="bg-red-50" />
        <StatCard label="Projects" value={stats?.projects ?? 0} icon="📁" color="bg-purple-50" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recent Tasks</h2>
            <Link to="/tasks" className="text-xs text-brand-600 hover:underline font-medium">View all →</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentTasks?.length === 0 && (
              <p className="px-5 py-8 text-center text-slate-400 text-sm">No tasks yet</p>
            )}
            {recentTasks?.map(task => (
              <div key={task._id} className="px-5 py-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{task.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {task.projectId?.name}
                    {task.dueDate && (
                      <span className={`ml-2 ${isPast(new Date(task.dueDate)) && task.status !== 'completed' ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                        · Due {format(new Date(task.dueDate), 'MMM d')}
                      </span>
                    )}
                  </p>
                </div>
                <TaskStatusBadge status={task.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Projects</h2>
            <Link to="/projects" className="text-xs text-brand-600 hover:underline font-medium">View all →</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {projects?.length === 0 && (
              <p className="px-5 py-8 text-center text-slate-400 text-sm">No projects yet</p>
            )}
            {projects?.map(proj => (
              <Link
                key={proj._id}
                to={`/projects/${proj._id}`}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">
                  {proj.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{proj.name}</p>
                  <p className="text-xs text-slate-500">{proj.members?.length ?? 0} members</p>
                </div>
                <span className="text-slate-300 text-sm">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
