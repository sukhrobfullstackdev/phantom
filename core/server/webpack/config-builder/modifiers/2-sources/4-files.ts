import { regExps, formatFilename } from '../../../webpack-utils';
import { ConfigModifier } from '../../types';

/**
 * Configure Webpack to consume static files (images, fonts, and more).
 */
const files: ConfigModifier = ({ name, config }) => {
  /* eslint-disable prettier/prettier */
  config.module.rule('compile-files')
    .test(regExps.loaders.files)
    .use('files')
      .loader('file-loader')
      .options({
        name: formatFilename(name, { hash: '[contenthash]' }),
        outputPath: './'
      })
      .end();
  /* eslint-enable prettier/prettier */
};

export default files;
