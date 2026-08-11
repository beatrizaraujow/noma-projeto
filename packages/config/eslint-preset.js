// Preset base de ESLint compartilhado do monorepo (@nexora/config).
//
// O `.eslintrc.js` da raiz estende este arquivo (via caminho relativo), e como
// a config raiz é `root: true`, todos os pacotes (api, web, ui) acabam usando
// este preset.
//
// O parser é resolvido com `require.resolve` a partir daqui, então funciona de
// qualquer pacote sem depender de o `@typescript-eslint/parser` estar instalado
// localmente em cada um (ele já está hoisteado no monorepo).
//
// Ruleset propositalmente enxuto: a config anterior apontava para um pacote
// inexistente (`@nexora/eslint-config`) e o lint nunca chegou a rodar de fato.
// Este preset faz o ESLint rodar e parsear TS/TSX sem quebrar; o endurecimento
// das regras (recommended etc.) fica como limpeza separada, para não misturar
// o conserto de CI com um flood de violações pré-existentes.
module.exports = {
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '.next/',
    'build/',
    'coverage/',
    'next-env.d.ts',
  ],
  rules: {},
};
