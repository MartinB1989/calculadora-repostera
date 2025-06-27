// Clase principal de la aplicación
class PastryCalculator {
    constructor() {
        this.ingredients = this.loadIngredients();
        this.recipes = this.loadRecipes();
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
            scaleQuantity: null
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderIngredients();
        this.renderRecipes();
        this.updateEmptyStates();
    }

    // Event Listeners
    setupEventListeners() {
        // Navegación
        document.querySelectorAll('[data-page]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.target.getAttribute('data-page') || e.target.closest('[data-page]').getAttribute('data-page');
                this.showPage(page);
            });
        });

        // Formulario de ingredientes
        document.getElementById('ingredient-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addIngredient();
        });

        // Modal de recetas
        document.getElementById('create-recipe-btn').addEventListener('click', () => {
            this.openRecipeModal();
        });

        document.querySelector('.modal-close').addEventListener('click', () => {
            this.closeRecipeModal();
        });

        // Scale modal
        document.querySelectorAll('.scale-modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeScaleModal();
            });
        });

        document.getElementById('calculate-scale').addEventListener('click', () => {
            this.calculateScaledRecipe();
        });

        // Navegación de pasos en el modal
        document.getElementById('next-step').addEventListener('click', () => {
            this.nextStep();
        });

        document.getElementById('prev-step').addEventListener('click', () => {
            this.prevStep();
        });

        document.getElementById('calculate-recipe').addEventListener('click', () => {
            this.calculateRecipe();
        });

        document.getElementById('save-recipe').addEventListener('click', () => {
            this.saveRecipe();
        });

        // Cerrar modal al hacer clic fuera
        document.getElementById('recipe-modal').addEventListener('click', (e) => {
            if (e.target.id === 'recipe-modal') {
                this.closeRecipeModal();
            }
        });

        document.getElementById('scale-modal').addEventListener('click', (e) => {
            if (e.target.id === 'scale-modal') {
                this.closeScaleModal();
            }
        });
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

    // Gestión de ingredientes
    addIngredient() {
        const name = document.getElementById('ingredient-name').value.trim();
        const price = parseFloat(document.getElementById('ingredient-price').value);
        const quantity = parseFloat(document.getElementById('ingredient-quantity').value);
        const unit = document.getElementById('ingredient-unit').value;

        if (!name || !price || !quantity || !unit) {
            this.showAlert('Por favor, completa todos los campos', 'error');
            return;
        }

        const ingredient = {
            id: Date.now(),
            name,
            price,
            quantity,
            unit,
            pricePerUnit: price / quantity
        };

        this.ingredients.push(ingredient);
        this.saveIngredients();
        this.renderIngredients();
        this.updateEmptyStates();
        
        // Limpiar formulario
        document.getElementById('ingredient-form').reset();
        
        this.showAlert('Ingrediente agregado exitosamente', 'success');
        this.showPage('home');
    }

    deleteIngredient(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este ingrediente?')) {
            this.ingredients = this.ingredients.filter(ing => ing.id !== id);
            this.saveIngredients();
            this.renderIngredients();
            this.updateEmptyStates();
            this.showAlert('Ingrediente eliminado', 'success');
        }
    }

    renderIngredients() {
        const grid = document.getElementById('ingredients-grid');
        
        if (this.ingredients.length === 0) {
            grid.innerHTML = '';
            return;
        }

        grid.innerHTML = this.ingredients.map(ingredient => {
            const unitDisplay = ingredient.unit === 'unidad' ? 'unidades' : ingredient.unit;
            const priceLabel = ingredient.unit === 'unidad' ? 'Precio por unidad' : `Precio por ${ingredient.unit}`;
            
            return `
                <div class="ingredient-card">
                    <h3>${ingredient.name}</h3>
                    <div class="ingredient-info">
                        <span>Precio total:</span>
                        <strong>$${ingredient.price.toFixed(2)}</strong>
                    </div>
                    <div class="ingredient-info">
                        <span>Cantidad:</span>
                        <strong>${ingredient.quantity} ${unitDisplay}</strong>
                    </div>
                    <div class="ingredient-info">
                        <span>${priceLabel}:</span>
                        <strong>$${ingredient.pricePerUnit.toFixed(2)}</strong>
                    </div>
                    <div class="ingredient-actions">
                        <button class="btn-icon" onclick="app.deleteIngredient(${ingredient.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Gestión de recetas
    openRecipeModal() {
        if (this.ingredients.length === 0) {
            this.showAlert('Necesitas agregar ingredientes antes de crear una receta', 'error');
            return;
        }

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
            scaleQuantity: null
        };

        document.getElementById('recipe-modal').classList.add('active');
        this.updateStep();
    }

    closeRecipeModal() {
        document.getElementById('recipe-modal').classList.remove('active');
        document.getElementById('recipe-name').value = '';
        document.getElementById('recipe-description').value = '';
        document.getElementById('recipe-yield').value = '1';
        document.getElementById('recipe-unit').value = 'unidad';
        document.getElementById('profit-margin').value = '20';
        document.getElementById('scale-quantity').value = '';
    }

    closeScaleModal() {
        document.getElementById('scale-modal').classList.remove('active');
        document.getElementById('scale-target-quantity').value = '';
        document.getElementById('scale-results').innerHTML = '';
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            this.currentStep++;
            this.updateStep();
        }
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
        document.getElementById('next-step').style.display = this.currentStep < 6 ? 'inline-flex' : 'none';
        document.getElementById('calculate-recipe').style.display = this.currentStep === 5 ? 'inline-flex' : 'none';
        document.getElementById('save-recipe').style.display = this.currentStep === 6 ? 'inline-flex' : 'none';

        // Cargar contenido específico del paso
        this.loadStepContent();
    }

    getStepName() {
        const steps = ['info', 'ingredients', 'quantities', 'profit', 'scale', 'results'];
        return steps[this.currentStep - 1];
    }

    loadStepContent() {
        switch (this.currentStep) {
            case 2:
                this.loadIngredientsSelection();
                break;
            case 3:
                this.loadQuantitiesForm();
                break;
        }
    }

    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                const recipeName = document.getElementById('recipe-name').value.trim();
                const description = document.getElementById('recipe-description').value.trim();
                const yield_ = parseFloat(document.getElementById('recipe-yield').value);
                const unit = document.getElementById('recipe-unit').value;
                
                if (!recipeName) {
                    this.showAlert('Por favor, ingresa el nombre de la receta', 'error');
                    return false;
                }
                if (!yield_ || yield_ <= 0) {
                    this.showAlert('Por favor, ingresa una cantidad válida que produce la receta', 'error');
                    return false;
                }
                
                this.currentRecipe.name = recipeName;
                this.currentRecipe.description = description;
                this.currentRecipe.yield = yield_;
                this.currentRecipe.unit = unit;
                return true;

            case 2:
                const selectedIngredients = document.querySelectorAll('#ingredients-list input:checked');
                if (selectedIngredients.length === 0) {
                    this.showAlert('Selecciona al menos un ingrediente', 'error');
                    return false;
                }
                this.currentRecipe.ingredients = Array.from(selectedIngredients).map(input => parseInt(input.value));
                return true;

            case 3:
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
                    this.showAlert('Por favor, ingresa cantidades válidas para todos los ingredientes', 'error');
                    return false;
                }
                return true;

            case 4:
                const profitMarginInput = document.getElementById('profit-margin').value;
                let profitMargin = parseFloat(profitMarginInput);
                
                // Si el campo está vacío, usar 0
                if (profitMarginInput === '' || profitMarginInput === null || profitMarginInput === undefined) {
                    profitMargin = 0;
                }
                
                if (isNaN(profitMargin) || profitMargin < 0) {
                    this.showAlert('Por favor, ingresa un porcentaje de ganancia válido', 'error');
                    return false;
                }
                
                this.currentRecipe.profitMargin = profitMargin;
                return true;

            case 5:
                // Este paso es opcional, solo capturamos el valor si existe
                const scaleQuantityInput = document.getElementById('scale-quantity').value;
                let scaleQuantity = null;
                
                if (scaleQuantityInput && scaleQuantityInput.trim() !== '') {
                    scaleQuantity = parseFloat(scaleQuantityInput);
                    if (isNaN(scaleQuantity) || scaleQuantity <= 0) {
                        this.showAlert('Por favor, ingresa una cantidad válida para escalar', 'error');
                        return false;
                    }
                }
                
                this.currentRecipe.scaleQuantity = scaleQuantity;
                return true;

            default:
                return true;
        }
    }

    loadIngredientsSelection() {
        const container = document.getElementById('ingredients-list');
        container.innerHTML = this.ingredients.map(ingredient => {
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

        // Event listeners para las checkboxes
        container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                e.target.closest('.ingredient-checkbox').classList.toggle('selected', e.target.checked);
            });
        });
    }

    loadQuantitiesForm() {
        const container = document.getElementById('quantities-form');
        const selectedIngredients = this.currentRecipe.ingredients.map(id => 
            this.ingredients.find(ing => ing.id === id)
        );

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

    calculateRecipe() {
        let totalCost = 0;

        // Calcular costo total para la receta original
        this.currentRecipe.ingredients.forEach(ingredientId => {
            const ingredient = this.ingredients.find(ing => ing.id === ingredientId);
            const usedQuantity = this.currentRecipe.quantities[ingredientId];
            const cost = ingredient.pricePerUnit * usedQuantity;
            totalCost += cost;
        });

        this.currentRecipe.cost = totalCost;
        
        // Obtener el porcentaje de ganancia
        const profitMarginInput = document.getElementById('profit-margin').value;
        let profitMargin = parseFloat(profitMarginInput);
        
        if (isNaN(profitMargin) || profitMarginInput === '' || profitMarginInput === null) {
            profitMargin = 0;
        }
        
        this.currentRecipe.profitMargin = profitMargin;
        
        // Calcular ganancia y precio final
        const profitAmount = totalCost * (profitMargin / 100);
        this.currentRecipe.profit = profitAmount;
        this.currentRecipe.finalPrice = totalCost + profitAmount;

        this.displayResults();
        this.nextStep();
    }

    displayResults() {
        const container = document.getElementById('recipe-results');
        const selectedIngredients = this.currentRecipe.ingredients.map(id => 
            this.ingredients.find(ing => ing.id === id)
        );

        // Determinar si estamos escalando la receta
        const isScaled = this.currentRecipe.scaleQuantity !== null && this.currentRecipe.scaleQuantity !== this.currentRecipe.yield;
        const scale = isScaled ? this.currentRecipe.scaleQuantity / this.currentRecipe.yield : 1;
        const targetQuantity = isScaled ? this.currentRecipe.scaleQuantity : this.currentRecipe.yield;
        
        let resultsHTML = `<h4>Receta: ${this.currentRecipe.name}</h4>`;
        
        if (isScaled) {
            resultsHTML += `<p><strong>Calculando para ${targetQuantity} ${this.currentRecipe.unit === 'unidad' ? 'unidades' : this.currentRecipe.unit}</strong></p>`;
        } else {
            resultsHTML += `<p><strong>Cantidad original: ${this.currentRecipe.yield} ${this.currentRecipe.unit === 'unidad' ? 'unidades' : this.currentRecipe.unit}</strong></p>`;
        }

        resultsHTML += '<h5>Desglose de ingredientes:</h5>';
        
        selectedIngredients.forEach(ingredient => {
            const originalQuantity = this.currentRecipe.quantities[ingredient.id];
            const scaledQuantity = originalQuantity * scale;
            const cost = ingredient.pricePerUnit * scaledQuantity;
            
            resultsHTML += `
                <div class="result-item">
                    <span>${ingredient.name} (${scaledQuantity.toFixed(2)} ${ingredient.unit})</span>
                    <span>$${cost.toFixed(2)}</span>
                </div>
            `;
        });

        const scaledCost = this.currentRecipe.cost * scale;
        const scaledProfit = this.currentRecipe.profit * scale;
        const scaledFinalPrice = this.currentRecipe.finalPrice * scale;

        resultsHTML += `
            <div class="result-item">
                <span>Costo total de ingredientes:</span>
                <span>$${scaledCost.toFixed(2)}</span>
            </div>
            <div class="result-item">
                <span>Ganancia (${this.currentRecipe.profitMargin}%):</span>
                <span>$${scaledProfit.toFixed(2)}</span>
            </div>
            <div class="result-item">
                <span><strong>Precio final sugerido:</strong></span>
                <span><strong>$${scaledFinalPrice.toFixed(2)}</strong></span>
            </div>
        `;

        // Mostrar costo por unidad si la receta produce múltiples unidades
        if (targetQuantity > 1) {
            const costPerUnit = scaledCost / targetQuantity;
            const pricePerUnit = scaledFinalPrice / targetQuantity;
            
            resultsHTML += `
                <hr style="margin: 1rem 0;">
                <h5>Costo por unidad:</h5>
                <div class="result-item">
                    <span>Costo por ${this.currentRecipe.unit === 'unidad' ? 'unidad' : this.currentRecipe.unit}:</span>
                    <span>$${costPerUnit.toFixed(2)}</span>
                </div>
                <div class="result-item">
                    <span><strong>Precio de venta por ${this.currentRecipe.unit === 'unidad' ? 'unidad' : this.currentRecipe.unit}:</strong></span>
                    <span><strong>$${pricePerUnit.toFixed(2)}</strong></span>
                </div>
            `;
        }

        container.innerHTML = resultsHTML;
    }

    saveRecipe() {
        const recipe = {
            id: Date.now(),
            name: this.currentRecipe.name,
            description: this.currentRecipe.description,
            yield: this.currentRecipe.yield,
            unit: this.currentRecipe.unit,
            ingredients: this.currentRecipe.ingredients.map(id => {
                const ingredient = this.ingredients.find(ing => ing.id === id);
                return {
                    id: ingredient.id,
                    name: ingredient.name,
                    quantity: this.currentRecipe.quantities[id],
                    unit: ingredient.unit,
                    cost: ingredient.pricePerUnit * this.currentRecipe.quantities[id]
                };
            }),
            profitMargin: this.currentRecipe.profitMargin,
            totalCost: this.currentRecipe.cost,
            profit: this.currentRecipe.profit,
            finalPrice: this.currentRecipe.finalPrice,
            costPerUnit: this.currentRecipe.cost / this.currentRecipe.yield,
            pricePerUnit: this.currentRecipe.finalPrice / this.currentRecipe.yield,
            createdAt: new Date().toISOString()
        };

        this.recipes.push(recipe);
        this.saveRecipes();
        this.renderRecipes();
        this.updateEmptyStates();
        this.closeRecipeModal();
        this.showAlert('Receta guardada exitosamente', 'success');
        this.showPage('recipes');
    }

    deleteRecipe(id) {
        if (confirm('¿Estás seguro de que quieres eliminar esta receta?')) {
            this.recipes = this.recipes.filter(recipe => recipe.id !== id);
            this.saveRecipes();
            this.renderRecipes();
            this.updateEmptyStates();
            this.showAlert('Receta eliminada', 'success');
        }
    }

    renderRecipes() {
        const grid = document.getElementById('recipes-grid');
        
        if (this.recipes.length === 0) {
            grid.innerHTML = '';
            return;
        }

        grid.innerHTML = this.recipes.map(recipe => {
            const unitDisplay = recipe.unit === 'unidad' ? 'unidades' : recipe.unit;
            return `
                <div class="recipe-card">
                    <h3>${recipe.name}</h3>
                    ${recipe.description ? `<p class="recipe-description">${recipe.description}</p>` : ''}
                    <div class="recipe-yield">
                        <strong>Rinde: ${recipe.yield} ${unitDisplay}</strong>
                    </div>
                    <div class="recipe-ingredients">
                        <h4>Ingredientes:</h4>
                        <ul>
                            ${recipe.ingredients.map(ing => {
                                const ingUnitDisplay = ing.unit === 'unidad' ? 'unidades' : ing.unit;
                                return `<li>${ing.name} (${ing.quantity} ${ingUnitDisplay})</li>`;
                            }).join('')}
                        </ul>
                    </div>
                    <div class="recipe-cost">
                        <div>
                            <span>Costo total: $${recipe.totalCost.toFixed(2)}</span>
                            <strong>Precio total: $${recipe.finalPrice.toFixed(2)}</strong>
                        </div>
                        ${recipe.yield > 1 ? `
                            <div style="margin-top: 0.5rem; font-size: 0.9em;">
                                <span>Costo por ${recipe.unit === 'unidad' ? 'unidad' : recipe.unit}: $${recipe.costPerUnit.toFixed(2)}</span>
                                <strong>Precio por ${recipe.unit === 'unidad' ? 'unidad' : recipe.unit}: $${recipe.pricePerUnit.toFixed(2)}</strong>
                            </div>
                        ` : ''}
                    </div>
                    <div class="recipe-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                        <button class="btn btn-sm btn-primary" onclick="app.openScaleModal(${recipe.id})" title="Calcular para otra cantidad">
                            <i class="fas fa-calculator"></i> Calcular
                        </button>
                        <button class="btn-icon" onclick="app.deleteRecipe(${recipe.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Estados vacíos
    updateEmptyStates() {
        const ingredientsEmpty = document.getElementById('empty-state');
        const recipesEmpty = document.getElementById('recipes-empty-state');

        ingredientsEmpty.style.display = this.ingredients.length === 0 ? 'block' : 'none';
        recipesEmpty.style.display = this.recipes.length === 0 ? 'block' : 'none';
    }

    // Almacenamiento local
    saveIngredients() {
        localStorage.setItem('pastry-ingredients', JSON.stringify(this.ingredients));
    }

    loadIngredients() {
        const saved = localStorage.getItem('pastry-ingredients');
        return saved ? JSON.parse(saved) : [];
    }

    saveRecipes() {
        localStorage.setItem('pastry-recipes', JSON.stringify(this.recipes));
    }

    loadRecipes() {
        const saved = localStorage.getItem('pastry-recipes');
        return saved ? JSON.parse(saved) : [];
    }

    // Modal de escalado
    openScaleModal(recipeId) {
        const recipe = this.recipes.find(r => r.id === recipeId);
        if (!recipe) return;

        document.getElementById('scale-modal-title').textContent = `Calcular: ${recipe.name}`;
        
        const unitDisplay = recipe.unit === 'unidad' ? 'unidades' : recipe.unit;
        document.getElementById('scale-recipe-info').innerHTML = `
            <div class="recipe-info-summary">
                <h4>${recipe.name}</h4>
                ${recipe.description ? `<p>${recipe.description}</p>` : ''}
                <p><strong>Receta original rinde:</strong> ${recipe.yield} ${unitDisplay}</p>
                <p><strong>Costo por ${recipe.unit === 'unidad' ? 'unidad' : recipe.unit}:</strong> $${recipe.costPerUnit.toFixed(2)}</p>
                <p><strong>Precio por ${recipe.unit === 'unidad' ? 'unidad' : recipe.unit}:</strong> $${recipe.pricePerUnit.toFixed(2)}</p>
            </div>
        `;

        document.getElementById('scale-target-quantity').placeholder = recipe.yield;
        document.getElementById('scale-modal').classList.add('active');
        document.getElementById('scale-modal').dataset.recipeId = recipeId;
    }

    calculateScaledRecipe() {
        const recipeId = parseInt(document.getElementById('scale-modal').dataset.recipeId);
        const recipe = this.recipes.find(r => r.id === recipeId);
        const targetQuantity = parseFloat(document.getElementById('scale-target-quantity').value);

        if (!targetQuantity || targetQuantity <= 0) {
            this.showAlert('Por favor, ingresa una cantidad válida', 'error');
            return;
        }

        const scale = targetQuantity / recipe.yield;
        const scaledCost = recipe.totalCost * scale;
        const scaledPrice = recipe.finalPrice * scale;

        const unitDisplay = recipe.unit === 'unidad' ? 'unidades' : recipe.unit;
        
        let resultsHTML = `
            <h4>Resultado para ${targetQuantity} ${unitDisplay}</h4>
            <div class="scale-calculation">
                <h5>Ingredientes necesarios:</h5>
        `;

        recipe.ingredients.forEach(ingredient => {
            const scaledQuantity = ingredient.quantity * scale;
            const ingUnitDisplay = ingredient.unit === 'unidad' ? 'unidades' : ingredient.unit;
            resultsHTML += `
                <div class="result-item">
                    <span>${ingredient.name}</span>
                    <span>${scaledQuantity.toFixed(2)} ${ingUnitDisplay}</span>
                </div>
            `;
        });

        resultsHTML += `
                <hr style="margin: 1rem 0;">
                <h5>Costos:</h5>
                <div class="result-item">
                    <span>Costo total de ingredientes:</span>
                    <span>$${scaledCost.toFixed(2)}</span>
                </div>
                <div class="result-item">
                    <span><strong>Precio de venta total:</strong></span>
                    <span><strong>$${scaledPrice.toFixed(2)}</strong></span>
                </div>
        `;

        if (targetQuantity > 1) {
            resultsHTML += `
                <hr style="margin: 1rem 0;">
                <h5>Por unidad:</h5>
                <div class="result-item">
                    <span>Costo por ${recipe.unit === 'unidad' ? 'unidad' : recipe.unit}:</span>
                    <span>$${recipe.costPerUnit.toFixed(2)}</span>
                </div>
                <div class="result-item">
                    <span><strong>Precio por ${recipe.unit === 'unidad' ? 'unidad' : recipe.unit}:</strong></span>
                    <span><strong>$${recipe.pricePerUnit.toFixed(2)}</strong></span>
                </div>
            `;
        }

        resultsHTML += '</div>';
        document.getElementById('scale-results').innerHTML = resultsHTML;
    }

    // Notificaciones
    showAlert(message, type = 'info') {
        // Crear elemento de alerta
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

        // Animar entrada
        setTimeout(() => {
            alert.style.transform = 'translateX(0)';
        }, 100);

        // Remover después de 3 segundos
        setTimeout(() => {
            alert.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(alert);
            }, 300);
        }, 3000);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PastryCalculator();
});

// Funciones globales para acceso desde HTML
function deleteIngredient(id) {
    window.app.deleteIngredient(id);
}

function deleteRecipe(id) {
    window.app.deleteRecipe(id);
}

function openScaleModal(id) {
    window.app.openScaleModal(id);
} 