/**
 * Origem da API para chamadas feitas NO SERVIDOR — route handlers e callbacks do
 * NextAuth, nao codigo de navegador.
 *
 * POR QUE ISTO EXISTE
 *
 * `NEXT_PUBLIC_API_URL` e inlinada no bundle do cliente em tempo de build e tem
 * que ser a URL *publica*: quem a resolve e o navegador do usuario.
 *
 * Mas o `authorize()` do NextAuth e o proxy de registro rodam **no servidor**. Com
 * o web em container, a URL publica e a pior escolha para eles:
 *
 *   - Em Docker local, `http://localhost:3001` dentro do container aponta para o
 *     PROPRIO container, nao para a API. A conexao e recusada e a tela mostra
 *     "Nao foi possivel conectar ao servidor" — sem nenhuma pista de que a causa
 *     e a resolucao de nome.
 *   - Em producao, mandar o request para o dominio publico faz ele sair do
 *     servidor, atravessar o Nginx e voltar, so para alcancar um container que
 *     esta na mesma rede interna.
 *
 * `API_INTERNAL_URL` e lida so em runtime e so no servidor, entao pode apontar
 * para o nome do servico na rede Docker (`http://api:3001`) enquanto o navegador
 * continua usando o dominio publico.
 *
 * Sem ela, o comportamento e o de antes — cai em `NEXT_PUBLIC_API_URL`.
 */
export const serverApiUrl =
  process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
