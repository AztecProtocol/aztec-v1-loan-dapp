import replaceValue, {
  FORCE_UPDATE_VALUE,
} from './replaceValue';

describe('replaceValue', () => {
  const data = {
    string: 'a string',
    integer: 1,
    object: {
      a: 97,
      b: '98',
      c: {
        val: 99,
      },
      d: ['1', '0', '0'],
    },
    array: [
      'z',
      1,
      {
        foo: 'bar',
      },
    ],
  };

  it('replace value in an object without changing the references of other properties', () => {
    const newData = replaceValue(data, 'object.c', {
      val: 'ninety-nine',
    });

    expect(newData).toEqual({
      string: 'a string',
      integer: 1,
      object: {
        a: 97,
        b: '98',
        c: {
          val: 'ninety-nine',
        },
        d: ['1', '0', '0'],
      },
      array: [
        'z',
        1,
        {
          foo: 'bar',
        },
      ],
    });
    expect(newData.object).not.toBe(data.object);
    expect(newData.object.c).not.toBe(data.object.c);
    expect(newData.object.d).toBe(data.object.d);
    expect(newData.array).toBe(data.array);
  });

  it('also works on arrays', () => {
    const newData = replaceValue(data, 'array.2.foo', 'bars');

    expect(newData).toEqual({
      string: 'a string',
      integer: 1,
      object: {
        a: 97,
        b: '98',
        c: {
          val: 99,
        },
        d: ['1', '0', '0'],
      },
      array: [
        'z',
        1,
        {
          foo: 'bars',
        },
      ],
    });
    expect(newData.object).toBe(data.object);
    expect(newData.object.c).toBe(data.object.c);
    expect(newData.object.d).toBe(data.object.d);
    expect(newData.object.d).toBe(data.object.d);
    expect(newData.array[2]).not.toBe(data.array[2]);

    const newArrayData = replaceValue(data.array, '2', {
      bars: 'foo',
    });

    expect(newArrayData).toEqual([
      'z',
      1,
      {
        bars: 'foo',
      },
    ]);
  });

  it('return same object when no match path is found', () => {
    const newData = replaceValue(data, 'object.d.4', '!');
    expect(newData).toEqual({
      string: 'a string',
      integer: 1,
      object: {
        a: 97,
        b: '98',
        c: {
          val: 99,
        },
        d: ['1', '0', '0'],
      },
      array: [
        'z',
        1,
        {
          foo: 'bar',
        },
      ],
    });
    expect(newData).toBe(data);

    const newData2 = replaceValue(data, 'newKey', 'newValue');
    expect(newData2).toEqual({
      string: 'a string',
      integer: 1,
      object: {
        a: 97,
        b: '98',
        c: {
          val: 99,
        },
        d: ['1', '0', '0'],
      },
      array: [
        'z',
        1,
        {
          foo: 'bar',
        },
      ],
    });
    expect(newData).toBe(data);
  });

  it('create new property for unfound path with parent of object type when forceUpdate is true', () => {
    const newData = replaceValue(data, 'newKey', 'newValue', FORCE_UPDATE_VALUE);
    expect(newData).toEqual({
      string: 'a string',
      integer: 1,
      object: {
        a: 97,
        b: '98',
        c: {
          val: 99,
        },
        d: ['1', '0', '0'],
      },
      array: [
        'z',
        1,
        {
          foo: 'bar',
        },
      ],
      newKey: 'newValue',
    });
    expect(newData).not.toBe(data);

    const newData2 = replaceValue(data, 'object.d.4', '!', FORCE_UPDATE_VALUE);
    expect(newData2).toEqual({
      string: 'a string',
      integer: 1,
      object: {
        a: 97,
        b: '98',
        c: {
          val: 99,
        },
        d: ['1', '0', '0', undefined, '!'],
      },
      array: [
        'z',
        1,
        {
          foo: 'bar',
        },
      ],
    });
    expect(newData2).not.toBe(data);
    expect(newData2.object).not.toBe(data.object);
    expect(newData2.object.c).toBe(data.object.c);
    expect(newData2.object.d).not.toBe(data.object.d);
    expect(newData2.array).toBe(data.array);

    const newData3 = replaceValue(data, 'object.e.val', 101, FORCE_UPDATE_VALUE);
    expect(newData3).toEqual({
      string: 'a string',
      integer: 1,
      object: {
        a: 97,
        b: '98',
        c: {
          val: 99,
        },
        d: ['1', '0', '0'],
        'e.val': 101,
      },
      array: [
        'z',
        1,
        {
          foo: 'bar',
        },
      ],
    });
    expect(newData3).not.toBe(data);
    expect(newData3.object).not.toBe(data.object);
    expect(newData3.object.c).toBe(data.object.c);
    expect(newData3.object.d).toBe(data.object.d);
    expect(newData3.array).toBe(data.array);
  });

  it('return the same object if no match path nor parent object is found', () => {
    const newData = replaceValue(data, 'object.c.val.test', 'four');

    expect(newData).toEqual({
      string: 'a string',
      integer: 1,
      object: {
        a: 97,
        b: '98',
        c: {
          val: 99,
        },
        d: ['1', '0', '0'],
      },
      array: [
        'z',
        1,
        {
          foo: 'bar',
        },
      ],
    });
    expect(newData).toBe(data);
    expect(newData.object).toBe(data.object);
    expect(newData.object.c).toBe(data.object.c);
    expect(newData.object.d).toBe(data.object.d);
    expect(newData.array).toBe(data.array);
  });

  it('do not partly match the path', () => {
    const testData = {
      1: {
        a: '97',
        b: '98',
      },
      12: {
        a: 97,
        b: 98,
      },
    };

    const newData = replaceValue(testData, '12.b', 'test');

    expect(newData).toEqual({
      1: {
        a: '97',
        b: '98',
      },
      12: {
        a: 97,
        b: 'test',
      },
    });
  });

  it('accept path name with dots in it', () => {
    const testData = {
      'r2.d2': {
        species: 'robot',
      },
    };

    const newData = replaceValue(testData, 'r2.d2.species', 'droid');
    expect(newData).toEqual({
      'r2.d2': {
        species: 'droid',
      },
    });
  });

  it('match shortest path first', () => {
    const testData = {
      'r2.d2': {
        species: 'robot',
      },
      r2: {
        d2: {
          species: 'robot',
        },
      },
    };

    const newData = replaceValue(testData, 'r2.d2.species', 'droid');
    expect(newData).toEqual({
      'r2.d2': {
        species: 'robot',
      },
      r2: {
        d2: {
          species: 'droid',
        },
      },
    });
  });

  it('return same object if value is the same as data', () => {
    const newData = replaceValue(data, 'object', data.object);
    expect(newData).toBe(data);

    const newData2 = replaceValue(data, 'object.b', '98');
    expect(newData2).toBe(data);
  });
});
