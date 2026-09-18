'use client';

import React, { useState } from 'react';
import { Shield, Lock, User, Key, ArrowRight, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { UserAccount } from '@/lib/store/types';
import { store } from '@/lib/store';

interface LoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (user: UserAccount) => void;
  onClose?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onLoginSuccess, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setError('Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const user = store.login(cleanUser, cleanPass);
      setIsLoading(false);

      if (user) {
        onLoginSuccess(user);
      } else {
        setError('Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!');
      }
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 selection:bg-amber-500 selection:text-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-700/80 bg-[#0d1527] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden">
        {/* Top police security stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-700 via-amber-400 to-red-600" />

        <div className="p-7 space-y-6">
          {/* Official Emblem & Title Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-xl shadow-amber-500/20">
                <div className="h-full w-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                  <Shield className="h-9 w-9 text-amber-400 fill-amber-400/20" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-[#0d1527] flex items-center justify-center shadow-sm">
                <Lock className="h-2.5 w-2.5 text-slate-950" />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-bold text-amber-300 tracking-wider uppercase mb-1.5">
                CÔNG AN NHÂN DÂN • CẢNH SÁT GIAO THÔNG
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                ĐĂNG NHẬP HỆ THỐNG
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xs mx-auto">
                Trợ lý Nghiệp vụ & Quản lý Biên tập Tin bài Tuyên truyền TTATGT Đường bộ
              </p>
            </div>
          </div>

          {/* Form Login */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-200 flex items-start gap-2.5 animate-in fade-in duration-200 shadow-sm">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                <span className="leading-snug text-[11.5px] font-medium">{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <User className="h-3.5 w-3.5 text-amber-400" />
                Tài khoản / Số hiệu CBCS:
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nhập tên đăng nhập được cấp..."
                  value={username}
                  onChange={e => {
                    setUsername(e.target.value);
                    if (error) setError('');
                  }}
                  autoFocus
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:bg-slate-900 focus:ring-1 focus:ring-amber-400/30 focus:outline-none transition-all shadow-inner"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                  <Key className="h-3.5 w-3.5 text-amber-400" />
                  Mật khẩu xác thực:
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:bg-slate-900 focus:ring-1 focus:ring-amber-400/30 focus:outline-none transition-all shadow-inner"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-0.5"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-950/80 border border-blue-500/30 transition-all hover:shadow-blue-900/50 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none cursor-pointer"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>ĐĂNG NHẬP HỆ THỐNG</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Security footnote */}
          <div className="pt-2 border-t border-slate-800/80 text-center">
            <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
              <Shield className="h-3 w-3 text-amber-500/70" />
              <span>Hệ thống phân quyền nghiệp vụ nội bộ • Bảo mật thông tin</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
