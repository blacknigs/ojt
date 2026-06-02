/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, ClipboardList, TrendingUp, ShieldAlert, CheckCircle2, 
  ArrowRight, FileSpreadsheet, PlusCircle, History, RotateCcw,
  Layers, Package, AlertCircle, Sparkles, AlertTriangle
} from 'lucide-react';
import { LogEntry, FormType, FORM_DEFAULTS } from '../types';

interface HomePageProps {
  onNavigate: (tab: 'home' | 'or' | 'saaf' | '74a') => void;
  entries: LogEntry[];
  onResetData: () => void;
}

export default function HomePage({ onNavigate, entries, onResetData }: HomePageProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // Calculate current balances dynamically
  // Balance = Beginning Balance + Received - Issued
  const getTotals = (formType: FormType) => {
    const formEntries = entries.filter(e => e.formType === formType);
    let beginningBalance = 0;
    let received = 0;
    let issued = 0;
    let amount = 0;

    formEntries.forEach(e => {
      if (e.category === 'Balance') {
        beginningBalance += e.quantity;
      } else if (e.category === 'Received') {
        received += e.quantity;
      } else if (e.category === 'Issued') {
        issued += e.quantity;
        amount += e.amount;
      }
    });

    const endingBalance = beginningBalance + received - issued;
    return {
      endingBalance,
      received,
      issued,
      amount
    };
  };

  const totals016 = getTotals('016');
  const totals51 = getTotals('51');
  const totals54 = getTotals('54');

  const totalFormsInCustody = totals016.endingBalance + totals51.endingBalance + totals54.endingBalance;
  const totalAmountCollected = totals016.amount + totals51.amount + totals54.amount;

  return (
    <div id="home-dashboard" className="space-y-8 animate-fade-in">
      {/* Top Welcome Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        {/* Abstract vector embellishments matching modern design guidelines */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-[15%] w-60 h-60 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Digitalized Auditing Platform</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Accountable Forms Governance
            </h1>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl">
              Track, balance, and generate audit-compliant schedules for public receipts and certificates. This system fully maps out the accountability structure connecting single records directly to your SAAF and 74A statutory reports.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              id="reset-state-btn"
              onClick={() => {
                setShowResetConfirm(true);
              }}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset To Demo
            </button>
          </div>
        </div>

        {/* Dashboard Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Total Active Stock</p>
            <p className="text-2xl font-bold font-mono text-white">{totalFormsInCustody.toLocaleString()} <span className="text-xs text-slate-400 font-sans">units</span></p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Collections Collected</p>
            <p className="text-2xl font-bold font-mono text-white">₱{totalAmountCollected.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Total Registers Saved</p>
            <p className="text-2xl font-bold font-mono text-white">{entries.length} <span className="text-xs text-slate-400 font-sans">entries</span></p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Audit Security</p>
            <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Balanced</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Pillars Navigation (Mirroring flowchart buttons or-saaf-74a) */}
      <div>
        <h2 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4 px-1">
          Flowchart Navigation Pillars
        </h2>
        <div id="navigation-pillars" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* OR Forms Pillar */}
          <motion.div
            id="node-or-card"
            whileHover={{ y: -3 }}
            onClick={() => onNavigate('or')}
            className="group bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-xl p-6 shadow-lg hover:shadow-blue-500/5 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors" />
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-bold">
                OR LEDGERS
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
              OR (Official Receipts)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Access specific Cashier forms <span className="text-slate-300 font-medium">016</span>, <span className="text-slate-300 font-medium">51</span>, and <span className="text-slate-300 font-medium">54</span>. Create balance carryovers, receipt registers, and log issues in accordance with strict serial numbering rules.
            </p>
            <div className="flex items-center justify-between text-xs pt-4 border-t border-slate-800/80">
              <span className="text-slate-500 font-semibold">Manage Forms</span>
              <span className="text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Open Ledgers <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </motion.div>

          {/* SAAF Form Pillar */}
          <motion.div
            id="node-saaf-card"
            whileHover={{ y: -3 }}
            onClick={() => onNavigate('saaf')}
            className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-6 shadow-lg hover:shadow-emerald-500/5 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors" />
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                SAAF STATEMENT
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
              SAAF Page
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Statement of Accountability for Accountable Forms (SAAF). Dynamically computes the beginning inventory, total acquisitions, distribution issuances, and physical ending balance serials with instant spreadsheet/CSV export.
            </p>
            <div className="flex items-center justify-between text-xs pt-4 border-t border-slate-800/80">
              <span className="text-slate-500 font-semibold">Statutory Audits</span>
              <span className="text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Generate Form <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </motion.div>

          {/* 74A Form Pillar */}
          <motion.div
            id="node-74a-card"
            whileHover={{ y: -3 }}
            onClick={() => onNavigate('74a')}
            className="group bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-xl p-6 shadow-lg hover:shadow-amber-500/5 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors" />
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ClipboardList className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-bold">
                74A REPORT
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
              74A Page
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Monthly Accountable Officers Form 74A Report. Renders accountability records into statutory government schedules formatted by serial number ranges. Includes automated export safeguards for submission.
            </p>
            <div className="flex items-center justify-between text-xs pt-4 border-t border-slate-800/80">
              <span className="text-slate-500 font-semibold">Treasury Archives</span>
              <span className="text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Export Report <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Visual Flowchart Overview (A majestic drawing matching the canvas sketch!) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-md font-semibold text-white">Flowchart Interactive Architecture</h3>
            <p className="text-xs text-slate-500">Click on any node in the hand-drawn-style schematic below to navigate directly</p>
          </div>
          <span className="text-xs text-slate-500 px-2 py-1 rounded bg-slate-950 border border-slate-800 font-mono">
            Interactive Map
          </span>
        </div>

        {/* Visual Map Render resembling the whiteboard diagram meticulously */}
        <div id="interactive-flowchart-map" className="relative p-6 bg-slate-950 rounded-xl border border-slate-800/60 overflow-x-auto min-w-[760px] select-none scrollbar-thin">
          <div className="flex items-stretch justify-around gap-4 py-8 relative">
            
            {/* Draw connectors or background lines representing arrows in flowchart */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                </marker>
                <marker id="arrow-blue" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                </marker>
                <marker id="arrow-amber" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
                </marker>
              </defs>
              
              {/* Connectors */}
              {/* Login -> Home */}
              <path d="M 120 70 L 220 70" stroke="#475569" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrow)" />
              {/* Home -> SAAF */}
              <path d="M 390 40 L 530 25" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow)" />
              {/* Home -> 74A */}
              <path d="M 390 100 L 535 155" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arrow-amber)" />
              {/* Home -> OR */}
              <path d="M 290 120 L 290 190" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrow-blue)" />
              
              {/* OR Option branch links pointing to sample details */}
              <path d="M 270 320 Q 180 345 180 435" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="2 2" markerEnd="url(#arrow-blue)" />
              <path d="M 330 320 Q 420 345 420 435" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="2 2" markerEnd="url(#arrow-blue)" />
            </svg>

            {/* Simulated Hand-Drawn Mock Cards */}
            
            {/* Slide 1: LogInPage */}
            <div className="w-28 flex flex-col items-center justify-center p-3 bg-slate-900 border border-slate-800 rounded-lg text-center shadow-md relative z-10 transition-transform hover:scale-105">
              <span className="text-[10px] font-sans text-slate-500 font-bold mb-2">Log in Page</span>
              <div className="w-16 h-3.5 bg-slate-950 border border-slate-800 rounded mb-1 text-[8px] text-slate-600 flex items-center justify-center font-mono">Email</div>
              <div className="w-16 h-3.5 bg-slate-950 border border-slate-800 rounded mb-2.5 text-[8px] text-slate-600 flex items-center justify-center font-mono">Password</div>
              <div className="w-14 py-0.5 bg-emerald-600/30 text-emerald-400 font-semibold border border-emerald-500/30 text-[8px] rounded">Log in</div>
            </div>

            {/* Slide 2: Home Page */}
            <div className="w-48 p-4 bg-slate-900 border-2 border-emerald-500 bg-slate-900/90 rounded-xl relative z-10 text-center flex flex-col justify-between shadow-2xl">
              <div>
                <span className="text-[10px] font-sans text-emerald-400 font-bold block mb-3">Enterprise Home Page</span>
                <div className="flex justify-center gap-2 mb-1.5">
                  <button onClick={() => onNavigate('or')} className="px-2 py-1.5 text-[9px] font-bold tracking-tight rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all">OR</button>
                  <button onClick={() => onNavigate('saaf')} className="px-2 py-1.5 text-[9px] font-bold tracking-tight rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all">SAAF</button>
                  <button onClick={() => onNavigate('74a')} className="px-2 py-1.5 text-[9px] font-bold tracking-tight rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all">74A</button>
                </div>
              </div>
              <span className="text-[8px] text-slate-500 italic mt-3 block">Navigation Hub</span>
            </div>

            {/* Slide 3: SAAF Page */}
            <div 
              onClick={() => onNavigate('saaf')} 
              className="w-36 p-3 bg-slate-900 border border-slate-800 hover:border-emerald-500 rounded-lg shrink-0 flex flex-col justify-between shadow-md relative z-10 cursor-pointer transition-all hover:translate-y-[-2px]"
            >
              <div>
                <span className="text-[9px] font-semibold text-slate-400 block mb-1">SAAF Page</span>
                <div className="h-10 border border-dashed border-slate-800 rounded bg-slate-950 flex flex-col justify-center items-center gap-1">
                  <span className="text-[8px] text-slate-500 font-mono">SAAF Form Ledger</span>
                  <span className="text-[7px] text-slate-600">3 Rows (016, 51, 54)</span>
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <span className="text-[8px] px-1 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded font-bold">Export</span>
              </div>
            </div>

            {/* Slide 4: 74A Page */}
            <div 
              onClick={() => onNavigate('74a')} 
              className="w-36 p-3 bg-slate-900 border border-slate-800 hover:border-amber-500 rounded-lg shrink-0 flex flex-col justify-between shadow-md relative z-10 cursor-pointer transition-all hover:translate-y-[-2px] mt-24"
            >
              <div>
                <span className="text-[9px] font-semibold text-slate-400 block mb-1">74A Page</span>
                <div className="h-10 border border-dashed border-slate-800 rounded bg-slate-950 flex flex-col justify-center items-center gap-1">
                  <span className="text-[8px] text-slate-500 font-mono">74A Form Ledger</span>
                  <span className="text-[7px] text-slate-600">Renders ranges...</span>
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <span className="text-[8px] px-1 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded font-bold">Export</span>
              </div>
            </div>

            {/* Slide 5: OR Page */}
            <div 
              onClick={() => onNavigate('or')} 
              className="w-40 p-3 bg-slate-900 border border-slate-800 hover:border-blue-500 rounded-lg shrink-0 flex flex-col justify-between shadow-md relative z-10 cursor-pointer transition-all hover:translate-y-[-2px] absolute top-[210px] left-[200px]"
            >
              <div>
                <span className="text-[9px] font-semibold text-slate-300 block mb-1">OR Forms Ledger</span>
                <div className="flex gap-1 justify-between mb-2">
                  <span className="text-[8px] px-1 bg-emerald-500/20 text-emerald-400 font-mono font-bold rounded">016</span>
                  <span className="text-[8px] px-1 bg-slate-800 text-slate-400 font-mono rounded">51</span>
                  <span className="text-[8px] px-1 bg-slate-800 text-slate-400 font-mono rounded">54</span>
                </div>
                <div className="py-1 px-1 bg-slate-950 text-slate-400 text-[8px] rounded border border-slate-800 font-mono mb-1 text-center font-bold">
                  Balance/Received/Issued
                </div>
              </div>
              <span className="text-[7px] text-slate-600 text-right mt-1 font-mono">Toggle branches</span>
            </div>

            {/* Slide 6 & 7: Filtered Subforms of OR */}
            <div className="w-32 p-2 bg-slate-900 border border-slate-800 rounded absolute bottom-[-15px] left-[30px] z-10 shrink-0 text-left scale-90">
              <span className="text-[8px] font-bold text-slate-500 font-mono">OR [Balance View]</span>
              <div className="w-full h-1.5 bg-blue-500/10 rounded mt-1 mb-1.5" />
              <div className="text-[8px] font-mono text-slate-400 flex items-center justify-between">
                <span>Balance:</span><span className="text-white">00000</span>
              </div>
            </div>

            <div className="w-32 p-2 bg-slate-900 border border-slate-800 rounded absolute bottom-[-15px] left-[370px] z-10 shrink-0 text-left scale-90">
              <span className="text-[8px] font-bold text-slate-500 font-mono">OR [Received View]</span>
              <div className="w-full h-1.5 bg-emerald-500/10 rounded mt-1 mb-1.5" />
              <div className="text-[8px] font-mono text-slate-400 flex items-center justify-between">
                <span>Received:</span><span className="text-white">00000</span>
              </div>
            </div>

            {/* Slide 8: Final Detailed OR Page Layout */}
            <div className="w-44 p-3 bg-slate-900 border border-slate-800 rounded shrink-0 flex flex-col justify-between shadow-lg relative z-10 absolute right-4 top-[170px] border-dashed border-blue-500/40">
              <div>
                <span className="text-[9px] font-semibold text-slate-400 block mb-1">OR Composite Layout</span>
                <div className="flex gap-1 mb-1">
                  <span className="text-[7px] px-1 bg-emerald-500/20 text-emerald-400 rounded">016</span>
                  <span className="text-[7px] px-1 bg-slate-800 text-slate-500 rounded">51</span>
                  <span className="text-[7px] px-1 bg-slate-800 text-slate-500 rounded">54</span>
                </div>
                <div className="h-1 py-0.5 bg-slate-950 rounded mb-2" />
                <div className="space-y-1 font-mono text-[8px] text-slate-400">
                  <div className="flex justify-between"><span>Balance:</span> <span className="text-xs font-semibold text-white">00000</span></div>
                  <div className="flex justify-between"><span>Received:</span> <span className="text-xs font-semibold text-white">00000</span></div>
                  <div className="flex justify-between"><span>Issued:</span> <span className="text-xs font-semibold text-white">00000</span></div>
                  <div className="flex justify-between"><span>Amount:</span> <span className="text-xs font-semibold text-white">00000</span></div>
                  <div className="flex justify-between"><span>Date:</span> <span className="text-slate-400">06/02</span></div>
                </div>
              </div>
              <span className="text-[7px] text-blue-400 mt-2 text-center border-t border-slate-800/80 pt-1 pointer" onClick={() => onNavigate('or')}>Launch Page</span>
            </div>

          </div>
        </div>
      </div>

      {/* Recent Records Audit Log block */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4.5 h-4.5 text-slate-400" />
            <h3 className="text-sm font-semibold text-white">Recent Register Activities</h3>
          </div>
          <button
            onClick={() => onNavigate('or')}
            className="text-xs text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View all transactions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-500 uppercase font-bold">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Form Type</th>
                <th className="py-2.5 px-3">Action Class</th>
                <th className="py-2.5 px-3">Serial Range</th>
                <th className="py-2.5 px-3 text-right">Quantity</th>
                <th className="py-2.5 px-3 text-right">Value (₱)</th>
                <th className="py-2.5 px-3 hidden sm:table-cell">Custodian Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {entries.slice().reverse().slice(0, 4).map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-800/30 text-slate-300">
                  <td className="py-3 px-3 font-mono">{entry.date}</td>
                  <td className="py-3 px-3 font-semibold">
                    AF No. <span className="text-white font-mono">{entry.formType}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                      entry.category === 'Balance' ? 'bg-blue-500/10 text-blue-400' :
                      entry.category === 'Received' ? 'bg-emerald-500/10 text-emerald-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>
                      {entry.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">
                    {entry.serialStart} — {entry.serialEnd}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold">{entry.quantity.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-400">
                    {entry.amount > 0 ? `₱${entry.amount.toLocaleString()}` : '—'}
                  </td>
                  <td className="py-3 px-3 hidden sm:table-cell text-slate-550 max-w-xs truncate text-[11px] text-slate-400">
                    {entry.remarks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* State-driven Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 text-slate-100 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-red-400">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="text-md font-bold text-white font-sans">Reset Accountability Registers</h3>
              </div>
              
              <p className="text-xs text-slate-450 leading-relaxed font-sans">
                Are you sure you want to reset all accountability registers back to the initial demo audit state? This operation will overwrite all manual changes and inputs.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 text-xs text-slate-400 hover:text-white transition-all cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="confirm-reset-btn"
                  onClick={() => {
                    onResetData();
                    setShowResetConfirm(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 active:bg-red-700 text-xs text-white transition-all cursor-pointer font-semibold"
                >
                  Yes, Reset Registers
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
