import calculateTotalInterest from './calculateTotalInterest';

describe('calculateTotalInterest', () => {
  it('correctly handle empty values', () => {
    expect(calculateTotalInterest({
      notional: 0,
      interestRate: 10,
      interestPeriod: 1,
      loanDuration: 2,
    })).toBe(0);

    expect(calculateTotalInterest({
      notional: 1000,
      interestRate: 0,
      interestPeriod: 1,
      loanDuration: 2,
    })).toBe(0);

    expect(calculateTotalInterest({
      notional: 1000,
      interestRate: 10,
      interestPeriod: 0,
      loanDuration: 2,
    })).toBe(0);

    expect(calculateTotalInterest({
      notional: 1000,
      interestRate: 10,
      interestPeriod: 1,
      loanDuration: 0,
    })).toBe(0);

    expect(calculateTotalInterest({
      notional: 0,
      interestRate: 0,
      interestPeriod: 0,
      loanDuration: 0,
    })).toBe(0);

    expect(calculateTotalInterest({
      notional: null,
    })).toBe(0);
  });

  it('correctly calculate total interest', () => {
    expect(calculateTotalInterest({
      notional: 1000,
      interestRate: 10,
      interestPeriod: 1,
      loanDuration: 2,
    })).toBe(200);

    expect(calculateTotalInterest({
      notional: 500,
      interestRate: 10,
      interestPeriod: 12,
      loanDuration: 30,
    })).toBe(125);
  });

  it('will return decimal value', () => {
    expect(calculateTotalInterest({
      notional: 100,
      interestRate: 1,
      interestPeriod: 10,
      loanDuration: 15,
    })).toBe(1.5);

    expect(calculateTotalInterest({
      notional: 100,
      interestRate: 1,
      interestPeriod: 100,
      loanDuration: 75,
    })).toBe(0.75);
  });
});
