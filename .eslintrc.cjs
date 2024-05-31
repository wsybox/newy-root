module.exports = {
  env: {
    browser: true, // 浏览器环境
    es2021: true, // ECMAScript 2021
    node: true // Node环境
  },
  // 扩展的 ESlint 规范, 可以被继承的规则; 字符串数组: 每个配置继承它之前的配置
  // eslint-config- 前缀可以省略
  extends: ['airbnb-base', 'prettier'],

  rules: {
    strict: 2, // 使用严格模式,
    camelcase: 2, // 强制驼峰法命名
    eqeqeq: [2, 'always'], // 禁止使用 ==，!=
    'no-console': 1, // 
    'consistent-return': 0,
    'prefer-promise-reject-errors': [0, { allowEmptyReject: false }]
  }
}
