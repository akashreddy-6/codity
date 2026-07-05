import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Building2, Plus, ArrowRight, Activity, Zap, Server } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Organization {
  id: string;
  name: string;
  _count: { projects: number };
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [newOrgName, setNewOrgName] = useState('');

  const { data: orgs, isLoading } = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: async () => {
      const res = await api.get('/api/organizations');
      return res.data;
    }
  });

  const createOrgMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await api.post('/api/organizations', { name });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setNewOrgName('');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to create organization');
    }
  });

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (newOrgName.trim()) {
      createOrgMutation.mutate(newOrgName);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-[var(--color-brand-500)]/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div>
          <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
            System Overview
          </h1>
          <p className="mt-2 text-lg text-[var(--color-text-secondary)] font-medium">
            Monitor and manage your distributed job scheduling platform.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-16 h-16 text-[var(--color-brand-500)]" />
          </div>
          <p className="text-[var(--color-text-secondary)] font-medium mb-1">Global Success Rate</p>
          <div className="text-4xl font-black text-white">99.98%</div>
          <div className="mt-4 flex items-center gap-2 text-sm text-emerald-400">
            <span className="flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-full"><ArrowRight className="w-3 h-3 -rotate-45" /> +0.02%</span>
            <span className="text-[var(--color-text-muted)]">vs last week</span>
          </div>
        </div>

        <div className="glass-card p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap className="w-16 h-16 text-[var(--color-accent-500)]" />
          </div>
          <p className="text-[var(--color-text-secondary)] font-medium mb-1">Avg Execution Time</p>
          <div className="text-4xl font-black text-white">42<span className="text-xl text-[var(--color-text-muted)] ml-1">ms</span></div>
          <div className="mt-4 flex items-center gap-2 text-sm text-emerald-400">
            <span className="flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-full"><ArrowRight className="w-3 h-3 rotate-45" /> -5ms</span>
            <span className="text-[var(--color-text-muted)]">vs last week</span>
          </div>
        </div>

        <div className="glass-card p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Server className="w-16 h-16 text-indigo-400" />
          </div>
          <p className="text-[var(--color-text-secondary)] font-medium mb-1">Active Workers</p>
          <div className="text-4xl font-black text-white">12<span className="text-xl text-[var(--color-text-muted)] ml-1">nodes</span></div>
          <div className="mt-4 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <span className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              All nodes healthy
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Building2 className="w-6 h-6 text-[var(--color-brand-500)]" />
          Organizations
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Create New Org Card */}
          <div className="glass-card p-6 flex flex-col justify-center border-dashed border-white/20 hover:border-[var(--color-brand-500)] hover:bg-white/[0.02]">
            <form onSubmit={handleCreateOrg} className="space-y-5">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <div className="bg-[var(--color-brand-500)]/20 p-2 rounded-lg">
                  <Plus className="h-5 w-5 text-[var(--color-brand-400)]" />
                </div>
                New Organization
              </h3>
              <input
                type="text"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="input-field"
                required
              />
              <button
                type="submit"
                disabled={createOrgMutation.isPending}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {createOrgMutation.isPending ? 'Creating...' : 'Create Organization'}
              </button>
            </form>
          </div>

          {/* List Orgs */}
          {isLoading ? (
            <div className="col-span-2 glass-card p-12 flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[var(--color-brand-500)] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[var(--color-text-secondary)] font-medium">Loading organizations...</p>
              </div>
            </div>
          ) : (
            orgs?.map((org, index) => (
              <Link
                to={`/projects?orgId=${org.id}`}
                key={org.id}
                className="glass-card p-6 group flex flex-col relative overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--color-brand-500)]/10 to-[var(--color-accent-500)]/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                
                <div className="flex-1 relative z-10">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-5 shadow-inner">
                    <Building2 className="h-6 w-6 text-white group-hover:text-[var(--color-brand-400)] transition-colors duration-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[var(--color-brand-100)] transition-all duration-300">
                    {org.name}
                  </h3>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-sm font-medium text-[var(--color-text-secondary)]">
                      {org._count.projects} {org._count.projects === 1 ? 'Project' : 'Projects'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center text-sm font-semibold text-[var(--color-brand-400)] opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 relative z-10">
                  Open Workspace <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
