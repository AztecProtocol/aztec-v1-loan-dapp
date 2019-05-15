export const isRequired = val => !!(val || val === 0);

const requiredErrorMessage = 'This field is required';

export default [
  {
    label: 'Login With New Account',
    buttonText: 'Create Account',
    errorPosition: 'bottom',
    fields: [
      {
        fieldName: 'acountName',
        inputType: 'text',
        label: 'Account Name',
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
        label: 'Password',
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
          type: 'password'
        }
      },
    ],
  },
];
