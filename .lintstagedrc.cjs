module.exports = {
  '*.ts': ['npm run lint:eslint', 'npm run lint:prettier'],
  '*.vue': [
    'npm run lint:eslint',
    'npm run lint:stylelint',
    'npm run lint:prettier',
  ],
  '*.scss': ['npm run lint:stylelint', 'npm run lint:prettier'],
  'package.json': ['npm run lint:prettier'],
  '!(package)*.json': ['npm run lint:prettier -- --parser json'],
}
