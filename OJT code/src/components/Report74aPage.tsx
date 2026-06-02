/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardList, Download, Printer, ArrowLeft, Shield, 
  ChevronRight, Calendar, User, FileSpreadsheet, Check
} from 'lucide-react';
import { LogEntry, FormType, FORM_DEFAULTS } from '../types';

interface Report74aPageProps {
  entries: LogEntry[];
  onNavigate: (tab: 'home' | 'or' | 'saaf' | '74a') => void;
}

interface BookletRow {
  id: string;
  formType: FormType;
  category: string;
  serialFrom: string;
  serialTo: string;
  bookletQty: number;
  date: string;
  status: 'Utilized' | 'In Depot Custody' | 'Beginning Reserve';
  allocatedAmount: number;
  remarks: string;
}

export default function Report74aPage({ entries, onNavigate }: Report74aPageProps) {
  const [showPrintModal74A, setShowPrintModal74A] = useState(false);
  const [export74aSuccess, setExport74aSuccess] = useState(false);

  // Compile individual booklet registries based on the logs
  const compileBooklets = (): BookletRow[] => {
    return entries.map((e, idx) => {
      let statusStr: 'Utilized' | 'In Depot Custody' | 'Beginning Reserve' = 'Beginning Reserve';
      if (e.category === 'Received') {
        statusStr = 'In Depot Custody';
      } else if (e.category === 'Issued') {
        statusStr = 'Utilized';
      }

      return {
        id: e.id,
        formType: e.formType,
        category: e.category,
        serialFrom: e.serialStart,
        serialTo: e.serialEnd,
        bookletQty: e.quantity,
        date: e.date,
        status: statusStr,
        allocatedAmount: e.amount,
        remarks: e.remarks
      };
    });
  };

  const bookletsList = compileBooklets();

  // Export 74A Spreadsheet Report
  const handleExport74A = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Form 74A Serial Booklet Register\n';
    csvContent += 'Voucher ID,AF Code,Category,Start Serial,End Serial,Quantity Count,Date Recorded,Status,Voucher Amount,Custodian Tag\n';

    bookletsList.forEach(item => {
      csvContent += `${item.id},"${item.formType}","${item.category}","${item.serialFrom}","${item.serialTo}",${item.bookletQty},"${item.date}","${item.status}",${item.allocatedAmount},"${item.remarks.replace(/"/g, '""')}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'AF_Form_74A_Accountability_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExport74aSuccess(true);
    setTimeout(() => {
      setExport74aSuccess(false);
    }, 4000);
  };

  return (
    <div className="space-y-8">
      {/* Top context header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Back to home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-amber-400" />
              Monthly Accountability Report (AF Form 74A)
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Provides granular tracking of individual booklet ranges, distribution pipelines, and reserve stocks.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0 scroll-smooth">
          <button
            id="export-74a-btn"
            onClick={handleExport74A}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-600/10"
          >
            <Download className="w-3.5 h-3.5" />
            Export 74A CSV Dataset
          </button>
          <button
            onClick={() => setShowPrintModal74A(true)}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-901 text-slate-200 border border-slate-700 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Auditor Print View (AF 74A)
          </button>
        </div>
      </div>

      {/* Verification alerts */}
      <AnimatePresence>
        {export74aSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 bg-amber-950/40 border border-amber-900/50 text-amber-400 rounded-lg flex items-center gap-2 text-xs font-sans"
          >
            <Check className="w-4.5 h-4.5 shrink-0" />
            <span>Success: Booklet dataset exported. Your <strong>AF_Form_74A_Accountability_Report.csv</strong> is downloaded!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booklet tracking ledger list */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-850 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4.5 h-4.5 text-slate-400" />
            <h3 className="text-sm font-semibold text-white">Monthly Custody Booklet Ranges</h3>
          </div>
          <div className="flex gap-2">
            <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full font-mono font-bold uppercase">
              Form Standard No. 74-A
            </span>
            <span className="text-[10px] bg-slate-950 border border-slate-800 text-slate-400 px-3 py-1 rounded-full font-mono font-bold">
              Submissions: Active
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-850 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                <th className="py-3 px-4">Registry Date</th>
                <th className="py-3 px-4">Accountable Form Type</th>
                <th className="py-3 px-4">Audit Category</th>
                <th className="py-3 px-4 font-mono">Inclusive Booklet Range</th>
                <th className="py-3 px-4 text-right">Quantity Sheets</th>
                <th className="py-3 px-4 text-center">Current Vault Status</th>
                <th className="py-3 px-4 text-right">Acquisition/Collection Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60 text-xs text-slate-350">
              {bookletsList.map((booklet) => (
                <tr key={booklet.id} className="hover:bg-slate-800/20">
                  <td className="py-3.5 px-4 font-mono text-slate-400">{booklet.date}</td>
                  <td className="py-3.5 px-4 font-semibold text-white">
                    AF No. <span className="font-mono text-emerald-400">{booklet.formType}</span> — {FORM_DEFAULTS[booklet.formType].name.split(' (')[0]}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-slate-400">{booklet.category}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-450">
                    {booklet.serialFrom} — {booklet.serialTo}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-250">
                    {booklet.bookletQty.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      booklet.status === 'Utilized' ? 'bg-amber-500/15 text-amber-400 border border-amber-900/10' :
                      booklet.status === 'In Depot Custody' ? 'bg-emerald-500/15 text-emerald-450 border border-emerald-900/10' :
                      'bg-indigo-500/15 text-indigo-400 border border-indigo-900/10'
                    }`}>
                      {booklet.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-300 font-semibold">
                    {booklet.allocatedAmount > 0 ? `₱${booklet.allocatedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Auditor Modal Overlay */}
      {showPrintModal74A && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white text-slate-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col"
          >
            {/* Modal Controls bar */}
            <div className="bg-slate-100 border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
              <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5 font-sans">
                <Shield className="w-4 h-4 text-amber-600" />
                Monthly Cashiers Audit Form 74A print setup
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Print Official Form 74A
                </button>
                <button
                  onClick={() => setShowPrintModal74A(false)}
                  className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded transition-all cursor-pointer"
                >
                  Close Print Layout
                </button>
              </div>
            </div>

            {/* Official Looking Document Print Preview with full signature cards */}
            <div className="p-8 font-sans text-xs flex-1 text-slate-850 space-y-8 print:p-0 bg-white" id="r74a-print-document">
              {/* Government Header */}
              <div className="text-center space-y-0.5 border-b border-slate-400 pb-4">
                <p className="uppercase tracking-wider font-bold text-[10px]">Republic of the Philippines</p>
                <p className="font-serif italic text-xs text-slate-650">COMMISSION ON AUDIT / MUNICIPAL ACCOUNTING OFFICE</p>
                <h2 className="text-sm font-bold font-sans tracking-wide pt-1 text-slate-900 uppercase">
                  Report of Accountability for Accountable Forms (Form 74A)
                </h2>
                <h4 className="text-[9px] font-mono text-slate-655">
                  Submission Interval Check: Monthly (Ending Jun 02, 2026)
                </h4>
              </div>

              {/* Informational Profile */}
              <div className="grid grid-cols-2 gap-4 text-[10px] leading-relaxed">
                <div>
                  <p><strong>ACCOUNTABLE OFFICER:</strong> BAGASANI, NYTHANJAN (TREASURER)</p>
                  <p><strong>REQUISITIONING AGENCY:</strong> Treasurer Office, Safe Box Registry</p>
                </div>
                <div className="text-right">
                  <p><strong>REGISTER ID:</strong> AF-74A-CUSTODY-2026-M5</p>
                  <p><strong>REPORTING DATE:</strong> June 02, 2026, 02:11 UTC</p>
                </div>
              </div>

              {/* Report Booklet List */}
              <table className="w-full text-[9px] text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-150 border-b border-slate-300 text-[8px] uppercase font-bold text-slate-700">
                    <th className="p-2 border-r border-slate-300">Form Name Index</th>
                    <th className="p-2 border-r border-slate-300">Audit Class</th>
                    <th className="p-2 border-r border-slate-300 font-mono">Booklet Serial Interval Handed</th>
                    <th className="p-2 text-right border-r border-slate-300">Sheets</th>
                    <th className="p-2 text-center border-r border-slate-300">Active Location Status</th>
                    <th className="p-2 text-right">Value Ledger Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {bookletsList.map((item) => (
                    <tr key={item.id} className="text-[9px]">
                      <td className="p-2 font-bold border-r border-slate-300 bg-slate-50">
                        AF No. {item.formType} — {FORM_DEFAULTS[item.formType].name.split(' (')[0]}
                      </td>
                      <td className="p-1.5 border-r border-slate-300">{item.category}</td>
                      <td className="p-1.5 font-mono border-r border-slate-300 text-slate-700 text-center">{item.serialFrom} — {item.serialTo}</td>
                      <td className="p-1.5 text-right font-mono border-r border-slate-300">{item.bookletQty.toLocaleString()}</td>
                      <td className="p-1.5 text-center border-r border-slate-300 font-semibold">{item.status}</td>
                      <td className="p-2 text-right font-mono">
                        {item.allocatedAmount > 0 ? `₱${item.allocatedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t-2 border-slate-900 bg-slate-100">
                    <td className="p-2" colSpan={3}>CUMULATIVE STOCKS REPORT SUMMARY</td>
                    <td className="p-1.5 text-right font-mono">{bookletsList.reduce((a, b) => a+b.bookletQty, 0).toLocaleString()} sheets</td>
                    <td className="p-1.5 text-center">Balanced</td>
                    <td className="p-2 text-right font-mono text-emerald-800">
                      ₱{bookletsList.reduce((a, b) => a+b.allocatedAmount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Statutory certification statements */}
              <div className="space-y-4 pt-4 border-t border-dashed border-slate-300 leading-relaxed text-[9px] text-slate-550">
                <p>
                  <strong>REGULATORY STATEMENT UNDER SECTION 507/74A:</strong> I officially state under standard penal conditions that these booklet records have been accurately audited index-by-index in accordance with municipal safe practices, and all inclusive receipt series have been successfully recorded in the central ledger directory without exception.
                </p>
                <div className="grid grid-cols-2 gap-12 pt-6">
                  <div className="text-center space-y-1">
                    <div className="border-b border-slate-900 h-6" />
                    <p className="font-bold text-slate-900 uppercase">Bagasani, Nythanjan</p>
                    <p className="text-[8px] uppercase tracking-wider">Treasury Custodial Auditor Signature</p>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="border-b border-slate-900 h-6" />
                    <p className="font-bold text-slate-900 uppercase">State Comptroller and Auditor General</p>
                    <p className="text-[8px] uppercase tracking-wider">Audit Attest Stamp Seal</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
