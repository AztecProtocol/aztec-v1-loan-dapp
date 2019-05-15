export default function getFraction(value, maxdenom) {
  const best = {
    numerator: 1, denominator: 1, err: Math.abs(value - 1),
  };
  if (!maxdenom) maxdenom = 100000;
  for (let denominator = 1; best.err > 0 && denominator <= maxdenom; denominator++) {
    const numerator = Math.round(value * denominator);
    const err = Math.abs(value - numerator / denominator);
    if (err >= best.err) continue;
    best.numerator = numerator;
    best.denominator = denominator;
    best.err = err;
  }
  return best;
}
