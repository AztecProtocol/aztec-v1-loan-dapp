const indent = (strArr) => {
  if (typeof strArr === 'string') {
    return `  ${strArr}`;
  }

  return strArr.map(str => `  ${str}`);
};

const prettyPrint = (obj) => {
  let lines = [];
  switch (typeof obj) {
    case 'string':
      lines.push(`'${obj}'`);
      break;
    case 'number':
    case 'boolean':
      lines.push(`${obj}`);
      break;
    case 'object': {
      if (Array.isArray(obj)) {
        lines.push('[');
        obj.forEach((value) => {
          const childLines = prettyPrint(value);
          if (childLines.length === 1) {
            lines.push(indent(`${childLines[0]},`));
          } else {
            lines = [
              ...lines,
              indent(`${childLines[0]}`),
              ...indent(childLines.slice(1, -1)),
              indent(`${childLines[childLines.length - 1]},`),
            ];
          }
        });
        lines.push(']');
      } else {
        lines.push('{');
        Object.keys(obj).forEach((key) => {
          const childLines = prettyPrint(obj[key]);
          if (childLines.length === 1) {
            lines.push(indent(`${key}: ${childLines[0]},`));
          } else {
            lines = [
              ...lines,
              indent(`${key}: ${childLines[0]}`),
              ...indent(childLines.slice(1, -1)),
              indent(`${childLines[childLines.length - 1]},`),
            ];
          }
        });
        lines.push('}');
      }
      break;
    }
    default:
  }

  return lines;
};

export {
  indent,
  prettyPrint,
};
