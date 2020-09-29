export const PRIVILEGE = {
  accounting: {
    title: 'Accounting',
    account: {
      title: 'Account',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['accounting.account.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['accounting.account.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['accounting.account.update'],
      },
      opening: {
        name: 'Account opening',
        value: false,
        requisites: ['accounting.account.create'],
      },
    },
    costCentre: {
      title: 'Cost Centre',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['accounting.costCentre.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['accounting.costCentre.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['accounting.costCentre.update'],
      },
    },
    costCategory: {
      title: 'Cost Category',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['accounting.costCategory.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['accounting.costCategory.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['accounting.costCategory.update'],
      },
    },
    cashDeposit: {
      title: 'Cash Deposit',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['accounting.cashDeposit.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['accounting.cashDeposit.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['accounting.cashDeposit.update'],
      },
    },
    cashWithdrawal: {
      title: 'Cash Withdrawal',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['accounting.cashWithdrawal.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['accounting.cashWithdrawal.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['accounting.cashWithdrawal.update'],
      },
    },
    journal: {
      title: 'Journal',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['accounting.journal.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['accounting.journal.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['accounting.journal.update'],
      },
    },
    accountPayment: {
      title: 'Account Payment',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['accounting.accountPayment.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['accounting.accountPayment.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['accounting.accountPayment.update'],
      },
    },
    expensePayment: {
      title: 'Expense Payment',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['accounting.expensePayment.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['accounting.expensePayment.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['accounting.expensePayment.update'],
      },
    },
    accountReceipt: {
      title: 'Account Receipt',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['accounting.accountReceipt.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['accounting.accountReceipt.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['accounting.accountReceipt.update'],
      },
    },
    incomeReceipt: {
      title: 'Income Receipt',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['accounting.incomeReceipt.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['accounting.incomeReceipt.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['accounting.incomeReceipt.update'],
      },
    },
  },
  inventory: {
    title: 'Inventory',
    section: {
      title: 'Section',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['inventory.section.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['inventory.section.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['inventory.section.update'],
      },
    },
    inventory: {
      title: 'Inventory',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['inventory.inventory.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['inventory.inventory.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['inventory.inventory.update'],
      },
      opening: {
        name: 'Inventory opening',
        value: false,
        requisites: ['inventory.inventory.create'],
      },
      assignRacks: {
        name: 'Assign Racks',
        value: false,
        requisites: ['inventory.inventory.create'],
      },
      unitConversion: {
        name: 'Unit Conversion',
        value: false,
        requisites: ['inventory.inventory.create'],
      },
      applyDiscount: {
        name: 'Apply Discount',
        value: false,
        requisites: ['inventory.inventory.create'],
      },
      preferredVendors: {
        name: 'Inventory Dealer',
        value: false,
        requisites: ['inventory.inventory.create'],
      },
    },
    manufacturer: {
      title: 'Manufacturer',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['inventory.manufacturer.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['inventory.manufacturer.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['inventory.manufacturer.update'],
      },
    },
    rack: {
      title: 'Rack',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['inventory.rack.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['inventory.rack.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['inventory.rack.update'],
      },
    },
    unit: {
      title: 'Unit',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['inventory.unit.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['inventory.unit.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['inventory.unit.update'],
      },
    },
    pharmaSalt: {
      title: 'Pharma Salt',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['inventory.pharmaSalt.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['inventory.pharmaSalt.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['inventory.pharmaSalt.update'],
      },
    },
    cashPurchase: {
      title: 'Cash Purchase',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['inventory.cashPurchase.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['inventory.cashPurchase.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['inventory.cashPurchase.update'],
      },
    },
    creditPurchase: {
      title: 'Credit Purchase',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['inventory.creditPurchase.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['inventory.creditPurchase.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['inventory.creditPurchase.update'],
      },
    },
    cashSale: {
      title: 'Cash Sale',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['inventory.cashSale.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['inventory.cashSale.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['inventory.cashSale.update'],
      },
    },
    creditSale: {
      title: 'Credit Sale',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['inventory.creditSale.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['inventory.creditSale.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['inventory.creditSale.update'],
      },
    },
    cashPurchaseReturn: {
      title: 'Cash Purchase Return',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['inventory.cashPurchaseReturn.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['inventory.cashPurchaseReturn.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['inventory.cashPurchaseReturn.update'],
      },
    },
    creditPurchaseReturn: {
      title: 'Credit Purchase Return',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['inventory.creditPurchaseReturn.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['inventory.creditPurchaseReturn.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['inventory.creditPurchaseReturn.update'],
      },
    },
    cashSaleReturn: {
      title: 'Cash Sale Return',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['inventory.cashSaleReturn.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['inventory.cashSaleReturn.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['inventory.cashSaleReturn.update'],
      },
    },
    creditSaleReturn: {
      title: 'Credit Sale Return',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['inventory.creditSaleReturn.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['inventory.creditSaleReturn.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['inventory.creditSaleReturn.update'],
      },
    },
    stockAdjustment: {
      title: 'Stock Adjustment',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['inventory.stockAdjustment.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['inventory.stockAdjustment.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['inventory.stockAdjustment.update'],
      },
    },
    stockTransfer: {
      title: 'Stock Transfer',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['inventory.stockTransfer.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['inventory.stockTransfer.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['inventory.stockTransfer.update'],
      },
    },
  },
  contacts: {
    title: 'Contacts',
    customer: {
      title: 'Customer',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['contacts.customer.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['contacts.customer.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['contacts.customer.update'],
      },
      opening: {
        name: 'Customer opening',
        value: false,
        requisites: ['contacts.customer.create'],
      },
    },
    vendor: {
      title: 'Vendor',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['contacts.vendor.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['contacts.vendor.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['contacts.vendor.update'],
      },
      opening: {
        name: 'Vendor opening',
        value: false,
        requisites: ['contacts.vendor.create'],
      },
    },
    customerPayment: {
      title: 'Customer Payment',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['contacts.customerPayment.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['contacts.customerPayment.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['contacts.customerPayment.update'],
      },
    },
    vendorPayment: {
      title: 'Vendor Payment',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['contacts.vendorPayment.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['contacts.vendorPayment.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['contacts.vendorPayment.update'],
      },
    },
    customerReceipt: {
      title: 'Customer Receipt',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['contacts.customerReceipt.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['contacts.customerReceipt.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['contacts.customerReceipt.update'],
      },
    },
    vendorReceipt: {
      title: 'Vendor Receipt',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['contacts.vendorReceipt.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['contacts.vendorReceipt.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['contacts.vendorReceipt.update'],
      },
    },
    doctor: {
      title: 'Doctor',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['contacts.doctor.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['contacts.doctor.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['contacts.doctor.update'],
      },
    },
    patient: {
      title: 'Patient',
      view: { name: 'View', value: false, requisites: [] },
      create: {
        name: 'Create',
        value: false,
        requisites: ['contacts.patient.view'],
      },
      update: {
        name: 'Update',
        value: false,
        requisites: ['contacts.patient.create'],
      },
      delete: {
        name: 'Delete',
        value: false,
        requisites: ['contacts.patient.update'],
      },
    },
  },
  report: {
    title: 'Report',
    account: {
      title: 'Account',
      accountBook: { name: 'Account Book', value: false, requisites: [] },
      expenseAnalysis: {
        name: 'Expense Analysis',
        value: false,
        requisites: [],
      },
      balanceSheet: { name: 'Balance Sheet', value: false, requisites: [] },
    },
    customer: {
      title: 'Customer',
      customerBook: { name: 'Customer Book', value: false, requisites: [] },
      customerOutstanding: {
        name: 'Customer Outstanding',
        value: false,
        requisites: [],
      },
      invoiceAgingSummary: {
        name: 'Invoice Aging Summary',
        value: false,
        requisites: [],
      },
    },
    vendor: {
      title: 'Vendor',
      vendorBook: { name: 'Vendor Book', value: false, requisites: [] },
      vendorOutstanding: {
        name: 'Vendor Outstanding',
        value: false,
        requisites: [],
      },
    },
    inventory: {
      title: 'Inventory',
      inventoryBook: { name: 'Inventory Book', value: false, requisites: [] },
      stockAnalysis: { name: 'Stock Analysis', value: false, requisites: [] },
      stockValuationSummary: {
        name: 'Stock Valuation Summary',
        value: false,
        requisites: [],
      },
      productwiseSales: {
        name: 'Product-wise Sales',
        value: false,
        requisites: [],
      },
      productwiseProfit: {
        name: 'Product-wise Profit',
        value: false,
        requisites: [],
      },
      reorderAnalysis: {
        name: 'Reorder Analysis',
        value: false,
        requisites: [],
      },
    },
    cashRegister: {
      title: 'Cash Register',
      cashRegisterBook: {
        name: 'Cash Register Book',
        value: false,
        requisites: [],
      },
    },
    branch: {
      title: 'Branch',
      branchBook: { name: 'Branch Book', value: false, requisites: [] },
    },
    gstReturns: {
      title: 'GST Returns',
      GSTR1Summary: {
        name: 'Summary of Outward Supplies (GSTR-1)',
        value: false,
        requisites: [],
      },
    },
    dashboard: {
      title: 'Dashboard',
      view: { name: 'View', value: false, requisites: [] },
      viewUsers: {
        name: 'View Users',
        value: false,
        requisites: ['report.dashboard.view'],
      },
      allowUsers: {
        name: 'Allow Users',
        value: false,
        requisites: ['report.dashboard.view'],
      },
      saleSummary: {
        name: 'View Sale Summary',
        value: false,
        requisites: ['report.dashboard.view'],
      },
    },
  },
  tax: {
    title: 'Tax',
    tax: {
      title: 'Tax',
      view: { name: 'View', value: false, requisites: [] },
      create: { name: 'Create', value: false, requisites: ['tax.tax.view'] },
      update: { name: 'Update', value: false, requisites: ['tax.tax.create'] },
      delete: { name: 'Delete', value: false, requisites: ['tax.tax.update'] },
    },
  },
  utility: {
    title: 'Utility',
    label: {
      title: 'Label',
      batchLabel: { name: 'Batch Label', value: false, requisites: [] },
    },
  },
};
