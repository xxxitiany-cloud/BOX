(function () {
  function normalizeRecipe(row) {
    return {
      id: row.id,
      name: row.name,
      image: row.image,
      ingredients: Array.isArray(row.ingredients) ? row.ingredients : [],
      createdAt: row.created_at,
      workspaceId: row.workspace_id
    };
  }

  function normalizePantryRow(row) {
    return {
      id: row.id,
      item: row.item,
      createdAt: row.created_at,
      workspaceId: row.workspace_id
    };
  }

  async function getRecipes() {
    var client = window.supabaseClient.getClient();
    var result = await client
      .from("recipes")
      .select("id, name, ingredients, image, created_at, workspace_id")
      .eq("workspace_id", window.supabaseConfig.workspaceId)
      .order("created_at", { ascending: false });

    if (result.error) {
      throw result.error;
    }

    return result.data.map(normalizeRecipe);
  }

  async function saveRecipe(recipe) {
    var client = window.supabaseClient.getClient();
    var payload = {
      name: recipe.name,
      image: recipe.image,
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
      workspace_id: window.supabaseConfig.workspaceId
    };
    var result = await client
      .from("recipes")
      .insert([payload])
      .select("id, name, ingredients, image, created_at, workspace_id")
      .single();

    console.log("[recipes.insert]", {
      payload: payload,
      data: result.data,
      error: result.error
    });

    if (result.error) {
      throw result.error;
    }

    if (!result.data) {
      throw new Error("菜谱写入失败：未返回数据");
    }

    return normalizeRecipe(result.data);
  }

  async function updateRecipe(recipeId, nextRecipe) {
    var client = window.supabaseClient.getClient();
    var result = await client
      .from("recipes")
      .update({
        name: nextRecipe.name,
        image: nextRecipe.image,
        ingredients: nextRecipe.ingredients
      })
      .eq("id", recipeId)
      .eq("workspace_id", window.supabaseConfig.workspaceId)
      .select("id, name, ingredients, image, created_at, workspace_id")
      .single();

    if (result.error) {
      throw result.error;
    }

    return normalizeRecipe(result.data);
  }

  async function deleteRecipe(recipeId) {
    var client = window.supabaseClient.getClient();
    var result = await client
      .from("recipes")
      .delete()
      .eq("id", recipeId)
      .eq("workspace_id", window.supabaseConfig.workspaceId);

    if (result.error) {
      throw result.error;
    }

    return true;
  }

  async function getRecipeById(id) {
    var client = window.supabaseClient.getClient();
    var result = await client
      .from("recipes")
      .select("id, name, ingredients, image, created_at, workspace_id")
      .eq("id", id)
      .eq("workspace_id", window.supabaseConfig.workspaceId)
      .maybeSingle();

    if (result.error) {
      throw result.error;
    }

    return result.data ? normalizeRecipe(result.data) : null;
  }

  async function getPantryRecords() {
    var client = window.supabaseClient.getClient();
    var result = await client
      .from("pantry")
      .select("id, item, created_at, workspace_id")
      .eq("workspace_id", window.supabaseConfig.workspaceId)
      .order("created_at", { ascending: true });

    if (result.error) {
      throw result.error;
    }

    return result.data.map(normalizePantryRow);
  }

  async function getPantryIngredients() {
    var records = await getPantryRecords();
    return records.map(function (record) {
      return record.item;
    });
  }

  async function addPantryItem(item) {
    var client = window.supabaseClient.getClient();
    var result = await client
      .from("pantry")
      .insert([{
        item: item,
        workspace_id: window.supabaseConfig.workspaceId
      }])
      .select("id, item, created_at, workspace_id")
      .single();

    if (result.error) {
      throw result.error;
    }

    return normalizePantryRow(result.data);
  }

  async function deletePantryItem(id) {
    var client = window.supabaseClient.getClient();
    var result = await client
      .from("pantry")
      .delete()
      .eq("id", id)
      .eq("workspace_id", window.supabaseConfig.workspaceId);

    if (result.error) {
      throw result.error;
    }

    return true;
  }

  window.storage = {
    getRecipes: getRecipes,
    saveRecipe: saveRecipe,
    updateRecipe: updateRecipe,
    deleteRecipe: deleteRecipe,
    getRecipeById: getRecipeById,
    getPantryRecords: getPantryRecords,
    getPantryIngredients: getPantryIngredients,
    addPantryItem: addPantryItem,
    deletePantryItem: deletePantryItem
  };
})();
