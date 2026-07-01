(function () {
  var params = new URLSearchParams(window.location.search);
  var recipeId = params.get("id");
  var recipe = recipeId ? window.storage.getRecipeById(recipeId) : null;

  var detailCard = document.getElementById("detailCard");
  var detailEmpty = document.getElementById("detailEmpty");

  if (!recipe) {
    detailEmpty.hidden = false;
    return;
  }

  document.getElementById("detailImage").src = recipe.image;
  document.getElementById("detailImage").alt = recipe.name;
  document.getElementById("detailName").textContent = recipe.name;
  document.getElementById("editRecipeButton").href = "add.html?id=" + encodeURIComponent(recipe.id);

  var ingredientList = document.getElementById("detailIngredients");
  recipe.ingredients.forEach(function (ingredient) {
    var item = document.createElement("li");
    item.textContent = ingredient;
    ingredientList.appendChild(item);
  });

  document.getElementById("deleteRecipeButton").addEventListener("click", function () {
    var confirmed = window.confirm("确定删除这道菜谱吗？");

    if (!confirmed) {
      return;
    }

    var deleted = window.storage.deleteRecipe(recipe.id);

    if (!deleted) {
      window.app.showToast("删除失败，请重试");
      return;
    }

    window.app.showToast("菜谱已删除");
    setTimeout(function () {
      window.location.href = "index.html";
    }, 250);
  });

  detailCard.hidden = false;
})();
