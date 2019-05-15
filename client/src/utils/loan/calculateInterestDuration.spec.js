import calculateInterestDuration from './calculateInterestDuration';

const addDay = (timestamp, numberOfDays) => timestamp + (numberOfDays * 86400000);

describe('calculateInterestDuration', () => {
  const settledAt = Date.now();

  it('return the equivalent time duration of a certain interest amount', () => {
    expect(calculateInterestDuration({
      totalInterest: 100,
      amount: 20,
      settledAt,
      maturity: addDay(settledAt, 5),
    })).toBe(86400000);

    expect(calculateInterestDuration({
      totalInterest: 100,
      amount: 40,
      settledAt,
      maturity: addDay(settledAt, 10),
    })).toBe(345600000);
  });

  it('round off decimal values', () => {
    expect(calculateInterestDuration({
      totalInterest: 33,
      amount: 1,
      settledAt,
      maturity: addDay(settledAt, 5),
    })).toBe(13090909);
  });

  it('round off decimal values to specific unit', () => {
    expect(calculateInterestDuration({
      totalInterest: 33,
      amount: 1,
      settledAt,
      maturity: addDay(settledAt, 5),
      timeUnit: 's'
    })).toBe(13090);
  });

  it('accept specific rounding method', () => {
    expect(calculateInterestDuration({
      totalInterest: 33,
      amount: 1,
      settledAt,
      maturity: addDay(settledAt, 5),
      roundingMethod: 'floor',
    })).toBe(13090909);

    expect(calculateInterestDuration({
      totalInterest: 33,
      amount: 1,
      settledAt,
      maturity: addDay(settledAt, 5),
      roundingMethod: 'ceil',
    })).toBe(13090910);
  });

  it('correctly handle empty values', () => {
    expect(calculateInterestDuration({
      totalInterest: 0,
      amount: 10,
      settledAt,
      maturity: addDay(settledAt, 5),
    })).toBe(0);

    expect(calculateInterestDuration({
      totalInterest: 100,
      amount: 0,
      settledAt,
      maturity: addDay(settledAt, 5),
    })).toBe(0);

    expect(calculateInterestDuration({
      totalInterest: 100,
      amount: 10,
      settledAt: 0,
      maturity: addDay(settledAt, 5),
    })).toBe(0);

    expect(calculateInterestDuration({
      totalInterest: 100,
      amount: 10,
      settledAt,
      maturity: 0,
    })).toBe(0);

    expect(calculateInterestDuration({
      amount: 10,
    })).toBe(0);
  });
});
