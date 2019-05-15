export const orderedStatus = [
  'pending',
  'awaiting_approval',
  'awaiting_settlement',
  'settled',
  'repaid',
  'default',
  'expired',
];

const LOAN_STATUS = {};
orderedStatus.forEach(name => LOAN_STATUS[name] = name);

export default LOAN_STATUS;
