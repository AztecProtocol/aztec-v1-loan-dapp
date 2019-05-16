/* global assert */

const parseValue = (value) => {
  if (typeof value.toNumber === 'function') {
    let num;
    try {
      num = value.toNumber();
    } catch (error) {
      num = value;
    }
    return num;
  }

  if (typeof value !== 'object') {
    return value;
  }

  const values = Object.values(value).map(parseValue);

  if (Array.isArray(value)) {
    return values;
  }

  const valueMap = {};
  Object.keys(value).forEach((key, i) => {
    valueMap[key] = values[i];
  });

  return valueMap;
};

const deepEqual = (data, expected, noExtraFields = false) => {
  if (!data
    || !expected
    || typeof data !== 'object'
    || typeof expected !== 'object'
  ) {
    return data === expected;
  }

  if (noExtraFields
    && Object.keys(expected).length !== Object.keys(data).length
  ) {
    return false;
  }

  return Object.keys(expected).every(key =>
    deepEqual(data[key], expected[key]));
};

class Web3Event {
  constructor(argsConfig) {
    this.hasBeenCalled = !!argsConfig;
    const {
      args,
      argsMap,
    } = argsConfig || {};
    this.args = args || [];
    this.argsMap = argsMap || {};
  }

  param(key) {
    return this.argsMap[key];
  }

  hasBeenCalledWith(expected) {
    if (!this.hasBeenCalled) {
      assert.equal({}, expected);
      return;
    }

    if (!deepEqual(this.argsMap, expected)) {
      assert.deepStrictEqual(this.argsMap, expected);
    }
  }

  hasBeenCalledExactlyWith(expected) {
    if (!this.hasBeenCalled) {
      assert.equal({}, expected);
      return;
    }

    if (!deepEqual(this.argsMap, expected, true)) {
      assert.deepStrictEqual(this.argsMap, expected);
    }
  }
}

class Web3Events {
  constructor(transaction) {
    this.observedEvents = {};
    this.parseTransaction(transaction);
    this.eventNames = Object.keys(this.observedEvents);
    this.targetEvent = this.eventNames.length === 1
      ? this.eventNames[0]
      : '';
  }

  parseTransaction(transaction) {
    transaction.logs.forEach(({
      event,
      args,
    }) => {
      const argsList = [];
      const eventArgs = {};
      let isList = true;
      Object.keys(args).forEach((key) => {
        if (key === '__length__') {
          isList = false;
          return;
        }
        const value = parseValue(args[key]);
        if (isList) {
          argsList.push(value);
        } else {
          eventArgs[key] = value;
        }
      });
      this.observedEvents[event] = {
        args: argsList,
        argsMap: eventArgs,
      };
    });
  }

  contain(eventName) {
    return !!this.observedEvents[eventName];
  }

  event(eventName) {
    return new Web3Event(this.observedEvents[eventName]);
  }

  count() {
    return this.eventNames.length;
  }
}

const web3Events = transaction => new Web3Events(transaction);

export default web3Events;
