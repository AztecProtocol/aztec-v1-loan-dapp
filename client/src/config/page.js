const PAGES = [
  'pending',
  'lender',
  'borrower',
  'create',
  'balance',
];

export const PAGE_NAME = {};
PAGES.forEach(name => PAGE_NAME[name] = name);

export const routes = [
  {
    name: PAGE_NAME.pending,
    path: '/pending',
    title: 'Pending Loans',
  },
  {
    name: PAGE_NAME.lender,
    path: '/lender',
    title: 'Approved Loans',
  },
  {
    name: PAGE_NAME.borrower,
    path: '/borrower',
    title: 'Manage Loans',
  },
  {
    name: PAGE_NAME.create,
    path: '/create',
    title: 'Create New Loan',
  },
  {
    name: PAGE_NAME.balance,
    path: '/balance',
    title: 'Account Balance',
  },
];

export const homePage = PAGE_NAME.lender;
