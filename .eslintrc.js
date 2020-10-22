module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true
  },
  extends: 'standard',
  globals: {
    window: true,
    document: true,
    App: true,
    Page: true,
    Component: true,
    Behavior: true,
    uni: true,
    worker: true,
    getApp: true
  },
  plugins: ['prettier'],
  rules: {
    'no-console': [2, { allow: ['warn', 'error'] }],
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'never',
        named: 'never',
        asyncArrow: 'always'
      }
    ],
    camelcase: 0,
    'no-var': 2,
    'prefer-const': 0,
    'node/no-deprecated-api': 0,
    'no-unused-vars': ['error', { varsIgnorePattern: 'regeneratorRuntime' }]
  }
}
