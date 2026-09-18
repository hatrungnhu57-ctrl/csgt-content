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
  Eye,
  EyeOff,
  AlertCircle,
  Edit2,
  Search,
  Check,
  X,
  BadgeCheck,
  Sparkles,
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
    isAdmin ? 'accounts' : 'unit'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Đã cập nhật thành công các thay đổi!');
  const [accountError, setAccountError] = useState('');

  // Search & filter accounts
  const [accountSearch, setAccountSearch] = useState('');

  // New team form state
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamLeader, setNewTeamLeader] = useState('');
  const [newTeamTarget, setNewTeamTarget] = useState(3);

  // New account form state
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('123');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'commander' | 'team' | 'officer'>('team');
  const [newTeamId, setNewTeamId] = useState(unit.teams[0]?.id || '');

  // Editing account state
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editPassword, setEditPassword] = useState('');
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'commander' | 'team' | 'officer'>('team');
  const [editTeamId, setEditTeamId] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);

  const accounts = store.getAccounts();

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveUnit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveUnitProfile(unitForm);
    showNotification('Đã lưu thông tin hồ sơ đơn vị CSGT thành công!');
  };

  const handleSaveTarget = () => {
    onUpdateTargetCount(targetCountInput);
    showNotification('Đã cập nhật chỉ tiêu tin bài tháng thành công!');
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
    showNotification(`Đã thêm tổ mới: "${newTeam.name}"`);
  };

  const handleDeleteTeam = (teamId: string) => {
    if (confirm('Xác nhận xóa tổ này khỏi danh sách quản lý?')) {
      const updatedTeams = (unitForm.teams || []).filter(t => t.id !== teamId);
      const updatedUnit = { ...unitForm, teams: updatedTeams };
      setUnitForm(updatedUnit);
      onSaveUnitProfile(updatedUnit);
      onRefreshData();
      showNotification('Đã xóa tổ công tác!');
    }
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setAccountError('');

    const cleanUsername = newUsername.trim().toLowerCase();
    const cleanDisplayName = newDisplayName.trim();
    const cleanPassword = newPassword.trim();

    if (!cleanUsername) {
      setAccountError('Tên đăng nhập không được để trống!');
      return;
    }
    if (!cleanPassword) {
      setAccountError('Mật khẩu không được để trống!');
      return;
    }
    if (!cleanDisplayName) {
      setAccountError('Tên hiển thị cán bộ/tổ không được để trống!');
      return;
    }

    const selectedTeam = unitForm.teams.find(t => t.id === newTeamId);

    const result = store.createAccount({
      username: cleanUsername,
      password: cleanPassword,
      name: cleanDisplayName,
      badge_number: `SH-${Math.floor(100 + Math.random() * 900)}`,
      rank: newRole === 'admin' ? 'Trung tá' : 'Đại úy',
      role: newRole,
      team_id: newRole === 'team' ? newTeamId : undefined,
      team_name: newRole === 'team' ? selectedTeam?.name : undefined,
      unit_id: unit.id,
    });

    if (!result.success) {
      setAccountError(result.error || 'Không thể tạo tài khoản!');
      return;
    }

    setNewUsername('');
    setNewDisplayName('');
    setNewPassword('123');
    setAccountError('');
    onRefreshData();
    showNotification(`Cấp thành công tài khoản: "${cleanUsername}" cho ${cleanDisplayName}!`);
  };

  const startEditAccount = (acc: UserAccount) => {
    setEditingAccountId(acc.id);
    setEditDisplayName(acc.name);
    setEditPassword(acc.password);
    setEditRole(acc.role);
    setEditTeamId(acc.team_id || unitForm.teams[0]?.id || '');
    setAccountError('');
  };

  const cancelEditAccount = () => {
    setEditingAccountId(null);
    setAccountError('');
  };

  const handleSaveEditAccount = (accId: string) => {
    const selectedTeam = unitForm.teams.find(t => t.id === editTeamId);
    const result = store.updateAccount(accId, {
      name: editDisplayName.trim(),
      password: editPassword.trim(),
      role: editRole,
      team_id: editRole === 'team' ? editTeamId : undefined,
      team_name: editRole === 'team' ? selectedTeam?.name : undefined,
    });

    if (!result.success) {
      setAccountError(result.error || 'Cập nhật tài khoản thất bại!');
      return;
    }

    setEditingAccountId(null);
    setAccountError('');
    onRefreshData();
    showNotification('Đã cập nhật thông tin tài khoản thành công!');
  };

  const handleDeleteAccount = (accId: string) => {
    if (confirm('Xác nhận xóa vĩnh viễn tài khoản này?')) {
      store.deleteAccount(accId);
      onRefreshData();
      showNotification('Đã xóa tài khoản!');
    }
  };

  const filteredAccounts = accounts.filter(acc => {
    if (!accountSearch.trim()) return true;
    const q = accountSearch.toLowerCase();
    return (
      acc.username.toLowerCase().includes(q) ||
      acc.name.toLowerCase().includes(q) ||
      (acc.team_name && acc.team_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-[#0f172a] via-[#111c35] to-[#0f172a] p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-amber-400 to-emerald-500" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-700/60 flex items-center gap-1.5">
                <Shield className="h-3 w-3 text-amber-400" /> HỆ THỐNG QUẢN TRỊ & PHÂN QUYỀN CSGT
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                • Phiên bản dữ liệu Source-Lock
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Quản lý Tài khoản, Tổ công tác & Cấu hình Đơn vị
            </h1>
            <p className="text-xs text-slate-400">
              Phân quyền chặt chẽ theo từng Tổ tuần tra kiểm soát và Chỉ huy Đội duyệt bài
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-900/80 border border-slate-700/70 px-3.5 py-2 rounded-xl text-slate-300">
            <User className="h-4 w-4 text-amber-400" />
            <span>Tài khoản hiện tại: <strong className="text-white">{user.name}</strong> ({isAdmin ? 'Chỉ huy / Quản trị' : 'Tổ công tác'})</span>
          </div>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 pb-3">
        {isAdmin && (
          <button
            onClick={() => setActiveSubTab('accounts')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'accounts'
                ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-lg shadow-blue-950/80 border border-blue-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <Key className="h-4 w-4 text-emerald-400" /> Cấp & Quản lý Tài khoản ({accounts.length})
          </button>
        )}

        {isAdmin && (
          <button
            onClick={() => setActiveSubTab('teams')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'teams'
                ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-lg shadow-blue-950/80 border border-blue-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <Users className="h-4 w-4 text-amber-400" /> Quản lý các Tổ công tác ({unitForm.teams?.length || 0})
          </button>
        )}

        <button
          onClick={() => setActiveSubTab('unit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'unit'
              ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-lg shadow-blue-950/80 border border-blue-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
          }`}
        >
          <Building2 className="h-4 w-4 text-blue-400" /> Hồ sơ chuẩn danh xưng CSGT
        </button>

        <button
          onClick={() => setActiveSubTab('target')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'target'
              ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-lg shadow-blue-950/80 border border-blue-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
          }`}
        >
          <Target className="h-4 w-4 text-red-400" /> Chỉ tiêu bài/tháng
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'audit'
                ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-lg shadow-blue-950/80 border border-blue-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <Activity className="h-4 w-4 text-emerald-400" /> Nhật ký kiểm toán ({auditLogs.length})
          </button>
        )}
      </div>

      {/* Global alert messages */}
      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-600 text-xs font-bold text-emerald-300 flex items-center gap-2.5 shadow-lg shadow-emerald-950/50 animate-in fade-in duration-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* TAB 1: CẤP & QUẢN LÝ TÀI KHOẢN (ACCOUNTS) */}
      {activeSubTab === 'accounts' && isAdmin && (
        <div className="space-y-6">
          {/* Form cấp tài khoản mới */}
          <form onSubmit={handleCreateAccount} className="rounded-2xl border border-slate-800 bg-[#11192e] p-6 space-y-4 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <Key className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight">CẤP TÀI KHOẢN MỚI CHO TỔ / CÁN BỘ</h3>
                  <p className="text-[11px] text-slate-400">Tạo tài khoản đăng nhập cho từng Tổ công tác để phân bổ và theo dõi chỉ tiêu</p>
                </div>
              </div>
            </div>

            {accountError && (
              <div className="p-3 rounded-xl bg-red-950/90 border border-red-700 text-red-200 flex items-center gap-2 text-xs">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                <span>{accountError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 flex items-center gap-1">
                  Tên đăng nhập (Username) <span className="text-red-400">*</span>:
                </label>
                <input
                  type="text"
                  placeholder="VD: to4, cb_tuan, to_dem..."
                  value={newUsername}
                  onChange={e => {
                    setNewUsername(e.target.value.toLowerCase().replace(/\s+/g, ''));
                    if (accountError) setAccountError('');
                  }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2 text-xs text-white focus:border-amber-400 focus:outline-none font-mono"
                  required
                />
                <span className="text-[10px] text-slate-500">Tự động viết thường, không dấu cách</span>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 flex items-center gap-1">
                  Mật khẩu khởi tạo <span className="text-red-400">*</span>:
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Mật khẩu"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-3.5 pr-9 py-2 text-xs text-white focus:border-amber-400 focus:outline-none font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showNewPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-500">Mặc định: 123 (có thể đổi)</span>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 flex items-center gap-1">
                  Tên hiển thị Tổ / Cán bộ <span className="text-red-400">*</span>:
                </label>
                <input
                  type="text"
                  placeholder="VD: Tổ 4 - Tuần tra đêm"
                  value={newDisplayName}
                  onChange={e => setNewDisplayName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Gán vào Tổ công tác:</label>
                <select
                  value={newTeamId}
                  onChange={e => setNewTeamId(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                >
                  {unitForm.teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    checked={newRole === 'team'}
                    onChange={() => setNewRole('team')}
                    className="text-blue-600 focus:ring-0"
                  />
                  <span>Tài khoản Tổ công tác</span>
                </label>
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    checked={newRole === 'admin'}
                    onChange={() => setNewRole('admin')}
                    className="text-amber-500 focus:ring-0"
                  />
                  <span>Tài khoản Chỉ huy (Toàn quyền)</span>
                </label>
              </div>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold shadow-lg shadow-emerald-950/80 border border-emerald-500/30 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> CẤP TÀI KHOẢN MỚI
              </button>
            </div>
          </form>

          {/* Danh sách tài khoản đang có */}
          <div className="rounded-2xl border border-slate-800 bg-[#11192e] p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-400" />
                <h3 className="text-xs font-bold uppercase text-slate-200">
                  DANH SÁCH TÀI KHOẢN ĐANG HOẠT ĐỘNG ({accounts.length})
                </h3>
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm tài khoản, tên cán bộ..."
                  value={accountSearch}
                  onChange={e => setAccountSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/90 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredAccounts.map(acc => {
                const isThisAdmin = acc.role === 'admin';
                const isEditing = editingAccountId === acc.id;

                return (
                  <div
                    key={acc.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isThisAdmin
                        ? 'bg-gradient-to-br from-amber-950/20 to-slate-900/80 border-amber-800/40'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {isEditing ? (
                      /* Form chỉnh sửa inline */
                      <div className="space-y-3 text-xs">
                        <div className="font-bold text-amber-400 flex items-center justify-between">
                          <span>Chỉnh sửa tài khoản: {acc.username}</span>
                          <span className="text-[10px] text-slate-400">ID: {acc.id}</span>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-300">Tên hiển thị:</label>
                          <input
                            type="text"
                            value={editDisplayName}
                            onChange={e => setEditDisplayName(e.target.value)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-300">Đổi mật khẩu mới:</label>
                          <div className="relative">
                            <input
                              type={showEditPassword ? 'text' : 'password'}
                              value={editPassword}
                              onChange={e => setEditPassword(e.target.value)}
                              className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-3 pr-8 py-1.5 text-xs text-white font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => setShowEditPassword(!showEditPassword)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                            >
                              {showEditPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </button>
                          </div>
                        </div>

                        {acc.role !== 'admin' && (
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-300">Chuyển sang Tổ:</label>
                            <select
                              value={editTeamId}
                              onChange={e => setEditTeamId(e.target.value)}
                              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
                            >
                              {unitForm.teams.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={cancelEditAccount}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                          >
                            <X className="h-3.5 w-3.5" /> Hủy
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEditAccount(acc.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                          >
                            <Check className="h-3.5 w-3.5" /> Lưu thay đổi
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Card hiển thị thông tin */
                      <div className="flex flex-col justify-between h-full space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <strong className="text-sm font-bold text-white">{acc.name}</strong>
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                isThisAdmin
                                  ? 'bg-amber-950 text-amber-300 border border-amber-700'
                                  : 'bg-blue-950 text-blue-300 border border-blue-700'
                              }`}>
                                {isThisAdmin ? 'CHỈ HUY ĐỘI' : 'TỔ CÔNG TÁC'}
                              </span>
                            </div>
                            <div className="text-slate-400 text-[11px]">
                              {acc.team_name || 'Bộ chỉ huy & Ban Quản trị đơn vị'}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => startEditAccount(acc)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                              title="Sửa / Đổi mật khẩu"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            {!isThisAdmin && (
                              <button
                                type="button"
                                onClick={() => handleDeleteAccount(acc.id)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-300 border border-slate-700"
                                title="Xóa tài khoản"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono flex items-center justify-between text-slate-300">
                          <div>
                            TK: <strong className="text-amber-400">{acc.username}</strong>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>MK: <strong className="text-slate-200">{acc.password}</strong></span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QUẢN LÝ CÁC TỔ CÔNG TÁC (TEAMS) */}
      {activeSubTab === 'teams' && isAdmin && (
        <div className="space-y-6">
          <form onSubmit={handleAddTeam} className="rounded-2xl border border-slate-800 bg-[#11192e] p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Plus className="h-4 w-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase text-slate-100">THÊM TỔ CÔNG TÁC MỚI VÀO ĐƠN VỊ</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Tên Tổ công tác / Tuyến phụ trách:</label>
                <input
                  type="text"
                  placeholder="VD: Tổ 4 - Tuần tra lưu động ban đêm"
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Đồng chí Tổ trưởng phụ trách:</label>
                <input
                  type="text"
                  placeholder="VD: Đại úy Phạm Văn D"
                  value={newTeamLeader}
                  onChange={e => setNewTeamLeader(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Chỉ tiêu tin bài / tháng:</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={newTeamTarget}
                  onChange={e => setNewTeamTarget(parseInt(e.target.value, 10) || 3)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2 text-xs text-amber-400 font-bold focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-950/80 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> THÊM TỔ CÔNG TÁC
              </button>
            </div>
          </form>

          {/* List of current teams */}
          <div className="rounded-2xl border border-slate-800 bg-[#11192e] p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase text-slate-200 pb-3 border-b border-slate-800">
              DANH SÁCH CÁC TỔ CÔNG TÁC TRONG ĐƠN VỊ ({unitForm.teams?.length || 0})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {unitForm.teams.map((t) => (
                <div key={t.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-sm text-white leading-tight">{t.name}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteTeam(t.id)}
                        className="p-1 rounded bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-300 border border-slate-700 shrink-0"
                        title="Xóa tổ"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Phụ trách: <strong className="text-slate-200">{t.leader_name}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                    <span className="text-[11px] text-slate-400">Quân số: {t.member_count} CBCS</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                      Chỉ tiêu: {t.target_count} bài/tháng
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HỒ SƠ ĐƠN VỊ (UNIT PROFILE) */}
      {activeSubTab === 'unit' && (
        <form onSubmit={handleSaveUnit} className="rounded-2xl border border-slate-800 bg-[#11192e] p-6 space-y-6 shadow-xl">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase">HỒ SƠ ĐƠN VỊ & QUY CÁCH XƯNG DANH</h2>
              <p className="text-xs text-slate-400">
                Thông tin này được dùng làm chuẩn danh xưng nghiệp vụ trong toàn bộ bài viết tuyên truyền.
              </p>
            </div>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-bold shadow-lg shadow-blue-950 cursor-pointer"
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
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Tên rút gọn thường gọi:</label>
              <input
                type="text"
                value={unitForm.short_name}
                onChange={e => setUnitForm({ ...unitForm, short_name: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Đơn vị cấp trên trực tiếp:</label>
              <input
                type="text"
                value={unitForm.parent_unit}
                onChange={e => setUnitForm({ ...unitForm, parent_unit: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Địa bàn phụ trách quản lý:</label>
              <input
                type="text"
                value={unitForm.location}
                onChange={e => setUnitForm({ ...unitForm, location: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300">Cách ghi tên lực lượng trong bài:</label>
              <input
                type="text"
                value={unitForm.force_display_name}
                onChange={e => setUnitForm({ ...unitForm, force_display_name: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300">Tên trang/kênh truyền thông xuất bản:</label>
              <input
                type="text"
                value={unitForm.channel_name}
                onChange={e => setUnitForm({ ...unitForm, channel_name: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Smart AI Engine & API Key Setting */}
            <div className="md:col-span-2 pt-4 border-t border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase">CẤU HÌNH BỘ NÃO AI THÔNG MINH (TÙY CHỌN ONLINE)</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mặc định hệ thống sử dụng <strong>Rule-Based Engine (Chạy an toàn Offline 100%)</strong>. Nếu đơn vị có API Key của các mô hình AI trực tuyến, bạn có thể điền vào dưới đây để kích hoạt văn phong báo chí thông minh và linh hoạt hơn.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Nhà cung cấp AI:</label>
                  <select
                    value={unitForm.ai_provider || 'rule_based'}
                    onChange={e => setUnitForm({ ...unitForm, ai_provider: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:outline-none font-medium"
                  >
                    <option value="rule_based">Rule-Based CSGT (Offline - Khuyên dùng nội bộ)</option>
                    <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
                    <option value="claude">Anthropic Claude (Claude 3.5 Sonnet)</option>
                    <option value="gemini">Google Gemini (Gemini 1.5 Flash)</option>
                    <option value="deepseek">DeepSeek (DeepSeek-V3)</option>
                  </select>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-300">API Key trực tuyến (Bảo mật):</label>
                  <input
                    type="password"
                    placeholder="Nhập sk-..., anthropic-..., gemini-... (nếu có)"
                    value={unitForm.api_key || ''}
                    onChange={e => setUnitForm({ ...unitForm, api_key: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 4: CHỈ TIÊU (TARGET SETTING) */}
      {activeSubTab === 'target' && (
        <div className="rounded-2xl border border-slate-800 bg-[#11192e] p-6 space-y-6 max-w-xl shadow-xl">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white uppercase">CẤU HÌNH CHỈ TIÊU TIN BÀI TUYÊN TRUYỀN</h2>
            <p className="text-xs text-slate-400">
              Mặc định giao <strong>03 tin/bài mỗi tháng</strong> cho từng Tổ / Cán bộ.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Số lượng tin bài chỉ tiêu chung:</label>
              <input
                type="number"
                min={1}
                max={30}
                value={targetCountInput}
                onChange={e => setTargetCountInput(parseInt(e.target.value, 10) || 3)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-sm font-bold text-amber-400 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveTarget}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-950 cursor-pointer"
            >
              <Save className="h-4 w-4" /> CẬP NHẬT CHỈ TIÊU
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: NHẬT KÝ KIỂM TOÁN (AUDIT LOGS) */}
      {activeSubTab === 'audit' && isAdmin && (
        <div className="rounded-2xl border border-slate-800 bg-[#11192e] p-6 space-y-4 shadow-xl">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase text-slate-200">
                NHẬT KÝ KIỂM TOÁN THAO TÁC HỆ THỐNG ({auditLogs.length})
              </h3>
            </div>
          </div>

          <div className="divide-y divide-slate-800/80 max-h-[500px] overflow-y-auto pr-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 text-xs flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{log.user_name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11.5px]">{log.description}</p>
                </div>
                <span className="text-[10px] text-slate-500 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleString('vi-VN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
