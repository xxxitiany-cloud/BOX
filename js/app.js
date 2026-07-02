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

  function renderBlockingState(options) {
    var shell = document.querySelector(".app-shell");
    var actions = options.actions || [];
    var actionHtml = actions.map(function (action) {
      var className = action.primary ? "button button-primary" : "button";
      return '<a class="' + className + '" href="' + escapeHtml(action.href) + '">' + escapeHtml(action.label) + "</a>";
    }).join("");

    shell.innerHTML =
      '<section class="panel state-panel">' +
      '<div class="section-heading state-heading">' +
      "<h2>" + escapeHtml(options.title) + "</h2>" +
      "</div>" +
      '<p class="hero-copy">' + escapeHtml(options.description) + "</p>" +
      (actionHtml ? '<div class="action-row state-actions">' + actionHtml + "</div>" : "") +
      "</section>";
  }

  function parseIngredientsInput(value) {
    return String(value || "")
      .split(",")
      .map(function (item) {
        return item.trim();
      })
      .filter(Boolean);
  }

  function getFriendlyErrorMessage(error, fallback) {
    var message = String((error && error.message) || "");
    var lower = message.toLowerCase();

    if (lower.includes("infinite recursion detected in policy")) {
      return "当前工作区权限策略配置异常，请先修复 Supabase 的 RLS 策略。";
    }

    if (lower.includes("row-level security")) {
      return "你当前没有权限访问这部分数据。";
    }

    return message || fallback;
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
    renderTags: renderTags,
    renderBlockingState: renderBlockingState,
    parseIngredientsInput: parseIngredientsInput,
    getFriendlyErrorMessage: getFriendlyErrorMessage
  };
})();
