(function () {
  var pantryInput = document.getElementById("pantryInput");
  var addPantryButton = document.getElementById("addPantryButton");
  var pantryList = document.getElementById("pantryList");
  var pantryEmpty = document.getElementById("pantryEmpty");
  var pantryRecords = [];

  function renderPantry() {
    pantryList.innerHTML = "";
    pantryEmpty.hidden = pantryRecords.length > 0;

    pantryRecords.forEach(function (record) {
      var tag = document.createElement("div");
      tag.className = "tag";

      var label = document.createElement("span");
      label.textContent = record.item;

      var removeButton = document.createElement("button");
      removeButton.className = "tag-remove";
      removeButton.type = "button";
      removeButton.setAttribute("aria-label", "删除 " + record.item);
      removeButton.textContent = "×";
      removeButton.addEventListener("click", async function () {
        try {
          await window.storage.deletePantryItem(record.id);
          pantryRecords = pantryRecords.filter(function (item) {
            return item.id !== record.id;
          });
          renderPantry();
        } catch (error) {
          window.app.showToast(error.message || "删除失败，请稍后重试");
        }
      });

      tag.appendChild(label);
      tag.appendChild(removeButton);
      pantryList.appendChild(tag);
    });
  }

  async function addPantryItem() {
    var value = pantryInput.value.trim();

    if (!value) {
      return;
    }

    var exists = pantryRecords.some(function (record) {
      return window.app.normalizeText(record.item) === window.app.normalizeText(value);
    });

    if (exists) {
      window.app.showToast("这个食材已经存在");
      pantryInput.value = "";
      pantryInput.focus();
      return;
    }

    addPantryButton.disabled = true;

    try {
      var record = await window.storage.addPantryItem(value);
      pantryRecords.push(record);
      pantryInput.value = "";
      pantryInput.focus();
      renderPantry();
    } catch (error) {
      window.app.showToast(error.message || "添加失败，请稍后重试");
    } finally {
      addPantryButton.disabled = false;
    }
  }

  addPantryButton.addEventListener("click", addPantryItem);
  pantryInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      addPantryItem();
    }
  });

  async function init() {
    try {
      var access = await window.auth.requireWorkspaceAccess();

      if (!access) {
        return;
      }

      pantryRecords = await window.storage.getPantryRecords();
      renderPantry();
    } catch (error) {
      window.app.renderBlockingState({
        title: "加载失败",
        description: error.message || "读取食材数据失败，请稍后重试。"
      });
    }
  }

  init();
})();
