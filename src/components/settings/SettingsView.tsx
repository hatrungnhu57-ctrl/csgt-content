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
  Users,
  Plus,
  Trash2,
  Lock,
} from 'lucide-react';
import { UnitProfile, UserAccount, AuditLogEntry, MonthlyTarget, TeamGroup } from '@/lib/store/types';
import { store } from '@/lib/store';

interface SettingsViewProps {
  unit: UnitProfile;
  user: UserAccount;
  target: MonthlyTarget;
  auditLogs: AuditLogEntry[];
  onSaveUnitProfile: (unit: UnitProfile) => void;
  onUpdateTargetCount: (count: number) => void;
  onRefreshData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  unit,
  user,
  target,
  auditLogs,
  onSaveUnitProfile,
  onUpdateTargetCount,
  onRefreshData,
}) => {
  const isAdmin = user.role === 'admin' || user.role === 'commander';
  const [unitForm, setUnitForm] = useState<UnitProfile>(unit);
  const [targetCountInput, setTargetCountInput] = useState<number>(target.target_count || 3);
  const [activeSubTab, setActiveSubTab] = useState<'unit' | 'teams' | 'accounts' | 'target' | 'audit'>(
    isAdmin ? 'teams' : 'unit'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New team form state
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamLeader, setNewTeamLeader] = useState('');
  const [newTeamTarget, setNewTeamTarget] = useState(3);

  // New account form state
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('123');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'team' | 'officer'>('team');
  const [newTeamId, setNewTeamId] = useState(unit.teams[0]?.id || '');

  const accounts = store.getAccounts();

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

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    const newTeam: TeamGroup = {
      id: `to-${Date.now()}`,
      name: newTeamName.trim(),
      leader_name: newTeamLeader.trim() || 'Đồng chí Tổ trưởng',
      member_count: 5,
      target_count: newTeamTarget,
    };

    const updatedTeams = [...(unitForm.teams || []), newTeam];
    const updatedUnit = { ...unitForm, teams: updatedTeams };
    setUnitForm(updatedUnit);
    onSaveUnitProfile(updatedUnit);

    setNewTeamName('');
    setNewTeamLeader('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleDeleteTeam = (teamId: string) => {
    if (confirm('Xác nhận xóa tổ này khỏi danh sách quản lý?')) {
      const updatedTeams = (unitForm.teams || []).filter(t => t.id !== teamId);
      const updatedUnit = { ...unitForm, teams: updatedTeams };
      setUnitForm(updatedUnit);
      onSaveUnitProfile(updatedUnit);
      onRefreshData();
    }
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newDisplayName.trim()) return;

    const selectedTeam = unitForm.teams.find(t => t.id === newTeamId);

    store.createAccount({
      username: newUsername.trim(),
      password: newPassword.trim(),
      name: newDisplayName.trim(),
      badge_number: `SH-${Math.floor(100 + Math.random() * 900)}`,
      rank: 'Đại úy',
      role: newRole,
      team_id: newRole === 'team' ? newTeamId : undefined,
      team_name: newRole === 'team' ? selectedTeam?.name : undefined,
      unit_id: unit.id,
    });

    setNewUsername('');
    setNewDisplayName('');
    onRefreshData();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleDeleteAccount = (accId: string) => {
    if (confirm('Xác nhận xóa tài khoản này?')) {
      store.deleteAccount(accId);
      onRefreshData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-800 bg-[#11192e] p-5 shadow-lg space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded border border-blue-800/60">
          HỆ THỐNG PHÂN QUYỀN, QUẢN LÝ TỔ & HỒ SƠ ĐƠN VỊ
        </span>
        <h1 className="text-xl font-black tracking-tight text-white">
          Quản lý tài khoản các Tổ, Cấu hình chỉ tiêu tháng & Nhật ký kiểm toán
        </h1>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {isAdmin && (
          <button
            onClick={() => setActiveSubTab('teams')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeSubTab === 'teams'
                ? 'bg-blue-700 text-white shadow-md shadow-blue-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Users className="h-4 w-4 text-amber-400" /> Quản lý các Tổ công tác ({unitForm.teams?.length || 0})
          </button>
        )}

        {isAdmin && (
          <button
            onClick={() => setActiveSubTab('accounts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeSubTab === 'accounts'
                ? 'bg-blue-700 text-white shadow-md shadow-blue-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Key className="h-4 w-4 text-emerald-400" /> Cấp & Quản lý Tài khoản ({accounts.length})
          </button>
        )}

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
          <Target className="h-4 w-4" /> Chỉ tiêu bài/tháng
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeSubTab === 'audit'
                ? 'bg-blue-700 text-white shadow-md shadow-blue-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Activity className="h-4 w-4" /> Nhật ký thao tác
          </button>
        )}
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-600 text-xs font-bold text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> Đã cập nhật thành công các thay đổi!
        </div>
      )}

      {/* 1. QUẢN LÝ CÁC TỔ CÔNG TÁC (TEAMS) */}
      {activeSubTab === 'teams' && isAdmin && (
        <div className="space-y-6">
          {/* Add new team form */}
          <form onSubmit={handleAddTeam} className="rounded-xl border border-slate-800 bg-[#111827] p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Plus className="h-4 w-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase text-slate-100">THÊM TỔ CÔNG TÁC MỚI VÀO ĐỘI</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Tên Tổ công tác / Đội trực:</label>
                <input
                  type="text"
                  placeholder="VD: Tổ 4 - Tuần tra lưu động ban đêm"
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Tổ trưởng phụ trách:</label>
                <input
                  type="text"
                  placeholder="VD: Đại úy Phạm Văn D"
                  value={newTeamLeader}
                  onChange={e => setNewTeamLeader(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Chỉ tiêu bài / tháng:</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={newTeamTarget}
                  onChange={e => setNewTeamTarget(parseInt(e.target.value, 10) || 3)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-amber-400 font-bold focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-950"
              >
                <Plus className="h-4 w-4" /> THÊM TỔ MỚI
              </button>
            </div>
          </form>

          {/* List of current teams */}
          <div className="rounded-xl border border-slate-800 bg-[#111827] p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-200 pb-2 border-b border-slate-800">
              DANH SÁCH CÁC TỔ CÔNG TÁC TRONG ĐƠN VỊ ({unitForm.teams?.length || 0})
            </h3>

            <div className="divide-y divide-slate-800/80">
              {unitForm.teams.map((t, i) => (
                <div key={t.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{t.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                        Chỉ tiêu: {t.target_count} bài/tháng
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Phụ trách: <strong className="text-slate-200">{t.leader_name}</strong> • Quân số: {t.member_count} CBCS
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteTeam(t.id)}
                    className="p-2 rounded bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-300 border border-slate-700"
                    title="Xóa tổ"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. CẤP & QUẢN LÝ TÀI KHOẢN (ACCOUNTS) */}
      {activeSubTab === 'accounts' && isAdmin && (
        <div className="space-y-6">
          {/* Create Account Form */}
          <form onSubmit={handleCreateAccount} className="rounded-xl border border-slate-800 bg-[#111827] p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Key className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase text-slate-100">CẤP TÀI KHOẢN MỚI CHO TỔ / CÁN BỘ</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Tên đăng nhập (Username):</label>
                <input
                  type="text"
                  placeholder="VD: to4, cb_tuan..."
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Mật khẩu:</label>
                <input
                  type="text"
                  placeholder="Mật khẩu"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Tên hiển thị:</label>
                <input
                  type="text"
                  placeholder="VD: Tổ 4 - Tuần tra ��êm"
                  value={newDisplayName}
                  onChange={e => setNewDisplayName(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Gán vào Tổ:</label>
                <select
                  value={newTeamId}
                  onChange={e => setNewTeamId(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
                >
                  {unitForm.teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-950"
              >
                <Plus className="h-4 w-4" /> CẤP TÀI KHOẢN MỚI
              </button>
            </div>
          </form>

          {/* List of accounts */}
          <div className="rounded-xl border border-slate-800 bg-[#111827] p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-200 pb-2 border-b border-slate-800">
              DANH SÁCH TÀI KHOẢN ĐANG HOẠT ĐỘNG ({accounts.length})
            </h3>

            <div className="divide-y divide-slate-800/80">
              {accounts.map(acc => (
                <div key={acc.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm text-white">{acc.name}</strong>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        acc.role === 'admin'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}>
                        {acc.role === 'admin' ? 'CHỦ HỆ THỐNG / CHỈ HUY' : 'TÀI KHOẢN TỔ'}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px] font-mono">
                      Username: <strong className="text-amber-400">{acc.username}</strong> | Mật khẩu: <strong className="text-slate-300">{acc.password}</strong>
                      {acc.team_name && <span> | {acc.team_name}</span>}
                    </div>
                  </div>

                  {acc.role !== 'admin' && (
                    <button
                      type="button"
                      onClick={() => handleDeleteAccount(acc.id)}
                      className="p-2 rounded bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-300 border border-slate-700"
                      title="Xóa tài khoản"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. HỒ SƠ ĐƠN VỊ (UNIT PROFILE) */}
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
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Tên rút gọn thường gọi:</label>
              <input
                type="text"
                value={unitForm.short_name}
                onChange={e => setUnitForm({ ...unitForm, short_name: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Đơn vị cấp trên trực tiếp:</label>
              <input
                type="text"
                value={unitForm.parent_unit}
                onChange={e => setUnitForm({ ...unitForm, parent_unit: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Địa bàn phụ trách quản lý:</label>
              <input
                type="text"
                value={unitForm.location}
                onChange={e => setUnitForm({ ...unitForm, location: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300">Cách ghi tên lực lượng trong bài:</label>
              <input
                type="text"
                value={unitForm.force_display_name}
                onChange={e => setUnitForm({ ...unitForm, force_display_name: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300">Tên trang/kênh truyền thông:</label>
              <input
                type="text"
                value={unitForm.channel_name}
                onChange={e => setUnitForm({ ...unitForm, channel_name: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>
        </form>
      )}

      {/* 4. CHỈ TIÊU (TARGET SETTING) */}
      {activeSubTab === 'target' && (
        <div className="rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-6 max-w-xl">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white">CHỈ TIÊU TIN BÀI TUYÊN TRUYỀN (MỤC I, VI)</h2>
            <p className="text-xs text-slate-400">
              Mặc định mỗi tổ/cán bộ được giao <strong>03 tin/bài mỗi tháng</strong>.
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

      {/* 5. AUDIT LOGS */}
      {activeSubTab === 'audit' && isAdmin && (
        <div className="rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white">NHẬT KÝ THAO TÁC HỆ THỐNG (AUDIT LOGS - SECTION XXXV)</h2>
            <p className="text-xs text-slate-400">
              Ghi lại mọi hoạt động đăng nhập, tạo tài khoản, tạo bài, bóc tách và xuất bản.
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
