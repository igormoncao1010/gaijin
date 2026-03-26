# Configuração do Modelo 3D (Abelha)

Guia rápido para ajustar o tamanho e posição da abelha no site.

## 📍 Arquivo: `js/three-scene.js`

### 🔍 Ajustar Tamanho (Escala)

Localize a linha 77:
```javascript
model.scale.set(0.8, 0.8, 0.8);
```

**Valores sugeridos:**
- `0.5` - Pequeno
- `0.8` - Médio (atual)
- `1.0` - Grande
- `1.2` - Extra Grande

### 📷 Ajustar Zoom da Câmera

Localize a linha 18:
```javascript
camera.position.set(0, 0, 5);
```

**O último número (Z) controla a distância:**
- `3` - Muito próximo (modelo parece maior)
- `5` - Distância atual
- `7` - Mais longe (modelo parece menor)

### 📐 Centralização

A abelha está centralizada em:
```javascript
model.position.set(0, 0, 0);  // X, Y, Z
controls.target.set(0, 0, 0);  // Câmera olha para o centro
```

## 🎨 Dicas de Ajuste

1. **Para aumentar a abelha:**
   - Aumente `model.scale` OU diminua `camera.position Z`

2. **Para mover verticalmente:**
   - Ajuste o segundo valor em `model.position.set(0, Y, 0)`

3. **Para mover horizontalmente:**
   - Ajuste o primeiro valor em `model.position.set(X, 0, 0)`

## 🔄 Aplicar Mudanças

Após editar `js/three-scene.js`:
1. Salve o arquivo
2. Recarregue o navegador (`Ctrl+Shift+R` ou `F5`)

## 📝 Valores Atuais (Recomendados)

```javascript
// Linha 17-18: FOV e posição da câmera
const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
camera.position.set(0, 0, 5);

// Linha 77-80: Escala e posição do modelo
model.scale.set(0.8, 0.8, 0.8);
model.position.set(0, 0, 0);

// Linha 33: Target da câmera
controls.target.set(0, 0, 0);
```

---

**Última atualização:** 26/03/2026
