'use client';

import React from 'react';
import {
  LayoutDashboard,
  PenTool,
  CheckSquare,
  Sparkles,
  Archive,
  Video,
  Settings,
  ShieldAlert,
  FileText,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  pendingReviewCount: number;
  draftCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
  pendingReviewCount,
  draftCount,
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Tổng quan (Dashboard)',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'writer',
      label: 'Soạn tin / bài mới',
      icon: PenTool,
      badge: draftCount > 0 ? `${draftCount} nháp` : null,
      badgeColor: 'bg-slate-700 text-slate-300',
    },
    {
      id: 'review',
      label: 'Kiểm duyệt & Thẩm định',
      icon: CheckSquare,
      badge: pendingReviewCount > 0 ? `${pendingReviewCount} bài` : null,
      badgeColor: 'bg-amber-600/80 text-white font-bold animate-pulse',
    },
    {
      id: 'topics',
      label: 'Gợi ý chủ đề',
      icon: Sparkles,
      badge: null,
    },
    {
      id: 'library',
      label: 'Kho tin bài',
      icon: Archive,
      badge: null,
    },
    {
      id: 'video',
      label: 'Kịch bản Video ngắn',
      icon: Video,
      badge: '9:16',
      badgeColor: 'bg-blue-900/60 text-blue-300 border border-blue-700',
    },
    {
      id: 'settings',
      label: 'Hồ sơ đơn vị & Cài đặt',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-[#0c1222] min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4">
      <div className="space-y-6">
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Nghiệp vụ tuyên truyền
          </div>
          <nav className="space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-700 text-white shadow-md shadow-blue-950 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-700 text-slate-300'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Guardrail Core Rules Notice */}
        <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-amber-400">
            <ShieldAlert className="h-4 w-4 text-amber-400" />
            <span>NGUYÊN TẮC CỐT LÕI</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            <span className="text-white font-semibold">ĐÚNG – NGẮN – RÕ – AN TOÀN THÔNG TIN.</span>
            <br />
            AI hoạt động dưới chế độ Source-Lock, không tự bịa số liệu hay pháp luật.
          </p>
        </div>
      </div>

      {/* Footer system info */}
      <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Phiên bản v1.0.0</span>
        <span className="text-emerald-400 flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          Hệ thống sẵn sàng
        </span>
      </div>
    </aside>
  );
};
