// Módulo para gestión de interfaz de usuario
class UIManager {
    constructor() {
        this.currentStep = 1;
        this.currentRecipe = {
            name: '',
            description: '',
            yield: 1,
            unit: 'unidad',
            ingredients: [],
            quantities: {},
            profitMargin: 0,
            cost: 0,
            profit: 0,
            finalPrice: 0,
            scaleQuantity: null,
            moldData: null
        };
        this.volumeCalculator = new VolumeCalculator();
    }

    // Navegación entre páginas
    showPage(pageName) {
        // Ocultar todas las páginas
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Mostrar la página seleccionada
        document.getElementById(`${pageName}-page`).classList.add('active');

        // Actualizar navegación
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-page="${pageName}"]`).classList.add('active');
    }

    // Estados vacíos
    updateEmptyStates(hasIngredients, hasRecipes) {
        const ingredientsEmpty = document.getElementById('empty-state');
        const recipesEmpty = document.getElementById('recipes-empty-state');

        ingredientsEmpty.style.display = hasIngredients ? 'none' : 'block';
        recipesEmpty.style.display = hasRecipes ? 'none' : 'block';
    }

    // Gestión de modales de recetas
    openRecipeModal() {
        this.currentStep = 1;
        this.currentRecipe = {
            name: '',
            description: '',
            yield: 1,
            unit: 'unidad',
            ingredients: [],
            quantities: {},
            profitMargin: 0,
            cost: 0,
            profit: 0,
            finalPrice: 0,
            scaleQuantity: null,
            moldData: null
        };

        document.getElementById('recipe-modal').classList.add('active');
        this.updateStep();
        
        // Configurar eventos de molde después de abrir el modal
        setTimeout(() => {
            this.volumeCalculator.setupMoldFormEvents();
        }, 100);
    }

    closeRecipeModal() {
        document.getElementById('recipe-modal').classList.remove('active');
        document.getElementById('recipe-name').value = '';
        document.getElementById('recipe-description').value = '';
        document.getElementById('recipe-yield').value = '1';
        document.getElementById('recipe-unit').value = 'unidad';
        document.getElementById('profit-margin').value = '20';
        document.getElementById('scale-quantity').value = '';
        
        // Limpiar formulario de molde
        document.getElementById('mold-enabled').checked = false;
        document.getElementById('mold-config').style.display = 'none';
        this.volumeCalculator.clearMoldForm();
    }

    // Gestión de modal de escalado
    openScaleModal(recipe) {
        document.getElementById('scale-modal-title').textContent = `Calcular: ${recipe.name}`;
        
        const unitDisplay = recipe.unit === 'unidad' ? 'unidades' : recipe.unit;
        let recipeInfoHTML = `
            <div class="recipe-info-summary">
                <h4>${recipe.name}</h4>
                ${recipe.description ? `<p>${recipe.description}</p>` : ''}
                <p><strong>Receta original rinde:</strong> ${recipe.yield} ${unitDisplay}</p>
                <p><strong>Costo por ${recipe.unit === 'unidad' ? 'unidad' : recipe.unit}:</strong> $${recipe.costPerUnit.toFixed(2)}</p>
                <p><strong>Precio por ${recipe.unit === 'unidad' ? 'unidad' : recipe.unit}:</strong> $${recipe.pricePerUnit.toFixed(2)}</p>
        `;
        
        // Agregar información del molde si existe
        if (recipe.moldData) {
            const moldDescription = this.volumeCalculator.getMoldDescription(recipe.moldData);
            const moldVolume = this.volumeCalculator.calculateVolume(recipe.moldData);
            recipeInfoHTML += `
                <div class="mold-info">
                    <i class="fas fa-cube"></i> ${moldDescription}
                    <div class="volume-info">Volumen: ${moldVolume.toLocaleString()} cm³</div>
                </div>
            `;
        }
        
        recipeInfoHTML += `</div>`;
        document.getElementById('scale-recipe-info').innerHTML = recipeInfoHTML;

        // Mostrar/ocultar opción de escalado por volumen
        const scaleByVolumeOption = document.getElementById('scale-by-volume-option');
        if (recipe.moldData) {
            scaleByVolumeOption.style.display = 'block';
        } else {
            scaleByVolumeOption.style.display = 'none';
            document.getElementById('scale-by-quantity').checked = true;
        }

        document.getElementById('scale-target-quantity').placeholder = recipe.yield;
        document.getElementById('scale-modal').classList.add('active');
        document.getElementById('scale-modal').dataset.recipeId = recipe.id;
        
        // Configurar eventos de escalado por volumen
        this.setupScaleModalEvents();
    }

    closeScaleModal() {
        document.getElementById('scale-modal').classList.remove('active');
        document.getElementById('scale-target-quantity').value = '';
        document.getElementById('scale-results').innerHTML = '';
        
        // Limpiar formularios de molde nuevo
        document.getElementById('new-mold-type').value = '';
        document.getElementById('volume-target-quantity').value = '1';
        this.volumeCalculator.toggleMoldSections('', 'new-');
        this.volumeCalculator.clearNewCalculatedVolume();
        
        // Resetear método de escalado
        document.getElementById('scale-by-quantity').checked = true;
        document.getElementById('quantity-scale-section').style.display = 'block';
        document.getElementById('volume-scale-section').style.display = 'none';
    }

    // Navegación de pasos en el modal
    nextStep() {
        this.currentStep++;
        this.updateStep();
    }

    prevStep() {
        this.currentStep--;
        this.updateStep();
    }

    updateStep() {
        // Ocultar todos los pasos
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active');
        });

        // Mostrar el paso actual
        document.getElementById(`step-${this.getStepName()}`).classList.add('active');

        // Actualizar botones
        document.getElementById('prev-step').style.display = this.currentStep > 1 ? 'inline-flex' : 'none';
        document.getElementById('next-step').style.display = this.currentStep < 7 ? 'inline-flex' : 'none';
        document.getElementById('calculate-recipe').style.display = this.currentStep === 6 ? 'inline-flex' : 'none';
        document.getElementById('save-recipe').style.display = this.currentStep === 7 ? 'inline-flex' : 'none';
    }

    getStepName() {
        const steps = ['info', 'mold', 'ingredients', 'quantities', 'profit', 'scale', 'results'];
        return steps[this.currentStep - 1];
    }

    getCurrentStep() {
        return this.currentStep;
    }

    getCurrentRecipe() {
        return this.currentRecipe;
    }

    updateCurrentRecipe(data) {
        this.currentRecipe = { ...this.currentRecipe, ...data };
    }

    // Validación de pasos
    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                const recipeName = document.getElementById('recipe-name').value.trim();
                const description = document.getElementById('recipe-description').value.trim();
                const recipeYield = parseFloat(document.getElementById('recipe-yield').value);
                const unit = document.getElementById('recipe-unit').value;
                
                if (!recipeName) {
                    throw new Error('Por favor, ingresa el nombre de la receta');
                }
                if (!recipeYield || recipeYield <= 0) {
                    throw new Error('Por favor, ingresa una cantidad válida que produce la receta');
                }
                
                this.currentRecipe.name = recipeName;
                this.currentRecipe.description = description;
                this.currentRecipe.yield = recipeYield;
                this.currentRecipe.unit = unit;
                return true;

            case 2:
                // Validar molde (opcional)
                try {
                    const moldData = this.volumeCalculator.getMoldDataFromForm();
                    this.currentRecipe.moldData = moldData;
                } catch (error) {
                    // Si hay error en los datos del molde pero está habilitado, mostrar error
                    if (document.getElementById('mold-enabled').checked) {
                        throw error;
                    }
                    // Si no está habilitado, continuar sin molde
                    this.currentRecipe.moldData = null;
                }
                return true;

            case 3:
                const selectedIngredients = document.querySelectorAll('#ingredients-list input:checked');
                if (selectedIngredients.length === 0) {
                    throw new Error('Selecciona al menos un ingrediente');
                }
                this.currentRecipe.ingredients = Array.from(selectedIngredients).map(input => parseInt(input.value));
                return true;

            case 4:
                const quantityInputs = document.querySelectorAll('#quantities-form input');
                let valid = true;
                quantityInputs.forEach(input => {
                    const quantity = parseFloat(input.value);
                    if (!quantity || quantity <= 0) {
                        valid = false;
                    } else {
                        this.currentRecipe.quantities[input.dataset.ingredientId] = quantity;
                    }
                });
                if (!valid) {
                    throw new Error('Por favor, ingresa cantidades válidas para todos los ingredientes');
                }
                return true;

            case 5:
                const profitMarginInput = document.getElementById('profit-margin').value;
                let profitMargin = parseFloat(profitMarginInput);
                
                if (profitMarginInput === '' || profitMarginInput === null || profitMarginInput === undefined) {
                    profitMargin = 0;
                }
                
                if (isNaN(profitMargin) || profitMargin < 0) {
                    throw new Error('Por favor, ingresa un porcentaje de ganancia válido');
                }
                
                this.currentRecipe.profitMargin = profitMargin;
                return true;

            case 6:
                const scaleQuantityInput = document.getElementById('scale-quantity').value;
                let scaleQuantity = null;
                
                if (scaleQuantityInput && scaleQuantityInput.trim() !== '') {
                    scaleQuantity = parseFloat(scaleQuantityInput);
                    if (isNaN(scaleQuantity) || scaleQuantity <= 0) {
                        throw new Error('Por favor, ingresa una cantidad válida para escalar');
                    }
                }
                
                this.currentRecipe.scaleQuantity = scaleQuantity;
                return true;

            default:
                return true;
        }
    }

    // Cargar contenido de pasos específicos
    loadIngredientsSelection(ingredients) {
        const container = document.getElementById('ingredients-list');
        container.innerHTML = ingredients.map(ingredient => {
            const unitDisplay = ingredient.unit === 'unidad' ? 'unidades' : ingredient.unit;
            return `
                <div class="ingredient-checkbox">
                    <input type="checkbox" id="ing-${ingredient.id}" value="${ingredient.id}">
                    <label for="ing-${ingredient.id}">
                        ${ingredient.name} (${ingredient.quantity} ${unitDisplay})
                    </label>
                </div>
            `;
        }).join('');

        container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                e.target.closest('.ingredient-checkbox').classList.toggle('selected', e.target.checked);
            });
        });
    }

    loadQuantitiesForm(selectedIngredients) {
        const container = document.getElementById('quantities-form');

        container.innerHTML = selectedIngredients.map(ingredient => {
            const unitDisplay = ingredient.unit === 'unidad' ? 'unidades' : ingredient.unit;
            const placeholder = ingredient.unit === 'unidad' ? 'Ej: 3 huevos' : '0';
            
            return `
                <div class="quantity-item">
                    <label>${ingredient.name}</label>
                    <input type="number" step="0.01" min="0" placeholder="${placeholder}" data-ingredient-id="${ingredient.id}">
                    <span>${unitDisplay}</span>
                </div>
            `;
        }).join('');
    }

    // Renderizado de contenido
    renderIngredientsGrid(ingredientsHTML) {
        const grid = document.getElementById('ingredients-grid');
        grid.innerHTML = ingredientsHTML;
    }

    renderRecipesGrid(recipesHTML) {
        const grid = document.getElementById('recipes-grid');
        grid.innerHTML = recipesHTML;
    }

    displayResults(resultsHTML) {
        const container = document.getElementById('recipe-results');
        container.innerHTML = resultsHTML;
    }

    displayScaleResults(resultsHTML) {
        document.getElementById('scale-results').innerHTML = resultsHTML;
    }

    // Notificaciones
    showAlert(message, type = 'info') {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4ecdc4' : type === 'error' ? '#ff6b6b' : '#74b9ff'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            font-weight: 500;
        `;
        alert.textContent = message;

        document.body.appendChild(alert);

        setTimeout(() => {
            alert.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            alert.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(alert);
            }, 300);
        }, 3000);
    }

    // Configurar eventos del modal de escalado
    setupScaleModalEvents() {
        const scaleMethodInputs = document.querySelectorAll('input[name="scale-method"]');
        scaleMethodInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.toggleScaleMethod();
            });
        });
        
        // Configurar eventos de molde para el modal de escalado
        setTimeout(() => {
            this.volumeCalculator.setupMoldFormEvents();
        }, 100);
    }

    // Alternar método de escalado
    toggleScaleMethod() {
        const scaleMethod = document.querySelector('input[name="scale-method"]:checked').value;
        const quantitySection = document.getElementById('quantity-scale-section');
        const volumeSection = document.getElementById('volume-scale-section');
        
        if (scaleMethod === 'quantity') {
            quantitySection.style.display = 'block';
            volumeSection.style.display = 'none';
        } else {
            quantitySection.style.display = 'none';
            volumeSection.style.display = 'block';
        }
    }

    // Limpiar formularios
    clearIngredientForm() {
        document.getElementById('ingredient-form').reset();
    }
}
