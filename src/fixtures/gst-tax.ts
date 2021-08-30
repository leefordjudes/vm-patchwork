export const GST_TAXES = [
  {
    name: 'GST 0%',
    code: 'gst0',
    ratio: { cgst: 0, sgst: 0, igst: 0 },
  },
  {
    name: 'GST 0.1%',
    code: 'gst0p1',
    ratio: { cgst: 0.05, sgst: 0.05, igst: 0.1 },
  },
  {
    name: 'GST 0.25%',
    code: 'gst0p25',
    ratio: { cgst: 0.125, sgst: 0.125, igst: 0.25 },
  },
  {
    name: 'GST 1%',
    code: 'gst1',
    ratio: { cgst: 0.5, sgst: 0.5, igst: 1 },
  },
  {
    name: 'GST 1.5%',
    code: 'gst1p5',
    ratio: { cgst: 0.75, sgst: 0.75, igst: 1.5 },
  },
  {
    name: 'GST 3%',
    code: 'gst3',
    ratio: { cgst: 1.5, sgst: 1.5, igst: 3 },
  },
  {
    name: 'GST 5%',
    defaultName: 'GST_5',
    code: 'gst5',
    ratio: { cgst: 2.5, sgst: 2.5, igst: 5 },
  },
  {
    name: 'GST 7.5%',
    code: 'gst7p5',
    ratio: { cgst: 3.75, sgst: 3.75, igst: 7.5 },
  },
  {
    name: 'GST 12%',
    code: 'gst12',
    ratio: { cgst: 6, sgst: 6, igst: 12 },
  },
  {
    name: 'GST 18%',
    code: 'gst18',
    ratio: { cgst: 9, sgst: 9, igst: 18 },
  },
  {
    name: 'GST 28%',
    code: 'gst28',
    ratio: { cgst: 14, sgst: 14, igst: 28 },
  },
  {
    name: 'Not Applicable',
    code: 'gstna',
    ratio: { cgst: 0, sgst: 0, igst: 0 },
  },
  // {
  //   name: 'Nil Rated',
  //   code: 'gstnr',
  //   ratio: { cgst: 0, sgst: 0, igst: 0 },
  // },
  {
    name: 'GST Exempt',
    code: 'gstexempt',
    ratio: { cgst: 0, sgst: 0, igst: 0 },
  },
  {
    name: 'Non GST Supply',
    code: 'gstngs',
    ratio: { cgst: 0, sgst: 0, igst: 0 },
  },
];
