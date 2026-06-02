/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Layers, FileSpreadsheet, ClipboardList, ShieldAlert,
  ArrowRight, ShieldCheck, HelpCircle, CheckCircle2
} from 'lucide-react';
import { LogEntry, INITIAL_ENTRIES } from './types';

// Component Imports
import LogInPage from './components/LogInPage';
import Header from './components/Header';
import HomePage from './components/HomePage';
import OrPage from './components/OrPage';
import SaafPage from './components/SaafPage';
import Report74aPage from './components/Report74aPage';

export default function App() {
  // Authentication status gate
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('aft_saas_auth');
    return saved === 'true';
  });
  
  const [currentUserEmail, setCurrentUserEmail] = useState<string>(() => {
    return localStorage.getItem('aft_saas_user') || 'nythanjanbagasani@gmail.com';
  });

  // Navigation tab route state matching the flowchart
  const [activeTab, setActiveTab] = useState<'home' | 'or' | 'saaf' | '74a'>(() => {
    return (localStorage.getItem('aft_saas_tab') as 'home' | 'or' | 'saaf' | '74a') || 'home';
  });

  // Accountable Form logs registry database
  const [entries, setEntries] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem('aft_saas_registers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_ENTRIES;
      }
    }
    return INITIAL_ENTRIES;
  });

  // Synchronize state values with local browser cache
  useEffect(() => {
    localStorage.setItem('aft_saas_registers', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('aft_saas_tab', activeTab);
  }, [activeTab]);

  const handleLogin = (email: string) => {
    setIsAuthenticated(true);
    setCurrentUserEmail(email);
    localStorage.setItem('aft_saas_auth', 'true');
    localStorage.setItem('aft_saas_user', email);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('aft_saas_auth');
    localStorage.removeItem('aft_saas_user');
  };

  const handleResetData = () => {
    setEntries(INITIAL_ENTRIES);
  };

  const handleAddEntry = (newEntry: Omit<LogEntry, 'id'>) => {
    const logId = 'log-' + Math.random().toString(36).substring(2, 9);
    setEntries(prev => [...prev, { ...newEntry, id: logId }]);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  };

  // Guard: Not authenticated -> display login screen
  if (!isAuthenticated) {
    return (
      <LogInPage 
        onLoginSuccess={handleLogin} 
        initialEmail={currentUserEmail}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Platform Header */}
      <Header 
        email={currentUserEmail} 
        onLogout={handleLogout} 
        activeTab={activeTab}
        onNavigate={setActiveTab}
      />

      {/* Main Workspace with adaptive side Navigation Bar context */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
        
        {/* Left Side Quick Menu Panel (Desk Layout helper) */}
        <aside className="w-full md:w-56 shrink-0 flex flex-col gap-6" id="navigation-sidebar">
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-row md:flex-col gap-1 sm:gap-2">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider px-2 py-1 mb-1 hidden md:block">
              Task Workspace
            </span>
            
            <button
              id="sidebar-nav-home"
              onClick={() => setActiveTab('home')}
              className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                activeTab === 'home'
                  ? 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Home className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Portal Hub</span>
            </button>

            <button
              id="sidebar-nav-or"
              onClick={() => setActiveTab('or')}
              className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                activeTab === 'or'
                  ? 'bg-blue-600/10 border border-blue-500/20 text-blue-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">OR (Forms Log)</span>
            </button>

            <button
              id="sidebar-nav-saaf"
              onClick={() => setActiveTab('saaf')}
              className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                activeTab === 'saaf'
                  ? 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-450'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">SAAF Page</span>
            </button>

            <button
              id="sidebar-nav-74a"
              onClick={() => setActiveTab('74a')}
              className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                activeTab === '74a'
                  ? 'bg-amber-600/10 border border-amber-500/20 text-amber-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <ClipboardList className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">74A Page</span>
            </button>
          </div>

          {/* Quick Tip Alert box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 hidden md:block">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mb-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Auditing Seal
            </h4>
            <p className="text-[11px] text-slate-450 leading-relaxed">
              All entered ranges are validated sequentially. Deleting or modifying a log line automatically updates the Statement of Accountability (SAAF & 74A) in real-time.
            </p>
          </div>
        </aside>

        {/* Dynamic Route Content Viewer */}
        <main className="flex-1 min-w-0" id="route-panel">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              {activeTab === 'home' && (
                <HomePage 
                  onNavigate={setActiveTab} 
                  entries={entries}
                  onResetData={handleResetData}
                />
              )}
              {activeTab === 'or' && (
                <OrPage 
                  entries={entries} 
                  onAddEntry={handleAddEntry} 
                  onDeleteEntry={handleDeleteEntry}
                />
              )}
              {activeTab === 'saaf' && (
                <SaafPage 
                  entries={entries} 
                  onNavigate={setActiveTab}
                />
              )}
              {activeTab === '74a' && (
                <Report74aPage 
                  entries={entries} 
                  onNavigate={setActiveTab}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>

      {/* Humble literal footer centered beautifully */}
      <footer id="app-footer" className="bg-slate-950 border-t border-slate-900/60 py-6 text-center text-slate-500 text-[10px]">
        <div className="max-w-7xl mx-auto px-4 gap-2 flex flex-col sm:flex-row items-center justify-between">
          <p>Accountable Forms Tracker &copy; 2026. Designed for Auditor-Ready Compliance.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-300 cursor-pointer">Security Standards</span>
            <span>&middot;</span>
            <span className="hover:text-slate-300 cursor-pointer">COA Regulations</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
