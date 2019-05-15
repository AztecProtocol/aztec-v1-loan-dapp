import getFraction from './getFraction';

describe('getFraction', () => {
  it('return intergers as numerator and denominator', () => {
    expect(getFraction(1)).toEqual({
      numerator: 1,
      denominator: 1,
      err: 0,
    });

    expect(getFraction(2/10)).toEqual({
      numerator: 1,
      denominator: 5,
      err: 0,
    });

    expect(getFraction(3/10)).toEqual({
      numerator: 3,
      denominator: 10,
      err: 0,
    });
  });
});
