# Calculadora Pastelera

Una aplicación web para calcular costos y precios de recetas de pastelería, ahora organizada con una arquitectura modular.

## Estructura del Proyecto

```
calculadora-pastelera/
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── js/                 # Módulos JavaScript
│   ├── app.js          # Aplicación principal (coordinador)
│   ├── ingredients.js  # Gestión de ingredientes
│   ├── recipes.js      # Gestión de recetas
│   └── ui.js          # Gestión de interfaz de usuario
├── backup/            # Archivo de respaldo
│   └── script.js      # Script original monolítico
└── README.md          # Este archivo
```

## Arquitectura Modular

### 1. **app.js** - Aplicación Principal
- **Función**: Coordinador central que importa y orquesta todos los módulos
- **Responsabilidades**:
  - Inicialización de la aplicación
  - Gestión de eventos globales
  - Coordinación entre módulos
  - Manejo de errores a nivel de aplicación

### 2. **ingredients.js** - Gestión de Ingredientes
- **Función**: Manejo completo de los ingredientes
- **Características**:
  - Clase `IngredientsManager`
  - CRUD de ingredientes (crear, leer, actualizar, eliminar)
  - Cálculo de precios por unidad
  - Renderizado de tarjetas de ingredientes
  - Almacenamiento local

### 3. **recipes.js** - Gestión de Recetas
- **Función**: Manejo de recetas y cálculos de costos
- **Características**:
  - Clase `RecipesManager`
  - Creación y gestión de recetas
  - Cálculo de costos totales y ganancias
  - Escalado de recetas (calcular para diferentes cantidades)
  - Renderizado de tarjetas de recetas
  - Generación de resultados detallados

### 4. **ui.js** - Gestión de Interfaz
- **Función**: Manejo de la interfaz de usuario y navegación
- **Características**:
  - Clase `UIManager`
  - Navegación entre páginas
  - Gestión de modales (creación de recetas, escalado)
  - Validación de formularios paso a paso
  - Sistema de notificaciones
  - Estados vacíos y renderizado de vistas

## Ventajas de la Arquitectura Modular

### ✅ **Organización**
- Código separado por responsabilidades
- Fácil localización de funcionalidades específicas
- Estructura clara y mantenible

### ✅ **Reutilización**
- Módulos independientes y reutilizables
- Interfaces claras entre componentes
- Fácil testing de módulos individuales

### ✅ **Escalabilidad**
- Agregar nuevas funcionalidades sin afectar módulos existentes
- Posibilidad de extender cada módulo independientemente
- Base sólida para futuras mejoras

### ✅ **Mantenimiento**
- Cambios aislados por módulo
- Debugging más eficiente
- Código más legible y entendible

## Funcionalidades

### Gestión de Ingredientes
- ➕ Agregar ingredientes con precio, cantidad y unidad
- 🗑️ Eliminar ingredientes
- 💰 Cálculo automático de precio por unidad
- 💾 Almacenamiento local persistente

### Creación de Recetas
- 📝 Proceso paso a paso para crear recetas
- 🧮 Cálculo automático de costos
- 📈 Configuración de margen de ganancia
- 📏 Escalado opcional para diferentes cantidades

### Calculadora de Escalado
- 🔢 Calcular ingredientes para cualquier cantidad
- 💵 Costos y precios escalados automáticamente
- 📊 Desglose detallado de costos por unidad

## Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos y responsivos
- **JavaScript ES6+**: Módulos, clases y características modernas
- **LocalStorage**: Persistencia de datos del lado del cliente
- **Font Awesome**: Iconografía

## Instalación y Uso

1. **Clonar o descargar** el proyecto
2. **Abrir `index.html`** en un navegador moderno que soporte módulos ES6
3. **Comenzar a usar** la aplicación agregando ingredientes y creando recetas

> **Nota**: La aplicación requiere un servidor HTTP para funcionar correctamente debido al uso de módulos ES6. Puedes usar herramientas como Live Server en VS Code o simplemente abrir con `file://` en navegadores modernos.

## Próximas Mejoras Posibles

- 🔄 Sistema de importación/exportación de datos
- 📱 Mejoras en responsive design
- 🔍 Sistema de búsqueda y filtrado
- 📊 Reportes y estadísticas
- 🌙 Modo oscuro
- 🔐 Sistema de autenticación
- ☁️ Sincronización en la nube

---

**Desarrollado con ❤️ para pasteleros y emprendedores gastronómicos** 