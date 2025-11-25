// CSS Lens - Content Script
class CSSLens {
  constructor() {
    this.isActive = false;
    this.inspectorMode = false; // Inspector mode OFF by default
    this.currentElement = null;
    this.overlay = null;
    this.isOverlayHovered = false;
    this.isLocked = false;
    this.lockedElement = null;
    this.highlightedElement = null;
    this.currentTab = "inspector";
    this.originalStyles = new Map();
    this.isDragging = false;
    this.offsetX = 0;
    this.offsetY = 0;

    // Premium and Ad services
    this.premiumService = new PremiumService();
    this.adService = new AdService();

    this.propertyCategories = {
      Layout: [
        "display",
        "position",
        "top",
        "right",
        "bottom",
        "left",
        "float",
        "clear",
        "z-index",
        "flex",
        "flex-basis",
        "flex-direction",
        "flex-flow",
        "flex-grow",
        "flex-shrink",
        "flex-wrap",
        "grid",
        "grid-area",
        "grid-auto-columns",
        "grid-auto-flow",
        "grid-auto-rows",
        "grid-column",
        "grid-column-end",
        "grid-column-gap",
        "grid-column-start",
        "grid-gap",
        "grid-row",
        "grid-row-end",
        "grid-row-gap",
        "grid-row-start",
        "grid-template",
        "grid-template-areas",
        "grid-template-columns",
        "grid-template-rows",
        "align-content",
        "align-items",
        "align-self",
        "justify-content",
        "justify-items",
        "justify-self",
        "order",
      ],
      "Box Model": [
        "width",
        "height",
        "margin",
        "margin-top",
        "margin-right",
        "margin-bottom",
        "margin-left",
        "padding",
        "padding-top",
        "padding-right",
        "padding-bottom",
        "padding-left",
        "border",
        "border-radius",
        "box-sizing",
        "overflow",
        "visibility",
      ],
      "Transitions & Animations": [
        "transition",
        "transition-delay",
        "transition-duration",
        "transition-property",
        "transition-timing-function",
        "animation",
        "animation-name",
        "animation-duration",
        "animation-timing-function",
        "animation-delay",
        "animation-iteration-count",
        "animation-direction",
        "animation-fill-mode",
        "animation-play-state",
      ],
      Other: [],
    };

    // Bind all handlers for cleanup
    this.boundHandleMouseOver = this.handleMouseOver.bind(this);
    this.boundHandleMouseOut = this.handleMouseOut.bind(this);
    this.boundHandleClick = this.handleClick.bind(this);
    this.boundHandleEscapeKey = this.handleEscapeKey.bind(this);
    this.boundHandleMouseDown = this.handleMouseDown.bind(this);
    this.boundHandleDrag = DOMUtils.throttleRAF(this.handleDrag.bind(this));
    this.boundHandleMouseUp = this.handleMouseUp.bind(this);

    this.init();
  }

  async init() {
    await this.premiumService.init();
    this.injectStyles();
    this.createOverlay();
    this.attachEventListeners();
    this.listenForMessages();
    this.restoreState();
  }

  restoreState() {
    chrome.storage.local.get("isActive", (data) => {
      if (data.isActive) {
        this.isActive = true;
        this.showInitialOverlayMessage();
        this.setupPersistence();
      }
    });
  }

  setupPersistence() {
    if (this.observer) return;

    this.observer = new MutationObserver((mutations) => {
      if (this.isActive && !document.getElementById("css-lens-overlay")) {
        document.body.appendChild(this.overlay);
      }
    });

    this.observer.observe(document.body, { childList: true });
  }

