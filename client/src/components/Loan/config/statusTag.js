import loanStatus from '../../../utils/loanStatus';

export default {
  [loanStatus('default')]: {
    text: 'In Default',
    background: 'red',
  },
  [loanStatus('repaid')]: {
    text: 'Repaid',
    background: 'primary',
  },
  [loanStatus('settled')]: {
    text: 'Settled',
    background: 'green',
  },
  [loanStatus('awaiting_settlement')]: {
    text: 'Awaiting Settlement',
    background: 'yellow',
    color: 'grey',
  },
  [loanStatus('awaiting_approval')]: {
    text: 'Locked',
    background: 'grey-light',
    color: 'white',
  },
  [loanStatus('pending')]: {
    text: 'Locked',
    background: 'grey-light',
    color: 'white',
  },
};
