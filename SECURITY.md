# Security Policy

## Reporting a Vulnerability

Se você descobrir uma vulnerabilidade de segurança no NexORA, por favor nos informe imediatamente.

### Como Reportar

**NÃO** crie uma issue pública para vulnerabilidades de segurança.

Em vez disso:

1. Envie um email para: security@nexora.dev
2. Inclua uma descrição detalhada da vulnerabilidade
3. Passos para reproduzir
4. Impacto potencial
5. Sugestões de correção (se tiver)

### O que esperar

- Resposta inicial em até 48 horas
- Atualizações regulares sobre o progresso
- Crédito público (se desejar) quando a vulnerabilidade for corrigida

## Versões Suportadas

| Versão | Suporte          |
| ------ | ---------------- |
| 1.x.x  | ✅ Suporte ativo |
| < 1.0  | ❌ Não suportado |

## Práticas de Segurança

### Autenticação
- JWT com refresh tokens
- Bcrypt para hash de senhas
- Rate limiting

### Banco de Dados
- Prisma ORM (prevenção de SQL injection)
- Row-level security
- Validação de inputs

### API
- Helmet.js para headers de segurança
- CORS configurado corretamente
- Validação com class-validator

### Dependências
- Atualizações regulares
- Dependabot alerts
- npm audit em CI/CD

## Vulnerabilidades Conhecidas

Nenhuma vulnerabilidade crítica conhecida no momento.
