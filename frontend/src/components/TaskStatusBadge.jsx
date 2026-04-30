import React from 'react';

const config = {
  pending: { label: 'Pending', cls: 'bg-slate-100 text-slate-600' },
  'in-progress': { label: 'In Progress', cls: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Completed', cls: 'bg-green-100 text-green-700' },
};

export default function TaskStatusBadge({ status }) {
  const c = config[status] || config.pending;
  return <span className={`badge ${c.cls}`}>{c.label}</span>;
}
