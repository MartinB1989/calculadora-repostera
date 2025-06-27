# Arquitectura CSS - Calculadora Pastelera

Esta carpeta contiene la arquitectura CSS modular del proyecto, organizada para mejorar el mantenimiento y la escalabilidad.

## Estructura de archivos

```
css/
├── styles.css          # Archivo principal que importa todos los módulos
├── variables.css       # Variables CSS y tokens de diseño
├── reset.css          # Reset CSS y estilos base
├── header.css         # Estilos del header y navegación
├── layout.css         # Layout principal y estructura de páginas
├── components.css     # Componentes reutilizables (botones, iconos)
├── forms.css          # Formularios y elementos de entrada
├── cards.css          # Tarjetas de ingredientes y recetas
├── modals.css         # Ventanas modales y popups
├── responsive.css     # Media queries y diseño responsivo
└── README.md          # Esta documentación
```

## Arquitectura

### 1. Variables CSS (`variables.css`)
- **Tokens de diseño**: Colores, tipografías, espaciado, sombras
- **Mantenimiento centralizado**: Cambios globales desde un solo archivo
- **Consistencia**: Garantiza el uso coherente de valores de diseño

### 2. Reset CSS (`reset.css`)
- **Normalización**: Reset de estilos por defecto del navegador
- **Estilos base**: Configuración global del body y contenedores
- **Animaciones globales**: Keyframes reutilizables

### 3. Componentes de Layout
- **`header.css`**: Header fijo, navegación y branding
- **`layout.css`**: Estructura principal, páginas y grids

### 4. Componentes UI
- **`components.css`**: Botones, iconos y elementos reutilizables
- **`forms.css`**: Formularios, inputs y validaciones
- **`cards.css`**: Tarjetas de contenido (ingredientes y recetas)
- **`modals.css`**: Ventanas emergentes y overlays

### 5. Responsivo (`responsive.css`)
- **Mobile First**: Diseño adaptable desde móvil hasta desktop
- **Breakpoints**: 768px (tablet), 480px (móvil), 320px (móvil pequeño)

## Ventajas de esta arquitectura

✅ **Mantenibilidad**: Cada archivo tiene una responsabilidad específica
✅ **Escalabilidad**: Fácil agregar nuevos componentes
✅ **Reutilización**: Componentes modulares y reutilizables
✅ **Organización**: Estructura clara y predecible
✅ **Performance**: Carga solo los estilos necesarios
✅ **Colaboración**: Fácil trabajo en equipo sin conflictos

## Guía de uso

### Para agregar nuevos estilos:
1. Identifica a qué módulo pertenece el nuevo estilo
2. Si es un componente nuevo, crea un archivo específico
3. Usa las variables CSS definidas para mantener consistencia
4. Actualiza `styles.css` si agregas nuevos archivos

### Para modificar estilos existentes:
1. Localiza el archivo correspondiente según la funcionalidad
2. Mantén la estructura y nomenclatura existente
3. Usa las variables CSS en lugar de valores hardcodeados

### Convenciones de nomenclatura:
- **BEM methodology**: `.block__element--modifier`
- **Variables semánticas**: `--primary-color`, `--spacing-md`
- **Clases descriptivas**: `.ingredient-card`, `.recipe-form`

## Variables CSS disponibles

Consulta `variables.css` para ver todas las variables disponibles:
- **Colores**: `--primary-color`, `--secondary-color`, etc.
- **Espaciado**: `--spacing-xs` a `--spacing-xxl`
- **Tipografía**: `--font-family`, `--font-size-*`
- **Efectos**: `--shadow`, `--border-radius`, `--transition`

Esta arquitectura hace que el código CSS sea más mantenible, escalable y fácil de entender para cualquier desarrollador que trabaje en el proyecto. 