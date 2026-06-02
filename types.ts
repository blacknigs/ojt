/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type FormType = '016' | '51' | '54';
export type CategoryType = 'Balance' | 'Received' | 'Issued';

export interface LogEntry {
  id: string;
  formType: FormType;
  category: CategoryType;
  quantity: number;
  amount: number;
  date: string;
  serialStart: string;
  serialEnd: string;
  remarks: string;
}

export interface FormMetadata {
  code: FormType;
  name: string;
  description: string;
  denomination?: number; // Face value if applicable
}

export const FORM_DEFAULTS: Record<FormType, FormMetadata> = {
  '016': {
    code: '016',
    name: 'Accountable Form No. 16 (Certificate)',
    description: 'Used for withholding tax certificates and custody of non-cash values.',
  },
  '51': {
    code: '51',
    name: 'Accountable Form No. 51 (Official Receipt)',
    description: 'General Official Receipt form for tax and revenue collections.',
  },
  '54': {
    code: '54',
    name: 'Accountable Form No. 54 (Cash Ticket / Receipt)',
    description: 'Special receipts for specialized cash collection nodes.',
  },
};

export const INITIAL_ENTRIES: LogEntry[] = [
  // Form 51 (OR)
  {
    id: 'init-51-bal',
    formType: '51',
    category: 'Balance',
    quantity: 500,
    amount: 0,
    date: '2026-05-01',
    serialStart: '51-10001',
    serialEnd: '51-10500',
    remarks: 'Beginning balance inventory audit.',
  },
  {
    id: 'init-51-rec',
    formType: '51',
    category: 'Received',
    quantity: 1000,
    amount: 150000,
    date: '2026-05-12',
    serialStart: '51-10501',
    serialEnd: '51-11500',
    remarks: 'Requisition from central treasury office.',
  },
  {
    id: 'init-51-iss',
    formType: '51',
    category: 'Issued',
    quantity: 450,
    amount: 45000,
    date: '2026-05-28',
    serialStart: '51-10001',
    serialEnd: '51-10450',
    remarks: 'Daily collections issued to taxpayers.',
  },

  // Form 016
  {
    id: 'init-016-bal',
    formType: '016',
    category: 'Balance',
    quantity: 200,
    amount: 0,
    date: '2026-05-01',
    serialStart: '16-05001',
    serialEnd: '16-05200',
    remarks: 'Carry over from previous cash book period.',
  },
  {
    id: 'init-016-rec',
    formType: '016',
    category: 'Received',
    quantity: 200,
    amount: 10000,
    date: '2026-05-18',
    serialStart: '16-05201',
    serialEnd: '16-05400',
    remarks: 'New booklet replenishment.',
  },
  {
    id: 'init-016-iss',
    formType: '016',
    category: 'Issued',
    quantity: 120,
    amount: 6000,
    date: '2026-05-25',
    serialStart: '16-05001',
    serialEnd: '16-05120',
    remarks: 'Issued certificates for municipal withholding.',
  },

  // Form 54
  {
    id: 'init-54-bal',
    formType: '54',
    category: 'Balance',
    quantity: 300,
    amount: 0,
    date: '2026-05-01',
    serialStart: '54-00101',
    serialEnd: '54-00400',
    remarks: 'Inventory of unused cash tickets in safe vault.',
  },
  {
    id: 'init-54-rec',
    formType: '54',
    category: 'Received',
    quantity: 200,
    amount: 25000,
    date: '2026-05-15',
    serialStart: '54-00401',
    serialEnd: '54-00600',
    remarks: 'Replenished from regional depository helper.',
  },
  {
    id: 'init-54-iss',
    formType: '54',
    category: 'Issued',
    quantity: 95,
    amount: 4750,
    date: '2026-05-29',
    serialStart: '54-00101',
    serialEnd: '54-00195',
    remarks: 'Market stall tax ticket distribution.',
  },
];
