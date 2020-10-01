export const privilegeJsonSchema = {
  type: 'object',
  properties: {
    accounting: {
      type: 'object',
      properties: {
        account: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            opening: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view', 'create', 'update', 'delete', 'opening'],
        },
        costCentre: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view', 'create', 'update', 'delete'],
        },
        costCategory: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view', 'create', 'update', 'delete'],
        },
        cashDeposit: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view', 'create', 'update', 'delete'],
        },
        cashWithdrawal: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view', 'create', 'update', 'delete'],
        },
        journal: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view', 'create', 'update', 'delete'],
        },
        accountPayment: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view', 'create', 'update', 'delete'],
        },
        expensePayment: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view', 'create', 'update', 'delete'],
        },
        accountReceipt: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view', 'create', 'update', 'delete'],
        },
        incomeReceipt: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view', 'create', 'update', 'delete'],
        },
      },
      required: [
        'account',
        'costCentre',
        'costCategory',
        'cashDeposit',
        'cashWithdrawal',
        'journal',
        'accountPayment',
        'expensePayment',
        'accountReceipt',
        'incomeReceipt',
      ],
    },
    inventory: {
      type: 'object',
      properties: {
        section: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view', 'create', 'update', 'delete'],
        },
        inventory: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            opening: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            assignRacks: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            unitConversion: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            applyDiscount: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            preferredVendors: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: [
            'view',
            'create',
            'update',
            'delete',
            'opening',
            'assignRacks',
            'unitConversion',
            'applyDiscount',
            'preferredVendors',
          ],
        },
        manufacturer: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view', 'create', 'update', 'delete'],
        },
        rack: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view', 'create', 'update', 'delete'],
        },
        unit: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view', 'create', 'update', 'delete'],
        },
        cashPurchase: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view', 'create', 'update', 'delete'],
        },
        creditPurchase: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view', 'create', 'update', 'delete'],
        },
        cashSale: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view', 'create', 'update', 'delete'],
        },
        creditSale: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view', 'create', 'update', 'delete'],
        },
        cashPurchaseReturn: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view', 'create', 'update', 'delete'],
        },
        creditPurchaseReturn: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view', 'create', 'update', 'delete'],
        },
        cashSaleReturn: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view', 'create', 'update', 'delete'],
        },
        creditSaleReturn: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            dateRestriction: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view', 'create', 'update', 'delete', 'dateRestriction'],
        },
        stockAdjustment: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view', 'create', 'update', 'delete'],
        },
        stockTransfer: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view', 'create', 'update', 'delete'],
        },
      },
      required: [
        'section',
        'inventory',
        'manufacturer',
        'rack',
        'unit',
        'cashPurchase',
        'creditPurchase',
        'cashSale',
        'creditSale',
        'cashPurchaseReturn',
        'creditPurchaseReturn',
        'cashSaleReturn',
        'creditSaleReturn',
        'stockAdjustment',
        'stockTransfer',
      ],
    },
    contacts: {
      type: 'object',
      properties: {
        customer: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            opening: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view', 'create', 'update', 'delete', 'opening'],
        },
        vendor: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            opening: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view', 'create', 'update', 'delete', 'opening'],
        },
        customerPayment: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view', 'create', 'update', 'delete'],
        },
        vendorPayment: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view', 'create', 'update', 'delete'],
        },
        customerReceipt: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view', 'create', 'update', 'delete'],
        },
        vendorReceipt: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view', 'create', 'update', 'delete'],
        },
        doctor: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view', 'create', 'update', 'delete'],
        },
        patient: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view', 'create', 'update', 'delete'],
        },
      },
      required: [
        'customer',
        'vendor',
        'customerPayment',
        'vendorPayment',
        'customerReceipt',
        'vendorReceipt',
        'doctor',
        'patient',
      ],
    },
    report: {
      type: 'object',
      properties: {
        account: {
          type: 'object',
          properties: {
            accountBook: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            expenseAnalysis: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            balanceSheet: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['accountBook', 'expenseAnalysis', 'balanceSheet'],
        },
        customer: {
          type: 'object',
          properties: {
            customerBook: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            customerOutstanding: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            invoiceAgingSummary: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['customerBook', 'customerOutstanding', 'invoiceAgingSummary'],
        },
        vendor: {
          type: 'object',
          properties: {
            vendorBook: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            vendorOutstanding: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['vendorBook', 'vendorOutstanding'],
        },
        inventory: {
          type: 'object',
          properties: {
            inventoryBook: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            stockAnalysis: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            stockValuationSummary: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            productwiseSales: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            productwiseProfit: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            reorderAnalysis: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: [
            'inventoryBook',
            'stockAnalysis',
            'stockValuationSummary',
            'productwiseSales',
            'productwiseProfit',
            'reorderAnalysis',
          ],
        },
        cashRegister: {
          type: 'object',
          properties: {
            cashRegisterBook: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['cashRegisterBook'],
        },
        branch: {
          type: 'object',
          properties: {
            branchBook: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['branchBook'],
        },
        activities: {
          type: 'object',
          properties: {
            activityLog: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['activityLog'],
        },
        gstReturns: {
          type: 'object',
          properties: {
            summaryOfOutwardSupplies: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['summaryOfOutwardSupplies'],
        },
      },
      required: ['account', 'customer', 'vendor', 'inventory', 'cashRegister', 'branch', 'activities', 'gstReturns'],
    },
    tax: {
      type: 'object',
      properties: {
        tax: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            create: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            update: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
            delete: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view', 'create', 'update', 'delete'],
        },
      },
      required: ['tax'],
    },
    utility: {
      type: 'object',
      properties: {
        batchLabel: {
          type: 'object',
          properties: {
            view: {
              type: 'object',
              properties: {
                value: {
                  type: 'boolean',
                },
              },
              required: ['value'],
            },
          },
          required: ['view'],
        },
      },
      required: ['batchLabel'],
    },
  },
  required: ['accounting', 'inventory', 'contacts', 'report', 'tax', 'utility'],
};
