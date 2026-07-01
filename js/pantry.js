(function () {
  var pantryInput = document.getElementById("pantryInput");
  var addPantryButton = document.getElementById("addPantryButton");
  var pantryList = document.getElementById("pantryList");
  var pantryEmpty = document.getElementById("pantryEmpty");

  function renderPantry() {
    var items = window.storage.getPantryIngredients();
    pantryList.innerHTML = "";
    pantryEmpty.hidden = items.length > 0;

    window.app.renderTags(pantryList, items, function (index) {
      items.splice(index, 1);
      window.storage.savePantryIngredients(items);
      renderPantry();
    });
  }

  function addPantryItem() {
    var value = pantryInput.value.trim();

    if (!value) {
      return;
    }

    var items = window.storage.getPantryIngredients();

    if (items.includes(value)) {
      window.app.showToast("这个食材已经存在");
      pantryInput.value = "";
      pantryInput.focus();
      return;
    }

    items.push(value);
    window.storage.savePantryIngredients(items);
    pantryInput.value = "";
    pantryInput.focus();
    renderPantry();
  }

  addPantryButton.addEventListener("click", addPantryItem);
  pantryInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      addPantryItem();
    }
  });

  renderPantry();
})();
