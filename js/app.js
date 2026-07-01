(function () {
  function normalizeText(value) {
    return String(value || "").trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function createId() {
    return "recipe_" + Date.now() + "_" + Math.random().toString(16).slice(2, 8);
  }

  function showToast(message) {
    var toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(function () {
      toast.classList.add("show");
    });

    setTimeout(function () {
      toast.classList.remove("show");
      setTimeout(function () {
        toast.remove();
      }, 220);
    }, 1800);
  }

  function fileToDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function (event) {
        resolve(event.target.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function renderTags(container, items, onRemove) {
    container.innerHTML = "";

    items.forEach(function (item, index) {
      var tag = document.createElement("div");
      tag.className = "tag";

      var label = document.createElement("span");
      label.textContent = item;

      var removeButton = document.createElement("button");
      removeButton.className = "tag-remove";
      removeButton.type = "button";
      removeButton.setAttribute("aria-label", "删除 " + item);
      removeButton.textContent = "×";
      removeButton.addEventListener("click", function () {
        onRemove(index);
      });

      tag.appendChild(label);
      tag.appendChild(removeButton);
      container.appendChild(tag);
    });
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {
        return null;
      });
    });
  }

  registerServiceWorker();

  window.app = {
    normalizeText: normalizeText,
    escapeHtml: escapeHtml,
    createId: createId,
    showToast: showToast,
    fileToDataUrl: fileToDataUrl,
    renderTags: renderTags
  };
})();
