# Script para crear archivo .env.local con las credenciales de produccion
# Ejecutar en PowerShell: .\setup-env-local.ps1

Write-Host "Configurando variables de entorno locales..." -ForegroundColor Cyan

$envContent = @"
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
"@

$envPath = ".env.local"

# Verificar si el archivo ya existe
if (Test-Path $envPath) {
    Write-Host "ADVERTENCIA: El archivo .env.local ya existe." -ForegroundColor Yellow
    $response = Read-Host "Deseas sobrescribirlo? (s/n)"
    if ($response -ne "s" -and $response -ne "S") {
        Write-Host "Operacion cancelada." -ForegroundColor Red
        exit
    }
}

# Crear el archivo
try {
    $envContent | Out-File -FilePath $envPath -Encoding UTF8 -Force
    Write-Host "OK: Archivo .env.local creado exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usuarios configurados:" -ForegroundColor Cyan
    Write-Host "  - admin@niawi.tech (Acceso completo)" -ForegroundColor White
    Write-Host "  - lrojas@wts.com.pe (Solo automatizaciones)" -ForegroundColor White
    Write-Host "  - rhuillca@wts.com.pe (Solo automatizaciones)" -ForegroundColor White
    Write-Host ""
    Write-Host "Puedes ejecutar el proyecto con: npm run dev" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Error al crear el archivo: $_" -ForegroundColor Red
    exit 1
}

