# 📋 Análisis Funcional - Copiloto Niawi

> **Versión:** 2.0.0  
> **Fecha de Análisis:** Diciembre 2025  
> **Desarrollado por:** Niawi Tech

---

## 📌 Resumen Ejecutivo

**Copiloto Niawi** es una plataforma de chat con agentes de Inteligencia Artificial especializados, diseñada para empresas del sector textil/manufactura. La plataforma integra:

- **Chat IA multi-agente** con agentes especializados por departamento
- **Módulo de Automatizaciones** para procesamiento de archivos Excel (WIP, Packing List, PO Buys)
- **Panel de Recomendaciones IA** con insights estratégicos
- **Sistema de Gestión de Usuarios** con roles jerárquicos y permisos granulares
- **Dashboard de Ejecuciones** en tiempo real conectado a N8N

### Stack Tecnológico

| Categoría | Tecnología |
|-----------|------------|
| **Framework** | React 18 + TypeScript + Vite |
| **Estilos** | TailwindCSS + Radix UI + shadcn/ui |
| **Estado** | TanStack Query + Context API |
| **Routing** | React Router DOM v6 |
| **Charts** | Recharts |
| **Excel** | SheetJS (xlsx) |
| **Markdown** | react-markdown + remark-gfm |
| **Backend** | Webhooks N8N (automation.wtsusa.us) |

---

## 🏗️ Arquitectura de la Plataforma

### Estructura de Rutas

```
/                       → Index (redirección a /login)
/login                  → Página de autenticación
/dashboard              → Layout principal (requiere auth)
├── /                   → Chat IA (default)
├── /chat               → Chat IA
├── /agents             → Dashboard de Agentes
├── /recommendations    → Recomendaciones IA
├── /integrations       → Integraciones externas
├── /automations        → Módulo de Automatizaciones
│   ├── /dashboard      → Dashboard de ejecuciones
│   ├── /wip            → Proceso WIP
│   ├── /po-buys        → Proceso PO Buys
│   └── /packing-list   → Proceso Packing List
└── /settings           → Configuración del sistema
```

### Proveedores de Contexto

1. **ThemeProvider** - Gestión de tema claro/oscuro
2. **QueryClientProvider** - Cache y estado del servidor (TanStack Query)
3. **AgentProvider** - Estado global de agentes y usuarios
4. **TooltipProvider** - Tooltips globales

---

## 📦 Módulos del Sistema

---

### 1. 🔐 Módulo de Autenticación

**Archivo principal:** `src/pages/Login.tsx`, `src/hooks/useAuth.ts`

#### Funcionalidades
- ✅ Login con email y contraseña
- ✅ Validación de credenciales via variables de entorno
- ✅ Persistencia de sesión en localStorage
- ✅ Redirección según tipo de acceso (`full` vs `automations_only`)
- ✅ Protección de rutas (requireAuth)
- ✅ Logout con limpieza de sesión

#### Tipos de Usuario
| Tipo | Acceso |
|------|--------|
| `super_admin` | Acceso completo a toda la plataforma |
| `admin` | Acceso completo, sin gestión avanzada |
| `manager` | Acceso limitado a módulos específicos |
| `employee` | Acceso básico solo a chat |
| `automations_user` | Solo módulo de automatizaciones |

#### Alcance Frontend
- UI de login con diseño glass-morphism
- Mostrar/ocultar contraseña
- Estado de loading durante verificación
- Mensajes de error en credenciales inválidas
- Redirección automática post-login

---

### 2. 💬 Módulo de Chat IA

**Archivo principal:** `src/pages/Chat.tsx`

#### Funcionalidades
- ✅ Chat conversacional con múltiples agentes IA
- ✅ Selector de agente dinámico
- ✅ Persistencia de conversaciones por agente (localStorage)
- ✅ Sugerencias contextuales por agente
- ✅ Renderizado de Markdown completo (tablas, código, listas)
- ✅ Adjuntos multimedia (imágenes, PDFs, audio)
- ✅ Grabación de notas de voz
- ✅ Drag & drop de archivos
- ✅ Pegado de imágenes desde portapapeles
- ✅ Auto-scroll y auto-resize del textarea
- ✅ Nueva conversación / historial

