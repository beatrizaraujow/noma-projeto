// Estende o preset base do monorepo (packages/config). Antes apontava para
// `@nexora/eslint-config`, um pacote que não existe — o pacote de configs é
// `@nexora/config`. Como `@nexora/config` não está linkado no node_modules da
// raiz, referenciamos o preset por caminho (resolvido de forma absoluta), o que
// funciona de qualquer pacote que suba até esta config `root: true`.
module.exports = {
  root: true,
  extends: [require.resolve('./packages/config/eslint-preset.js')],
};
