(function () {
  var params = new URLSearchParams(window.location.search);
  var editingRecipeId = params.get("id");
  var editingRecipe = editingRecipeId ? window.storage.getRecipeById(editingRecipeId) : null;

  var pageTitle = document.getElementById("pageTitle");
  var submitButton = document.getElementById("submitButton");
  var imageFieldLabel = document.getElementById("imageFieldLabel");
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

  function syncTags() {
    window.app.renderTags(ingredientTags, ingredients, function (index) {
      ingredients.splice(index, 1);
      syncTags();
    });
  }

  function addIngredient() {
    var value = ingredientInput.value.trim();

    if (!value) {
      return;
    }

    if (ingredients.includes(value)) {
      window.app.showToast("这个食材已经添加过了");
      ingredientInput.value = "";
      ingredientInput.focus();
      return;
    }

    ingredients.push(value);
    ingredientInput.value = "";
    ingredientInput.focus();
    syncTags();
  }

  function setEditMode(recipe) {
    document.title = "编辑菜谱";
    pageTitle.textContent = "编辑菜谱";
    submitButton.textContent = "保存修改";
    imageFieldLabel.textContent = "菜品图片";
    imageHint.hidden = false;
    recipeNameInput.value = recipe.name;
    imagePreview.src = recipe.image;
    imageDataUrl = recipe.image;
    ingredients = recipe.ingredients.slice();
    syncTags();
  }

  function init() {
    if (!editingRecipeId) {
      recipeImageInput.required = true;
      return;
    }

    if (!editingRecipe) {
      window.app.showToast("没有找到要编辑的菜谱");
      setTimeout(function () {
        window.location.href = "index.html";
      }, 700);
      return;
    }

    setEditMode(editingRecipe);
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
      imageDataUrl = editingRecipe ? editingRecipe.image : "";
      imagePreview.src = imageDataUrl || "assets/placeholder.png";
      window.app.showToast("图片读取失败，请重试");
    });
  });

  recipeForm.addEventListener("submit", function (event) {
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

    if (editingRecipe) {
      window.storage.updateRecipe(editingRecipe.id, {
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

    window.storage.saveRecipe({
      id: window.app.createId(),
      name: name,
      image: imageDataUrl,
      ingredients: ingredients.slice(),
      createdAt: Date.now()
    });

    window.app.showToast("菜谱已保存");
    setTimeout(function () {
      window.location.href = "index.html";
    }, 500);
  });

  syncTags();
  init();
})();