#### Agentes Disponibles
| ID | Nombre | Departamento | Estado |
|----|--------|--------------|--------|
| `operations` | Agente de Operaciones | PCP | Activo |
| `documents` | Validador de Documentos | WTS | Activo |
| `hr` | Agente de RRHH | Recursos Humanos | Mantenimiento |
| `sales` | Agente de Ventas | Comercial | Mantenimiento |

#### Endpoints Configurados
- **Agente PCP:** `https://automation.wtsusa.us/webhook/153ed783-a4e4-49be-8e89-16ae2d01ec1c`
- **Agente WTS:** `https://automation.wtsusa.us/webhook/067c480e-c554-4e28-a4e1-4212e4b7c8f2`

#### Alcance Frontend
- Pantalla de bienvenida personalizada con nombre de usuario
- Grid de sugerencias interactivas
- Burbujas de chat con timestamps
- Indicador de "escribiendo..." con animación
- Manejo de errores de red
- Soporte para adjuntos con validación (5MB por archivo, 15MB total)
- Formatos permitidos: JPEG, PNG, WebP, PDF, Audio (webm/ogg/mp4)

---

### 3. 🤖 Módulo de Administración de Agentes

**Archivo principal:** `src/pages/AgentsDashboard.tsx`

#### Funcionalidades
- ✅ Vista de todos los agentes en grid/cards
- ✅ Estadísticas agregadas (activos, conversaciones, precisión)
- ✅ Activar/desactivar agentes (toggle)
- ✅ Crear nuevo agente (modal)
- ✅ Editar información de agente
- ✅ Configurar webhook/endpoint
- ✅ Eliminar agente (con confirmación)
- ✅ Reset a valores por defecto
- ✅ Persistencia en localStorage

#### Métricas por Agente
- Usuarios conectados
- Total de conversaciones
- Uso (%)
- Precisión (%)
- Última actividad

#### Alcance Frontend
- Cards con gradientes y colores por agente
- Dropdown de acciones (configurar, editar, eliminar)
- Modal de configuración avanzada
- Modal de creación/edición
- Diálogo de confirmación para eliminar
- Badges de estado (ACTIVO/INACTIVO)
- Listado de capacidades con badges

---

### 4. ⚡ Módulo de Automatizaciones

**Archivos principales:** 
- `src/pages/Automations.tsx`
- `src/pages/automations/AutomationsDashboard.tsx`
- `src/pages/automations/WipProcess.tsx`
- `src/pages/automations/PackingListProcess.tsx`
- `src/services/automationService.ts`

#### Sub-módulos

##### 4.1 Dashboard de Ejecuciones
**Funcionalidades:**
- ✅ Tabla de ejecuciones en tiempo real
- ✅ Auto-refresh cada 60 segundos
- ✅ Filtros por workflow, estado, fechas, búsqueda
- ✅ Ordenamiento por todas las columnas
- ✅ Paginación (20 items por página)
- ✅ Estadísticas: total, exitosas, fallidas, en curso, duración promedio
- ✅ Conexión a webhook N8N productivo

**Webhooks:**
- Reporte de ejecuciones: `https://automation.wtsusa.us/webhook/reportewts`

##### 4.2 Proceso WIP (Work in Progress)
**Funcionalidades:**
- ✅ Carga de archivo Excel (.xlsx, .xls)
- ✅ Selección de tipo de fábrica
- ✅ Envío a webhook N8N
- ✅ Visualización de resultados en tabla
- ✅ Descarga automática de Excel procesado
- ✅ Cronómetro de tiempo de procesamiento
- ✅ Transformación de datos a formato interno

**Webhook:** `https://automation.wtsusa.us/webhook/WIPautomation`

