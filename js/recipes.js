// Módulo para gestión de recetas
class RecipesManager {
    constructor() {
        this.recipes = this.loadRecipes();
    }

    createRecipe(recipeData) {
        const recipe = {
            id: Date.now(),
            name: recipeData.name,
            description: recipeData.description,
            yield: recipeData.yield,
            unit: recipeData.unit,
            ingredients: recipeData.ingredients,
            profitMargin: recipeData.profitMargin,
            totalCost: recipeData.totalCost,
            profit: recipeData.profit,
            finalPrice: recipeData.finalPrice,
            costPerUnit: recipeData.totalCost / recipeData.yield,
            pricePerUnit: recipeData.finalPrice / recipeData.yield,
            createdAt: new Date().toISOString()
        };

        this.recipes.push(recipe);
        this.saveRecipes();
        return recipe;
    }

    deleteRecipe(id) {
        this.recipes = this.recipes.filter(recipe => recipe.id !== id);
        this.saveRecipes();
    }

    getRecipe(id) {
        return this.recipes.find(recipe => recipe.id === id);
    }

    getAllRecipes() {
        return this.recipes;
    }

    calculateRecipeCost(ingredientsManager, selectedIngredients, quantities, profitMargin = 0) {
        let totalCost = 0;

        selectedIngredients.forEach(ingredientId => {
            const ingredient = ingredientsManager.getIngredient(ingredientId);
            const usedQuantity = quantities[ingredientId];
            const cost = ingredient.pricePerUnit * usedQuantity;
            totalCost += cost;
        });

        const profitAmount = totalCost * (profitMargin / 100);
        const finalPrice = totalCost + profitAmount;

        return {
            totalCost,
            profit: profitAmount,
            finalPrice
        };
    }

    calculateScaledRecipe(recipe, targetQuantity) {
        const scale = targetQuantity / recipe.yield;
        const scaledCost = recipe.totalCost * scale;
        const scaledPrice = recipe.finalPrice * scale;

        return {
            scale,
            scaledCost,
            scaledPrice,
            scaledIngredients: recipe.ingredients.map(ingredient => ({
                ...ingredient,
                quantity: ingredient.quantity * scale
            }))
        };
    }

    renderRecipes() {
        if (this.recipes.length === 0) {
            return '';
        }

        return this.recipes.map(recipe => {
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
                            <strong>Precio de venta: $${recipe.finalPrice.toFixed(2)}</strong>
                        </div>
                        ${recipe.yield > 1 ? `
                            <div style="margin-top: 0.5rem; font-size: 0.9em;">
                                <span>Costo por ${recipe.unit === 'unidad' ? 'unidad' : recipe.unit}: $${recipe.costPerUnit.toFixed(2)}</span>
                                <strong>Precio por ${recipe.unit === 'unidad' ? 'unidad' : recipe.unit}: $${recipe.pricePerUnit.toFixed(2)}</strong>
                            </div>
                        ` : ''}
                    </div>
                    <div class="recipe-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                        <button class="btn btn-sm btn-primary" onclick="window.app.openScaleModal(${recipe.id})" title="Calcular para otra cantidad">
                            <i class="fas fa-calculator"></i> Calcular
                        </button>
                        <button class="btn-icon" onclick="window.app.deleteRecipe(${recipe.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    generateRecipeResults(ingredientsManager, recipeData, isScaled = false, targetQuantity = null) {
        const scale = isScaled && targetQuantity ? targetQuantity / recipeData.yield : 1;
        const displayQuantity = isScaled && targetQuantity ? targetQuantity : recipeData.yield;
        
        let resultsHTML = `<h4>Receta: ${recipeData.name}</h4>`;
        
        if (isScaled && targetQuantity) {
            resultsHTML += `<p><strong>Calculando para ${displayQuantity} ${recipeData.unit === 'unidad' ? 'unidades' : recipeData.unit}</strong></p>`;
        } else {
            resultsHTML += `<p><strong>Cantidad original: ${recipeData.yield} ${recipeData.unit === 'unidad' ? 'unidades' : recipeData.unit}</strong></p>`;
        }

        resultsHTML += '<h5>Desglose de ingredientes:</h5>';
        
        recipeData.ingredients.forEach(ingredientId => {
            const ingredient = ingredientsManager.getIngredient(ingredientId);
            const originalQuantity = recipeData.quantities[ingredientId];
            const scaledQuantity = originalQuantity * scale;
            const cost = ingredient.pricePerUnit * scaledQuantity;
            
            resultsHTML += `
                <div class="result-item">
                    <span>${ingredient.name} (${scaledQuantity.toFixed(2)} ${ingredient.unit})</span>
                    <span>$${cost.toFixed(2)}</span>
                </div>
            `;
        });

        const scaledCost = recipeData.totalCost * scale;
        const scaledProfit = recipeData.profit * scale;
        const scaledFinalPrice = recipeData.finalPrice * scale;

        resultsHTML += `
            <div class="result-item">
                <span>Costo total de ingredientes:</span>
                <span>$${scaledCost.toFixed(2)}</span>
            </div>
            <div class="result-item">
                <span>Ganancia (${recipeData.profitMargin}%):</span>
                <span>$${scaledProfit.toFixed(2)}</span>
            </div>
            <div class="result-item">
                <span><strong>Precio final sugerido:</strong></span>
                <span><strong>$${scaledFinalPrice.toFixed(2)}</strong></span>
            </div>
        `;

        // Mostrar costo por unidad si la receta produce múltiples unidades
        if (displayQuantity > 1) {
            const costPerUnit = scaledCost / displayQuantity;
            const pricePerUnit = scaledFinalPrice / displayQuantity;
            
            resultsHTML += `
                <hr style="margin: 1rem 0;">
                <h5>Costo por unidad:</h5>
                <div class="result-item">
                    <span>Costo por ${recipeData.unit === 'unidad' ? 'unidad' : recipeData.unit}:</span>
                    <span>$${costPerUnit.toFixed(2)}</span>
                </div>
                <div class="result-item">
                    <span><strong>Precio de venta por ${recipeData.unit === 'unidad' ? 'unidad' : recipeData.unit}:</strong></span>
                    <span><strong>$${pricePerUnit.toFixed(2)}</strong></span>
                </div>
            `;
        }

        return resultsHTML;
    }

    // Almacenamiento local
    saveRecipes() {
        localStorage.setItem('pastry-recipes', JSON.stringify(this.recipes));
    }

    loadRecipes() {
        const saved = localStorage.getItem('pastry-recipes');
        return saved ? JSON.parse(saved) : [];
    }
} 