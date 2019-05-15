export const isRequired = val => !!(val || val === 0);

const requiredErrorMessage = 'This field is required';

export default [
  {
    label: 'Restore Account',
    buttonText: 'Restore',
    errorPosition: 'bottom',
    fields: [
      {
        fieldName: 'seedPhrase',
        inputType: 'text',
        label: 'Seed Phrase',
        column: 12,
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
        fieldName: 'password',
        inputType: 'text',
        label: 'New Password',
        column: 12,
        colBreak: true,
        isRequired: true,
        defaultValue: '',
        fieldValidators: [
          {
            validator: isRequired,
            errorMessage: requiredErrorMessage,
          },
        ],
        extraProps: {
          type: 'password',
        },
      },
    ],
  },
];