**Campos procesados:**
| Campo | Descripción |
|-------|-------------|
| buyer_name | Nombre del comprador |
| pwn_no | Número PWN |
| po_no | Número de orden |
| article_code | Código de artículo |
| delivery_date | Fecha de entrega |
| color_name | Nombre del color |
| process_name | Nombre del proceso |
| current_qty | Cantidad actual |
| balance_qty | Balance |

##### 4.3 Proceso Packing List
**Funcionalidades:**
- ✅ Carga de archivo Excel con datos de empaque
- ✅ Extracción de estadísticas completas
- ✅ Panel de gestión de PWNID
- ✅ Edición inline de PWNID por BuyerPO
- ✅ Re-upload de Excel con PWNID completados
- ✅ Validación de completitud (% complete/incomplete)
- ✅ Envío a ERP
- ✅ Visualización de respuesta del ERP
- ✅ Análisis de hojas procesadas/omitidas
- ✅ Descarga automática de Excel

**Webhook:** `https://automation.wtsusa.us/webhook/automatizacionpackinglist`

**Estadísticas Extraídas:**
- Total de órdenes y cartones
- Totales por talla (sizeTotals)
- DCs únicos, estilos, colores
- Análisis de hojas (procesadas, omitidas, con errores)
- Flags de calidad de datos

##### 4.4 Proceso PO Buys (Placeholder)
- ⏳ Pendiente de implementación
- Estructura lista con webhook configurable

#### Alcance Frontend Automatizaciones
- Navegación por tabs (Dashboard, WIP, PO Buys, Packing List)
- Cards de métricas con iconos y colores
- Tabla de resultados con paginación
- Accordion colapsable para carga de archivos
- Indicador de progreso/tiempo
- Toast notifications (sonner)
- Exportación a Excel con xlsx

---

### 5. 💡 Módulo de Recomendaciones IA

**Archivo principal:** `src/pages/Recommendations.tsx`

#### Funcionalidades
- ✅ Fetch de recomendaciones desde API
- ✅ Vista grid/lista (toggle)
- ✅ Filtros por categoría y estado
- ✅ Búsqueda por texto
- ✅ Modal de detalle de recomendación
- ✅ Estadísticas (total, nuevas, aplicadas, críticas)
- ✅ Badges de prioridad/impacto (alto, medio, bajo)
- ✅ Estado de carga y error

#### Estructura de Recomendación
| Campo | Descripción |
|-------|-------------|
| mensaje | Título de la recomendación |
| descripcion | Descripción detallada |
| impacto | Alto/Medio/Bajo |
| categoria | Categoría temática |
| estado | Nueva/Aplicada/Descartada |
| estimatedRevenue | Impacto económico estimado |
| prioridad | Número de prioridad |

#### Alcance Frontend
- Cards animadas con hover effects
- Modal con análisis detallado
- Métricas en cards destacadas
- Botones de acción (aplicar recomendación)
- Loading spinner durante fetch
- Estado vacío con mensaje informativo

---

### 6. 🔗 Módulo de Integraciones

**Archivo principal:** `src/pages/Integrations.tsx`

#### Integraciones Disponibles
| Integración | Estado | Descripción |
|-------------|--------|-------------|
| Google Analytics | Conectado | Analítica web |
| Google Tag Manager | Conectado | Gestión de etiquetas |
| Woowup / CRM | Conectado | Gestión de clientes |
| Monitor de Competencia | Desconectado | Seguimiento de precios |
| Niawi API | Conectado | Métricas de negocio |

#### Alcance Frontend
- Cards por integración con ícono y estado
- Badge de estado (CONECTADO/DESCONECTADO)
- Indicador de última sincronización
- Botón de acción contextual (Ver datos/Conectar)
- Estadísticas agregadas (conectadas, pendientes, total)

---

### 7. ⚙️ Módulo de Configuración

**Archivo principal:** `src/pages/Settings.tsx`

#### Tabs Disponibles

##### 7.1 General
- Configuración de notificaciones (email, push, alertas)
- Preferencias de IA (sugerencias proactivas, análisis detallado)
- Datos y privacidad (analytics, exportar datos)

