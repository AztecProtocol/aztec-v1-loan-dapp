export default function calculateTotalInterest({
  notional,
  interestRate,
  interestPeriod,
  loanDuration,
}) {
  if (!notional
    || !interestRate
    || !loanDuration
    || !interestPeriod
  ) {
    return 0;
  }

  const numberOfPeriods = loanDuration / interestPeriod;

  return notional * (interestRate / 100) * numberOfPeriods;
}
