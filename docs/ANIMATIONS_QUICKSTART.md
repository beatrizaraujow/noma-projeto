# 🚀 Quick Start - Micro-interactions

## 5 Minutos para Começar

### 1. Ver o Showcase
```bash
npm run dev
# Acesse: http://localhost:3000/showcase
```

### 2. Importar Componentes
```tsx
import { 
  AnimatedButton,
  AnimatedCard,
  PageTransition 
} from '@/components/animations';
```

### 3. Usar em Qualquer Página
```tsx
export default function MyPage() {
  return (
    <PageTransition>
      <AnimatedCard hoverable className="p-6">
        <h1>Meu Conteúdo</h1>
        <AnimatedButton variant="primary">
          Ação
        </AnimatedButton>
      </AnimatedCard>
    </PageTransition>
  );
}
```

## 📝 Checklist de Implementação

### Nível 1: Básico (5 min)
- [ ] Adicionar `PageTransition` na página principal
- [ ] Substituir 3 botões por `AnimatedButton`
- [ ] Adicionar `hoverable` em 2 cards

### Nível 2: Intermediário (15 min)
- [ ] Adicionar skeleton loaders em listas
- [ ] Implementar `SuccessToast` em formulários
- [ ] Usar `AnimatedCard` em todos os cards

### Nível 3: Avançado (30 min)
- [ ] Adicionar drag & drop em listas ordenáveis
- [ ] Implementar stagger animation em listas
- [ ] Adicionar confetti em ações importantes

## 🎯 Padrões Recomendados

### Páginas com Loading
```tsx
if (loading) return <SkeletonDashboard />;
return <PageTransition>{content}</PageTransition>;
```

### Formulários
```tsx
<form onSubmit={handleSubmit}>
  {/* campos */}
  <AnimatedButton type="submit" disabled={loading}>
    {loading ? 'Salvando...' : 'Salvar'}
  </AnimatedButton>
</form>
<SuccessToast show={success} message="Salvo!" />
```

### Listas
```tsx
if (loading) return <SkeletonList items={5} />;
return (
  <motion.div variants={staggerContainerVariants}>
    {items.map(item => (
      <motion.div key={item.id} variants={listItemVariants}>
        <AnimatedCard hoverable>{item.content}</AnimatedCard>
      </motion.div>
    ))}
  </motion.div>
);
```

## 📚 Documentação Completa

- **API Completa**: `apps/web/src/components/animations/README.md`
- **Exemplos**: `docs/ANIMATIONS_EXAMPLES.md`
- **Resumo**: `docs/MICRO_INTERACTIONS_SUMMARY.md`

## 💡 Dicas Rápidas

1. **Sempre use `'use client'`** em componentes com animações
2. **Prefira skeletons** ao invés de spinners
3. **Animações curtas** (200-400ms) são melhores
4. **Combine efeitos** para criar experiências ricas
5. **Teste no mobile** - animações devem ser suaves

## 🎨 Componentes Mais Usados

```tsx
// 1. Botões (use em todo lugar)
<AnimatedButton variant="primary">Ação</AnimatedButton>

// 2. Cards (envolva conteúdo)
<AnimatedCard hoverable className="p-6">Conteúdo</AnimatedCard>

// 3. Transições (envolva páginas)
<PageTransition>Página</PageTransition>

// 4. Loading (mostre enquanto carrega)
<SkeletonList items={5} />

// 5. Sucesso (confirme ações)
<SuccessToast show={true} message="Feito!" />
```

## ⚡ Performance

Todas as animações são otimizadas e usam GPU acceleration. Se precisar melhorar ainda mais:

```tsx
// Use will-change com moderação
<motion.div style={{ willChange: 'transform' }}>
```

## 🐛 Debug

Se algo não funcionar:

1. Verifique se tem `'use client'` no arquivo
2. Confirme que Framer Motion está instalado
3. Veja o console do navegador para erros
4. Compare com os exemplos em `ANIMATIONS_EXAMPLES.md`

---

**Pronto para começar! 🎉**

Acesse o showcase em `/showcase` para ver tudo funcionando.
