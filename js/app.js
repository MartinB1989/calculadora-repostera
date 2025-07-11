// Aplicación principal - Coordinador de módulos
class PastryCalculator {
    constructor() {
        this.ingredientsManager = new IngredientsManager();
        this.recipesManager = new RecipesManager();
        this.uiManager = new UIManager();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDisplay();
    }

    setupEventListeners() {
        // Navegación
        document.querySelectorAll('[data-page]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.target.getAttribute('data-page') || e.target.closest('[data-page]').getAttribute('data-page');
                this.uiManager.showPage(page);
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
            this.uiManager.closeRecipeModal();
        });

        // Scale modal
        document.querySelectorAll('.scale-modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.uiManager.closeScaleModal();
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
                this.uiManager.closeRecipeModal();
            }
        });

        document.getElementById('scale-modal').addEventListener('click', (e) => {
            if (e.target.id === 'scale-modal') {
                this.uiManager.closeScaleModal();
            }
        });
    }

    // Gestión de ingredientes
    addIngredient() {
        try {
            const ingredientData = {
                name: document.getElementById('ingredient-name').value.trim(),
                price: parseFloat(document.getElementById('ingredient-price').value),
                quantity: parseFloat(document.getElementById('ingredient-quantity').value),
                unit: document.getElementById('ingredient-unit').value
            };

            this.ingredientsManager.addIngredient(ingredientData);
            this.updateDisplay();
            this.uiManager.clearIngredientForm();
            this.uiManager.showAlert('Ingrediente agregado exitosamente', 'success');
            this.uiManager.showPage('home');
        } catch (error) {
            this.uiManager.showAlert(error.message, 'error');
        }
    }

    deleteIngredient(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este ingrediente?')) {
            this.ingredientsManager.deleteIngredient(id);
            this.updateDisplay();
            this.uiManager.showAlert('Ingrediente eliminado', 'success');
        }
    }

    // Gestión de recetas
    openRecipeModal() {
        const ingredients = this.ingredientsManager.getAllIngredients();
        if (ingredients.length === 0) {
            this.uiManager.showAlert('Necesitas agregar ingredientes antes de crear una receta', 'error');
            return;
        }

        this.uiManager.openRecipeModal();
    }

    nextStep() {
        try {
            this.uiManager.validateCurrentStep();
            this.uiManager.nextStep();
            
            // Cargar contenido específico según el paso DESPUÉS de avanzar
            const currentStep = this.uiManager.getCurrentStep();
            
            if (currentStep === 3) {
                // Cargar lista de ingredientes para selección
                const ingredients = this.ingredientsManager.getAllIngredients();
                this.uiManager.loadIngredientsSelection(ingredients);
            } else if (currentStep === 4) {
                // Cargar formulario de cantidades
                const currentRecipe = this.uiManager.getCurrentRecipe();
                const selectedIngredients = currentRecipe.ingredients.map(id => 
                    this.ingredientsManager.getIngredient(id)
                );
                this.uiManager.loadQuantitiesForm(selectedIngredients);
            }
        } catch (error) {
            this.uiManager.showAlert(error.message, 'error');
        }
    }

    prevStep() {
        this.uiManager.prevStep();
        
        // Cargar contenido específico según el paso DESPUÉS de retroceder
        const currentStep = this.uiManager.getCurrentStep();
        
        if (currentStep === 3) {
            // Cargar lista de ingredientes para selección
            const ingredients = this.ingredientsManager.getAllIngredients();
            this.uiManager.loadIngredientsSelection(ingredients);
        } else if (currentStep === 4) {
            // Cargar formulario de cantidades
            const currentRecipe = this.uiManager.getCurrentRecipe();
            const selectedIngredients = currentRecipe.ingredients.map(id => 
                this.ingredientsManager.getIngredient(id)
            );
            this.uiManager.loadQuantitiesForm(selectedIngredients);
        }
    }

    calculateRecipe() {
        try {
            const currentRecipe = this.uiManager.getCurrentRecipe();
            
            // Calcular costos usando el módulo de recetas
            const costs = this.recipesManager.calculateRecipeCost(
                this.ingredientsManager,
                currentRecipe.ingredients,
                currentRecipe.quantities,
                currentRecipe.profitMargin
            );

            // Actualizar datos de la receta actual
            this.uiManager.updateCurrentRecipe({
                totalCost: costs.totalCost,
                profit: costs.profit,
                finalPrice: costs.finalPrice
            });

            // Generar y mostrar resultados
            const resultsHTML = this.recipesManager.generateRecipeResults(
                this.ingredientsManager,
                this.uiManager.getCurrentRecipe(),
                this.uiManager.getCurrentRecipe().scaleQuantity !== null,
                this.uiManager.getCurrentRecipe().scaleQuantity
            );

            this.uiManager.displayResults(resultsHTML);
            this.uiManager.nextStep();
        } catch (error) {
            this.uiManager.showAlert(error.message, 'error');
        }
    }

    saveRecipe() {
        try {
            const currentRecipe = this.uiManager.getCurrentRecipe();
            
            // Preparar datos de la receta para guardar
            const recipeData = {
                name: currentRecipe.name,
                description: currentRecipe.description,
                yield: currentRecipe.yield,
                unit: currentRecipe.unit,
                ingredients: currentRecipe.ingredients.map(id => {
                    const ingredient = this.ingredientsManager.getIngredient(id);
                    return {
                        id: ingredient.id,
                        name: ingredient.name,
                        quantity: currentRecipe.quantities[id],
                        unit: ingredient.unit,
                        cost: ingredient.pricePerUnit * currentRecipe.quantities[id]
                    };
                }),
                profitMargin: currentRecipe.profitMargin,
                totalCost: currentRecipe.totalCost,
                profit: currentRecipe.profit,
                finalPrice: currentRecipe.finalPrice,
                moldData: currentRecipe.moldData
            };

            this.recipesManager.createRecipe(recipeData);
            this.updateDisplay();
            this.uiManager.closeRecipeModal();
            this.uiManager.showAlert('Receta guardada exitosamente', 'success');
            this.uiManager.showPage('recipes');
        } catch (error) {
            this.uiManager.showAlert(error.message, 'error');
        }
    }

    deleteRecipe(id) {
        if (confirm('¿Estás seguro de que quieres eliminar esta receta?')) {
            this.recipesManager.deleteRecipe(id);
            this.updateDisplay();
            this.uiManager.showAlert('Receta eliminada', 'success');
        }
    }

    // Modal de escalado
    openScaleModal(recipeId) {
        const recipe = this.recipesManager.getRecipe(recipeId);
        if (!recipe) return;

        this.uiManager.openScaleModal(recipe);
    }

    calculateScaledRecipe() {
        try {
            const recipeId = parseInt(document.getElementById('scale-modal').dataset.recipeId);
            const recipe = this.recipesManager.getRecipe(recipeId);
            
            // Verificar método de escalado
            const scaleMethod = document.querySelector('input[name="scale-method"]:checked').value;
            let scaleFactor;
            let targetQuantity;
            
            if (scaleMethod === 'quantity') {
                targetQuantity = parseFloat(document.getElementById('scale-target-quantity').value);
                if (!targetQuantity || targetQuantity <= 0) {
                    throw new Error('Por favor, ingresa una cantidad válida');
                }
                scaleFactor = targetQuantity / recipe.yield;
            } else if (scaleMethod === 'volume') {
                if (!recipe.moldData) {
                    throw new Error('Esta receta no tiene información de molde');
                }
                
                const newMoldData = this.uiManager.volumeCalculator.getNewMoldDataFromModal();
                const originalVolume = this.uiManager.volumeCalculator.calculateVolume(recipe.moldData);
                const newVolume = this.uiManager.volumeCalculator.calculateVolume(newMoldData);
                
                // Factor de escala basado en volumen (para una unidad)
                const volumeScaleFactor = this.uiManager.volumeCalculator.calculateScaleFactor(originalVolume, newVolume);
                
                // Cantidad de unidades del nuevo tamaño que quiere hacer
                const newSizeQuantity = parseInt(document.getElementById('volume-target-quantity').value) || 1;
                if (newSizeQuantity <= 0) {
                    throw new Error('Por favor, ingresa una cantidad válida de unidades');
                }
                
                // Calcular para la cantidad total deseada del nuevo tamaño
                scaleFactor = volumeScaleFactor * newSizeQuantity;
                targetQuantity = newSizeQuantity; // Las unidades que va a producir
            } else {
                throw new Error('Método de escalado no válido');
            }

            const scaledData = this.recipesManager.calculateScaledRecipe(recipe, targetQuantity);
            
            const unitDisplay = recipe.unit === 'unidad' ? 'unidades' : recipe.unit;
            
            let resultsHTML = `
                <h4>Resultado para ${targetQuantity.toFixed(2)} ${unitDisplay}</h4>
            `;
            
            // Agregar información del escalado por volumen si aplica
            if (scaleMethod === 'volume') {
                const newMoldData = this.uiManager.volumeCalculator.getNewMoldDataFromModal();
                const newMoldDescription = this.uiManager.volumeCalculator.getMoldDescription(newMoldData);
                const originalMoldDescription = this.uiManager.volumeCalculator.getMoldDescription(recipe.moldData);
                const newSizeQuantity = parseInt(document.getElementById('volume-target-quantity').value) || 1;
                const volumeScaleFactor = scaleFactor / newSizeQuantity; // Factor solo por volumen
                
                resultsHTML += `
                    <div class="volume-scaling-info">
                        <h5>Escalado por volumen:</h5>
                        <div class="mold-comparison">
                            <div class="mold-item">
                                <strong>Molde original:</strong> ${originalMoldDescription}
                            </div>
                            <div class="mold-item">
                                <strong>Molde nuevo:</strong> ${newMoldDescription}
                            </div>
                            <div class="scale-factor-display">
                                <i class="fas fa-arrows-alt"></i>
                                <strong>Factor de escala por volumen: ${volumeScaleFactor.toFixed(3)}x</strong>
                            </div>
                            <div class="quantity-info">
                                <i class="fas fa-calculator"></i>
                                <strong>Calculando para: ${newSizeQuantity} ${recipe.unit === 'unidad' ? 'unidades' : recipe.unit} del nuevo tamaño</strong>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            resultsHTML += `
                <div class="scale-calculation">
            `;

            // Si es escalado por volumen, mostrar ingredientes por unidad y total
            if (scaleMethod === 'volume') {
                const newSizeQuantity = parseInt(document.getElementById('volume-target-quantity').value) || 1;
                const volumeScaleFactor = scaleFactor / newSizeQuantity;
                
                resultsHTML += `<h5>Ingredientes por unidad (nuevo tamaño):</h5>`;
                
                // Los ingredientes ya están guardados con la estructura correcta en recipe.ingredients
                recipe.ingredients.forEach(ingredient => {
                    const perUnitQuantity = ingredient.quantity * volumeScaleFactor;
                    const ingUnitDisplay = ingredient.unit === 'unidad' ? 'unidades' : ingredient.unit;
                    resultsHTML += `
                        <div class="result-item">
                            <span>${ingredient.name}</span>
                            <span>${perUnitQuantity.toFixed(2)} ${ingUnitDisplay}</span>
                        </div>
                    `;
                });
                
                resultsHTML += `
                    <hr style="margin: 1rem 0;">
                    <h5>Ingredientes totales (para ${newSizeQuantity} ${recipe.unit === 'unidad' ? 'unidades' : recipe.unit}):</h5>
                `;
                recipe.ingredients.forEach(ingredient => {
                    const totalQuantity = ingredient.quantity * scaleFactor;
                    const ingUnitDisplay = ingredient.unit === 'unidad' ? 'unidades' : ingredient.unit;
                    resultsHTML += `
                        <div class="result-item">
                            <span>${ingredient.name}</span>
                            <span>${totalQuantity.toFixed(2)} ${ingUnitDisplay}</span>
                        </div>
                    `;
                });
            } else {
                // Escalado por cantidad normal
                resultsHTML += `<h5>Ingredientes necesarios:</h5>`;
                recipe.ingredients.forEach(ingredient => {
                    const scaledQuantity = ingredient.quantity * scaledData.scale;
                    const ingUnitDisplay = ingredient.unit === 'unidad' ? 'unidades' : ingredient.unit;
                    resultsHTML += `
                        <div class="result-item">
                            <span>${ingredient.name}</span>
                            <span>${scaledQuantity.toFixed(2)} ${ingUnitDisplay}</span>
                        </div>
                    `;
                });
            }

            resultsHTML += `
                    <hr style="margin: 1rem 0;">
            `;

            // Calcular costos según el método de escalado
            if (scaleMethod === 'volume') {
                const newSizeQuantity = parseInt(document.getElementById('volume-target-quantity').value) || 1;
                const volumeScaleFactor = scaleFactor / newSizeQuantity;
                
                // Costos por unidad del nuevo tamaño
                const costPerNewUnit = recipe.totalCost * volumeScaleFactor;
                const pricePerNewUnit = recipe.finalPrice * volumeScaleFactor;
                
                // Costos totales para la cantidad deseada
                const totalCostForQuantity = costPerNewUnit * newSizeQuantity;
                const totalPriceForQuantity = pricePerNewUnit * newSizeQuantity;
                
                resultsHTML += `
                    <h5>Costos por unidad (nuevo tamaño):</h5>
                    <div class="result-item">
                        <span>Costo por ${recipe.unit === 'unidad' ? 'unidad' : recipe.unit}:</span>
                        <span>$${costPerNewUnit.toFixed(2)}</span>
                    </div>
                    <div class="result-item">
                        <span><strong>Precio por ${recipe.unit === 'unidad' ? 'unidad' : recipe.unit}:</strong></span>
                        <span><strong>$${pricePerNewUnit.toFixed(2)}</strong></span>
                    </div>
                    
                    <hr style="margin: 1rem 0;">
                    <h5>Costos totales (para ${newSizeQuantity} ${recipe.unit === 'unidad' ? 'unidades' : recipe.unit}):</h5>
                    <div class="result-item">
                        <span>Costo total de ingredientes:</span>
                        <span>$${totalCostForQuantity.toFixed(2)}</span>
                    </div>
                    <div class="result-item">
                        <span><strong>Precio de venta total:</strong></span>
                        <span><strong>$${totalPriceForQuantity.toFixed(2)}</strong></span>
                    </div>
                `;
            } else {
                // Escalado por cantidad normal
                resultsHTML += `
                    <h5>Costos:</h5>
                    <div class="result-item">
                        <span>Costo total de ingredientes:</span>
                        <span>$${scaledData.scaledCost.toFixed(2)}</span>
                    </div>
                    <div class="result-item">
                        <span><strong>Precio de venta total:</strong></span>
                        <span><strong>$${scaledData.scaledPrice.toFixed(2)}</strong></span>
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
            }

            resultsHTML += '</div>';
            this.uiManager.displayScaleResults(resultsHTML);
        } catch (error) {
            this.uiManager.showAlert(error.message, 'error');
        }
    }

    // Actualizar todas las vistas
    updateDisplay() {
        const ingredients = this.ingredientsManager.getAllIngredients();
        const recipes = this.recipesManager.getAllRecipes();

        // Renderizar ingredientes
        const ingredientsHTML = this.ingredientsManager.renderIngredients();
        this.uiManager.renderIngredientsGrid(ingredientsHTML);

        // Renderizar recetas
        const recipesHTML = this.recipesManager.renderRecipes();
        this.uiManager.renderRecipesGrid(recipesHTML);

        // Actualizar estados vacíos
        this.uiManager.updateEmptyStates(ingredients.length > 0, recipes.length > 0);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PastryCalculator();
});

// Funciones globales para acceso desde HTML
window.deleteIngredient = function(id) {
    window.app.deleteIngredient(id);
};

window.deleteRecipe = function(id) {
    window.app.deleteRecipe(id);
};

window.openScaleModal = function(id) {
    window.app.openScaleModal(id);
};
