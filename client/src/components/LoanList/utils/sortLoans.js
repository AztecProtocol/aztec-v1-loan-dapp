import sort, {
  sortBySortedArray,
  ASC,
} from '@aztec/guacamole-ui/dist/utils/sort';
import {
  orderedStatus,
} from '../../../config/loanStatus';

export default function sortLoans(loans, sortBy, sortOrder) {
  if (sortBy === 'status') {
    const sortedStatus = sortOrder === ASC
      ? orderedStatus
      : [...orderedStatus].reverse();
    return sortBySortedArray(
      loans,
      sortedStatus,
      'status',
    );
  }

  return sort(
    loans,
    sortBy,
    sortOrder,
  );
}
