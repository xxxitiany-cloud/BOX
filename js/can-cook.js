(function () {
  var cookList = document.getElementById("cookList");
  var cookEmpty = document.getElementById("cookEmpty");

  function renderCookResults(recipes, pantryIngredients) {
    var pantryMap = pantryIngredients.map(function (item) {
      return window.app.normalizeText(item);
    });

    cookList.innerHTML = "";
    cookEmpty.hidden = recipes.length > 0;

    recipes.forEach(function (recipe) {
      var missingIngredients = recipe.ingredients.filter(function (ingredient) {
        return !pantryMap.includes(window.app.normalizeText(ingredient));
      });

      var card = document.createElement("article");
      card.className = "cook-card";

      var top = document.createElement("div");
      top.className = "cook-card-top";

      var title = document.createElement("h2");
      title.textContent = recipe.name;

      var status = document.createElement("span");
      status.className = "cook-status " + (missingIngredients.length ? "cook-status-danger" : "cook-status-success");
      status.textContent = missingIngredients.length ? "❌ 缺少食材" : "✅ 可以制作";

      top.appendChild(title);
      top.appendChild(status);
      card.appendChild(top);

      var description = document.createElement("p");
      description.className = "cook-missing";
      description.textContent = missingIngredients.length
        ? "缺少：" + missingIngredients.join("、")
        : "家里已有所需食材，可以直接开做。";

      card.appendChild(description);
      cookList.appendChild(card);
    });
  }

  async function init() {
    try {
      var access = await window.auth.requireWorkspaceAccess();

      if (!access) {
        return;
      }

      var recipes = await window.storage.getRecipes();
      var pantryIngredients = await window.storage.getPantryIngredients();
      renderCookResults(recipes, pantryIngredients);
    } catch (error) {
      window.app.renderBlockingState({
        title: "加载失败",
        description: window.app.getFriendlyErrorMessage(error, "无法计算当前可做菜谱。")
      });
    }
  }

  init();
})();
