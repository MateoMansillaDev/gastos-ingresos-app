# Gestión de Finanzas

Aplicación de escritorio para Windows para gestionar finanzas personales con capacidad de automatización de ingresos y gastos recurrentes.

## Características

- ✅ Registro manual de ingresos y gastos diarios
- ✅ Sistema de automatización de transacciones recurrentes (semanales/mensuales)
- ✅ Dashboard con balance en tiempo real
- ✅ Tarjetas visuales para ingresos, gastos y balance
- ✅ Colores dinámicos (verde para positivo, rojo para negativo)
- ✅ Historial completo de transacciones
- ✅ 4 temas de colores (Púrpura, Azul, Verde, Oscuro)
- ✅ Persistencia de tema seleccionado
- ✅ Interfaz moderna y responsive
- ✅ Funciona sin Node.js ni npm instalados

## Stack Tecnológico

- **Electron**: Aplicación de escritorio
- **Express**: Servidor integrado
- **lowdb**: Base de datos JSON
- **JavaScript ES6+**: Lógica de la aplicación
- **HTML5/CSS3**: Interfaz de usuario

## Instalación

### Para usuarios finales

1. Descarga el instalador: `Gestión de Finanzas Setup 1.0.0.exe`
2. Ejecuta el instalador
3. Sigue el asistente de instalación
4. La aplicación se instalará en tu sistema

### Para desarrolladores

#### Requisitos previos
- Node.js instalado
- npm instalado

#### Configuración del proyecto

1. **Navegar al directorio del proyecto**
   ```bash
   cd gastos-ingresos-app
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo**
   ```bash
   npm start
   ```

4. **Generar instalador para Windows**
   ```bash
   npm run build:win
   ```
   El instalador se generará en: `C:\Users\Mateo\Desktop\Instaladores\`

## Estructura del Proyecto

```
gastos-ingresos-app/
├── electron/
│   ├── main.js            # Proceso principal de Electron
│   ├── preload.js         # Script de preload
│   ├── index.html         # Interfaz de usuario
│   └── app.js             # Lógica de la aplicación
├── backend/              # Código backend (referencia)
├── frontend/             # Código frontend (referencia)
└── package.json          # Configuración del proyecto
```

## Uso de la Aplicación

### 1. Temas de Colores
- Usa los botones circulares en la parte superior para cambiar el tema
- Temas disponibles: Púrpura, Azul, Verde, Oscuro
- El tema seleccionado se guarda automáticamente

### 2. Agregar Transacciones Manuales
- En la sección "Agregar Transacción"
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
- Haz clic en "⚡ Ejecutar Reglas Pendientes"
- Las reglas que cumplan con la fecha se ejecutarán automáticamente

### 5. Ver Balance y Historial
- El dashboard muestra 3 tarjetas: Ingresos, Gastos y Balance
- Balance verde cuando es positivo, rojo cuando es negativo
- El historial muestra todas las transacciones
- Las transacciones automáticas están marcadas con "Auto"

## Almacenamiento de Datos

La aplicación guarda los datos en:
- `C:\Users\TU_USUARIO\AppData\Roaming\gestion-finanzas\data\db.json`

## Compilación

### Compilar para Windows
```bash
npm run build:win
```

### Compilar para todas las plataformas
```bash
npm run build:all
```

## Notas

- La aplicación es un ejecutable autónomo que no requiere instalación de Node.js
- La base de datos se crea automáticamente al iniciar la aplicación
- El tema seleccionado se guarda en localStorage
- Para desarrollo, usa `npm start` para iniciar la aplicación con recarga en caliente

## Solución de Problemas

### La aplicación no inicia
- Verifica que no haya otra instancia corriendo
- Revisa los permisos de la carpeta de datos
- reinstala la aplicación

### Los datos no se guardan
- Verifica que tengas permisos de escritura en AppData
- Revisa el espacio en disco

### El instalador no funciona
- Ejecuta como administrador
- Desactiva temporalmente el antivirus
- Verifica que Windows esté actualizado

## Licencia

Este proyecto es para uso personal y educativo.