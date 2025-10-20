#!/bin/bash

# Script para limpiar credenciales expuestas del historial de Git
# Ejecutar desde la raíz del proyecto

echo "🔐 Limpiando credenciales expuestas del historial de Git..."

# Verificar que estamos en un repositorio Git
if [ ! -d ".git" ]; then
    echo "❌ Error: No se encontró un repositorio Git. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

# Crear backup del repositorio actual
echo "📦 Creando backup del repositorio actual..."
git bundle create backup-$(date +%Y%m%d-%H%M%S).bundle --all

# Limpiar credenciales del historial
echo "🧹 Limpiando credenciales del historial..."

# Eliminar archivos .env del historial
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env .env.local .env.development.local .env.test.local .env.production.local' \
  --prune-empty --tag-name-filter cat -- --all

# Limpiar referencias
echo "🗑️ Limpiando referencias..."
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Forzar actualización del repositorio remoto
echo "🚀 Actualizando repositorio remoto..."
echo "⚠️ ADVERTENCIA: Esto reescribirá el historial del repositorio remoto."
echo "¿Estás seguro de que quieres continuar? (y/N)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    git push origin --force --all
    git push origin --force --tags
    echo "✅ Repositorio remoto actualizado exitosamente."
else
    echo "⏸️ Actualización del repositorio remoto cancelada."
    echo "💡 Puedes ejecutar 'git push origin --force --all' más tarde si es necesario."
fi

echo "✅ Limpieza completada. Las credenciales han sido eliminadas del historial."
echo "📋 Próximos pasos:"
echo "   1. Configurar variables de entorno en .env.local"
echo "   2. Cambiar contraseñas por defecto"
echo "   3. Notificar al equipo sobre los cambios"
echo "   4. Verificar que GitGuardian ya no detecte problemas"
