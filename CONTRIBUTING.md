# Contributing to NexORA

Obrigado por considerar contribuir com o NexORA! 🎉

## Como Contribuir

### Reportando Bugs

1. Verifique se o bug já foi reportado em [Issues](https://github.com/seu-usuario/nexora/issues)
2. Se não, crie uma nova issue com:
   - Título descritivo
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots se aplicável
   - Informações do ambiente (OS, Node version, etc)

### Sugerindo Features

1. Abra uma issue com o label `enhancement`
2. Descreva detalhadamente a feature
3. Explique por que seria útil
4. Inclua exemplos de uso se possível

### Pull Requests

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Faça suas alterações
4. Adicione testes se aplicável
5. Rode os testes: `pnpm test`
6. Commit com mensagens descritivas (veja [Conventional Commits](https://www.conventionalcommits.org/))
7. Push para sua branch (`git push origin feature/MinhaFeature`)
8. Abra um Pull Request

### Padrões de Código

- Use TypeScript para todo código novo
- Siga as configurações do ESLint e Prettier
- Escreva testes para novas features
- Mantenha a cobertura de testes acima de 80%
- Documente APIs públicas com JSDoc

### Commit Messages

Formato: `<tipo>(<escopo>): <descrição>`

Tipos:
- `feat`: Nova feature
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Manutenção

Exemplo:
```
feat(tasks): add drag and drop functionality
fix(auth): resolve token expiration issue
docs(readme): update installation instructions
```

## Desenvolvimento Local

Veja o [README.md](README.md) para instruções de setup do ambiente de desenvolvimento.

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto (MIT).
