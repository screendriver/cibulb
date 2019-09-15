import baseConfig from './ava.config';

export default {
  ...baseConfig,
  files: ['target/test/integration/**/*.test.js'],
};
