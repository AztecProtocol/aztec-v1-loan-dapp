import graphConfig from '../../../config/graph';
import {
  prettyPath,
} from '../../utils/path';
import instance from '../../utils/instance';
import {
  getManifest,
  onReceiveErrorOutput,
} from '../../utils/graph';

export default function codegen({
  onError,
  onClose,
}) {
  const {
    outputDir,
  } = graphConfig;

  const manifestPath = getManifest();

  const typesPath = prettyPath(`./${outputDir}/types`);

  return instance(
    `graph codegen ${manifestPath} --debug --output-dir ${typesPath}`,
    {
      onReceiveErrorOutput,
      onError,
      onClose,
    },
  );
}
