/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Calendar, Layers, Trash2, ArrowRight, ShieldCheck, 
  Hash, DollarSign, PenTool, LayoutGrid, CheckCircle2, AlertTriangle, BookOpen
} from 'lucide-react';
import { LogEntry, FormType, CategoryType, FORM_DEFAULTS } from '../types';

interface OrPageProps {
  entries: LogEntry[];
  onAddEntry: (entry: Omit<LogEntry, 'id'>) => void;
  onDeleteEntry: (id: string) => void;
}

export default function OrPage({ entries, onAddEntry, onDeleteEntry }: OrPageProps) {
  // Navigation / Selection State mirroring the flowchart precisely
  const [selectedForm, setSelectedForm] = useState<FormType>('016');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('Balance');

  // Form states matching standard and handwritten parameters
  const [balanceVal, setBalanceVal] = useState<string>('0');
  const [receivedVal, setReceivedVal] = useState<string>('0');
  const [issuedVal, setIssuedVal] = useState<string>('0');
  const [amountVal, setAmountVal] = useState<string>('0');
  const [dateVal, setDateVal] = useState<string>('2026-06-02');
  const [serialStart, setSerialStart] = useState<string>('');
  const [serialEnd, setSerialEnd] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');

  // Info alerts
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);

  // Handle category selector changes
  const handleCategoryChange = (category: CategoryType) => {
    setSelectedCategory(category);
    setErrorMsg('');
    setSuccessMsg('');
    // Reset and clear variables to avoid loaded presets
    setBalanceVal('0');
    setReceivedVal('0');
    setIssuedVal('0');
    setAmountVal('0');
    setSerialStart('');
    setSerialEnd('');
  };

  // Safe quantity calculation from serial numbers if digits can be extracted
  const calculateQuantityFromSerials = (start: string, end: string) => {
    const startNum = parseInt(start.replace(/\D/g, ''), 10);
    const endNum = parseInt(end.replace(/\D/g, ''), 10);
    if (!isNaN(startNum) && !isNaN(endNum) && endNum >= startNum) {
      return (endNum - startNum) + 1;
    }
    return 0;
  };

  // Trigger quantity update when serial number inputs change
  useEffect(() => {
    const qty = calculateQuantityFromSerials(serialStart, serialEnd);
    if (qty > 0) {
      if (selectedCategory === 'Balance') {
        setBalanceVal(qty.toString());
      } else if (selectedCategory === 'Received') {
        setReceivedVal(qty.toString());
      } else if (selectedCategory === 'Issued') {
        setIssuedVal(qty.toString());
        // Set a rough standard collection amount (e.g., 50 pesos per sheet for 016/54, 100 for 51)
        const unitCost = selectedForm === '51' ? 100 : selectedForm === '54' ? 50 : 25;
        setAmountVal((qty * unitCost).toString());
      }
    }
  }, [serialStart, serialEnd, selectedCategory, selectedForm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    // Determine quantity
    let finalQty = 0;
    if (selectedCategory === 'Balance') {
      finalQty = parseInt(balanceVal, 10) || 0;
    } else if (selectedCategory === 'Received') {
      finalQty = parseInt(receivedVal, 10) || 0;
    } else {
      finalQty = parseInt(issuedVal, 10) || 0;
    }

    if (finalQty <= 0) {
      setErrorMsg('Operational quantity must be greater than zero. Verify your serial ranges.');
      setTimeout(() => setErrorMsg(''), 5000);
      return;
    }

    if (!serialStart || !serialEnd) {
      setErrorMsg('Please define inclusive serial range numbers for audit trail.');
      setTimeout(() => setErrorMsg(''), 5000);
      return;
    }

    onAddEntry({
      formType: selectedForm,
      category: selectedCategory,
      quantity: finalQty,
      amount: parseFloat(amountVal) || 0,
      date: dateVal,
      serialStart: serialStart.trim(),
      serialEnd: serialEnd.trim(),
      remarks: remarks || `Logged ${selectedCategory} register under form type ${selectedForm}.`
    });

    setSuccessMsg(`Successfully saved registry for Form ${selectedForm}! Form balances recalculated.`);
    
    // Reset short fields
    setSerialStart('');
    setSerialEnd('');
    setRemarks('');
    
    setTimeout(() => {
      setSuccessMsg('');
    }, 4500);
  };

  // Filter logs corresponding to selected Form
  const formEntries = entries.filter(e => e.formType === selectedForm);

  // Compute stats dynamically
  let totalBal = 0;
  let totalRec = 0;
  let totalIss = 0;
  let collectedCash = 0;

  formEntries.forEach(e => {
    if (e.category === 'Balance') {
      totalBal += e.quantity;
    } else if (e.category === 'Received') {
      totalRec += e.quantity;
    } else if (e.category === 'Issued') {
      totalIss += e.quantity;
      collectedCash += e.amount;
    }
  });

  const finalEndingBalance = totalBal + totalRec - totalIss;
  const isStockLow = finalEndingBalance < 200;

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-400" />
            Official Accountable Forms (OR Page)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Log transactions, verify sequential serial controls, and view form ledger books.
          </p>
        </div>
        
        {/* Dynamic stock stats */}
        <div className="flex gap-3">
          <div className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Book Name</span>
            <span className="font-semibold text-white">{FORM_DEFAULTS[selectedForm].name.split(' (')[0]}</span>
          </div>
          <div className={`px-3.5 py-1.5 rounded-lg border text-xs flex flex-col justify-between ${isStockLow ? 'bg-amber-950/20 border-amber-800/60' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Ending Balance</span>
            <span className={`font-bold font-mono ${isStockLow ? 'text-amber-400 text-xs' : 'text-emerald-400'}`}>
              {finalEndingBalance.toLocaleString()} sheets
            </span>
          </div>
        </div>
      </div>

      {/* Main Layout matches the Flowchart dual perspective */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: The Interactive Form Mockup mimicking the hand-drawn elements */}
        <div id="flowchart-or-canvas" className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest font-mono">
              OR FORMS
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span>Interactive Draft Node</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Form selection - highlighting exact handwritten mockup layout */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                1. Select Accountable Form
              </label>
              <div className="flex gap-3">
                {/* 016 with green outline if selected, matching the sketch exactly */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedForm('016');
                    setSerialStart('');
                    setSerialEnd('');
                  }}
                  className={`flex-1 py-3 text-center rounded-xl cursor-pointer font-bold font-mono text-sm tracking-widest transition-all ${
                    selectedForm === '016'
                      ? 'bg-emerald-950/40 border-2 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/5'
                      : 'bg-slate-950 border border-slate-800 text-slate-500 hover:text-slate-350 hover:bg-slate-850'
                  }`}
                >
                  016
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedForm('51');
                    setSerialStart('');
                    setSerialEnd('');
                  }}
                  className={`flex-1 py-3 text-center rounded-xl cursor-pointer font-bold font-mono text-sm tracking-widest transition-all ${
                    selectedForm === '51'
                      ? 'bg-blue-950/40 border-2 border-blue-500/80 text-blue-400 shadow-lg shadow-blue-500/5'
                      : 'bg-slate-950 border border-slate-800 text-slate-500 hover:text-slate-350 hover:bg-slate-850'
                  }`}
                >
                  51
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedForm('54');
                    setSerialStart('');
                    setSerialEnd('');
                  }}
                  className={`flex-1 py-3 text-center rounded-xl cursor-pointer font-bold font-mono text-sm tracking-widest transition-all ${
                    selectedForm === '54'
                      ? 'bg-purple-950/40 border-2 border-purple-550/80 text-purple-400 shadow-lg shadow-purple-500/5'
                      : 'bg-slate-950 border border-slate-800 text-slate-500 hover:text-slate-350 hover:bg-slate-850'
                  }`}
                >
                  54
                </button>
              </div>
              <p className="text-[10px] text-slate-500 italic mt-1 pl-1">
                {FORM_DEFAULTS[selectedForm].name}
              </p>
            </div>

            {/* Step 2: Toggle bar: Balance/Received/Issued which updates highlighted inputs */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                2. Select Form Action Sector
              </label>
              <div className="grid grid-cols-3 bg-slate-950 border border-slate-800 p-1.2 rounded-lg">
                {(['Balance', 'Received', 'Issued'] as CategoryType[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    className={`py-1.5 text-xs font-bold font-sans rounded-md cursor-pointer transition-all ${
                      selectedCategory === cat
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Composite fields - mimicking the handwritten OR Forms mockup perfectly */}
            <div className="space-y-4 bg-slate-950 border border-slate-850 rounded-xl p-4">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block border-b border-slate-850 pb-1 mb-2">
                Forms Composite Variables
              </span>
              
              {/* Highlight field according to Category selection */}
              <div className={`space-y-1 p-2 rounded-lg transition-all ${selectedCategory === 'Balance' ? 'bg-amber-500/10 border border-amber-500/20' : 'opacity-60'}`}>
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300 font-mono">Balance:</label>
                  <span className="text-[10px] text-amber-400 font-mono">Beginning Inventory</span>
                </div>
                <input
                  type="number"
                  value={balanceVal}
                  onChange={(e) => setBalanceVal(e.target.value)}
                  disabled={selectedCategory !== 'Balance'}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-white text-right focus:outline-none focus:border-amber-500 disabled:bg-slate-950 disabled:text-slate-550"
                />
              </div>

              <div className={`space-y-1 p-2 rounded-lg transition-all ${selectedCategory === 'Received' ? 'bg-amber-500/10 border border-amber-500/20' : 'opacity-60'}`}>
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300 font-mono">Received:</label>
                  <span className="text-[10px] text-emerald-400 font-mono font-semibold">Stock Requisition</span>
                </div>
                <input
                  type="number"
                  value={receivedVal}
                  onChange={(e) => setReceivedVal(e.target.value)}
                  disabled={selectedCategory !== 'Received'}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-white text-right focus:outline-none focus:border-amber-500 disabled:bg-slate-950 disabled:text-slate-550"
                />
              </div>

              <div className={`space-y-1 p-2 rounded-lg transition-all ${selectedCategory === 'Issued' ? 'bg-amber-500/10 border border-amber-500/20' : 'opacity-60'}`}>
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300 font-mono">Issued:</label>
                  <span className="text-[10px] text-blue-400 font-mono font-semibold">Collections Distributed</span>
                </div>
                <input
                  type="number"
                  value={issuedVal}
                  onChange={(e) => setIssuedVal(e.target.value)}
                  disabled={selectedCategory !== 'Issued'}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-white text-right focus:outline-none focus:border-amber-500 disabled:bg-slate-950 disabled:text-slate-550"
                />
              </div>

              {/* Serials Input fields so we can safely compute exact serial intervals */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Inclusive From Serial</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-slate-600"><Hash className="w-3 h-3" /></span>
                    <input
                      type="text"
                      placeholder={`${selectedForm}-00001`}
                      value={serialStart}
                      onChange={(e) => setSerialStart(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded pl-7 pr-1.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Inclusive To Serial</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-slate-600"><Hash className="w-3 h-3" /></span>
                    <input
                      type="text"
                      placeholder={`${selectedForm}-00100`}
                      value={serialEnd}
                      onChange={(e) => setSerialEnd(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded pl-7 pr-1.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Amount Value (₱)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-slate-600"><DollarSign className="w-3 h-3" /></span>
                    <input
                      type="number"
                      step="any"
                      value={amountVal}
                      onChange={(e) => setAmountVal(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-900 border border-slate-800 rounded pl-6 pr-1.5 py-1.5 text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Registry Date</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-slate-600"><Calendar className="w-3 h-3" /></span>
                    <input
                      type="date"
                      value={dateVal}
                      onChange={(e) => setDateVal(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded pl-6 pr-1.5 py-1.5 text-xs font-mono text-white focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase block">Remarks / Notes</label>
                <input
                  type="text"
                  placeholder="Audit reference, voucher index..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

            </div>

            <button
              id="add-entry-btn"
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Form Registry Log
            </button>
          </form>

          {/* Validation & Success notifications */}
          <AnimatePresence mode="popLayout">
            {successMsg && (
              <motion.div
                key="or-success-toast"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-4 p-3 bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 rounded-lg flex items-center gap-2 text-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}

            {errorMsg && (
              <motion.div
                key="or-error-toast"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-4 p-3 bg-red-950/40 border border-red-900/50 text-red-400 rounded-lg flex items-center gap-2 text-xs"
              >
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: The Historical Ledger Sheet for active form */}
        <div id="or-ledger-sheet" className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-md font-bold text-white">
                AF No. {selectedForm} Live Ledger Book
              </h2>
              <p className="text-xs text-slate-450 mt-1">
                Displaying {formEntries.length} chronological audit entries
              </p>
            </div>
            
            {/* Low stock alert flag */}
            {isStockLow && (
              <div className="flex items-center gap-1 bg-amber-950/30 border border-amber-900/50 text-amber-400 px-2.5 py-1 rounded-md text-[10px] font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>LOW CUSTODY STOCK alert</span>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            {formEntries.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <LayoutGrid className="w-10 h-10 mx-auto text-slate-700 mb-3" />
                <p className="text-sm font-semibold">No registers found for Form {selectedForm}</p>
                <p className="text-xs text-slate-600 mt-1">Create an entry in the draft layout block to begin tracking ledger ranges.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-[10px] text-slate-500 uppercase font-bold">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Class</th>
                    <th className="py-2.5 px-3 font-mono">Serial Range</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3 text-right">Amount (₱)</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/80 text-xs">
                  {formEntries.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-3 text-slate-300 font-mono">{e.date}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          e.category === 'Balance' ? 'bg-blue-500/10 text-blue-400' :
                          e.category === 'Received' ? 'bg-emerald-500/10 text-emerald-400' :
                          'bg-amber-500/10 text-amber-450'
                        }`}>
                          {e.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-400 text-xs">
                        {e.serialStart} — {e.serialEnd}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-200">
                        {e.quantity.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-450">
                        {e.amount > 0 ? `₱${e.amount.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => {
                            setDeleteCandidateId(e.id);
                          }}
                          className="p-1 px-2 text-slate-500 hover:text-red-400 hover:bg-slate-800/20 rounded-md transition-all cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Quick Ledger Balance math breakdown */}
          <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 text-xs font-mono space-y-2 text-slate-450">
            <span className="text-[9px] uppercase tracking-wider font-bold block text-slate-500">Live Mathematical Audit Verify</span>
            <div className="flex justify-between border-b border-slate-850 pb-1.5">
              <span>Begin Balance (May 01) :</span>
              <span className="text-blue-400">{totalBal.toLocaleString()} sheets</span>
            </div>
            <div className="flex justify-between border-b border-slate-850 pb-1.5">
              <span>Add: Received (Acquisitions) :</span>
              <span className="text-emerald-400">+{totalRec.toLocaleString()} sheets</span>
            </div>
            <div className="flex justify-between border-b border-slate-850 pb-1.5">
              <span>Less: Issued (Disbursed) :</span>
              <span className="text-amber-400">-{totalIss.toLocaleString()} sheets</span>
            </div>
            <div className="flex justify-between pt-1 font-bold text-white">
              <span>Ending Safe Custody Stock :</span>
              <span className="text-emerald-405">{finalEndingBalance.toLocaleString()} sheets</span>
            </div>
          </div>
        </div>

      </div>

      {/* Custom Confirmation Modal for Deletion to avoid iframe window.confirm blocks */}
      <AnimatePresence>
        {deleteCandidateId && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 text-slate-100 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-amber-550">
                <AlertTriangle className="w-6 h-6 shrink-0 text-amber-450" />
                <h3 className="text-md font-bold text-white">Confirm Record Deletion</h3>
              </div>
              
              <p className="text-xs text-slate-450 leading-relaxed">
                Are you sure you want to delete this log entry from the registry book? Deleting this record will automatically recalculate the SAAF and 74A accountability forms in real-time.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  id="cancel-delete-btn"
                  onClick={() => setDeleteCandidateId(null)}
                  className="px-4 py-2 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 text-xs text-slate-400 hover:text-white transition-all cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="confirm-delete-btn"
                  onClick={() => {
                    onDeleteEntry(deleteCandidateId);
                    setDeleteCandidateId(null);
                    setSuccessMsg('Registry log deleted successfully! Statements updated.');
                    setTimeout(() => setSuccessMsg(''), 4500);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 active:bg-red-700 text-xs text-white transition-all cursor-pointer font-semibold animate-fade-in"
                >
                  Delete Record
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
