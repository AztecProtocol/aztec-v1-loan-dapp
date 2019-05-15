import path from 'path';

const root = path.resolve(__dirname, '../../');

const prettyPath = composedPath =>
  composedPath.replace(/\/{1,}/g, '/');

export {
  root,
  prettyPath,
};
