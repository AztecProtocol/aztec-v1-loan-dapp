import calculatePayableInterest from './calculatePayableInterest';

const addDay = (timestamp, numberOfDays) => timestamp + (numberOfDays * 86400000);

describe('calculatePayableInterest', () => {
  const settledAt = Date.now();

  it('correctly handle empty values', () => {
    expect(calculatePayableInterest({
      totalInterest: 0,
      settledAt,
      lastWithdrawAt: settledAt,
      maturity: addDay(settledAt, 20),
      currentTime: addDay(settledAt, 10),
    })).toBe(0);

    expect(calculatePayableInterest({
      totalInterest: 100,
      settledAt,
      lastWithdrawAt: 0,
      maturity: addDay(settledAt, 20),
      currentTime: addDay(settledAt, 10),
    })).toBe(50);

    expect(calculatePayableInterest({
      totalInterest: 100,
      settledAt,
      lastWithdrawAt: settledAt,
      maturity: 0,
      currentTime: addDay(settledAt, 10),
    })).toBe(0);

    expect(calculatePayableInterest({
      totalInterest: 100,
    })).toBe(0);
  });

  it('correctly calculate payable interest', () => {
    expect(calculatePayableInterest({
      totalInterest: 100,
      settledAt,
      lastWithdrawAt: settledAt,
      maturity: addDay(settledAt, 20),
      currentTime: addDay(settledAt, 10),
    })).toBe(50);

    expect(calculatePayableInterest({
      totalInterest: 100,
      settledAt,
      lastWithdrawAt: addDay(settledAt, 2),
      maturity: addDay(settledAt, 20),
      currentTime: addDay(settledAt, 12),
    })).toBe(50);

    expect(calculatePayableInterest({
      totalInterest: 100,
      settledAt,
      lastWithdrawAt: addDay(settledAt, 15),
      maturity: addDay(settledAt, 20),
      currentTime: addDay(settledAt, 20),
    })).toBe(25);

    expect(calculatePayableInterest({
      totalInterest: 100,
      settledAt,
      lastWithdrawAt: addDay(settledAt, 10),
      maturity: addDay(settledAt, 20),
      currentTime: addDay(settledAt, 10),
    })).toBe(0);
  });

  it('return correct value after maturity', () => {
    expect(calculatePayableInterest({
      totalInterest: 100,
      settledAt,
      lastWithdrawAt: 0,
      maturity: addDay(settledAt, 20),
      currentTime: addDay(settledAt, 21),
    })).toBe(100);

    expect(calculatePayableInterest({
      totalInterest: 100,
      settledAt,
      lastWithdrawAt: addDay(settledAt, 10),
      maturity: addDay(settledAt, 20),
      currentTime: addDay(settledAt, 25),
    })).toBe(50);

    expect(calculatePayableInterest({
      totalInterest: 100,
      settledAt,
      lastWithdrawAt: addDay(settledAt, 20),
      maturity: addDay(settledAt, 20),
      currentTime: addDay(settledAt, 25),
    })).toBe(0);

    expect(calculatePayableInterest({
      totalInterest: 100,
      settledAt,
      lastWithdrawAt: addDay(settledAt, 25),
      maturity: addDay(settledAt, 20),
      currentTime: addDay(settledAt, 30),
    })).toBe(0);
  });

  it('will not round off decimal values', () => {
    expect(calculatePayableInterest({
      totalInterest: 10,
      settledAt,
      lastWithdrawAt: 0,
      maturity: addDay(settledAt, 20),
      currentTime: addDay(settledAt, 5),
    })).toBe(2.5);

    expect(calculatePayableInterest({
      totalInterest: 10,
      settledAt,
      lastWithdrawAt: 0,
      maturity: addDay(settledAt, 20),
      currentTime: addDay(settledAt, 7),
    })).toBe(3.5);
  });

  it('will round off decimal values if roundingMethod is specified', () => {
    expect(calculatePayableInterest({
      totalInterest: 10,
      settledAt,
      lastWithdrawAt: 0,
      maturity: addDay(settledAt, 20),
      currentTime: addDay(settledAt, 5),
      roundingMethod: 'floor',
    })).toBe(2);

    expect(calculatePayableInterest({
      totalInterest: 10,
      settledAt,
      lastWithdrawAt: 0,
      maturity: addDay(settledAt, 20),
      currentTime: addDay(settledAt, 5),
      roundingMethod: 'ceil',
    })).toBe(3);

    expect(calculatePayableInterest({
      totalInterest: 10,
      settledAt,
      lastWithdrawAt: 0,
      maturity: addDay(settledAt, 20),
      currentTime: addDay(settledAt, 5),
      roundingMethod: 'round',
    })).toBe(3);
  });
});
