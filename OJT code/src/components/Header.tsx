/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, LogOut, CheckCircle2, User, HelpCircle } from 'lucide-react';

interface HeaderProps {
  email: string;
  onLogout: () => void;
  activeTab: 'home' | 'or' | 'saaf' | '74a';
  onNavigate: (tab: 'home' | 'or' | 'saaf' | '74a') => void;
}

export default function Header({ email, onLogout, activeTab, onNavigate }: HeaderProps) {
  const formatUserEmail = (emailStr: string) => {
    return emailStr.split('@')[0].toUpperCase();
  };

  return (
    <header id="app-header" className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block sm:inline">
                AFT-SaaS
              </span>
              <span className="text-xs text-slate-400 block sm:inline sm:ml-2 border-slate-700 sm:border-l sm:pl-2">
                Accountable Forms Tracker
              </span>
            </div>
          </div>

          {/* Quick Stats / System Status indicator */}
          <div className="hidden md:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>SYS ACTIVE</span>
            </div>
            <div className="text-slate-500">
              UTC: <span className="font-mono text-slate-300">2026-06-02 02:11</span>
            </div>
          </div>

          {/* Actions and User */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                <User className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-300 leading-3">
                  {formatUserEmail(email)}
                </p>
                <p className="text-[10px] text-slate-500 leading-none mt-1">
                  Custodian / Officer
                </p>
              </div>
            </div>

            <button
              id="logout-btn"
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
              title="Logout session"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
