// Clase principal de la aplicación
class PastryCalculator {
    constructor() {
        this.ingredients = this.loadIngredients();
        this.recipes = this.loadRecipes();
        this.currentStep = 1;
        this.currentRecipe = {
            name: '',
            ingredients: [],
            quantities: {},
            profitMargin: 0,
            cost: 0,
            finalPrice: 0
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
            ingredients: [],
            quantities: {},
            profitMargin: 0,
            cost: 0,
            profit: 0,
            finalPrice: 0
        };

        document.getElementById('recipe-modal').classList.add('active');
        this.updateStep();
    }

    closeRecipeModal() {
        document.getElementById('recipe-modal').classList.remove('active');
        document.getElementById('recipe-name').value = '';
        document.getElementById('profit-margin').value = '20'; // Restablecer al valor predeterminado
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
        document.getElementById('next-step').style.display = this.currentStep < 5 ? 'inline-flex' : 'none';
        document.getElementById('calculate-recipe').style.display = this.currentStep === 4 ? 'inline-flex' : 'none';
        document.getElementById('save-recipe').style.display = this.currentStep === 5 ? 'inline-flex' : 'none';

        // Cargar contenido específico del paso
        this.loadStepContent();
    }

    getStepName() {
        const steps = ['name', 'ingredients', 'quantities', 'profit', 'results'];
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
                if (!recipeName) {
                    this.showAlert('Por favor, ingresa el nombre de la receta', 'error');
                    return false;
                }
                this.currentRecipe.name = recipeName;
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
                console.log('Validación paso 4 - Porcentaje de ganancia:', profitMargin);
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

        // Calcular costo total
        this.currentRecipe.ingredients.forEach(ingredientId => {
            const ingredient = this.ingredients.find(ing => ing.id === ingredientId);
            const usedQuantity = this.currentRecipe.quantities[ingredientId];
            const cost = ingredient.pricePerUnit * usedQuantity;
            totalCost += cost;
        });

        this.currentRecipe.cost = totalCost;
        
        // Obtener el porcentaje de ganancia directamente del input para asegurar que sea el valor actual
        const profitMarginInput = document.getElementById('profit-margin').value;
        let profitMargin = parseFloat(profitMarginInput);
        
        // Si el campo está vacío o es NaN, usar 0
        if (isNaN(profitMargin) || profitMarginInput === '' || profitMarginInput === null) {
            profitMargin = 0;
        }
        
        // Actualizar el valor en el objeto de receta
        this.currentRecipe.profitMargin = profitMargin;
        
        // Calcular ganancia y precio final
        const profitAmount = totalCost * (profitMargin / 100);
        this.currentRecipe.profit = profitAmount;
        this.currentRecipe.finalPrice = totalCost + profitAmount;

        console.log('Cálculo de receta:', {
            costoTotal: totalCost,
            porcentajeGanancia: profitMargin,
            cantidadGanancia: profitAmount,
            precioFinal: this.currentRecipe.finalPrice,
            inputValue: profitMarginInput
        });

        this.displayResults();
        this.nextStep();
    }

    displayResults() {
        const container = document.getElementById('recipe-results');
        const selectedIngredients = this.currentRecipe.ingredients.map(id => 
            this.ingredients.find(ing => ing.id === id)
        );

        let resultsHTML = '<h4>Desglose de costos:</h4>';
        
        selectedIngredients.forEach(ingredient => {
            const usedQuantity = this.currentRecipe.quantities[ingredient.id];
            const cost = ingredient.pricePerUnit * usedQuantity;
            
            resultsHTML += `
                <div class="result-item">
                    <span>${ingredient.name} (${usedQuantity} ${ingredient.unit})</span>
                    <span>$${cost.toFixed(2)}</span>
                </div>
            `;
        });

        resultsHTML += `
            <div class="result-item">
                <span>Costo total de ingredientes:</span>
                <span>$${this.currentRecipe.cost.toFixed(2)}</span>
            </div>
            <div class="result-item">
                <span>Ganancia (${this.currentRecipe.profitMargin}%):</span>
                <span>$${this.currentRecipe.profit.toFixed(2)}</span>
            </div>
            <div class="result-item">
                <span><strong>Precio final sugerido:</strong></span>
                <span><strong>$${this.currentRecipe.finalPrice.toFixed(2)}</strong></span>
            </div>
        `;

        container.innerHTML = resultsHTML;
    }

    saveRecipe() {
        const recipe = {
            id: Date.now(),
            name: this.currentRecipe.name,
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

        grid.innerHTML = this.recipes.map(recipe => `
            <div class="recipe-card">
                <h3>${recipe.name}</h3>
                <div class="recipe-ingredients">
                    <h4>Ingredientes:</h4>
                    <ul>
                        ${recipe.ingredients.map(ing => {
                            const unitDisplay = ing.unit === 'unidad' ? 'unidades' : ing.unit;
                            return `<li>${ing.name} (${ing.quantity} ${unitDisplay})</li>`;
                        }).join('')}
                    </ul>
                </div>
                <div class="recipe-cost">
                    <span>Costo: $${recipe.totalCost.toFixed(2)}</span>
                    <strong>Precio: $${recipe.finalPrice.toFixed(2)}</strong>
                </div>
                <div class="ingredient-actions" style="margin-top: 1rem;">
                    <button class="btn-icon" onclick="app.deleteRecipe(${recipe.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
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