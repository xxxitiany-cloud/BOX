(function () {
  var params = new URLSearchParams(window.location.search);
  var recipeId = params.get("id");
  var detailCard = document.getElementById("detailCard");
  var detailEmpty = document.getElementById("detailEmpty");

  function renderRecipe(recipe) {
    document.getElementById("detailImage").src = recipe.image || "assets/placeholder.png";
    document.getElementById("detailImage").alt = recipe.name;
    document.getElementById("detailName").textContent = recipe.name;
    document.getElementById("editRecipeButton").href = "add.html?id=" + encodeURIComponent(recipe.id);

    var ingredientList = document.getElementById("detailIngredients");
    ingredientList.innerHTML = "";
    recipe.ingredients.forEach(function (ingredient) {
      var item = document.createElement("li");
      item.textContent = ingredient;
      ingredientList.appendChild(item);
    });

    document.getElementById("deleteRecipeButton").addEventListener("click", async function () {
      var confirmed = window.confirm("确定删除这道菜谱吗？");

      if (!confirmed) {
        return;
      }

      try {
        await window.storage.deleteRecipe(recipe.id);
        window.app.showToast("菜谱已删除");
        setTimeout(function () {
          window.location.href = "index.html";
        }, 250);
      } catch (error) {
        window.app.showToast(error.message || "删除失败，请重试");
      }
    });

    detailCard.hidden = false;
  }

  async function init() {
    try {
      var access = await window.auth.requireWorkspaceAccess();

      if (!access) {
        return;
      }

      if (!recipeId) {
        detailEmpty.hidden = false;
        return;
      }

      var recipe = await window.storage.getRecipeById(recipeId);

      if (!recipe) {
        detailEmpty.hidden = false;
        return;
      }

      renderRecipe(recipe);
    } catch (error) {
      window.app.renderBlockingState({
        title: "加载失败",
        description: error.message || "读取菜谱详情失败，请稍后重试。"
      });
    }
  }

  init();
})();
