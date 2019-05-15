export default function transformDataForContract(formData) {
  const {
    notional,
    interestRate,
    interestPeriod,
    settlementCurrency,
    loanDuration,
  } = formData;

  const data = {
    notional: +notional,
    interestRate: +interestRate,
    interestPeriod: +interestPeriod,
    settlementCurrencyId: +settlementCurrency,
    loanDuration: +loanDuration,
  };

  return data;
}
