(function () {
  var params = new URLSearchParams(window.location.search);
  var editingRecipeId = params.get("id");

  var pageTitle = document.getElementById("pageTitle");
  var submitButton = document.getElementById("submitButton");
  var imageHint = document.getElementById("imageHint");
  var recipeForm = document.getElementById("recipeForm");
  var recipeNameInput = document.getElementById("recipeName");
  var recipeImageInput = document.getElementById("recipeImage");
  var imagePreview = document.getElementById("imagePreview");
  var ingredientInput = document.getElementById("ingredientInput");
  var addIngredientButton = document.getElementById("addIngredientButton");
  var ingredientTags = document.getElementById("ingredientTags");

  var ingredients = [];
  var imageDataUrl = "";
  var editingRecipe = null;

  function syncTags() {
    window.app.renderTags(ingredientTags, ingredients, function (index) {
      ingredients.splice(index, 1);
      syncTags();
    });
  }

  function addIngredient() {
    var rawValue = ingredientInput.value.trim();

    if (!rawValue) {
      return;
    }

    var items = window.app.parseIngredientsInput(rawValue);

    if (!items.length) {
      return;
    }

    items.forEach(function (item) {
      if (!ingredients.includes(item)) {
        ingredients.push(item);
      }
    });

    ingredientInput.value = "";
    ingredientInput.focus();
    syncTags();
  }

  function setEditMode(recipe) {
    document.title = "编辑菜谱";
    pageTitle.textContent = "编辑菜谱";
    submitButton.textContent = "保存修改";
    imageHint.hidden = false;
    recipeNameInput.value = recipe.name;
    imagePreview.src = recipe.image || "assets/placeholder.png";
    imageDataUrl = recipe.image || "";
    ingredients = recipe.ingredients.slice();
    syncTags();
  }

  addIngredientButton.addEventListener("click", addIngredient);
  ingredientInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      addIngredient();
    }
  });

  recipeImageInput.addEventListener("change", function (event) {
    var file = event.target.files[0];

    if (!file) {
      if (!editingRecipe) {
        imageDataUrl = "";
        imagePreview.src = "assets/placeholder.png";
      }
      return;
    }

    window.app.fileToDataUrl(file).then(function (result) {
      imageDataUrl = result;
      imagePreview.src = result;
    }).catch(function () {
      imageDataUrl = editingRecipe ? (editingRecipe.image || "") : "";
      imagePreview.src = imageDataUrl || "assets/placeholder.png";
      window.app.showToast("图片读取失败，请重试");
    });
  });

  recipeForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    var name = recipeNameInput.value.trim();

    if (!name) {
      window.app.showToast("请输入菜名");
      return;
    }

    if (!imageDataUrl) {
      window.app.showToast("请上传一张图片");
      return;
    }

    if (!ingredients.length) {
      window.app.showToast("请至少添加一个食材");
      return;
    }

    submitButton.disabled = true;

    try {
      if (editingRecipe) {
        await window.storage.updateRecipe(editingRecipe.id, {
          name: name,
          image: imageDataUrl,
          ingredients: ingredients.slice()
        });

        window.app.showToast("菜谱已更新");
        setTimeout(function () {
          window.location.href = "detail.html?id=" + encodeURIComponent(editingRecipe.id);
        }, 500);
        return;
      }

      await window.storage.saveRecipe({
        name: name,
        image: imageDataUrl,
        ingredients: ingredients.slice()
      });

      window.app.showToast("菜谱已保存");
      setTimeout(function () {
        window.location.href = "index.html";
      }, 500);
    } catch (error) {
      submitButton.disabled = false;
      window.app.showToast(window.app.getFriendlyErrorMessage(error, "保存失败，请稍后重试"));
    }
  });

  async function init() {
    try {
      var access = await window.auth.requireWorkspaceAccess();

      if (!access) {
        return;
      }

      if (!editingRecipeId) {
        recipeImageInput.required = true;
        syncTags();
        return;
      }

      editingRecipe = await window.storage.getRecipeById(editingRecipeId);

      if (!editingRecipe) {
        window.app.showToast("没有找到要编辑的菜谱");
        setTimeout(function () {
          window.location.href = "index.html";
        }, 700);
        return;
      }

      setEditMode(editingRecipe);
    } catch (error) {
      window.app.renderBlockingState({
        title: "加载失败",
        description: window.app.getFriendlyErrorMessage(error, "无法初始化当前页面。")
      });
      return;
    }
  }

  syncTags();
  init();
})();
