# NOMA Branding Guide

## 🎨 Logo & Branding

### Logo Variações

#### 1. Logo Completo (Primary)
- **Uso**: Header, landing pages, marketing materials
- **Formato**: SVG, PNG (em alta resolução)
- **Variações**: Light & Dark backgrounds

#### 2. Logo Icon Only
- **Uso**: Favicon, mobile app icon, social media avatar
- **Formato**: SVG, PNG (múltiplas resoluções: 16x16, 32x32, 64x64, 128x128, 256x256, 512x512)

#### 3. Logo Symbol + Nome
- **Uso**: Navigation bar, emails, documentos
- **Formato**: SVG (preferencial para escalabilidade)

---

## 📐 Especificações do Logo

### Dimensões Mínimas
- **Logo Completo**: Mínimo 120px de largura
- **Logo Icon**: Mínimo 32px
- **Clear Space**: 16px ao redor do logo em todas as direções

### Cores do Logo

#### Light Background (Fundos Claros)
- Primary Color: `#3B82F6` (Azul)
- Text: `#111827` (Neutral 900)

#### Dark Background (Fundos Escuros)
- Primary Color: `#60A5FA` (Azul 400 - mais claro)
- Text: `#F9FAFB` (Neutral 50)

#### Monochrome
- All Black: `#000000`
- All White: `#FFFFFF`

---

## 🚫 O Que NÃO Fazer

❌ **Não distorça o logo** - mantenha as proporções originais
❌ **Não rotacione** - use sempre na horizontal
❌ **Não altere as cores** - use apenas as variações aprovadas
❌ **Não adicione efeitos** - sem gradientes, sombras ou bordas
❌ **Não use em fundos complexos** - garanta contraste adequado
❌ **Não posicione próximo demais das bordas** - respeite o clear space

---

## ✅ Uso Correto

### Para Fundos Claros
```jsx
<img src="/logo-dark.svg" alt="NOMA" />
```

### Para Fundos Escuros
```jsx
<img src="/logo-light.svg" alt="NOMA" />
```

### Logo Responsivo
```jsx
// Mobile: apenas ícone
<img src="/logo-icon.svg" alt="NOMA" className="h-8 w-8 md:hidden" />

// Desktop: logo completo
<img src="/logo.svg" alt="NOMA" className="h-8 hidden md:block" />
```

---

## 📦 Arquivos Disponíveis

### SVG (Vetorial - Preferencial)
- `/public/logo.svg` - Logo completo (light)
- `/public/logo-dark.svg` - Logo completo (dark)
- `/public/logo-icon.svg` - Apenas ícone
- `/public/logo-wordmark.svg` - Apenas texto

### PNG (Raster)
- `/public/logo-1x.png` - Standard (72dpi)
- `/public/logo-2x.png` - Retina (144dpi)
- `/public/logo-3x.png` - Super Retina (216dpi)

### Favicon
- `/public/favicon.ico` - 32x32, 16x16
- `/public/favicon-16x16.png`
- `/public/favicon-32x32.png`
- `/public/apple-touch-icon.png` - 180x180
- `/public/android-chrome-192x192.png`
- `/public/android-chrome-512x512.png`

---

## 🎯 Contextos de Uso

### Aplicação Web
- **Header Navigation**: Logo completo (height: 32px ou 40px)
- **Footer**: Logo icon + wordmark (height: 24px)
- **Loading Screen**: Logo icon animado

### Marketing & Docs
- **Landing Page Hero**: Logo grande (height: 64px-96px)
- **Documentação**: Logo completo no header
- **Apresentações**: Logo no canto (height: 40-48px)

### Social Media
- **Profile Picture**: Logo icon (1:1 ratio)
- **Cover/Banner**: Logo completo com espaçamento adequado
- **Posts**: Logo watermark no canto (transparência 80%)

---

## 🖼️ Templates para Download

### Figma
- [NOMA Branding Kit](link-para-figma) - Todos os assets e variações
- [Logo Guidelines](link-para-figma) - Especificações detalhadas

### Design Assets
- [Brand Assets ZIP](#) - Todos os formatos (SVG, PNG, ICO)
- [Press Kit](#) - Logos, screenshots, descrição da empresa

---

## 📝 Brand Tagline

**"Organize. Colabore. Conquiste."**

Ou em inglês:
**"Organize. Collaborate. Achieve."**

### Uso do Tagline
- Sempre abaixo do logo (não ao lado)
- Font: Inter Regular, 0.875rem (14px)
- Color: Neutral 500 (light) / Neutral 400 (dark)
- Letter spacing: 0.05em (wider)

---

## 🎨 Brand Voice & Tone

### Personalidade
- **Profissional** mas acessível
- **Confiável** e seguro
- **Moderno** e inovador
- **Colaborativo** e inclusivo

### Tom de Comunicação
- Use linguagem clara e direta
- Evite jargões desnecessários
- Seja útil e educativo
- Celebre os sucessos dos usuários

---

## 📞 Contato

Para dúvidas sobre uso da marca ou solicitação de assets adicionais:
- Email: brand@noma.com
- Design Team: design@noma.com

---

**Versão**: 1.0.0  
**Última atualização**: Semana 1  
**Mantido por**: Design & Brand Team
