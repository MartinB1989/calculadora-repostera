// Módulo para gestión de ingredientes
export class IngredientsManager {
    constructor() {
        this.ingredients = this.loadIngredients();
    }

    addIngredient(ingredientData) {
        const { name, price, quantity, unit } = ingredientData;

        if (!name || !price || !quantity || !unit) {
            throw new Error('Por favor, completa todos los campos');
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
        return ingredient;
    }

    deleteIngredient(id) {
        this.ingredients = this.ingredients.filter(ing => ing.id !== id);
        this.saveIngredients();
    }

    getIngredient(id) {
        return this.ingredients.find(ing => ing.id === id);
    }

    getAllIngredients() {
        return this.ingredients;
    }

    renderIngredients() {
        if (this.ingredients.length === 0) {
            return '';
        }

        return this.ingredients.map(ingredient => {
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
                        <button class="btn-icon" onclick="window.app.deleteIngredient(${ingredient.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Almacenamiento local
    saveIngredients() {
        localStorage.setItem('pastry-ingredients', JSON.stringify(this.ingredients));
    }

    loadIngredients() {
        const saved = localStorage.getItem('pastry-ingredients');
        return saved ? JSON.parse(saved) : [];
    }
} 