##### 7.2 Usuarios (requiere permisos)
- Estadísticas de usuarios (total, activos, por rol)
- Tabla de gestión de usuarios
- Crear nuevo usuario (modal)
- Editar usuario existente
- Cambiar rol de usuario
- Activar/desactivar usuario

##### 7.3 Asignaciones de Agentes (solo super_admin)
- Tabla de usuarios con sus asignaciones
- Modal para asignar agentes específicos
- Tipos de asignación:
  - **Custom**: Ignora permisos de rol
  - **Role-based**: Rol + agentes adicionales
  - **Restricted**: Reduce acceso del rol
- Revocar asignaciones
- Historial de cambios

##### 7.4 Actividad (requiere permisos)
- Logs de actividad reciente
- Filtrado por usuario/acción
- Detalles de cada acción

##### 7.5 Seguridad (requiere permisos)
- Autenticación de dos factores
- Timeout de sesión
- Máximo intentos de login
- Zona de peligro (reset - solo super_admin)

##### 7.6 Acerca de
- Versión del sistema
- Información de empresa
- Plan activo y estado

#### Alcance Frontend
- Sistema de tabs con control de permisos
- Modales para crear/editar usuarios
- Checkboxes para asignación de agentes
- Tabla con acciones por fila
- Badges de rol con colores
- Alertas de confirmación
- Persistencia en localStorage

---

### 8. 🎨 Layout y Navegación

**Archivo principal:** `src/components/DashboardLayout.tsx`

#### Funcionalidades
- ✅ Sidebar colapsable (expandir/colapsar en desktop)
- ✅ Sidebar drawer en móvil
- ✅ Menú dinámico según permisos de usuario
- ✅ Avatar de usuario con iniciales
- ✅ Badge de rol con color
- ✅ Toggle de tema claro/oscuro
- ✅ Botón de logout
- ✅ Header móvil con título de página
- ✅ Overlay para cerrar sidebar en móvil

#### Menú según Rol
| Rol | Menús Visibles |
|-----|----------------|
| super_admin | Todos + Configuración avanzada |
| admin | Todos excepto configuración avanzada |
| manager | Recomendaciones, Chat, Agentes, Automatizaciones |
| employee | Chat, Automatizaciones |
| bot_user | Solo Automatizaciones |

---

## 🔧 Hooks Personalizados

### useAuth
- Gestión de autenticación
- Login/logout
- Protección de rutas
- Estado de usuario actual

### useAgent
- Acceso al contexto de agentes
- Agente seleccionado
- Endpoint del agente
- Usuario actual

### useAgentsManager
- CRUD de agentes
- Persistencia en localStorage
- Toggle de estado
- Métricas mock

### useUsersManager
- CRUD de usuarios
- Cambio de roles
- Asignación de agentes
- Logs de actividad

### usePackingListPWNID
- Gestión de estado PWNID
- Grupos por BuyerPO
- Estadísticas de completitud
- Envío a ERP

---

## 📊 Tipos y Modelos de Datos

### Tipos Principales

```typescript
// Usuario del sistema
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
  availableAgents: string[];
  permissions: UserPermissions;
  isActive: boolean;
  agentAssignments?: UserAgentAssignment;
  useCustomAgentAccess?: boolean;
}

// Agente IA
interface Agent {
  id: string;
  name: string;
  department: string;
  description: string;
  icon: LucideIcon;
  endpoint: string;
  capabilities: string[];
  status: 'active' | 'maintenance' | 'new';
}

// Mensaje de chat
interface Message {
  id: number;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  hasError?: boolean;
  attachments?: Attachment[];
}

// Resultado de proceso
interface ProcessResults {
  success: boolean;
  data: Array<Record<string, any>>;
  recordCount?: number;
  stats?: PackingListStats;
  sheetsAnalysis?: SheetsAnalysis;
}
```

---

## 🔐 Sistema de Permisos

### Jerarquía de Roles
```
super_admin (4) > admin (3) > manager (2) > employee (1)
```

