module.exports = {
  '*.ts*': [
    'prettier --config .prettierrc --write',
    'eslint --quiet',
  ],
};
