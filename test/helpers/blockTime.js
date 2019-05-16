/* global web3 */

const unitToSeconds = {
  second: 1,
  seconds: 1,
  minute: 60,
  minutes: 60,
  day: 86400,
  days: 86400,
};

const valueOf = (numberOfUnits, unit) => numberOfUnits * unitToSeconds[unit];

const blockTime = (initialTimestamp) => {
  let timeValue = initialTimestamp;

  return {
    value: () => timeValue,
    subtract: function (numberOfUnits, unit) { // eslint-disable-line
      timeValue -= valueOf(numberOfUnits, unit);
      return this;
    },
    add: function (numberOfUnits, unit) { // eslint-disable-line
      timeValue += valueOf(numberOfUnits, unit);
      return this;
    },
  };
};

blockTime.now = async () => {
  const block = await web3.eth.getBlock('latest');
  return block.timestamp;
};

blockTime.valueOf = valueOf;

blockTime.fromTransaction = async (transaction) => {
  const {
    blockNumber,
  } = transaction.receipt;
  const block = await web3.eth.getBlock(blockNumber);

  return (block && block.timestamp) || 0;
};

export default blockTime;