  injectStyles() {
    // Prevent duplicate injection
    if (document.getElementById("css-lens-styles")) return;

    const style = document.createElement("style");
    style.id = "css-lens-styles";
    style.textContent = `
            #css-lens-overlay * {
                box-sizing: border-box;
            }

            #css-lens-overlay.flex-container .css-lens-header::after {
                content: " (Flexbox Container)";
                font-size: 12px;
                color: #94a3b8;
            }

            #css-lens-overlay.grid-container .css-lens-header::after {
                content: " (Grid Container)";
                font-size: 12px;
                color: #94a3b8;
            }

            #css-lens-overlay {
                position: fixed;
                background: #1e293b;
                border: 2px solid #2563eb;
                border-radius: 8px;
                padding: 0;
                color: white;
                font-family: 'Consolas', monospace;
                font-size: 14px;
                z-index: 1000000;
                max-width: 400px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                display: none;
                flex-direction: column;
                width: 350px;
                height: 500px;
                top: 10px;
                right: 10px;
            }

            /* Estilos para el Box Model */
            .css-box-model {
                margin-top: 10px;
                border: 1px solid #4a5568;
                padding: 5px;
                background-color: #2d3748;
                text-align: center;
                overflow: hidden;
            }
            .box-margin, .box-border, .box-padding, .box-content {
                border: 1px dashed rgba(255,255,255,0.3);
                margin: 2px;
                position: relative;
                max-width: 100%;
            }
            .box-margin { border-color: #f6ad55; }
            .box-border { border-color: #4299e1; }
            .box-padding { border-color: #48bb78; }
            .box-content { 
                background-color: #38b2ac; 
                min-height: 20px; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                color: white;
                font-size: 12px;
            }
            .box-labels {
                font-size: 10px;
                margin-top: 5px;
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            .label-margin { color: #f6ad55; }
            .label-border { color: #4299e1; }
            .label-padding { color: #48bb78; }

            /* Bottom Bar Styles */
            #css-lens-bottom-bar {
                display: flex;
                background-color: #2d3748;
                border-top: 1px solid #4a5568;
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 40px;
            }
            
            .css-lens-tab-button {
                flex: 1;
                background: none;
                border: none;
                color: #cbd5e0;
                padding: 8px 4px;
                cursor: pointer;
                font-size: 11px;
                transition: all 0.2s;
                border-right: 1px solid #4a5568;
            }
            
            .css-lens-tab-button:last-child {
                border-right: none;
            }
            
            .css-lens-tab-button:hover {
                background-color: #4a5568;
            }
            
            .css-lens-tab-button.active {
                background-color: #4299e1;
                color: white;
            }
            
            /* Tab Content Area */
            #css-lens-tab-content {
                height: calc(100% - 80px);
                overflow-y: auto;
                padding: 10px;
            }
            
            /* Typography Tab Styles */
            .typography-section {
                margin-bottom: 15px;
                padding: 10px;
                background-color: #2d3748;
                border-radius: 4px;
            }
            
            .typography-item {
                display: flex;
                justify-content: space-between;
                margin: 5px 0;
                font-size: 12px;
            }
            
            .typography-label {
                color: #a0aec0;
            }
            
            .typography-value {
                color: #e2e8f0;
                font-weight: bold;
            }
            
            .font-preview {
                margin-top: 10px;
                padding: 10px;
                border: 1px solid #4a5568;
                border-radius: 4px;
                background-color: #1a202c;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .font-family-item {
                margin: 8px 0;
                padding: 8px;
                background-color: #2d3748;
                border-radius: 4px;
                border-left: 3px solid #4299e1;
            }
            
            /* Colors Tab Styles */
            .color-palette {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                gap: 10px;
                margin-top: 10px;
            }
            
            .color-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 8px;
                background-color: #2d3748;
                border-radius: 4px;
                cursor: pointer;
                transition: transform 0.2s;
            }
            
            .color-item:hover {
                transform: scale(1.05);
            }
            
            .color-swatch {
                width: 40px;
                height: 40px;
                border-radius: 4px;
                margin-bottom: 5px;
                border: 1px solid #4a5568;
            }
            
            .color-value {
                font-size: 10px;
                color: #cbd5e0;
                text-align: center;
                word-break: break-all;
            }
            
            /* Images Tab Styles */
            .images-section {
                margin-bottom: 15px;
            }
            
            .image-item {
                display: flex;
                align-items: center;
                padding: 10px;
                background-color: #2d3748;
                border-radius: 4px;
                margin-bottom: 8px;
            }
            
            .image-preview {
                width: 50px;
                height: 50px;
                object-fit: cover;
                border-radius: 4px;
                margin-right: 10px;
                border: 1px solid #4a5568;
            }
            
            .image-info {
                flex: 1;
            }
            
            .image-url {
                font-size: 11px;
                color: #a0aec0;
                word-break: break-all;
                margin-bottom: 4px;
            }
            
            .image-dimensions {
                font-size: 10px;
                color: #718096;
            }
            
            .download-btn {
                background-color: #4299e1;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
                transition: background-color 0.2s;
            }
            
            .download-btn:hover {
                background-color: #3182ce;
            }
            
            .css-lens-actions {
                display: flex;
                justify-content: space-around;
                margin-top: 15px;
                padding-top: 10px;
                border-top: 1px solid #4a5568;
            }
            
            .css-lens-button {
                background-color: #4a5568;
                color: #cbd5e0;
                border: none;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                transition: background-color 0.2s;
            }
            
            .css-lens-button:hover {
                background-color: #2d3748;
            }

            /* Estilos para las categorías de propiedades */
            .css-properties-container {
                margin-top: 15px;
            }
            .css-category {
                border-bottom: 1px solid #4a5568;
            }
            .css-category:last-child {
                border-bottom: none;
            }
            .css-category-title {
                cursor: pointer;
                padding: 8px 0;
                font-weight: bold;
                color: #94a3b8;
                list-style: none;
                user-select: none;
            }
            .css-category-title::-webkit-details-marker {
                display: none;
            }
            .css-category-title::before {
                content: '▶';
                margin-right: 8px;
                font-size: 10px;
                display: inline-block;
                transition: transform 0.2s;
            }
            .css-category[open] > .css-category-title::before {
                transform: rotate(90deg);
            }
            .css-properties-list {
                max-height: 150px;
                overflow-y: auto;
                padding-left: 15px;
                margin-bottom: 10px;
            }
            .css-property {
                display: flex;
                justify-content: space-between;
                margin-bottom: 4px;
                font-size: 12px;
            }
            .prop {
                color: #a0aec0;
                font-weight: bold;
            }
            .value {
                color: #e2e8f0;
                max-width: 60%;
                word-break: break-word;
                text-align: right;
            }

            .css-lens-locked-element {
                outline: 2px solid #FFD700 !important;
                outline-offset: -2px;
            }
            .css-lens-highlight {
                outline: 2px dashed rgba(255, 0, 0, 0.7) !important;
                outline-offset: -2px;
                background-color: rgba(255, 0, 0, 0.1) !important;
                cursor: pointer;
            }
            #css-lens-overlay.locked .css-lens-header {
                border-left: 4px solid #FFD700;
                background-color: #2d3748; /* Keep dark background */
                color: #fff; /* Keep white text */
            }

            /* Header Styles */
            .css-lens-header {
                background-color: #2d3748;
                padding: 12px 15px;
                font-weight: bold;
                border-bottom: 1px solid #4a5568;
                border-radius: 8px 8px 0 0;
                cursor: move;
                user-select: none;
            }

            /* Scrollbar Styles */
            #css-lens-tab-content::-webkit-scrollbar {
                width: 6px;
            }
            #css-lens-tab-content::-webkit-scrollbar-track {
                background: #2d3748;
                border-radius: 3px;
            }
            #css-lens-tab-content::-webkit-scrollbar-thumb {
                background: #4a5568;
                border-radius: 3px;
            }
            #css-lens-tab-content::-webkit-scrollbar-thumb:hover {
                background: #718096;
            }

            .stats-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
                margin: 10px 0;
            }
            
            .stat-item {
                background-color: #2d3748;
                padding: 8px;
                border-radius: 4px;
                text-align: center;
            }
            
            .stat-value {
                font-size: 18px;
                font-weight: bold;
                color: #4299e1;
            }
            
            .stat-label {
                font-size: 10px;
                color: #a0aec0;
            }
        `;
    document.head.appendChild(style);
  }

