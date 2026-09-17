'use client';

import React, { useState } from 'react';
import { Shield, Lock, User, Key, ArrowRight, AlertCircle, Users, CheckCircle2 } from 'lucide-react';
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
  const [error, setError] = useState('');
  const [selectedQuickAcc, setSelectedQuickAcc] = useState<string | null>(null);

  if (!isOpen) return null;

  const accounts = store.getAccounts();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = store.login(username, password);
    if (user) {
      onLoginSuccess(user);
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không chính xác!');
    }
  };

  const handleQuickLogin = (acc: UserAccount) => {
    setUsername(acc.username);
    setPassword(acc.password);
    setSelectedQuickAcc(acc.id);
    const user = store.login(acc.username, acc.password);
    if (user) {
      onLoginSuccess(user);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#0f172a] p-6 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Top police badge banner */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-amber-500 to-emerald-500" />

        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 shadow-lg border border-amber-400/50 mb-1">
            <Shield className="h-7 w-7 fill-amber-300" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            ĐĂNG NHẬP HỆ THỐNG CSGT
          </h2>
          <p className="text-xs text-slate-400">
            Trợ lý Quản lý & Biên tập Tin bài Tuyên truyền TTATGT
          </p>
        </div>

        {/* Quick select demo accounts */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-400 uppercase block">
            Chọn nhanh tài khoản phân quyền:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {accounts.map(acc => {
              const isAdmin = acc.role === 'admin';
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleQuickLogin(acc)}
                  className={`p-2.5 rounded-lg border text-left transition-all text-xs flex flex-col justify-between ${
                    isAdmin
                      ? 'bg-amber-950/40 border-amber-600/70 hover:bg-amber-900/60 text-amber-200'
                      : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="font-bold truncate text-white">{acc.name}</div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>TK: <strong className="text-amber-400">{acc.username}</strong></span>
                    <span className="font-mono text-[9px] bg-slate-800 px-1 py-0.5 rounded">mk: 123</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase font-bold">Hoặc nhập thông tin</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-700 text-red-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-400" />
              Tên đăng nhập:
            </label>
            <input
              type="text"
              placeholder="VD: admin, to1, to2..."
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-slate-400" />
              Mật khẩu:
            </label>
            <input
              type="password"
              placeholder="Mật khẩu (mặc định: 123)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-950 transition-all"
          >
            ĐĂNG NHẬP VÀO HỆ THỐNG <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
