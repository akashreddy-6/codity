import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Briefcase, Plus, ArrowRight, Layers } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  _count: { queues: number };
}

export default function Projects() {
  const [searchParams] = useSearchParams();
  const orgId = searchParams.get('orgId');
  const queryClient = useQueryClient();
  const [newProjectName, setNewProjectName] = useState('');

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['projects', orgId],
    queryFn: async () => {
      const res = await api.get(`/api/projects/${orgId}`);
      return res.data;
    },
    enabled: !!orgId,
  });

  const createProjectMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await api.post(`/api/projects/${orgId}`, { name });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', orgId] });
      setNewProjectName('');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to create project');
    }
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim() && orgId) {
      createProjectMutation.mutate(newProjectName);
    }
  };

  if (!orgId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-secondary)]">
        <Briefcase className="w-16 h-16 text-white/10 mb-4" />
        <h2 className="text-xl font-medium text-white mb-2">No Organization Selected</h2>
        <p>Please select an organization from the dashboard first.</p>
        <Link to="/" className="mt-6 btn-primary">Go to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="relative">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-[var(--color-accent-500)]/10 rounded-full blur-[100px] pointer-events-none"></div>
        <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-accent-500)]/20 to-[var(--color-brand-500)]/20 rounded-xl flex items-center justify-center border border-white/10">
            <Briefcase className="h-6 w-6 text-[var(--color-accent-400)]" />
          </div>
          Projects
        </h1>
        <p className="mt-3 text-lg text-[var(--color-text-secondary)] font-medium">Manage projects and their associated job queues.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create New Project Card */}
        <div className="glass-card p-6 flex flex-col justify-center border-dashed border-white/20 hover:border-[var(--color-brand-500)] hover:bg-white/[0.02]">
          <form onSubmit={handleCreateProject} className="space-y-5">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <div className="bg-[var(--color-brand-500)]/20 p-2 rounded-lg">
                <Plus className="h-5 w-5 text-[var(--color-brand-400)]" />
              </div>
              New Project
            </h3>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="e.g. Email Service"
              className="input-field"
              required
            />
            <button
              type="submit"
              disabled={createProjectMutation.isPending}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
            </button>
          </form>
        </div>

        {/* List Projects */}
        {isLoading ? (
          <div className="col-span-2 glass-card p-12 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[var(--color-brand-500)] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[var(--color-text-secondary)] font-medium">Loading projects...</p>
            </div>
          </div>
        ) : (
          projects?.map((project, index) => (
            <Link
              to={`/queues?projectId=${project.id}`}
              key={project.id}
              className="glass-card p-6 group flex flex-col relative overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[var(--color-accent-500)]/10 to-transparent rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="flex-1 relative z-10">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-5 shadow-inner">
                  <Layers className="h-6 w-6 text-white group-hover:text-[var(--color-accent-400)] transition-colors duration-300" />
                </div>
                <h3 className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[var(--color-accent-100)] transition-all duration-300">
                  {project.name}
                </h3>
                <div className="mt-3 flex items-center gap-3">
                  <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-sm font-medium text-[var(--color-text-secondary)]">
                    {project._count.queues} {project._count.queues === 1 ? 'Queue' : 'Queues'}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 flex items-center text-sm font-semibold text-[var(--color-accent-400)] opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 relative z-10">
                View Queues <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