### Permisos por Módulo
| Módulo | super_admin | admin | manager | employee |
|--------|-------------|-------|---------|----------|
| agents.view | ✅ | ✅ | ✅ | ❌ |
| agents.create | ✅ | ✅ | ❌ | ❌ |
| agents.edit | ✅ | ✅ | ❌ | ❌ |
| agents.delete | ✅ | ✅ | ❌ | ❌ |
| agents.assign | ✅ | ❌ | ❌ | ❌ |
| users.view | ✅ | ✅ | ✅ | ❌ |
| users.create | ✅ | ✅ | ❌ | ❌ |
| users.assignAgents | ✅ | ❌ | ❌ | ❌ |
| analytics.view | ✅ | ✅ | ✅ | ❌ |
| settings.edit | ✅ | ✅ | ❌ | ❌ |
| settings.advanced | ✅ | ❌ | ❌ | ❌ |

---

## 🎯 Estado Actual vs Pendiente

### ✅ Implementado
- [x] Autenticación completa
- [x] Chat multi-agente con adjuntos
- [x] Dashboard de agentes con CRUD
- [x] Automatizaciones WIP y Packing List
- [x] Dashboard de ejecuciones en tiempo real
- [x] Sistema de roles y permisos
- [x] Asignación granular de agentes
- [x] Tema claro/oscuro
- [x] Diseño responsive
- [x] Exportación a Excel

### ⏳ Pendiente/En Progreso
- [ ] Proceso PO Buys (estructura lista)
- [ ] Integración real con APIs externas
- [ ] Dashboard ejecutivo con gráficas reales
- [ ] Sistema de notificaciones en tiempo real
- [ ] Backend propio (actualmente webhooks N8N)
- [ ] Tests automatizados
- [ ] Documentación de API

---

## 📁 Estructura de Archivos Clave

```
src/
├── App.tsx                    # Router y providers
├── main.tsx                   # Entry point
├── pages/
│   ├── Login.tsx             # Autenticación
│   ├── Chat.tsx              # Chat IA principal
│   ├── AgentsDashboard.tsx   # Admin agentes
│   ├── Recommendations.tsx   # Recomendaciones IA
│   ├── Integrations.tsx      # Integraciones
│   ├── Settings.tsx          # Configuración
│   └── automations/
│       ├── AutomationsDashboard.tsx
│       ├── WipProcess.tsx
│       └── PackingListProcess.tsx
├── components/
│   ├── DashboardLayout.tsx   # Layout principal
│   ├── AgentSelector.tsx     # Selector de agente
│   ├── MarkdownRenderer.tsx  # Renderizado MD
│   └── packing-list/         # Componentes específicos
├── contexts/
│   ├── AgentContext.tsx      # Estado global agentes
│   └── ThemeContext.tsx      # Tema
├── hooks/
│   ├── useAuth.ts            # Autenticación
│   ├── useAgent.ts           # Acceso a contexto
│   ├── useAgentsManager.ts   # CRUD agentes
│   └── useUsersManager.ts    # CRUD usuarios
├── services/
│   └── automationService.ts  # Lógica de automatizaciones
├── types/
│   ├── agents.ts             # Tipos de agentes/usuarios
│   └── automations.ts        # Tipos de procesos
├── constants/
│   └── agents.ts             # Configuración de agentes
└── lib/
    └── exportExcel.ts        # Utilidades Excel
```

---

## 📝 Notas Adicionales

### Variables de Entorno Requeridas
```env
VITE_CHAT_API_URL=https://api.niawi.tech
VITE_N8N_WEBHOOK_POBUYS=<webhook_url>
VITE_RECOMMENDATIONS_API_URL=<api_url>
VITE_AUTH_EMAIL=<admin_email>
VITE_AUTH_PASSWORD=<admin_password>
```

### Limitaciones Conocidas
1. Los agentes HR y Sales están en mantenimiento
2. El backend es via webhooks N8N (no API REST propia)
3. Datos de métricas de agentes son mock
4. El módulo PO Buys está como placeholder

---

**Documento generado automáticamente - Copiloto Niawi v2.0.0**
