// Módulo para cálculos de volumen de moldes
class VolumeCalculator {
    constructor() {
        // Factores de conversión comunes en pastelería
        this.conversionFactors = {
            // Para moldes circulares vs rectangulares (aproximación)
            circularToRectangular: 0.8,
            rectangularToCircular: 1.25
        };
    }

    // Calcular volumen de molde circular
    calculateCircularVolume(diameter, height) {
        if (!diameter || !height || diameter <= 0 || height <= 0) {
            throw new Error('Diámetro y altura deben ser valores positivos');
        }
        
        const radius = diameter / 2;
        const volume = Math.PI * Math.pow(radius, 2) * height;
        return Math.round(volume * 100) / 100; // Redondear a 2 decimales
    }

    // Calcular volumen de molde rectangular
    calculateRectangularVolume(length, width, height) {
        if (!length || !width || !height || length <= 0 || width <= 0 || height <= 0) {
            throw new Error('Largo, ancho y altura deben ser valores positivos');
        }
        
        const volume = length * width * height;
        return Math.round(volume * 100) / 100; // Redondear a 2 decimales
    }

    // Calcular volumen de molde cuadrado
    calculateSquareVolume(side, height) {
        if (!side || !height || side <= 0 || height <= 0) {
            throw new Error('Lado y altura deben ser valores positivos');
        }
        
        const volume = Math.pow(side, 2) * height;
        return Math.round(volume * 100) / 100; // Redondear a 2 decimales
    }

    // Calcular volumen según el tipo de molde
    calculateVolume(moldData) {
        switch (moldData.type) {
            case 'circular':
                return this.calculateCircularVolume(moldData.diameter, moldData.height);
            case 'rectangular':
                return this.calculateRectangularVolume(moldData.length, moldData.width, moldData.height);
            case 'cuadrado':
                return this.calculateSquareVolume(moldData.side, moldData.height);
            default:
                throw new Error('Tipo de molde no válido');
        }
    }

    // Calcular factor de escala basado en volúmenes
    calculateScaleFactor(originalVolume, newVolume) {
        if (!originalVolume || !newVolume || originalVolume <= 0 || newVolume <= 0) {
            throw new Error('Los volúmenes deben ser valores positivos');
        }
        
        const scaleFactor = newVolume / originalVolume;
        return Math.round(scaleFactor * 1000) / 1000; // Redondear a 3 decimales
    }

    // Validar datos de molde
    validateMoldData(moldData) {
        if (!moldData.type) {
            throw new Error('Debe especificar el tipo de molde');
        }

        switch (moldData.type) {
            case 'circular':
                if (!moldData.diameter || !moldData.height) {
                    throw new Error('Debe especificar diámetro y altura para molde circular');
                }
                break;
            case 'rectangular':
                if (!moldData.length || !moldData.width || !moldData.height) {
                    throw new Error('Debe especificar largo, ancho y altura para molde rectangular');
                }
                break;
            case 'cuadrado':
                if (!moldData.side || !moldData.height) {
                    throw new Error('Debe especificar lado y altura para molde cuadrado');
                }
                break;
            default:
                throw new Error('Tipo de molde no válido');
        }

        return true;
    }

    // Obtener datos de molde desde el formulario de creación
    getMoldDataFromForm() {
        const moldEnabled = document.getElementById('mold-enabled').checked;
        
        if (!moldEnabled) {
            return null;
        }

        const moldType = document.getElementById('mold-type').value;
        
        if (!moldType) {
            return null;
        }

        const moldData = { type: moldType };

        switch (moldType) {
            case 'circular':
                moldData.diameter = parseFloat(document.getElementById('circular-diameter').value);
                moldData.height = parseFloat(document.getElementById('circular-height').value);
                break;
            case 'rectangular':
                moldData.length = parseFloat(document.getElementById('rectangular-length').value);
                moldData.width = parseFloat(document.getElementById('rectangular-width').value);
                moldData.height = parseFloat(document.getElementById('rectangular-height').value);
                break;
            case 'cuadrado':
                moldData.side = parseFloat(document.getElementById('square-side').value);
                moldData.height = parseFloat(document.getElementById('square-height').value);
                break;
        }

        try {
            this.validateMoldData(moldData);
            return moldData;
        } catch (error) {
            throw error;
        }
    }

    // Obtener datos de molde nuevo desde el modal de escalado
    getNewMoldDataFromModal() {
        const moldType = document.getElementById('new-mold-type').value;
        
        if (!moldType) {
            throw new Error('Debe seleccionar el tipo de molde nuevo');
        }

        const moldData = { type: moldType };

        switch (moldType) {
            case 'circular':
                moldData.diameter = parseFloat(document.getElementById('new-circular-diameter').value);
                moldData.height = parseFloat(document.getElementById('new-circular-height').value);
                break;
            case 'rectangular':
                moldData.length = parseFloat(document.getElementById('new-rectangular-length').value);
                moldData.width = parseFloat(document.getElementById('new-rectangular-width').value);
                moldData.height = parseFloat(document.getElementById('new-rectangular-height').value);
                break;
            case 'cuadrado':
                moldData.side = parseFloat(document.getElementById('new-square-side').value);
                moldData.height = parseFloat(document.getElementById('new-square-height').value);
                break;
        }

        try {
            this.validateMoldData(moldData);
            return moldData;
        } catch (error) {
            throw error;
        }
    }

