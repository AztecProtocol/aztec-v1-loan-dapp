import graphConfig from '../../config/graph';
import {
  prettyPath,
} from './path';

const getProjectName = () => {
  const {
    name,
    githubUser,
  } = graphConfig;

  return `${githubUser}/${name}`;
};

const getManifest = () => {
  const {
    manifest,
  } = graphConfig;

  if (!manifest) {
    return '';
  }

  return manifest.startsWith('.')
    ? manifest
    : prettyPath(`./${manifest}`);
};

const onReceiveErrorOutput = (output) => {
  process.stdout.write(output);
};

export {
  getProjectName,
  getManifest,
  onReceiveErrorOutput,
};
