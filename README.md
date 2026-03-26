# Gaijin Creative

Identidade visual & criação de sites com precisão.

## 🚀 Desenvolvimento Local

### Método 1: Script Bash (Recomendado)
```bash
./start.sh
```

### Método 2: npm
```bash
npm start
```

### Método 3: Python direto
```bash
python3 -m http.server 5500
```

Depois acesse: **http://localhost:5500**

## 📦 Deploy na Vercel

### Primeira vez:
1. Instale a CLI da Vercel:
```bash
npm i -g vercel
```

2. Faça login:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

### Atualizações:
```bash
vercel --prod
```

## 📁 Estrutura do Projeto

```
gaijin/
├── index.html          # Página principal
├── robo.glb            # Modelo 3D
├── js/
│   ├── app.js          # Funcionalidades gerais
│   └── three-scene.js  # Cena Three.js
├── imagens/            # Assets de imagem
├── package.json        # Scripts npm
├── vercel.json         # Configuração Vercel
└── start.sh            # Script de inicialização
```

## 🛠️ Tecnologias

- HTML5, CSS3, JavaScript (ES6+)
- Three.js (WebGL/3D)
- Python HTTP Server (desenvolvimento)
- Vercel (deploy)

## 📝 Notas

- O modelo 3D (`robo.glb`) requer servidor HTTP (não funciona com `file://`)
- Fallback automático caso o modelo não carregue
- Suporte a múltiplos caminhos de carregamento (localhost, produção, subdiretórios)

---

**Gaijin Creative** — Onde criatividade encontra código 🎨💻
