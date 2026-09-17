'use client';

import React from 'react';
import { Shield, Bell, User, Building2, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { UnitProfile, UserProfile, MonthlyTarget } from '@/lib/store/types';

interface NavbarProps {
  unit: UnitProfile;
  user: UserProfile;
  target: MonthlyTarget;
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ unit, user, target, activeTab, onNavigate }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0d1527]/95 backdrop-blur shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Brand & Badges */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-md border border-amber-400/40">
            <Shield className="h-6 w-6 text-slate-950 fill-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                CSGT <span className="text-amber-400">Content</span>
              </span>
              <span className="rounded bg-blue-900/60 px-2 py-0.5 text-[11px] font-semibold text-blue-300 border border-blue-700/50">
                Nghiệp vụ TTATGT
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-[280px] sm:max-w-md">
              {unit.short_name || unit.full_name} • {unit.parent_unit}
            </p>
          </div>
        </div>

        {/* Center/Right: Target Indicator & Officer info */}
        <div className="flex items-center gap-4">
          {/* Target Mini-Pill */}
          <button
            onClick={() => onNavigate('dashboard')}
            className={`hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              target.completed_count >= target.target_count
                ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300'
                : target.deadline_alert_level === 'urgent_warning'
                ? 'bg-red-950/60 border-red-600/80 text-red-300 animate-pulse'
                : 'bg-amber-950/40 border-amber-700/60 text-amber-300'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>Chỉ tiêu T{target.month}:</span>
            </div>
            <span className="font-bold">
              {target.completed_count}/{target.target_count} bài
            </span>
            {target.completed_count >= target.target_count ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <span className="text-[11px] opacity-80">(còn thiếu {Math.max(0, target.target_count - target.completed_count)})</span>
            )}
          </button>

          {/* User Badge */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
            <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-xs">
              {user.rank ? user.rank.slice(0, 2) : 'CB'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-200">{user.name}</div>
              <div className="text-[11px] text-slate-400">SH: {user.badge_number}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
