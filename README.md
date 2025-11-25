# CSS Lens 👁️✨

<div align="center">

![CSS Lens Logo](icons/icon128.png)

**Una extensión de navegador potente y elegante para inspeccionar y editar CSS en tiempo real**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/olalmeida/css-lens)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/olalmeida/css-lens/pulls)

[English](#english) | [Español](#español)

</div>

---

## Español

### 📖 Descripción

**CSS Lens** es una extensión de navegador moderna y potente diseñada para desarrolladores y diseñadores web que necesitan inspeccionar y modificar estilos CSS en tiempo real. Con una interfaz intuitiva y características avanzadas, CSS Lens hace que el desarrollo web sea más rápido y eficiente.

### ✨ Características Principales

#### 🔍 Inspección Avanzada
- **Modo Inspector Interactivo**: Activa/desactiva el modo de inspección con un solo clic
- **Visualización en Tiempo Real**: Inspecciona cualquier elemento de la página al pasar el cursor
- **Box Model Visual**: Visualización interactiva de margin, padding, border y content
- **Detección Automática**: Identifica automáticamente contenedores Flexbox y Grid
- **Bloqueo de Elementos**: Mantén un elemento seleccionado para análisis detallado

#### 🎨 Análisis Global de Página
- **Typography Tab**: Analiza todas las fuentes, tamaños y pesos de texto usados
- **Colors Tab**: Extrae y visualiza la paleta de colores completa de la página
- **Images Tab**: Lista todas las imágenes (incluyendo backgrounds) con opción de descarga
- **Estadísticas en Tiempo Real**: Métricas instantáneas sobre elementos y estilos

#### ✏️ Edición en Vivo
- **Edición Inline**: Modifica propiedades CSS directamente desde el overlay
- **Edición de Contenido**: Cambia el texto de los elementos en tiempo real
- **Feedback Visual**: Confirmación visual de cambios aplicados
- **Límite Gratuito**: 5 ediciones por sesión (ilimitado en Premium)

#### 🎯 Productividad
- **Copiar CSS**: Exporta las propiedades CSS de cualquier elemento
- **Overlay Arrastrable**: Posiciona el panel donde lo necesites
- **Navegación por Pestañas**: Acceso rápido a diferentes vistas
- **Persistencia de Estado**: El overlay permanece abierto al navegar entre páginas
- **Soporte para SPAs**: Funciona perfectamente con aplicaciones React, Vue, Angular

#### 🚀 Rendimiento
- **Ultra Rápido**: Renderizado optimizado con throttling y RAF
- **Sampling Inteligente**: Analiza muestras representativas en páginas grandes
- **Procesamiento Asíncrono**: No bloquea la UI durante análisis pesados
- **Memoria Eficiente**: Gestión optimizada de recursos

### 📦 Instalación

#### Instalación Local (Modo Desarrollador)

1. **Clona el repositorio**:
   ```bash
   git clone https://github.com/olalmeida/css-lens.git
   cd css-lens
   ```

2. **Instala las dependencias** (opcional, solo para desarrollo):
   ```bash
   npm install
   ```

3. **Carga la extensión en Chrome**:
   - Abre Chrome y navega a `chrome://extensions/`
   - Activa el **"Modo de desarrollador"** (esquina superior derecha)
   - Haz clic en **"Cargar extensión sin empaquetar"**
   - Selecciona la carpeta del proyecto `css-lens`

4. **¡Listo!** El ícono de CSS Lens aparecerá en tu barra de herramientas

### 🎮 Uso

1. **Activa la extensión**: Haz clic en el ícono de CSS Lens o usa `Ctrl+Shift+L`
2. **Activa el Inspector**: Haz clic en el botón "🔍 Inspector" en el overlay
3. **Inspecciona elementos**: Pasa el cursor sobre cualquier elemento de la página
4. **Bloquea un elemento**: Haz clic en un elemento para mantenerlo seleccionado
5. **Edita en vivo**: Haz clic en cualquier valor CSS para editarlo
6. **Explora pestañas**: Cambia entre Inspector, Typography, Colors e Images
7. **Desbloquea**: Presiona `Escape` para deseleccionar el elemento

### 🏗️ Arquitectura Técnica

CSS Lens está construida siguiendo las mejores prácticas de Manifest V3:

```
css-lens/
├── manifest.json          # Configuración de la extensión
├── background.js          # Service Worker (gestión de estado)
├── content.js             # Script principal inyectado
├── popup.html/js/css      # Interfaz del popup
├── src/
│   ├── services/
│   │   ├── PremiumService.js    # Gestión de límites de edición
│   │   └── AdService.js         # Sistema de anuncios
│   └── utils/
│       ├── Sanitizer.js         # Sanitización de HTML/CSS
│       └── DOMUtils.js          # Utilidades de rendimiento
├── styles/
│   └── content.css        # Estilos del overlay
└── icons/                 # Iconos de la extensión
```

#### Componentes Principales

- **Service Worker (background.js)**: Gestiona el estado global y la comunicación
- **Content Script (content.js)**: Inyectado en cada página, maneja la inspección
- **Popup**: Interfaz de activación/desactivación
- **PremiumService**: Control de límites de edición (5 gratis, ilimitado Premium)
- **AdService**: Sistema de anuncios no intrusivos para versión gratuita
- **Sanitizer**: Prevención de XSS y sanitización de inputs
- **DOMUtils**: Optimizaciones de rendimiento (throttling, sampling, RAF)

### 🔒 Seguridad

- ✅ Sanitización completa de HTML y CSS para prevenir XSS
- ✅ Validación de URLs para prevenir ataques
- ✅ Permisos mínimos necesarios (`activeTab`, `storage`)
- ✅ Sin seguimiento de usuarios ni recopilación de datos
- ✅ Código abierto y auditable

### 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch

# Cobertura de código
npm run test:coverage
```

### 🛠️ Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar linter
npm run lint

# Corregir problemas de linting
npm run lint:fix

# Formatear código
npm run format

# Verificar formato
npm run format:check
```

### 💎 Versión Premium

La versión Premium ofrece:
- ✨ **Ediciones ilimitadas** de CSS
- 🚫 **Sin anuncios**
- 🎯 **Características avanzadas** (próximamente)
- 💬 **Soporte prioritario**

> **Nota**: Actualmente, Premium se puede activar desde el modal de actualización para propósitos de demostración.

### 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

### 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si deseas contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### 🐛 Reportar Bugs

Si encuentras un bug, por favor abre un [issue](https://github.com/olalmeida/css-lens/issues) con:
- Descripción detallada del problema
- Pasos para reproducirlo
- Comportamiento esperado vs actual
- Screenshots si es posible
- Versión del navegador

### 📧 Contacto

- **GitHub**: [@olalmeida](https://github.com/olalmeida)
- **Issues**: [GitHub Issues](https://github.com/olalmeida/css-lens/issues)

### 🙏 Agradecimientos

- Inspirado en las DevTools de Chrome
- Iconos y diseño UI/UX modernos
- Comunidad de desarrolladores web

---

## English

### 📖 Description

**CSS Lens** is a modern and powerful browser extension designed for web developers and designers who need to inspect and modify CSS styles in real-time. With an intuitive interface and advanced features, CSS Lens makes web development faster and more efficient.

### ✨ Key Features

#### 🔍 Advanced Inspection
- **Interactive Inspector Mode**: Toggle inspection mode with a single click
- **Real-Time Visualization**: Inspect any page element on hover
- **Visual Box Model**: Interactive visualization of margin, padding, border, and content
- **Automatic Detection**: Automatically identifies Flexbox and Grid containers
- **Element Locking**: Keep an element selected for detailed analysis

#### 🎨 Global Page Analysis
- **Typography Tab**: Analyze all fonts, sizes, and text weights used
- **Colors Tab**: Extract and visualize the complete color palette of the page
- **Images Tab**: List all images (including backgrounds) with download option
- **Real-Time Statistics**: Instant metrics about elements and styles

#### ✏️ Live Editing
- **Inline Editing**: Modify CSS properties directly from the overlay
- **Content Editing**: Change element text in real-time
- **Visual Feedback**: Visual confirmation of applied changes
- **Free Limit**: 5 edits per session (unlimited in Premium)

#### 🎯 Productivity
- **Copy CSS**: Export CSS properties of any element
- **Draggable Overlay**: Position the panel where you need it
- **Tab Navigation**: Quick access to different views
- **State Persistence**: Overlay remains open when navigating between pages
- **SPA Support**: Works perfectly with React, Vue, Angular applications

#### 🚀 Performance
- **Ultra Fast**: Optimized rendering with throttling and RAF
- **Smart Sampling**: Analyzes representative samples on large pages
- **Asynchronous Processing**: Doesn't block UI during heavy analysis
- **Memory Efficient**: Optimized resource management

### 📦 Installation

#### Local Installation (Developer Mode)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/olalmeida/css-lens.git
   cd css-lens
   ```

2. **Install dependencies** (optional, for development only):
   ```bash
   npm install
   ```

3. **Load the extension in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **"Developer mode"** (top right corner)
   - Click **"Load unpacked"**
   - Select the `css-lens` project folder

4. **Done!** The CSS Lens icon will appear in your toolbar

### 🎮 Usage

1. **Activate the extension**: Click the CSS Lens icon or use `Ctrl+Shift+L`
2. **Enable Inspector**: Click the "🔍 Inspector" button in the overlay
3. **Inspect elements**: Hover over any page element
4. **Lock an element**: Click on an element to keep it selected
5. **Live edit**: Click on any CSS value to edit it
6. **Explore tabs**: Switch between Inspector, Typography, Colors, and Images
7. **Unlock**: Press `Escape` to deselect the element

### 🏗️ Technical Architecture

CSS Lens is built following Manifest V3 best practices:

```
css-lens/
├── manifest.json          # Extension configuration
├── background.js          # Service Worker (state management)
├── content.js             # Main injected script
├── popup.html/js/css      # Popup interface
├── src/
│   ├── services/
│   │   ├── PremiumService.js    # Edit limits management
│   │   └── AdService.js         # Ad system
│   └── utils/
│       ├── Sanitizer.js         # HTML/CSS sanitization
│       └── DOMUtils.js          # Performance utilities
├── styles/
│   └── content.css        # Overlay styles
└── icons/                 # Extension icons
```

#### Main Components

- **Service Worker (background.js)**: Manages global state and communication
- **Content Script (content.js)**: Injected into each page, handles inspection
- **Popup**: Activation/deactivation interface
- **PremiumService**: Edit limits control (5 free, unlimited Premium)
- **AdService**: Non-intrusive ad system for free version
- **Sanitizer**: XSS prevention and input sanitization
- **DOMUtils**: Performance optimizations (throttling, sampling, RAF)

### 🔒 Security

- ✅ Complete HTML and CSS sanitization to prevent XSS
- ✅ URL validation to prevent attacks
- ✅ Minimum necessary permissions (`activeTab`, `storage`)
- ✅ No user tracking or data collection
- ✅ Open source and auditable code

### 🧪 Testing

```bash
# Run tests
npm test

# Tests in watch mode
npm run test:watch

# Code coverage
npm run test:coverage
```

### 🛠️ Development

```bash
# Install dependencies
npm install

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check format
npm run format:check
```

### 💎 Premium Version

The Premium version offers:
- ✨ **Unlimited CSS edits**
- 🚫 **No ads**
- 🎯 **Advanced features** (coming soon)
- 💬 **Priority support**

> **Note**: Currently, Premium can be activated from the upgrade modal for demonstration purposes.

### 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

### 🤝 Contributing

Contributions are welcome! If you want to contribute:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 🐛 Bug Reports

If you find a bug, please open an [issue](https://github.com/olalmeida/css-lens/issues) with:
- Detailed description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if possible
- Browser version

### 📧 Contact

- **GitHub**: [@olalmeida](https://github.com/olalmeida)
- **Issues**: [GitHub Issues](https://github.com/olalmeida/css-lens/issues)

### 🙏 Acknowledgments

- Inspired by Chrome DevTools
- Modern UI/UX icons and design
- Web developer community

---

<div align="center">

**Made with ❤️ for the web development community**

⭐ Star this repo if you find it useful!

</div>
