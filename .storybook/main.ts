module.exports = {
  stories: ['../(stories|src)/**/*.stories.@(ts|tsx|js|jsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-storysource',
    '@a110/storybook-expand-all',
  ],
  typescript: {
    check: true,
  },
};
