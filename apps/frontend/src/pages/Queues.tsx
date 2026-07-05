import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Layers, Plus, ArrowRight, Play, Pause, Activity } from 'lucide-react';

interface Queue {
  id: string;
  name: string;
  priority: number;
  concurrencyLimit: number;
  isPaused: boolean;
  _count: { jobs: number };
}

export default function Queues() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const queryClient = useQueryClient();
  const [newQueueName, setNewQueueName] = useState('');

  const { data: queues, isLoading } = useQuery<Queue[]>({
    queryKey: ['queues', projectId],
    queryFn: async () => {
      const res = await api.get(`/api/queues/${projectId}`);
      return res.data;
    },
    enabled: !!projectId,
  });

  const createQueueMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await api.post(`/api/queues/${projectId}`, { name, priority: 0, concurrencyLimit: 10 });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queues', projectId] });
      setNewQueueName('');
    }
  });

  const togglePauseMutation = useMutation({
    mutationFn: async ({ id, isPaused }: { id: string; isPaused: boolean }) => {
      const action = isPaused ? 'resume' : 'pause';
      const res = await api.put(`/api/queues/${id}/${action}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queues', projectId] });
    }
  });

  const handleCreateQueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQueueName.trim() && projectId) {
      createQueueMutation.mutate(newQueueName);
    }
  };

  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-secondary)]">
        <Layers className="w-16 h-16 text-white/10 mb-4" />
        <h2 className="text-xl font-medium text-white mb-2">No Project Selected</h2>
        <p>Please select a project from the projects page first.</p>
        <Link to="/projects" className="mt-6 btn-primary">Go to Projects</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="relative">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-[var(--color-brand-500)]/20 rounded-xl flex items-center justify-center border border-white/10">
            <Layers className="h-6 w-6 text-emerald-400" />
          </div>
          Job Queues
        </h1>
        <p className="mt-3 text-lg text-[var(--color-text-secondary)] font-medium">Manage priority queues, concurrency, and worker configuration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create New Queue Card */}
        <div className="glass-card p-6 flex flex-col justify-center border-dashed border-white/20 hover:border-emerald-500/50 hover:bg-emerald-500/[0.02]">
          <form onSubmit={handleCreateQueue} className="space-y-5">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <div className="bg-emerald-500/20 p-2 rounded-lg">
                <Plus className="h-5 w-5 text-emerald-400" />
              </div>
              New Queue
            </h3>
            <input
              type="text"
              value={newQueueName}
              onChange={(e) => setNewQueueName(e.target.value)}
              placeholder="e.g. High Priority Emails"
              className="input-field focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
            <button
              type="submit"
              disabled={createQueueMutation.isPending}
              className="w-full flex items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-medium py-2 px-4 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
            >
              {createQueueMutation.isPending ? 'Creating...' : 'Create Queue'}
            </button>
          </form>
        </div>

        {/* List Queues */}
        {isLoading ? (
          <div className="col-span-2 glass-card p-12 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[var(--color-brand-500)] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[var(--color-text-secondary)] font-medium">Loading queues...</p>
            </div>
          </div>
        ) : (
          queues?.map((queue, index) => (
            <div
              key={queue.id}
              className="glass-card p-6 group flex flex-col relative overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${queue.isPaused ? 'from-amber-500/10' : 'from-emerald-500/10'} to-transparent rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700`}></div>
              
              <div className="flex-1 relative z-10">
                <div className="flex justify-between items-start mb-5">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shadow-inner">
                    <Activity className={`h-6 w-6 transition-colors duration-300 ${queue.isPaused ? 'text-amber-500' : 'text-emerald-400'}`} />
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      togglePauseMutation.mutate({ id: queue.id, isPaused: queue.isPaused });
                    }}
                    className={`p-2.5 rounded-xl transition-all duration-300 border shadow-sm ${
                      queue.isPaused 
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:scale-110' 
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:scale-110'
                    }`}
                    title={queue.isPaused ? "Resume Queue" : "Pause Queue"}
                  >
                    {queue.isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                  </button>
                </div>
                
                <h3 className="text-2xl font-bold text-white transition flex items-center gap-3">
                  {queue.name}
                  {queue.isPaused && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)] animate-pulse-slow">
                      PAUSED
                    </span>
                  )}
                </h3>
                
                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div className="bg-black/20 border border-white/5 p-3.5 rounded-xl backdrop-blur-sm group-hover:bg-black/30 transition-colors duration-300">
                    <p className="text-xs text-[var(--color-text-secondary)] font-medium uppercase tracking-wider mb-1">Total Jobs</p>
                    <p className="text-xl font-bold text-white">{queue._count.jobs}</p>
                  </div>
                  <div className="bg-black/20 border border-white/5 p-3.5 rounded-xl backdrop-blur-sm group-hover:bg-black/30 transition-colors duration-300">
                    <p className="text-xs text-[var(--color-text-secondary)] font-medium uppercase tracking-wider mb-1">Workers</p>
                    <p className="text-xl font-bold text-white">{queue.concurrencyLimit}</p>
                  </div>
                </div>
              </div>
              
              <Link to={`/jobs?queueId=${queue.id}`} className="mt-6 flex items-center justify-end text-sm font-semibold text-emerald-400 opacity-80 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 relative z-10 w-fit self-end">
                Manage Jobs <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
