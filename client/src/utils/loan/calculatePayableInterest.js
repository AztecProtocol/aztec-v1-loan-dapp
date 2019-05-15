export default function calculatePayableInterest({
  totalInterest,
  settledAt,
  lastWithdrawAt = 0,
  maturity,
  currentTime = Date.now(),
  roundingMethod = '',
}) {
  if (!totalInterest
    || !settledAt
    || !currentTime
    || !maturity
  ) {
    return 0;
  }

  const withdrawnStartAt = Math.min(
    maturity,
    Math.max(settledAt, lastWithdrawAt),
  );
  const endAt = Math.min(
    maturity,
    currentTime,
  );

  let value = totalInterest * ((endAt - withdrawnStartAt) / (maturity - settledAt));

  if (roundingMethod) {
    value = Math[roundingMethod](value);
  }

  return value;
}
