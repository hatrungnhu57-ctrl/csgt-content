'use client';

import React, { useState } from 'react';
import {
  Building2,
  Shield,
  Save,
  CheckCircle2,
  Target,
  FileText,
  History,
  Activity,
  User,
  Key,
} from 'lucide-react';
import { UnitProfile, UserProfile, AuditLogEntry, MonthlyTarget } from '@/lib/store/types';

interface SettingsViewProps {
  unit: UnitProfile;
  user: UserProfile;
  target: MonthlyTarget;
  auditLogs: AuditLogEntry[];
  onSaveUnitProfile: (unit: UnitProfile) => void;
  onUpdateTargetCount: (count: number) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  unit,
  user,
  target,
  auditLogs,
  onSaveUnitProfile,
  onUpdateTargetCount,
}) => {
  const [unitForm, setUnitForm] = useState<UnitProfile>(unit);
  const [targetCountInput, setTargetCountInput] = useState<number>(target.target_count || 3);
  const [activeSubTab, setActiveSubTab] = useState<'unit' | 'target' | 'audit'>('unit');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveUnit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveUnitProfile(unitForm);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveTarget = () => {
    onUpdateTargetCount(targetCountInput);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-800 bg-[#11192e] p-5 shadow-lg space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded border border-blue-800/60">
          HỆ THỐNG CÀI ĐẶT & HỒ SƠ ĐƠN VỊ (MỤC XXXIII, XXXV)
        </span>
        <h1 className="text-xl font-black tracking-tight text-white">
          Cấu hình thông tin nghiệp vụ, Chỉ tiêu tháng & Nhật ký kiểm toán (Audit Logs)
        </h1>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('unit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeSubTab === 'unit'
              ? 'bg-blue-700 text-white shadow-md shadow-blue-950'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Building2 className="h-4 w-4" /> Hồ sơ đơn vị CSGT
        </button>

        <button
          onClick={() => setActiveSubTab('target')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeSubTab === 'target'
              ? 'bg-blue-700 text-white shadow-md shadow-blue-950'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Target className="h-4 w-4" /> Cấu hình chỉ tiêu (03 bài/tháng)
        </button>

        <button
          onClick={() => setActiveSubTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeSubTab === 'audit'
              ? 'bg-blue-700 text-white shadow-md shadow-blue-950'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Activity className="h-4 w-4" /> Nhật ký thao tác (Audit Logs)
        </button>
      </div>

      {/* Saved Success Notification */}
      {savedSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-600 text-xs font-bold text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> Đã lưu thành công các thay đổi!
        </div>
      )}

      {/* SubTab 1: Unit Profile */}
      {activeSubTab === 'unit' && (
        <form onSubmit={handleSaveUnit} className="rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-6">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">THÔNG TIN ĐƠN VỊ CÔNG TÁC (SECTION XXXIII)</h2>
              <p className="text-xs text-slate-400">
                Thông tin này được dùng làm chuẩn xưng danh trong mọi bài viết tuyên truyền.
              </p>
            </div>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-950"
            >
              <Save className="h-4 w-4" /> LƯU HỒ SƠ ĐƠN VỊ
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Tên đầy đủ của đơn vị:</label>
              <input
                type="text"
                value={unitForm.full_name}
                onChange={e => setUnitForm({ ...unitForm, full_name: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Tên rút gọn thường gọi:</label>
              <input
                type="text"
                value={unitForm.short_name}
                onChange={e => setUnitForm({ ...unitForm, short_name: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Đơn vị cấp trên trực tiếp:</label>
              <input
                type="text"
                value={unitForm.parent_unit}
                onChange={e => setUnitForm({ ...unitForm, parent_unit: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Địa bàn phụ trách quản lý:</label>
              <input
                type="text"
                value={unitForm.location}
                onChange={e => setUnitForm({ ...unitForm, location: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300">Cách ghi tên lực lượng trong bài:</label>
              <input
                type="text"
                value={unitForm.force_display_name}
                onChange={e => setUnitForm({ ...unitForm, force_display_name: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300">Tên trang/kênh truyền thông:</label>
              <input
                type="text"
                value={unitForm.channel_name}
                onChange={e => setUnitForm({ ...unitForm, channel_name: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </form>
      )}

      {/* SubTab 2: Target Configuration */}
      {activeSubTab === 'target' && (
        <div className="rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-6 max-w-xl">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white">CHỈ TIÊU TIN BÀI TUYÊN TRUYỀN (MỤC I, VI)</h2>
            <p className="text-xs text-slate-400">
              Mặc định mỗi cán bộ được giao <strong>03 tin/bài mỗi tháng</strong> theo quy định.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Số lượng tin bài chỉ tiêu trong tháng:</label>
              <input
                type="number"
                min={1}
                max={30}
                value={targetCountInput}
                onChange={e => setTargetCountInput(parseInt(e.target.value, 10) || 3)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-bold text-amber-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              onClick={handleSaveTarget}
              className="px-6 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-950"
            >
              Cập nhật chỉ tiêu
            </button>
          </div>
        </div>
      )}

      {/* SubTab 3: Audit Logs */}
      {activeSubTab === 'audit' && (
        <div className="rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white">NHẬT KÝ THAO TÁC HỆ THỐNG (AUDIT LOGS - SECTION XXXV)</h2>
            <p className="text-xs text-slate-400">
              Ghi lại mọi hoạt động tạo bài, sửa đổi, AI bóc tách, thẩm định và xuất bản.
            </p>
          </div>

          <div className="divide-y divide-slate-800/80 max-h-[500px] overflow-y-auto">
            {auditLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">Chưa có nhật ký nào.</div>
            ) : (
              auditLogs.map(log => (
                <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded text-[10px] border border-blue-800">
                        {log.action}
                      </span>
                      <span className="font-semibold text-slate-200">{log.user_name}</span>
                    </div>
                    <p className="text-slate-300">{log.description}</p>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleString('vi-VN')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
