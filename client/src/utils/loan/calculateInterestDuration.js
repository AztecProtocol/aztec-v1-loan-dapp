const timeRatio = {
  s: 1000,
  ms: 1,
};

export default function calculateInterestDuration({
  totalInterest,
  amount,
  settledAt,
  maturity,
  timeUnit = 'ms',
  roundingMethod = 'floor',
}) {
  if (!totalInterest
    || !settledAt
    || !maturity
  ) {
    return 0;
  }

  const ratio = timeRatio[timeUnit];
  if (!ratio) {
    return 0;
  }

  const durationInMs = (maturity - settledAt) * amount / totalInterest;

  return Math[roundingMethod](durationInMs / ratio);
}
