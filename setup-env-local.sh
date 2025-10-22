#!/bin/bash
# Script para crear archivo .env.local con las credenciales de producción
# Ejecutar en terminal: chmod +x setup-env-local.sh && ./setup-env-local.sh

echo "🔐 Configurando variables de entorno locales..."

ENV_PATH=".env.local"

# Verificar si el archivo ya existe
if [ -f "$ENV_PATH" ]; then
    echo "⚠️  El archivo .env.local ya existe."
    read -p "¿Deseas sobrescribirlo? (s/n): " response
    if [ "$response" != "s" ] && [ "$response" != "S" ]; then
        echo "❌ Operación cancelada."
        exit 0
    fi
fi

# Crear el archivo
cat > "$ENV_PATH" << 'EOF'
# Variables de entorno para desarrollo local
# NUNCA subir este archivo al repositorio (ya está en .gitignore)

# ===========================================
# AUTENTICACIÓN - ADMINISTRADOR (REQUERIDO)
# ===========================================
VITE_ADMIN_EMAIL=admin@niawi.tech
VITE_ADMIN_PASSWORD=d3mo.Niawi
VITE_ADMIN_NAME=Super Administrador

# ===========================================
# AUTENTICACIÓN - USUARIOS ADICIONALES (OPCIONAL)
# ===========================================
# Usuario 1 - Acceso únicamente al módulo de automatizaciones
VITE_USER1_EMAIL=lrojas@wts.com.pe
VITE_USER1_PASSWORD=WTS%2025*
VITE_USER1_NAME=Lya Rojas

# Usuario 2 - Acceso únicamente al módulo de automatizaciones
VITE_USER2_EMAIL=rhuillca@wts.com.pe
VITE_USER2_PASSWORD=WTS%2025*
VITE_USER2_NAME=Rommel Huillca

# ===========================================
# WEBHOOKS N8N
# ===========================================
VITE_N8N_WEBHOOK_POBUYS=

# ===========================================
# CONFIGURACIÓN DE SEGURIDAD
# ===========================================
VITE_ENCRYPTION_KEY=niawi-secure-key-2025

# ===========================================
# CONFIGURACIÓN DE DESARROLLO
# ===========================================
VITE_DEV_MODE=false
EOF

if [ $? -eq 0 ]; then
    echo "✅ Archivo .env.local creado exitosamente!"
    echo ""
    echo "📝 Usuarios configurados:"
    echo "  - admin@niawi.tech (Acceso completo)"
    echo "  - lrojas@wts.com.pe (Solo automatizaciones)"
    echo "  - rhuillca@wts.com.pe (Solo automatizaciones)"
    echo ""
    echo "🚀 Puedes ejecutar el proyecto con: npm run dev"
else
    echo "❌ Error al crear el archivo"
    exit 1
fi


