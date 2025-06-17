# Variables de Entorno - Copiloto NiawiTech

## 🔒 Configuración de Seguridad

Las URLs de webhooks ahora están protegidas mediante variables de entorno.

## 📝 Variables Requeridas

### Para desarrollo local (.env):
```
VITE_RECOMMENDATIONS_API_URL=https://automation.wtsusa.us/webhook/2a2f2d36-9a66-4ca0-9f80-a8db6fea206b
VITE_CHAT_API_URL=https://automation.wtsusa.us/webhook/153ed783-a4e4-49be-8e89-16ae2d01ec1c
```

### Para Vercel (Dashboard):

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto "Copiloto NiawiTech"
3. Ve a **Settings** > **Environment Variables**
4. Agrega estas variables:

| Name | Value |
|------|-------|
| `VITE_RECOMMENDATIONS_API_URL` | `https://automation.wtsusa.us/webhook/2a2f2d36-9a66-4ca0-9f80-a8db6fea206b` |
| `VITE_CHAT_API_URL` | `https://automation.wtsusa.us/webhook/153ed783-a4e4-49be-8e89-16ae2d01ec1c` |

5. Asegúrate de marcar las variables para **Production**, **Preview** y **Development**
6. **Redeploy** el proyecto después de agregar las variables

## ⚠️ Importante

- Las variables **DEBEN** tener el prefijo `VITE_` para ser accesibles en el frontend
- Después de agregar variables en Vercel, **debes hacer redeploy**
- Para desarrollo local, crea un archivo `.env` en la raíz del proyecto

## 🔍 Verificación

Si las variables no están configuradas, la aplicación mostrará errores específicos indicando qué variable falta. 