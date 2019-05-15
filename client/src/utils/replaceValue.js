function assignValue(data, key, value) {
  const newData = Array.isArray(data) ? [...data] : {
    ...data,
  };
  newData[key] = value;
  return newData;
}

export const FORCE_UPDATE_VALUE = true;

export default function replaceValue(data, path, value, forceUpdate = false) {
  if (typeof data !== 'object') {
    return !path ? value : data;
  }

  let newData = data;

  let root = '';
  const segments = path.split('.');
  const replaceAt = segments.findIndex((seg) => {
    root += seg;
    if (!(root in data)) {
      root += '.';
      return false;
    }

    return true;
  });

  if (replaceAt >= 0) {
    const childPath = segments.slice(replaceAt + 1).join('.');
    const childData = !childPath ? value : replaceValue(
      data[root],
      childPath,
      value,
      forceUpdate,
    );
    if (childData !== data[root]) {
      newData = assignValue(
        newData,
        root,
        childData,
      );
    }
  } else if (forceUpdate) {
    newData = assignValue(
      newData,
      path,
      value,
    );
  }

  return newData;
}
