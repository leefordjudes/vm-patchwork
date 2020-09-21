export const ACCOUNT_TYPE = [
  {
    name: 'Direct Income',
    defaultName: 'DIRECT_INCOME',
  },
  {
    name: 'Indirect Income',
    defaultName: 'INDIRECT_INCOME',
  },
  {
    name: 'Direct Expense',
    defaultName: 'DIRECT_EXPENSE',
  },
  {
    name: 'Indirect Expense',
    defaultName: 'INDIRECT_EXPENSE',
  },
  {
    name: 'Fixed Asset',
    defaultName: 'FIXED_ASSET',
  },
  {
    name: 'Current Asset',
    defaultName: 'CURRENT_ASSET',
  },
  {
    name: 'LongTerm Liability',
    defaultName: 'LONGTERM_LIABILITY',
  },
  {
    name: 'Current Liability',
    defaultName: 'CURRENT_LIABILITY',
  },
  {
    name: 'Equity',
    defaultName: 'EQUITY',
  },
  {
    name: 'Cash',
    defaultName: 'CASH',
  },
  {
    name: 'Account Payable',
    defaultName: 'ACCOUNT_PAYABLE',
  },
  {
    name: 'Account Receivable',
    defaultName: 'ACCOUNT_RECEIVABLE',
  },
  {
    name: 'Stock',
    defaultName: 'STOCK',
  },
  {
    name: 'Cost Of Goods Sold',
    defaultName: 'COST_OF_GOODS_SOLD',
  },
  {
    name: 'Undeposited Funds',
    defaultName: 'UNDEPOSITED_FUNDS',
    parentType: 'CASH',
  },
  {
    name: 'Bank Account',
    defaultName: 'BANK_ACCOUNT',
    parentType: 'CURRENT_ASSET',
  },
  {
    name: 'Bank OD Account',
    defaultName: 'BANK_OD_ACCOUNT',
    parentType: 'CURRENT_LIABILITY',
  },
  {
    name: 'GST Payable',
    defaultName: 'GST_PAYABLE',
    parentType: 'CURRENT_LIABILITY',
  },
  {
    name: 'GST Receivable',
    defaultName: 'GST_RECEIVABLE',
    parentType: 'CURRENT_ASSET',
  },
];
