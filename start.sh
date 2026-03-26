#!/bin/bash

echo "🚀 Iniciando servidor local Gaijin Creative..."
echo ""
echo "📂 Pasta: $(pwd)"
echo "🌐 URL: http://localhost:5500"
echo ""
echo "💡 Pressione Ctrl+C para parar o servidor"
echo ""

if command -v python3 &> /dev/null; then
    python3 -m http.server 5500
elif command -v python &> /dev/null; then
    python -m http.server 5500
else
    echo "❌ Python não encontrado. Instale Python 3 para continuar."
    exit 1
fi