  listenForMessages() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "toggle") {
        this.isActive = request.isActive;
        if (this.isActive) {
          this.originalStyles.clear();
          
          if (!document.getElementById("css-lens-overlay")) {
            this.createOverlay();
            this.attachEventListeners();
          }
          
          this.showInitialOverlayMessage();
          this.setupPersistence();
        } else {
          this.unlockElement();
          this.hideOverlay();
          this.cleanup();
        }
      }
    });
  }

  createOverlay() {
    this.overlay = document.createElement("div");
    this.overlay.id = "css-lens-overlay";
    this.overlay.innerHTML = `
            <div class="css-lens-header" style="display: flex; justify-content: space-between; align-items: center;">
                <span>CSS Lens</span>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <span id="css-lens-edit-counter" style="font-size: 11px; color: #94a3b8;"></span>
                    <button id="css-lens-inspector-toggle" style="
                        background: #4299e1;
                        color: white;
                        border: none;
                        padding: 6px 12px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 11px;
                        transition: background 0.2s;
                        white-space: nowrap;
                    " title="Activar/Desactivar modo inspector">
                        🔍 Inspector OFF
                    </button>
                </div>
            </div>
            <div id="css-lens-tab-content">
                <div style="padding: 20px; text-align: center; color: #a0aec0;">
                    <p>Haz click en el botón "🔍 Inspector" para activar el modo de inspección.</p>
                    <p style="font-size: 12px; margin-top: 10px;">O usa las pestañas para ver información global de la página.</p>
                </div>
            </div>
            <div id="css-lens-bottom-bar">
                <button class="css-lens-tab-button active" data-tab="inspector">Inspector</button>
                <button class="css-lens-tab-button" data-tab="typography">Typography</button>
                <button class="css-lens-tab-button" data-tab="colors">Colors</button>
                <button class="css-lens-tab-button" data-tab="images">Images</button>
            </div>
        `;

    document.body.appendChild(this.overlay);
    this.updateEditCounter();
    this.attachInspectorToggleListener();
  }

  attachEventListeners() {
    // Use bound handlers for proper cleanup
    document.addEventListener("mouseover", this.boundHandleMouseOver, true);
    document.addEventListener("mouseout", this.boundHandleMouseOut, true);
    document.addEventListener("click", this.boundHandleClick, true);
    document.addEventListener("keydown", this.boundHandleEscapeKey);
    this.overlay.addEventListener("mousedown", this.boundHandleMouseDown);

    const tabButtons = this.overlay.querySelectorAll(".css-lens-tab-button");
    tabButtons.forEach((button) => {
      button.addEventListener("click", this.handleTabClick.bind(this));
    });
  }

  cleanup() {
    // Remove all event listeners
    document.removeEventListener("mouseover", this.boundHandleMouseOver, true);
    document.removeEventListener("mouseout", this.boundHandleMouseOut, true);
    document.removeEventListener("click", this.boundHandleClick, true);
    document.removeEventListener("keydown", this.boundHandleEscapeKey);

    if (this.overlay) {
      this.overlay.removeEventListener("mousedown", this.boundHandleMouseDown);
      this.overlay.remove();
    }

    // Remove injected styles
    const styles = document.getElementById("css-lens-styles");
    if (styles) styles.remove();

    // Clear highlights
    if (this.highlightedElement) {
      this.highlightedElement.classList.remove("css-lens-highlight");
      this.highlightedElement = null;
    }
    if (this.lockedElement) {
      this.lockedElement.classList.remove("css-lens-locked-element");
      this.lockedElement = null;
    }

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  attachInspectorToggleListener() {
    const toggleBtn = document.getElementById("css-lens-inspector-toggle");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        this.inspectorMode = !this.inspectorMode;
        
        if (this.inspectorMode) {
          toggleBtn.textContent = "🔍 Inspector ON";
          toggleBtn.style.background = "#48bb78";
          this.updateTabContent(`
            <div style="padding: 20px; text-align: center; color: #a0aec0;">
              <p style="color: #48bb78; font-weight: bold;">✓ Modo Inspector Activado</p>
              <p style="margin-top: 10px;">Pasa el mouse sobre los elementos de la página para inspeccionarlos.</p>
              <p style="font-size: 12px; margin-top: 10px;">Haz click en un elemento para bloquearlo.</p>
            </div>
          `);
        } else {
          toggleBtn.textContent = "🔍 Inspector OFF";
          toggleBtn.style.background = "#4299e1";
          
          // Clear any locked element
          if (this.isLocked) {
            this.unlockElement();
          }
          
          // Clear any highlights
          if (this.highlightedElement) {
            this.highlightedElement.classList.remove("css-lens-highlight");
            this.highlightedElement = null;
          }
          
          this.updateTabContent(`
            <div style="padding: 20px; text-align: center; color: #a0aec0;">
              <p>Modo Inspector Desactivado</p>
              <p style="font-size: 12px; margin-top: 10px;">Haz click en "🔍 Inspector" para activarlo nuevamente.</p>
            </div>
          `);
        }
      });
    }
  }

  handleMouseOver(e) {
    if (!this.isActive || !this.inspectorMode || this.overlay.contains(e.target) || this.isLocked) {
      return;
    }

    if (this.highlightedElement === e.target) {
      return;
    }

    if (this.highlightedElement) {
      this.highlightedElement.classList.remove("css-lens-highlight");
    }
    this.highlightedElement = e.target;
    this.highlightedElement.classList.add("css-lens-highlight");
  }

  handleMouseOut(e) {
    if (!this.isActive || this.isLocked) {
      return;
    }

    if (e.relatedTarget && this.overlay.contains(e.relatedTarget)) {
      return;
    }

    if (this.highlightedElement) {
      this.highlightedElement.classList.remove("css-lens-highlight");
      this.highlightedElement = null;
    }
  }

  handleClick(e) {
    if (!this.isActive || !this.inspectorMode || this.overlay.contains(e.target)) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const target = e.target;

    // Case 1: Clicking the already selected element -> Deselect.
    if (this.isLocked && this.lockedElement === target) {
      this.unlockElement();
      return;
    }

    // Case 2: Selecting a new element (or the first element).
    if (this.lockedElement) {
      this.lockedElement.classList.remove("css-lens-locked-element");
    }

    this.isLocked = true;
    this.lockedElement = target;
    this.currentElement = target;

    if (this.highlightedElement) {
      this.highlightedElement.classList.remove("css-lens-highlight");
      this.highlightedElement = null;
    }

    this.lockedElement.classList.add("css-lens-locked-element");
    this.overlay.classList.add("locked");

    this.storeOriginalStyles(this.lockedElement);
    this.renderTabContent(this.currentTab);
    
    // Update only the title text, not the entire header
    const headerTitle = this.overlay.querySelector(".css-lens-header span:first-child");
    if (headerTitle) {
      headerTitle.textContent = "CSS Lens (Elemento Seleccionado)";
    }

    // Asegurar que el overlay esté visible
    this.overlay.style.display = "flex";
  }

  handleEscapeKey(e) {
    if (e.key === "Escape" && this.isLocked) {
      e.preventDefault();
      this.unlockElement();
    }
  }

  handleTabClick(e) {
    const clickedButton = e.target;
    const tabName = clickedButton.dataset.tab;

    const tabButtons = this.overlay.querySelectorAll(".css-lens-tab-button");
    tabButtons.forEach((button) => button.classList.remove("active"));

    clickedButton.classList.add("active");

    this.currentTab = tabName;
    this.renderTabContent(tabName);
  }

  renderTabContent(tabName) {
    switch (tabName) {
      case "inspector":
        if (!this.currentElement) {
          this.showInitialTabMessage(tabName);
        } else {
          this.renderInspectorTab();
        }
        break;
      case "typography":
        this.renderGlobalTypographyTab();
        break;
      case "colors":
        this.renderGlobalColorsTab();
        break;
      case "images":
        this.renderGlobalImagesTab();
        break;
    }
  }

  renderInspectorTab() {
    const computedStyle = window.getComputedStyle(this.currentElement);
    const properties = this.getKeyProperties(
      computedStyle,
      this.currentElement
    );
    const categorizedProperties = this.categorizeProperties(properties);

    // Detect layout type for overlay classes
    const layoutType = computedStyle.getPropertyValue("display");
    if (layoutType.includes("flex")) {
      this.overlay.classList.add("flex-container");
      this.overlay.classList.remove("grid-container");
    } else if (layoutType.includes("grid")) {
      this.overlay.classList.add("grid-container");
      this.overlay.classList.remove("flex-container");
    } else {
      this.overlay.classList.remove("flex-container", "grid-container");
    }

    let html = "";

    // Box Model Visualization
    const boxModel = this.getBoxModel(this.currentElement);
    if (boxModel) {
      const maxVisualSize = 20;
      const visualMarginTop = Math.min(boxModel.margin.top, maxVisualSize);
      const visualMarginRight = Math.min(boxModel.margin.right, maxVisualSize);
      const visualMarginBottom = Math.min(
        boxModel.margin.bottom,
        maxVisualSize
      );
      const visualMarginLeft = Math.min(boxModel.margin.left, maxVisualSize);
      const visualBorderTop = Math.min(boxModel.border.top, maxVisualSize);
      const visualBorderRight = Math.min(boxModel.border.right, maxVisualSize);
      const visualBorderBottom = Math.min(
        boxModel.border.bottom,
        maxVisualSize
      );
      const visualBorderLeft = Math.min(boxModel.border.left, maxVisualSize);
      const visualPaddingTop = Math.min(boxModel.padding.top, maxVisualSize);
      const visualPaddingRight = Math.min(
        boxModel.padding.right,
        maxVisualSize
      );
      const visualPaddingBottom = Math.min(
        boxModel.padding.bottom,
        maxVisualSize
      );
      const visualPaddingLeft = Math.min(boxModel.padding.left, maxVisualSize);

      html += `
                <div class="css-box-model">
                    <div class="box-margin" style="padding: ${visualMarginTop}px ${visualMarginRight}px ${visualMarginBottom}px ${visualMarginLeft}px;">
                        <div class="box-border" style="padding: ${visualBorderTop}px ${visualBorderRight}px ${visualBorderBottom}px ${visualBorderLeft}px;">
                            <div class="box-padding" style="padding: ${visualPaddingTop}px ${visualPaddingRight}px ${visualPaddingBottom}px ${visualPaddingLeft}px;">
                                <div class="box-content">
                                    Content: ${Math.round(
                                      boxModel.content.width
                                    )}px × ${Math.round(
        boxModel.content.height
      )}px
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="box-labels">
                        <span class="label-margin">Margin: ${
                          boxModel.margin.top
                        }px ${boxModel.margin.right}px ${
        boxModel.margin.bottom
      }px ${boxModel.margin.left}px</span>
                        <span class="label-border">Border: ${
                          boxModel.border.top
                        }px ${boxModel.border.right}px ${
        boxModel.border.bottom
      }px ${boxModel.border.left}px</span>
                        <span class="label-padding">Padding: ${
                          boxModel.padding.top
                        }px ${boxModel.padding.right}px ${
        boxModel.padding.bottom
      }px ${boxModel.padding.left}px</span>
                    </div>
                </div>
            `;
    }

    // CSS Properties by Category
    html += '<div class="css-properties-container">';
    
    // Add Content Section first if element has text
    if (this.currentElement.innerText && this.currentElement.children.length === 0) {
        html += `<details class="css-category" open>`;
        html += `<summary class="css-category-title">Content</summary>`;
        html += '<div class="css-properties-list">';
        html += `
            <div class="css-property">
                <span class="prop">Text:</span>
                <span class="value editable-content" contenteditable="true" style="border-bottom: 1px dashed #a0aec0; cursor: text;">${Sanitizer.sanitizeHTML(this.currentElement.innerText)}</span>
            </div>
        `;
        html += "</div>";
        html += `</details>`;
    }

    for (const category in categorizedProperties) {
      const properties = categorizedProperties[category];
      if (Object.keys(properties).length > 0) {
        html += `<details class="css-category" open>`;
        html += `<summary class="css-category-title">${category}</summary>`;
        html += '<div class="css-properties-list">';
        for (const [prop, value] of Object.entries(properties)) {
          if (value && value !== "none" && value !== "normal") {
            html += `
                            <div class="css-property">
                                <span class="prop">${prop}:</span>
                                <span class="value editable-value" contenteditable="true" data-prop="${prop}" style="border-bottom: 1px dashed #a0aec0; cursor: text;">${value}</span>
                            </div>
                        `;
          }
        }
        html += "</div>";
        html += `</details>`;
      }
    }
    html += "</div>";

    // Actions
    html += `
            <div class="css-lens-actions">
                <button id="copy-css-btn" class="css-lens-button">Copiar CSS</button>
            </div>
        `;

    this.updateTabContent(html);
    this.attachInspectorEventListeners();
    this.attachEditableListeners();
  }

  attachEditableListeners() {
    // CSS Values
    const editableValues = this.overlay.querySelectorAll(".editable-value");
    editableValues.forEach((el) => {
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          el.blur();
        }
      });

      el.addEventListener("blur", () => {
        const prop = el.dataset.prop;
        const value = el.textContent;
        this.handleCSSEdit(prop, value);
      });
    });

    // Content
    const editableContent = this.overlay.querySelector(".editable-content");
    if (editableContent) {
      editableContent.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          editableContent.blur();
        }
      });

      editableContent.addEventListener("blur", () => {
        const content = editableContent.textContent;
        this.handleContentEdit(content);
      });
    }
  }

  handleCSSEdit(property, value) {
    if (!this.currentElement) return;

    // Check premium status
    if (!this.premiumService.canEdit()) {
      this.showUpgradeModal();
      // Revert change in UI (optional, but good UX)
      this.renderInspectorTab(); 
      return;
    }

    try {
      // Apply style
      this.currentElement.style[property] = value;
      
      // Increment counter
      this.premiumService.incrementEditCount();
      this.updateEditCounter();
      
      // Show success feedback
      const el = this.overlay.querySelector(`.editable-value[data-prop="${property}"]`);
      if (el) {
        const originalColor = el.style.color;
        el.style.color = "#48bb78"; // Green
        setTimeout(() => {
          el.style.color = originalColor;
        }, 1000);
      }
    } catch (e) {
      console.error("Error applying style:", e);
    }
  }

  handleContentEdit(content) {
    if (!this.currentElement) return;

    // Check premium status
    if (!this.premiumService.canEdit()) {
      this.showUpgradeModal();
      this.renderInspectorTab();
      return;
    }

    try {
      // Apply content
      this.currentElement.innerText = content;
      
      // Increment counter
      this.premiumService.incrementEditCount();
      this.updateEditCounter();
      
      // Show success feedback
      const el = this.overlay.querySelector(".editable-content");
      if (el) {
        const originalColor = el.style.color;
        el.style.color = "#48bb78"; // Green
        setTimeout(() => {
          el.style.color = originalColor;
        }, 1000);
      }
    } catch (e) {
      console.error("Error applying content:", e);
    }
  }

  renderGlobalTypographyTab() {
    const SAMPLE_SIZE = 500;
    const allElements = document.querySelectorAll("*");
    const sampledElements = DOMUtils.sampleElements(allElements, SAMPLE_SIZE);

    // Show loading state
    this.updateTabContent(`
      <div style="padding: 20px; text-align: center; color: #a0aec0;">
        <p>Analyzing typography...</p>
        <p style="font-size: 12px;">(Sampling ${sampledElements.length} of ${allElements.length} elements)</p>
      </div>
    `);

    // Process in idle time to avoid blocking
    DOMUtils.processInIdle(() => {
      const fontFamilies = new Set();
      const fontSizes = new Set();
      const fontWeights = new Set();

      sampledElements.forEach((element) => {
        const style = window.getComputedStyle(element);
        if (style.fontFamily && style.fontFamily !== "initial") {
          fontFamilies.add(style.fontFamily);
        }
        if (style.fontSize && style.fontSize !== "initial") {
          fontSizes.add(style.fontSize);
        }
        if (style.fontWeight && style.fontWeight !== "initial") {
          fontWeights.add(style.fontWeight);
        }
      });

      let html = '<div class="stats-grid">';
      html += `
            <div class="stat-item">
                <div class="stat-value">${fontFamilies.size}</div>
                <div class="stat-label">Font Families</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${fontSizes.size}</div>
                <div class="stat-label">Font Sizes</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${fontWeights.size}</div>
                <div class="stat-label">Font Weights</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${allElements.length}</div>
                <div class="stat-label">Total Elements</div>
            </div>
        `;
      html += "</div>";

      html += '<div class="typography-section">';
      html +=
        '<h4 style="margin: 0 0 10px 0; color: #e2e8f0;">Font Families Found</h4>';

      if (fontFamilies.size > 0) {
        Array.from(fontFamilies)
          .slice(0, 10)
          .forEach((fontFamily) => {
            html += `
                    <div class="font-family-item">
                        <div style="font-family: ${Sanitizer.sanitizeCSS(fontFamily)}; font-size: 14px; margin-bottom: 4px;">
                            ${Sanitizer.sanitizeHTML(fontFamily)}
                        </div>
                        <div style="font-size: 10px; color: #a0aec0;">
                            Sample: The quick brown fox
                        </div>
                    </div>
                `;
          });
        if (fontFamilies.size > 10) {
          html += `<p style="color: #a0aec0; text-align: center; margin-top: 10px;">... and ${
            fontFamilies.size - 10
          } more font families</p>`;
        }
      } else {
        html +=
          '<p style="color: #a0aec0; text-align: center;">No font families found</p>';
      }

      html += "</div>";

      html += '<div class="typography-section">';
      html += '<h4 style="margin: 0 0 10px 0; color: #e2e8f0;">Font Sizes</h4>';
      if (fontSizes.size > 0) {
        Array.from(fontSizes)
          .slice(0, 8)
          .forEach((fontSize) => {
            html += `
                    <div class="typography-item">
                        <span class="typography-label">Size:</span>
                        <span class="typography-value">${Sanitizer.sanitizeHTML(fontSize)}</span>
                    </div>
                `;
          });
      } else {
        html +=
          '<p style="color: #a0aec0; text-align: center;">No font sizes found</p>';
      }
      html += "</div>";

      this.updateTabContent(html);
    });
  }

  renderGlobalColorsTab() {
    const SAMPLE_SIZE = 500;
    const allElements = document.querySelectorAll("*");
    const sampledElements = DOMUtils.sampleElements(allElements, SAMPLE_SIZE);

    // Show loading state
    this.updateTabContent(`
      <div style="padding: 20px; text-align: center; color: #a0aec0;">
        <p>Analyzing colors...</p>
        <p style="font-size: 12px;">(Sampling ${sampledElements.length} of ${allElements.length} elements)</p>
      </div>
    `);

    // Process in idle time
    DOMUtils.processInIdle(() => {
      const colors = new Set();

      sampledElements.forEach((element) => {
        const style = window.getComputedStyle(element);
        const colorProps = [
          style.color,
          style.backgroundColor,
          style.borderColor,
          style.borderTopColor,
          style.borderRightColor,
          style.borderBottomColor,
          style.borderLeftColor,
          style.outlineColor,
        ];

        colorProps.forEach((color) => {
          if (
            color &&
            color !== "rgba(0, 0, 0, 0)" &&
            color !== "transparent" &&
            color !== "initial" &&
            !color.includes("gradient")
          ) {
            colors.add(color);
          }
        });
      });

      let html = '<div class="stats-grid">';
      html += `
            <div class="stat-item">
                <div class="stat-value">${colors.size}</div>
                <div class="stat-label">Unique Colors</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${allElements.length}</div>
                <div class="stat-label">Total Elements</div>
            </div>
        `;
      html += "</div>";

      html += '<div class="typography-section">';
      html +=
        '<h4 style="margin: 0 0 10px 0; color: #e2e8f0;">Color Palette</h4>';

      if (colors.size > 0) {
        html += '<div class="color-palette">';
        Array.from(colors)
          .slice(0, 12)
          .forEach((color) => {
            const safeColor = Sanitizer.sanitizeCSS(color);
            html += `
                    <div class="color-item" title="Click to copy ${Sanitizer.sanitizeHTML(color)}">
                        <div class="color-swatch" style="background-color: ${safeColor};"></div>
                        <span class="color-value">${Sanitizer.sanitizeHTML(color)}</span>
                    </div>
                `;
          });
        html += "</div>";
        if (colors.size > 12) {
          html += `<p style="color: #a0aec0; text-align: center; margin-top: 10px;">... and ${
            colors.size - 12
          } more colors</p>`;
        }
      } else {
        html +=
          '<p style="color: #a0aec0; text-align: center;">No colors found</p>';
      }

      html += "</div>";
      this.updateTabContent(html);
      this.attachColorsEventListeners();
    });
  }

  renderGlobalImagesTab() {
    // Collect ALL images from the entire page
    const images = Array.from(document.querySelectorAll("img"));
    const backgroundImages = this.extractBackgroundImages();
    const allImages = [...images, ...backgroundImages];
    const totalImages = allImages.length;

    let html = '<div class="stats-grid">';
    html += `
            <div class="stat-item">
                <div class="stat-value">${totalImages}</div>
                <div class="stat-label">Total Images</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${images.length}</div>
                <div class="stat-label">IMG Tags</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${backgroundImages.length}</div>
                <div class="stat-label">Background Images</div>
            </div>
        `;
    html += "</div>";

    html += '<div class="images-section">';
    html += '<h4 style="margin: 0 0 10px 0; color: #e2e8f0;">All Page Images</h4>';

    if (totalImages > 0) {
      // Show ALL regular images (no limit)
      images.forEach((img, index) => {
        const imgName = img.src.split("/").pop() || `image_${index + 1}`;
        const safeUrl = Sanitizer.sanitizeHTML(img.src.substring(0, 50));
        html += `
                    <div class="image-item">
                        <img src="${Sanitizer.sanitizeURL(img.src)}" class="image-preview" alt="Preview ${index + 1}" onerror="this.style.display='none'">
                        <div class="image-info">
                            <div class="image-url">${safeUrl}${img.src.length > 50 ? "..." : ""}</div>
                            <div class="image-dimensions">${img.naturalWidth} × ${img.naturalHeight}px</div>
                        </div>
                        <button class="download-btn" data-src="${Sanitizer.sanitizeURL(img.src)}" data-filename="${Sanitizer.sanitizeHTML(imgName)}">Download</button>
                    </div>
                `;
      });

      // Show ALL background images (no limit)
      backgroundImages.forEach((bg, index) => {
        const bgName = `background_${index + 1}.png`;
        const safeUrl = Sanitizer.sanitizeHTML(bg.url.substring(0, 50));
        html += `
                    <div class="image-item">
                        <div style="width: 50px; height: 50px; background-image: url('${Sanitizer.sanitizeURL(bg.url)}'); background-size: cover; border-radius: 4px; margin-right: 10px; border: 1px solid #4a5568;"></div>
                        <div class="image-info">
                            <div class="image-url">Background: ${safeUrl}${bg.url.length > 50 ? "..." : ""}</div>
                            <div class="image-dimensions">From: ${Sanitizer.sanitizeHTML(bg.element)}</div>
                        </div>
                        <button class="download-btn" data-src="${Sanitizer.sanitizeURL(bg.url)}" data-filename="${Sanitizer.sanitizeHTML(bgName)}">Download</button>
                    </div>
                `;
      });
    } else {
      html += '<p style="color: #a0aec0; text-align: center;">No images found on this page</p>';
    }

    html += "</div>";
    this.updateTabContent(html);
    this.attachImagesEventListeners();
  }

  extractBackgroundImages() {
    const backgroundImages = [];
    const allElements = document.querySelectorAll("*");

    allElements.forEach((element) => {
      const style = window.getComputedStyle(element);
      const backgroundImage = style.backgroundImage;

      if (backgroundImage && backgroundImage !== "none") {
        const bgMatch = backgroundImage.match(/url\(["']?(.*?)["']?\)/);
        if (bgMatch && bgMatch[1]) {
          backgroundImages.push({
            url: bgMatch[1],
            element: element,
          });
        }
      }
    });

    return backgroundImages;
  }

  showInitialTabMessage(tabName) {
    const html = `
            <div style="padding: 20px; text-align: center; color: #a0aec0;">
                <p>Select an element on the page to view its properties.</p>
            </div>
        `;

    this.updateTabContent(html);
  }

  updateTabContent(html) {
    const tabContent = this.overlay.querySelector("#css-lens-tab-content");
    tabContent.innerHTML = html;
  }

  attachInspectorEventListeners() {
    const copyCssButton = this.overlay.querySelector("#copy-css-btn");
    if (copyCssButton) {
      copyCssButton.addEventListener("click", this.handleCopyCSS.bind(this));
    }
  }

  attachColorsEventListeners() {
    const colorItems = this.overlay.querySelectorAll(".color-item");
    colorItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        const colorValue =
          e.currentTarget.querySelector(".color-value").textContent;
        navigator.clipboard.writeText(colorValue).then(() => {
          const originalText =
            e.currentTarget.querySelector(".color-value").textContent;
          e.currentTarget.querySelector(".color-value").textContent = "Copied!";
          setTimeout(() => {
            e.currentTarget.querySelector(".color-value").textContent =
              originalText;
          }, 1000);
        });
      });
    });
  }

  attachImagesEventListeners() {
    const downloadButtons = this.overlay.querySelectorAll(".download-btn");
    downloadButtons.forEach((button) => {
      // Remove any existing listeners by cloning the button
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
      
      newButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const src = e.target.dataset.src;
        const filename = e.target.dataset.filename;
        this.downloadImage(src, filename);
      });
    });
  }

  downloadImage(src, filename) {
    let finalFilename = filename;
    if (!finalFilename.includes(".")) {
      finalFilename += ".png";
    }

    fetch(src)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = finalFilename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch((err) => {
        console.error("Error downloading image:", err);
        alert("Error downloading image. It may be due to CORS restrictions.");
      });
  }

  handleMouseDown(e) {
    if (e.target.classList.contains("css-lens-header")) {
      this.isDragging = true;
      this.offsetX = e.clientX - this.overlay.getBoundingClientRect().left;
      this.offsetY = e.clientY - this.overlay.getBoundingClientRect().top;

      document.addEventListener("mousemove", this.boundHandleDrag);
      document.addEventListener("mouseup", this.boundHandleMouseUp);
    }
  }

  handleDrag(e) {
    if (!this.isDragging || !this.isActive) return;
    this.overlay.style.left = `${e.clientX - this.offsetX}px`;
    this.overlay.style.top = `${e.clientY - this.offsetY}px`;
    this.overlay.style.right = "auto";
  }

  handleMouseUp() {
    if (!this.isDragging) return;
    this.isDragging = false;
    document.removeEventListener("mousemove", this.boundHandleDrag);
    document.removeEventListener("mouseup", this.boundHandleMouseUp);
  }

  unlockElement() {
    if (this.lockedElement) {
      this.lockedElement.classList.remove("css-lens-locked-element");
      this.lockedElement = null;
    }
    if (this.highlightedElement) {
      this.highlightedElement.classList.remove("css-lens-highlight");
      this.highlightedElement = null;
    }
    this.isLocked = false;
    this.currentElement = null;
    this.overlay.classList.remove("locked");

    // Mostrar mensaje inicial en lugar de ocultar el overlay
    this.showInitialOverlayMessage();

    if (this.isDragging) {
      this.isDragging = false;
      document.removeEventListener("mousemove", this.boundHandleDrag);
      document.removeEventListener("mouseup", this.boundHandleMouseUp);
    }
  }

  showInitialOverlayMessage() {
    this.overlay.style.display = "flex";
    this.showInitialTabMessage("inspector");
    const headerTitle = this.overlay.querySelector(".css-lens-header span:first-child");
    if (headerTitle) {
      headerTitle.textContent = "CSS Lens";
    }
    this.overlay.classList.remove("flex-container", "grid-container");
    
    // Show ad if needed after 3 seconds of inactivity
    setTimeout(() => {
      this.showAdIfNeeded();
    }, 3000);
  }

  updateEditCounter() {
    const counter = document.getElementById("css-lens-edit-counter");
    if (!counter) return;

    const isPremium = this.premiumService.getIsPremium();

    if (isPremium) {
      counter.textContent = "✨ Premium";
      counter.style.color = "#FFD700";
    } else {
      const remaining = this.premiumService.getRemainingEdits();
      counter.textContent = `${remaining}/5 edits`;
      counter.style.color = remaining > 0 ? "#94a3b8" : "#ef4444";
    }
  }

  showAdIfNeeded() {
    const isPremium = this.premiumService.getIsPremium();

    if (this.adService.shouldShowAd(isPremium)) {
      const ad = this.adService.getNextAd();
      if (ad) {
        this.renderAd(ad);
        this.adService.markAdShown();
      }
    }
  }

  renderAd(ad) {
    const tabContent = this.overlay.querySelector("#css-lens-tab-content");
    const existingAd = document.getElementById("css-lens-ad-banner");

    if (existingAd) {
      existingAd.remove();
    }

    const adHTML = this.adService.renderAdBanner(ad);
    tabContent.insertAdjacentHTML("beforeend", adHTML);

    // Attach event listeners
    const ctaButton = document.getElementById("css-lens-ad-cta");
    const closeButton = document.getElementById("css-lens-ad-close");

    if (ctaButton) {
      ctaButton.addEventListener("click", () => {
        if (ad.action === "upgrade") {
          this.showUpgradeModal();
        }
      });
    }

    if (closeButton) {
      closeButton.addEventListener("click", () => {
        const adBanner = document.getElementById("css-lens-ad-banner");
        if (adBanner) adBanner.remove();
      });
    }
  }

  showUpgradeModal() {
    // Remove existing modal if any
    const existingModal = document.getElementById("css-lens-upgrade-modal");
    if (existingModal) {
      existingModal.remove();
    }

    const modalHTML = this.adService.getUpgradeModal();
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Attach event listeners
    const upgradeBtn = document.getElementById("css-lens-upgrade-btn");
    const closeBtn = document.getElementById("css-lens-upgrade-close");
    const backdrop = document.getElementById("css-lens-upgrade-backdrop");

    const closeModal = () => {
      const modal = document.getElementById("css-lens-upgrade-modal");
      const backdrop = document.getElementById("css-lens-upgrade-backdrop");
      if (modal) modal.remove();
      if (backdrop) backdrop.remove();
    };

    if (upgradeBtn) {
      upgradeBtn.addEventListener("click", async () => {
        // Activate premium for demo purposes
        await this.premiumService.activatePremium();
        this.updateEditCounter();
        alert("¡Premium activado! Ahora tienes ediciones ilimitadas y sin anuncios.");
        closeModal();
        
        // Remove any existing ads
        const adBanner = document.getElementById("css-lens-ad-banner");
        if (adBanner) adBanner.remove();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", closeModal);
    }

    if (backdrop) {
      backdrop.addEventListener("click", closeModal);
    }
  }

  storeOriginalStyles(element) {
    if (!this.originalStyles.has(element)) {
      const computedStyle = window.getComputedStyle(element);
      const stylesToStore = {};
      const editableProperties = [
        "display",
        "position",
        "margin",
        "padding",
        "color",
        "background-color",
        "font-size",
        "font-weight",
        "border",
        "border-radius",
      ];
      editableProperties.forEach((prop) => {
        stylesToStore[prop] = computedStyle.getPropertyValue(prop);
      });
      this.originalStyles.set(element, stylesToStore);
    }
  }

  handleCopyCSS() {
    if (!this.currentElement) return;

    let cssToCopy = "";
    const computedStyle = window.getComputedStyle(this.currentElement);
    const properties = this.getKeyProperties(
      computedStyle,
      this.currentElement
    );

    for (const prop in properties) {
      if (properties[prop]) {
        cssToCopy += `  ${prop}: ${properties[prop]};\n`;
      }
    }

    navigator.clipboard
      .writeText(cssToCopy)
      .then(() => {
        const button = this.overlay.querySelector("#copy-css-btn");
        const originalText = button.textContent;
        button.textContent = "¡Copiado!";
        setTimeout(() => {
          button.textContent = originalText;
        }, 1000);
      })
      .catch((err) => {
        console.error("Error al copiar CSS: ", err);
      });
  }

  getKeyProperties(computedStyle, element) {
    const properties = {};
    for (let i = 0; i < computedStyle.length; i++) {
      const propName = computedStyle[i];
      const propValue = computedStyle.getPropertyValue(propName);
      if (
        propValue &&
        propValue !== "initial" &&
        propValue !== "unset" &&
        propValue !== "inherit"
      ) {
        properties[propName] = propValue;
      }
    }
    return properties;
  }

  categorizeProperties(properties) {
    const categorized = {};
    for (const category in this.propertyCategories) {
      categorized[category] = {};
    }
    for (const prop in properties) {
      let foundCategory = false;
      for (const category in this.propertyCategories) {
        if (this.propertyCategories[category].includes(prop)) {
          categorized[category][prop] = properties[prop];
          foundCategory = true;
          break;
        }
      }
      if (!foundCategory) {
        categorized["Other"][prop] = properties[prop];
      }
    }
    return categorized;
  }

  getBoxModel(element) {
    if (!element) return null;

    const computedStyle = window.getComputedStyle(element);
    const getNumericValue = (prop) =>
      parseFloat(computedStyle.getPropertyValue(prop)) || 0;

    const margin = {
      top: getNumericValue("margin-top"),
      right: getNumericValue("margin-right"),
      bottom: getNumericValue("margin-bottom"),
      left: getNumericValue("margin-left"),
    };
    const border = {
      top: getNumericValue("border-top-width"),
      right: getNumericValue("border-right-width"),
      bottom: getNumericValue("border-bottom-width"),
      left: getNumericValue("border-left-width"),
    };
    const padding = {
      top: getNumericValue("padding-top"),
      right: getNumericValue("padding-right"),
      bottom: getNumericValue("padding-bottom"),
      left: getNumericValue("padding-left"),
    };

    const rect = element.getBoundingClientRect();
    const content = {
      width:
        rect.width - padding.left - padding.right - border.left - border.right,
      height:
        rect.height - padding.top - padding.bottom - border.top - border.bottom,
    };

    return { margin, border, padding, content };
  }

  hideOverlay() {
    this.overlay.style.display = "none";
  }
}

// Initialize CSSLens
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new CSSLens();
  });
} else {
  new CSSLens();
}
