const svelte_preprocess_postcss = require('svelte-preprocess-postcss')

const {
  preprocess: makeTsPreprocess,
  createEnv,
  readConfigFile,
} = require("@pyoner/svelte-ts-preprocess");

const env = createEnv();
const compilerOptions = readConfigFile(env);
const tsPreprocessOptions = {
  env,
  compilerOptions: {
    ...compilerOptions,
    allowNonTsExtensions: true,
  },
};

module.exports = {
  css: css => {
    css.write('dist/components.css');
  },
  preprocess: {
    ...{ style: svelte_preprocess_postcss() },
    ...makeTsPreprocess(tsPreprocessOptions),
  },
};