    // Generar descripción legible del molde
    getMoldDescription(moldData) {
        if (!moldData) return '';

        switch (moldData.type) {
            case 'circular':
                return `Molde circular - Diámetro: ${moldData.diameter}cm, Alto: ${moldData.height}cm`;
            case 'rectangular':
                return `Molde rectangular - ${moldData.length}x${moldData.width}cm, Alto: ${moldData.height}cm`;
            case 'cuadrado':
                return `Molde cuadrado - ${moldData.side}x${moldData.side}cm, Alto: ${moldData.height}cm`;
            default:
                return 'Molde no especificado';
        }
    }

    // Actualizar la visualización del volumen calculado
    updateVolumeDisplay(volume, elementId = 'volume-value') {
        const volumeElement = document.getElementById(elementId);
        if (volumeElement) {
            volumeElement.textContent = `${volume.toLocaleString()} cm³`;
        }
    }

    // Mostrar/ocultar secciones de molde según el tipo seleccionado
    toggleMoldSections(moldType, prefix = '') {
        const types = ['circular', 'rectangular', 'square'];
        
        types.forEach(type => {
            const element = document.getElementById(`${prefix}${type}-mold`);
            if (element) {
                element.style.display = moldType === type ? 'block' : 'none';
            }
        });
    }

    // Configurar eventos para los formularios de molde
    setupMoldFormEvents() {
        // Checkbox para habilitar/deshabilitar molde
        const moldEnabled = document.getElementById('mold-enabled');
        const moldConfig = document.getElementById('mold-config');
        
        if (moldEnabled && moldConfig) {
            moldEnabled.addEventListener('change', () => {
                moldConfig.style.display = moldEnabled.checked ? 'block' : 'none';
                if (!moldEnabled.checked) {
                    this.clearMoldForm();
                }
            });
        }

        // Selector de tipo de molde
        const moldType = document.getElementById('mold-type');
        if (moldType) {
            moldType.addEventListener('change', () => {
                this.toggleMoldSections(moldType.value);
                this.clearCalculatedVolume();
            });
        }

        // Selector de tipo de molde nuevo (modal de escalado)
        const newMoldType = document.getElementById('new-mold-type');
        if (newMoldType) {
            newMoldType.addEventListener('change', () => {
                this.toggleMoldSections(newMoldType.value, 'new-');
                this.clearNewCalculatedVolume();
            });
        }

        // Eventos para calcular volumen en tiempo real
        this.setupVolumeCalculationEvents();
        this.setupNewVolumeCalculationEvents();
    }

    // Configurar eventos para cálculo automático de volumen
    setupVolumeCalculationEvents() {
        const inputs = [
            'circular-diameter', 'circular-height',
            'rectangular-length', 'rectangular-width', 'rectangular-height',
            'square-side', 'square-height'
        ];

        inputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => {
                    this.calculateAndDisplayVolume();
                });
            }
        });
    }

    // Configurar eventos para cálculo automático de volumen nuevo
    setupNewVolumeCalculationEvents() {
        const inputs = [
            'new-circular-diameter', 'new-circular-height',
            'new-rectangular-length', 'new-rectangular-width', 'new-rectangular-height',
            'new-square-side', 'new-square-height'
        ];

        inputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => {
                    this.calculateAndDisplayNewVolume();
                });
            }
        });
    }

    // Calcular y mostrar volumen del molde original
    calculateAndDisplayVolume() {
        try {
            const moldData = this.getMoldDataFromForm();
            if (moldData) {
                const volume = this.calculateVolume(moldData);
                this.updateVolumeDisplay(volume, 'volume-value');
                document.getElementById('calculated-volume').style.display = 'block';
            }
        } catch (error) {
            this.clearCalculatedVolume();
        }
    }

    // Calcular y mostrar volumen del molde nuevo
    calculateAndDisplayNewVolume() {
        try {
            const newMoldData = this.getNewMoldDataFromModal();
            if (newMoldData) {
                const newVolume = this.calculateVolume(newMoldData);
                this.updateVolumeDisplay(newVolume, 'new-volume-value');
                document.getElementById('new-calculated-volume').style.display = 'block';
                
                // Mostrar factor de escala si hay molde original
                this.showVolumeComparison(newVolume);
            }
        } catch (error) {
            this.clearNewCalculatedVolume();
        }
    }

    // Mostrar comparación de volúmenes
    showVolumeComparison(newVolume) {
        const scaleModal = document.getElementById('scale-modal');
        const recipeId = scaleModal.dataset.recipeId;
        
        if (recipeId && window.app) {
            const recipe = window.app.recipesManager.getRecipe(parseInt(recipeId));
            if (recipe && recipe.moldData) {
                try {
                    const originalVolume = this.calculateVolume(recipe.moldData);
                    const scaleFactor = this.calculateScaleFactor(originalVolume, newVolume);
                    
                    document.getElementById('volume-scale-factor').textContent = `${scaleFactor}`;
                    document.getElementById('volume-comparison').style.display = 'block';
                } catch (error) {
                    document.getElementById('volume-comparison').style.display = 'none';
                }
            }
        }
    }

    // Limpiar formulario de molde
    clearMoldForm() {
        const inputs = [
            'circular-diameter', 'circular-height',
            'rectangular-length', 'rectangular-width', 'rectangular-height',
            'square-side', 'square-height'
        ];

        inputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.value = '';
            }
        });

        document.getElementById('mold-type').value = '';
        this.toggleMoldSections('');
        this.clearCalculatedVolume();
    }

    // Limpiar volumen calculado
    clearCalculatedVolume() {
        document.getElementById('calculated-volume').style.display = 'none';
    }

    // Limpiar volumen calculado nuevo
    clearNewCalculatedVolume() {
        document.getElementById('new-calculated-volume').style.display = 'none';
        document.getElementById('volume-comparison').style.display = 'none';
    }
} 