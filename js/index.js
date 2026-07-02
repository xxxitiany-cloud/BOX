(function () {
  var recipeList = document.getElementById("recipeList");
  var recipeCount = document.getElementById("recipeCount");
  var emptyState = document.getElementById("emptyState");
  var searchInput = document.getElementById("searchInput");
  var allRecipes = [];

  function getFilteredRecipes(query) {
    var keyword = window.app.normalizeText(query);

    if (!keyword) {
      return allRecipes;
    }

    return allRecipes.filter(function (recipe) {
      var matchName = window.app.normalizeText(recipe.name).includes(keyword);
      var matchIngredients = recipe.ingredients.some(function (ingredient) {
        return window.app.normalizeText(ingredient).includes(keyword);
      });

      return matchName || matchIngredients;
    });
  }

  function renderRecipes(recipes) {
    recipeList.innerHTML = "";
    recipeCount.textContent = recipes.length ? "共 " + recipes.length + " 道" : "";
    emptyState.hidden = recipes.length > 0;

    recipes.forEach(function (recipe) {
      var link = document.createElement("a");
      link.className = "recipe-card";
      link.href = "detail.html?id=" + encodeURIComponent(recipe.id);

      link.innerHTML =
        '<img class="recipe-card-image" src="' + window.app.escapeHtml(recipe.image || "assets/placeholder.png") + '" alt="' + window.app.escapeHtml(recipe.name) + '">' +
        '<div class="recipe-card-body">' +
        '<h3 class="recipe-card-title">' + window.app.escapeHtml(recipe.name) + "</h3>" +
        "</div>";

      recipeList.appendChild(link);
    });
  }

  searchInput.addEventListener("input", function (event) {
    renderRecipes(getFilteredRecipes(event.target.value));
  });

  async function init() {
    try {
      var access = await window.auth.requireWorkspaceAccess();

      if (!access) {
        return;
      }

      allRecipes = await window.storage.getRecipes();
      renderRecipes(getFilteredRecipes(""));
    } catch (error) {
      window.app.renderBlockingState({
        title: "加载失败",
        description: error.message || "读取菜谱数据失败，请稍后重试。"
      });
    }
  }

  init();
})();
