# Aplicación de Gestión de Gastos e Ingresos

Aplicación web completa para gestionar finanzas personales con capacidad de automatización de ingresos recurrentes.

## Características

- ✅ Sistema de autenticación de usuarios multi-usuario
- ✅ Registro manual de ingresos y gastos diarios
- ✅ Sistema de automatización de ingresos recurrentes (semanales/mensuales)
- ✅ Dashboard con balance en tiempo real
- ✅ Historial completo de transacciones
- ✅ Gestión de categorías
- ✅ Interfaz de usuario moderna y responsiva

## Stack Tecnológico

### Backend
- Node.js + Express + TypeScript
- Base de datos JSON con lowdb
- Autenticación JWT
- bcryptjs para encriptación de contraseñas

### Frontend
- React + TypeScript
- Vite
- React Router
- Axios para peticiones HTTP
- Tailwind CSS (estilos inline)

## Instalación y Uso

### Requisitos previos
- Node.js instalado
- npm instalado

### Configuración del proyecto

1. **Clonar o navegar al directorio del proyecto**
   ```bash
   cd gastos-ingresos-app
   ```

2. **Instalar dependencias del backend**
   ```bash
   cd backend
   npm install
   ```

3. **Instalar dependencias del frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### Ejecutar la aplicación

1. **Iniciar el servidor backend** (en una terminal)
   ```bash
   cd backend
   npm run dev    # Para desarrollo con nodemon
   # o
   npm run build  # Para compilar
   npm start      # Para producción
   ```

2. **Iniciar el servidor frontend** (en otra terminal)
   ```bash
   cd frontend
   npm run dev
   ```

3. **Abrir el navegador**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## Estructura del Proyecto

```
gastos-ingresos-app/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Controladores de la API
│   │   ├── models/          # Modelos de datos y lógica de negocio
│   │   ├── routes/          # Rutas de Express
│   │   ├── middleware/      # Middleware de autenticación
│   │   └── index.ts         # Punto de entrada del servidor
│   ├── data/                # Base de datos JSON (se crea automáticamente)
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/      # Componentes de React
    │   ├── pages/           # Páginas de la aplicación
    │   ├── services/        # Servicios API
    │   ├── contexts/        # Contextos de React
    │   └── types/           # Definiciones TypeScript
    └── package.json
```

## Uso de la Aplicación

### 1. Registro e Inicio de Sesión
- Crea una cuenta en la página de registro
- Inicia sesión con tus credenciales

### 2. Agregar Transacciones Manuales
- En el dashboard, usa el formulario "Agregar Transacción"
- Selecciona tipo (Ingreso/Gasto)
- Ingresa monto, categoría y descripción
- Haz clic en "Agregar"

### 3. Configurar Automatizaciones
- En la sección "Reglas Automáticas"
- Haz clic en "Nueva Regla"
- Configura:
  - Tipo (Ingreso/Gasto)
  - Frecuencia (Semanal/Mensual)
  - Día específico (día de la semana o día del mes)
  - Monto, categoría y descripción
- Haz clic en "Crear Regla"

### 4. Ejecutar Reglas Automáticas
- En la sección "Reglas Automáticas"
- Haz clic en "Ejecutar Reglas Pendientes"
- Las reglas que cumplan con la fecha se ejecutarán automáticamente

### 5. Ver Balance y Historial
- El dashboard muestra balance total, ingresos y gastos
- El historial muestra todas las transacciones con fecha
- Las transacciones automáticas están marcadas

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

### Transacciones
- `POST /api/transactions` - Crear transacción
- `GET /api/transactions` - Obtener transacciones del usuario
- `DELETE /api/transactions/:id` - Eliminar transacción
- `GET /api/transactions/balance` - Obtener balance

### Reglas Automáticas
- `POST /api/automatic-rules` - Crear regla automática
- `GET /api/automatic-rules` - Obtener reglas del usuario
- `PUT /api/automatic-rules/:id` - Actualizar regla
- `DELETE /api/automatic-rules/:id` - Eliminar regla
- `POST /api/automatic-rules/execute` - Ejecutar reglas pendientes

## Variables de Entorno

El archivo `.env` en el backend contiene:
```
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
```

**Importante:** Cambia `JWT_SECRET` en producción por una cadena segura y aleatoria.

## Datos

La aplicación utiliza una base de datos JSON que se guarda en:
- `backend/data/db.json`

Este archivo se crea automáticamente la primera vez que se ejecuta la aplicación.

## Notas

- La aplicación está configurada para desarrollo
- Para producción, asegúrate de:
  - Cambiar el JWT_SECRET
  - Configurar HTTPS
  - Usar una base de datos de producción
  - Configurar proper CORS
  - Implementar rate limiting
  - Agregar validaciones adicionales

## Problemas Comunes

### Node.js no reconocido
Si obtienes errores de "node no reconocido", asegúrate de que Node.js esté en el PATH del sistema:
1. Agrega `C:\Program Files\nodejs` a las variables de entorno PATH
2. Reinicia la terminal

### Puerto en uso
Si el puerto 3000 o 5173 está en uso, puedes cambiarlos en:
- Backend: archivo `.env` (PORT)
- Frontend: archivo `vite.config.ts` (server.port)

## Licencia

Este proyecto es para uso personal y educativo.