
const svelte_preproceses_postcss = require('svelte-preprocess-postcss')

module.exports = {
  css: css => {
    css.write('dist/components.css');
  },
  preprocess: {
    style: svelte_preprocess_postcss(),
  },
};