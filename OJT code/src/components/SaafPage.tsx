/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileSpreadsheet, Download, Printer, ArrowLeft, ShieldCheck, 
  UserSquare2, CalendarRange, Check, AlertCircle, FileText
} from 'lucide-react';
import { LogEntry, FormType, FORM_DEFAULTS } from '../types';

interface SaafPageProps {
  entries: LogEntry[];
  onNavigate: (tab: 'home' | 'or' | 'saaf' | '74a') => void;
}

interface SAAFRow {
  formCode: FormType;
  formName: string;
  // Beginning Inventory
  beginningQty: number;
  beginningSerials: string;
  // Received
  receivedQty: number;
  receivedSerials: string;
  // Issued
  issuedQty: number;
  issuedSerials: string;
  // Ending Balance
  endingQty: number;
  endingSerials: string;
  // Financial Collection value
  valueCollected: number;
}

export default function SaafPage({ entries, onNavigate }: SaafPageProps) {
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Core SAAF aggregation algorithm
  const generateSAAFData = (): SAAFRow[] => {
    return (['016', '51', '54'] as FormType[]).map(code => {
      const formEntries = entries.filter(e => e.formType === code);
      
      // Filter categories
      const balanceEntries = formEntries.filter(e => e.category === 'Balance');
      const receivedEntries = formEntries.filter(e => e.category === 'Received');
      const issuedEntries = formEntries.filter(e => e.category === 'Issued');

      // Tally Quantities
      const beginningQty = balanceEntries.reduce((sum, e) => sum + e.quantity, 0);
      const receivedQty = receivedEntries.reduce((sum, e) => sum + e.quantity, 0);
      const issuedQty = issuedEntries.reduce((sum, e) => sum + e.quantity, 0);
      const endingQty = beginningQty + receivedQty - issuedQty;

      // Extract serial lists/ranges
      const formatSerialsRange = (list: LogEntry[]) => {
        if (list.length === 0) return 'None';
        if (list.length === 1) return `${list[0].serialStart} — ${list[0].serialEnd}`;
        return `${list[0].serialStart} — ${list[list.length - 1].serialEnd}`;
      };

      const beginningSerials = formatSerialsRange(balanceEntries);
      const receivedSerials = formatSerialsRange(receivedEntries);
      const issuedSerials = formatSerialsRange(issuedEntries);

      // Compute Ending Serials logically by taking the first unissued serial up to the max received
      let endingSerials = 'None';
      if (endingQty > 0) {
        // Collect all ranges and find the last issued end index or starting point
        const allReceived = [...balanceEntries, ...receivedEntries].sort((a, b) => {
          return (parseInt(a.serialStart.replace(/\D/g, ''), 10) || 0) - (parseInt(b.serialStart.replace(/\D/g, ''), 10) || 0);
        });

        const allIssued = [...issuedEntries].sort((a, b) => {
          return (parseInt(a.serialEnd.replace(/\D/g, ''), 10) || 0) - (parseInt(b.serialEnd.replace(/\D/g, ''), 10) || 0);
        });

        if (allReceived.length > 0) {
          const absoluteStartSerial = allReceived[0].serialStart;
          const absoluteEndSerial = allReceived[allReceived.length - 1].serialEnd;
          
          if (allIssued.length > 0) {
            // Find next unissued serial
            const lastIssuedEnd = allIssued[allIssued.length - 1].serialEnd;
            const prefix = lastIssuedEnd.split('-')[0] + '-';
            const suffixNum = parseInt(lastIssuedEnd.replace(/\D/g, ''), 10) || 0;
            const nextUnissuedNum = suffixNum + 1;
            
            // Format back
            const nextUnissued = `${prefix}${nextUnissuedNum}`;
            endingSerials = `${nextUnissued} — ${absoluteEndSerial}`;
          } else {
            endingSerials = `${absoluteStartSerial} — ${absoluteEndSerial}`;
          }
        }
      }

      const valueCollected = issuedEntries.reduce((sum, e) => sum + e.amount, 0);

      return {
        formCode: code,
        formName: FORM_DEFAULTS[code].name,
        beginningQty,
        beginningSerials,
        receivedQty,
        receivedSerials,
        issuedQty,
        issuedSerials,
        endingQty,
        endingSerials,
        valueCollected
      };
    });
  };

  const saafRows = generateSAAFData();

  // Handle CSV Export
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Form Code,Form Description,Beginning Qty,Beginning Serials,Received Qty,Received Serials,Issued Qty,Issued Serials,Ending Qty,Ending Serials,Collections (PHP)\n';

    saafRows.forEach(row => {
      const escapedDesc = row.formName.replace(/"/g, '""');
      csvContent += `${row.formCode},"${escapedDesc}",${row.beginningQty},"${row.beginningSerials}",${row.receivedQty},"${row.receivedSerials}",${row.issuedQty},"${row.issuedSerials}",${row.endingQty},"${row.endingSerials}",${row.valueCollected}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Statement_of_Accountability_SAAF_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Trigger visual success notification
    setExportSuccess(true);
    setTimeout(() => {
      setExportSuccess(false);
    }, 4000);
  };

  return (
    <div className="space-y-8">
      {/* Top action context header */}
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
              <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
              Statement of Accountability (SAAF Form)
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Consolidated statutory schedule of local public accountable receipts and certificates.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/10"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV Dataset
          </button>
          <button
            onClick={() => setShowPrintModal(true)}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-902 text-slate-200 border border-slate-700 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Auditor Print View
          </button>
        </div>
      </div>

      {/* Verification alerts */}
      <AnimatePresence>
        {exportSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 rounded-lg flex items-center gap-2 text-xs font-sans"
          >
            <Check className="w-4.5 h-4.5" />
            <span>Success: Spreadsheet dataset exported. Your <strong>Statement_of_Accountability_SAAF_Report.csv</strong> is downloaded!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Consolidated Table Layout */}
      <div id="saaf-report-wrapper" className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarRange className="w-4.5 h-4.5 text-slate-400" />
            <h3 className="text-sm font-semibold text-white">Aggregated Register Summary (Monthly Ledger Cycle)</h3>
          </div>
          <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono px-3 py-1 rounded-full font-bold uppercase">
            Active Period: May - June 2026
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[960px]">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-850 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                <th className="py-4 px-4 sticky left-0 bg-slate-950 z-10 w-64">Name of Form</th>
                <th className="py-4 px-4 text-center border-l border-slate-850/55 bg-indigo-950/20" colSpan={2}>Balanced on hand (A)</th>
                <th className="py-4 px-4 text-center border-l border-slate-850/55 bg-emerald-950/20" colSpan={2}>Received Since (B)</th>
                <th className="py-4 px-4 text-center border-l border-slate-850/55 bg-amber-950/20" colSpan={2}>issued accountability (C)</th>
                <th className="py-4 px-4 text-center border-l border-slate-850/55 bg-teal-950/20" colSpan={2}>Balance of Accountability</th>
                <th className="py-4 px-4 text-right border-l border-slate-850/55">Value Collected</th>
              </tr>
              <tr className="bg-slate-950 border-b border-slate-850 text-[9px] text-slate-500 uppercase font-bold font-mono">
                <th className="py-2 px-4 sticky left-0 bg-slate-950">Line Item Index</th>
                {/* Begin */}
                <th className="py-2 px-2 text-center border-l border-slate-850/30">Serials Range</th>
                <th className="py-2 px-2 text-center">Qty</th>
                {/* Received */}
                <th className="py-2 px-2 text-center border-l border-slate-850/30">Serials Range</th>
                <th className="py-2 px-2 text-center">Qty</th>
                {/* Issued */}
                <th className="py-2 px-2 text-center border-l border-slate-850/30">Serials Range</th>
                <th className="py-2 px-2 text-center">Qty</th>
                {/* Ending */}
                <th className="py-2 px-2 text-center border-l border-slate-850/30">Serials Range</th>
                <th className="py-2 px-2 text-center">Qty</th>
                {/* Collected */}
                <th className="py-2 px-4 text-right border-l border-slate-850/30">Cash (₱)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60 text-xs text-slate-350">
              {saafRows.map((row) => (
                <tr key={row.formCode} className="hover:bg-slate-800/20">
                  <td className="py-4.5 px-4 font-semibold sticky left-0 bg-slate-900 z-10 text-white max-w-xs truncate">
                    AF No. <span className="font-mono text-emerald-450">{row.formCode}</span> — {row.formName.split('Form No. ')[1]?.split(' (')[0] || row.formName}
                  </td>
                  
                  {/* Beginning */}
                  <td className="py-4.5 px-2 text-center font-mono text-slate-450 border-l border-slate-850/30 text-[11px] bg-indigo-950/5">
                    {row.beginningSerials}
                  </td>
                  <td className="py-4.5 px-2 text-center font-mono font-bold bg-indigo-950/5 text-slate-200">
                    {row.beginningQty.toLocaleString()}
                  </td>

                  {/* Received */}
                  <td className="py-4.5 px-2 text-center font-mono text-slate-450 border-l border-slate-850/30 text-[11px] bg-emerald-950/5">
                    {row.receivedSerials}
                  </td>
                  <td className="py-4.5 px-2 text-center font-mono font-bold bg-emerald-950/5 text-emerald-400">
                    {row.receivedQty > 0 ? `+${row.receivedQty.toLocaleString()}` : '0'}
                  </td>

                  {/* Issued */}
                  <td className="py-4.5 px-2 text-center font-mono text-slate-450 border-l border-slate-850/30 text-[11px] bg-amber-950/5">
                    {row.issuedSerials}
                  </td>
                  <td className="py-4.5 px-2 text-center font-mono font-bold bg-amber-950/5 text-amber-500">
                    {row.issuedQty > 0 ? `-${row.issuedQty.toLocaleString()}` : '0'}
                  </td>

                  {/* Ending */}
                  <td className="py-4.5 px-2 text-center font-mono text-slate-450 border-l border-slate-850/30 text-[11px] bg-teal-950/5">
                    {row.endingSerials}
                  </td>
                  <td className="py-4.5 px-2 text-center font-mono font-bold bg-teal-950/5 text-white">
                    {row.endingQty.toLocaleString()}
                  </td>

                  {/* Collected */}
                  <td className="py-4.5 px-4 text-right font-mono text-slate-200 border-l border-slate-850/30 font-semibold bg-slate-950/15">
                    ₱{row.valueCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Auditor Modal Overlay */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white text-slate-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col"
          >
            {/* Modal Controls bar */}
            <div className="bg-slate-100 border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
              <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5 font-sans">
                <FileText className="w-4 h-4 text-emerald-600" />
                Auditor Sign-off Form Print layout
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Trigger Print Dialog
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded transition-all cursor-pointer"
                >
                  Close Print Layout
                </button>
              </div>
            </div>

            {/* Official Looking Document Print Preview with full signature cards */}
            <div className="p-8 font-sans text-xs flex-1 text-slate-800 space-y-8 print:p-0 bg-white" id="saaf-print-document">
              {/* Government Header */}
              <div className="text-center space-y-1 border-b-2 border-slate-900 pb-4">
                <p className="uppercase tracking-wider font-bold text-[11px]">Republic of the Philippines</p>
                <p className="font-serif italic text-sm text-slate-600">OFFICE OF THE MUNICIPAL TREASURER</p>
                <p className="text-[10px] text-slate-500">Provincial Depository Treasury Division</p>
                <h2 className="text-base font-bold font-sans tracking-wide pt-2 text-slate-900">
                  STATEMENT OF ACCOUNTABILITY FOR ACCOUNTABLE FORMS
                </h2>
                <h4 className="text-[10px] font-mono text-slate-600">
                  Reporting Cycle: May 01, 2026 to June 02, 2026
                </h4>
              </div>

              {/* Informational Profile */}
              <div className="grid grid-cols-2 gap-4 text-[11px] leading-relaxed">
                <div>
                  <p><strong>ACCOUNTABLE OFFICER:</strong> BAGASANI, NYTHANJAN (CUSTODIAN)</p>
                  <p><strong>DESIGNATION:</strong> Municipal Cashier / Accountable Safe Officer</p>
                  <p><strong>AGENCY STATION:</strong> Treasury Vault Office, Main Mun. Hall</p>
                </div>
                <div className="text-right">
                  <p><strong>AUDIT STATUS:</strong> SUBMITTED / NOT ARREARS</p>
                  <p><strong>DATE GENERATED:</strong> June 02, 2026, 02:11 UTC</p>
                  <p><strong>REF REGISTER INDEX:</strong> SAAS-AFT-2026-062</p>
                </div>
              </div>

              {/* Aggregated Form Table */}
              <table className="w-full text-[10px] text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-300 text-[9px] uppercase font-bold text-slate-700">
                    <th className="p-2 border-r border-slate-300">Name of Form</th>
                    <th className="p-2 text-center border-r border-slate-300" colSpan={2}>Balanced on hand</th>
                    <th className="p-2 text-center border-r border-slate-300" colSpan={2}>Received Since</th>
                    <th className="p-2 text-center border-r border-slate-300" colSpan={2}>issued accountability</th>
                    <th className="p-2 text-center border-r border-slate-300" colSpan={2}>Balance of Accountability</th>
                    <th className="p-2 text-right">Collections (₱)</th>
                  </tr>
                  <tr className="bg-slate-100 border-b border-slate-300 font-mono text-[8px] text-[8px] text-slate-600">
                    <th className="p-1 border-r border-slate-300">Form Name</th>
                    {/* Begin */}
                    <th className="p-1 border-r border-slate-300 text-center">Inclusive Range</th>
                    <th className="p-1 border-r border-slate-300 text-center">Qty</th>
                    {/* Rec */}
                    <th className="p-1 border-r border-slate-300 text-center">Inclusive Range</th>
                    <th className="p-1 border-r border-slate-300 text-center">Qty</th>
                    {/* Iss */}
                    <th className="p-1 border-r border-slate-300 text-center">Inclusive Range</th>
                    <th className="p-1 border-r border-slate-300 text-center">Qty</th>
                    {/* End */}
                    <th className="p-1 border-r border-slate-300 text-center">Inclusive Range</th>
                    <th className="p-1 border-r border-slate-300 text-center">Qty</th>
                    {/* Cash */}
                    <th className="p-1 text-right">Cash Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {saafRows.map((row) => (
                    <tr key={row.formCode} className="text-[9px]">
                      <td className="p-2 font-bold border-r border-slate-300 bg-slate-50/50">
                        AF No. {row.formCode} ({row.formName.split('Form No. ')[1]?.split(' (')[0] || ''})
                      </td>
                      <td className="p-1.5 text-center font-mono border-r border-slate-300 text-slate-600">{row.beginningSerials}</td>
                      <td className="p-1.5 text-center font-mono border-r border-slate-300">{row.beginningQty.toLocaleString()}</td>
                      
                      <td className="p-1.5 text-center font-mono border-r border-slate-300 text-slate-600">{row.receivedSerials}</td>
                      <td className="p-1.5 text-center font-mono border-r border-slate-300 text-emerald-700">+{row.receivedQty.toLocaleString()}</td>

                      <td className="p-1.5 text-center font-mono border-r border-slate-300 text-slate-600">{row.issuedSerials}</td>
                      <td className="p-1.5 text-center font-mono border-r border-slate-300 text-amber-700">-{row.issuedQty.toLocaleString()}</td>

                      <td className="p-1.5 text-center font-mono border-r border-slate-300 text-slate-600">{row.endingSerials}</td>
                      <td className="p-1.5 text-center font-mono border-r border-slate-300 font-bold">{row.endingQty.toLocaleString()}</td>

                      <td className="p-2 text-right font-mono border-slate-300 bg-slate-50/50">
                        ₱{row.valueCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Statutory certification statements */}
              <div className="space-y-4 pt-4 border-t border-dashed border-slate-300 leading-relaxed text-[10px] text-slate-600">
                <p>
                  <strong>CERTIFICATION STATEMENT:</strong> I hereby certify on my official oath that the statement of accountable forms above is a full, true, and correct report of all accountable receipt structures that have passed my custody, and that all serial counters run in regular chronological progression without bypass or missing numbers. Verified in cash books on date listed below:
                </p>
                <div className="grid grid-cols-2 gap-12 pt-6">
                  <div className="text-center space-y-1">
                    <div className="border-b border-slate-900 h-6" />
                    <p className="font-bold text-slate-900 uppercase">Bagasani, Nythanjan</p>
                    <p className="text-[9px] uppercase tracking-wider">Accountable Cashier Officer Signature</p>
                    <p className="text-[8px] text-slate-450 font-mono">Date: June 02, 2026</p>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="border-b border-slate-900 h-6" />
                    <p className="font-bold text-slate-900 uppercase">Commission On Audit Office</p>
                    <p className="text-[9px] uppercase tracking-wider">State Examiner / Audit Division</p>
                    <p className="text-[8px] text-slate-450 font-mono">Seal of Receipt Verification</p>
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
