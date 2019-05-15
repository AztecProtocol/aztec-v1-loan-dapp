import {
  currencyIdMapping,
} from '../../../config/settlementCurrency';

export const isRequired = val => !!(val || val === 0);

const requiredErrorMessage = 'This field is required';

const column = { s: 6, xxs: 12 };

export default [
  {
    buttonText: 'Create New Loan',
    errorPosition: 'right',
    fields: [
      {
        fieldName: 'notional',
        inputType: 'number',
        label: 'Notional',
        column,
        colBreak: true,
        isRequired: true,
        defaultValue: '',
        fieldValidators: [
          {
            validator: isRequired,
            errorMessage: requiredErrorMessage,
          },
        ],
      },
      {
        fieldName: 'settlementCurrency',
        inputType: 'select',
        label: 'Settlement Currency',
        column,
        colBreak: true,
        defaultValue: Object.keys(currencyIdMapping)[0],
        itemGroups: [
          {
            items: Object.keys(currencyIdMapping).map(currencyId => ({
              value: currencyId,
              title: currencyIdMapping[currencyId].name,
            })),
          },
        ],
      },
      {
        fieldName: 'interestRate',
        inputType: 'number',
        label: 'Interest Rate',
        column,
        colBreak: true,
        isRequired: true,
        defaultValue: 1,
        extraProps: {
          suffix: ' %',
        },
        fieldValidators: [
          {
            validator: isRequired,
            errorMessage: requiredErrorMessage,
          },
        ],
      },
      {
        fieldName: 'interestPeriod',
        inputType: 'number',
        label: 'Interest Period',
        column,
        colBreak: true,
        isRequired: true,
        defaultValue: 7,
        extraProps: {
          suffix: ' days',
          allowDecimal: true,
        },
        fieldValidators: [
          {
            validator: isRequired,
            errorMessage: requiredErrorMessage,
          },
        ],
      },
      {
        fieldName: 'loanDuration',
        inputType: 'number',
        label: 'Loan Duration',
        column,
        colBreak: true,
        isRequired: true,
        defaultValue: 30,
        extraProps: {
          suffix: ' days',
          allowDecimal: true,
        },
        fieldValidators: [
          {
            validator: isRequired,
            errorMessage: requiredErrorMessage,
          },
        ],
      },
    ],
  },
];
