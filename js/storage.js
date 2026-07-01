(function () {
  var RECIPE_KEY = "my-recipes:recipes";
  var PANTRY_KEY = "my-recipes:pantry";

  function readJson(key, fallback) {
    var raw = localStorage.getItem(key);

    if (!raw) {
      return fallback;
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getRecipes() {
    var recipes = readJson(RECIPE_KEY, []);
    return Array.isArray(recipes) ? recipes : [];
  }

  function saveRecipe(recipe) {
    var recipes = getRecipes();
    recipes.unshift(recipe);
    writeJson(RECIPE_KEY, recipes);
    return recipe;
  }

  function updateRecipe(recipeId, nextRecipe) {
    var recipes = getRecipes();
    var updatedRecipes = recipes.map(function (recipe) {
      if (recipe.id !== recipeId) {
        return recipe;
      }

      return {
        id: recipe.id,
        name: nextRecipe.name,
        image: nextRecipe.image,
        ingredients: nextRecipe.ingredients,
        createdAt: recipe.createdAt,
        updatedAt: Date.now()
      };
    });

    writeJson(RECIPE_KEY, updatedRecipes);
    return updatedRecipes.find(function (recipe) {
      return recipe.id === recipeId;
    }) || null;
  }

  function deleteRecipe(recipeId) {
    var recipes = getRecipes();
    var nextRecipes = recipes.filter(function (recipe) {
      return recipe.id !== recipeId;
    });
    var changed = nextRecipes.length !== recipes.length;

    if (changed) {
      writeJson(RECIPE_KEY, nextRecipes);
    }

    return changed;
  }

  function getRecipeById(id) {
    return getRecipes().find(function (recipe) {
      return recipe.id === id;
    }) || null;
  }

  function getPantryIngredients() {
    var items = readJson(PANTRY_KEY, []);
    return Array.isArray(items) ? items : [];
  }

  function savePantryIngredients(items) {
    writeJson(PANTRY_KEY, items);
    return items;
  }

  window.storage = {
    getRecipes: getRecipes,
    saveRecipe: saveRecipe,
    updateRecipe: updateRecipe,
    deleteRecipe: deleteRecipe,
    getRecipeById: getRecipeById,
    getPantryIngredients: getPantryIngredients,
    savePantryIngredients: savePantryIngredients
  };
})();
