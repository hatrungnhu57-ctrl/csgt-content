'use client';

import React from 'react';
import { Shield, Bell, User, Building2, CheckCircle2, AlertTriangle, Clock, LogOut, Users, ShieldAlert } from 'lucide-react';
import { UnitProfile, UserAccount, MonthlyTarget } from '@/lib/store/types';

interface NavbarProps {
  unit: UnitProfile;
  user: UserAccount | null;
  target: MonthlyTarget;
  activeTab: string;
  onNavigate: (tab: string) => void;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  unit,
  user,
  target,
  activeTab,
  onNavigate,
  onOpenLogin,
  onLogout,
}) => {
  const isAdmin = user?.role === 'admin' || user?.role === 'commander';

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
                {isAdmin ? 'Quản trị Chỉ huy' : 'Tài khoản Tổ công tác'}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-[280px] sm:max-w-md">
              {unit.short_name || unit.full_name} • {unit.parent_unit}
            </p>
          </div>
        </div>

        {/* Center/Right: Target Indicator & Officer info */}
        <div className="flex items-center gap-3">
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
              <span>{isAdmin ? 'Chỉ tiêu Đội T9:' : `Chỉ tiêu ${user?.team_name ? user.team_name.split('-')[0] : 'Tổ'} T9:`}</span>
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

          {/* User Profile Badge & Switch Account */}
          {user ? (
            <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors text-left"
                title="Bấm để đổi tài khoản Tổ / Chỉ huy"
              >
                <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${
                  isAdmin ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' : 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                }`}>
                  {isAdmin ? 'BCH' : user.username.toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-slate-100 flex items-center gap-1">
                    {user.name}
                    <span className="text-[10px] text-amber-400 font-normal">▼</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {isAdmin ? 'Chỉ huy đơn vị' : user.team_name || 'Tổ công tác'}
                  </div>
                </div>
              </button>

              <button
                onClick={onLogout}
                className="p-2 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-300 border border-slate-700 transition-colors"
                title="Đăng xuất"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-4 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-950"
            >
              Đăng nhập
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
