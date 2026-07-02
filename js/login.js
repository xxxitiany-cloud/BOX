(function () {
  var params = new URLSearchParams(window.location.search);
  var nextUrl = params.get("next") || "index.html";
  var loginForm = document.getElementById("loginForm");
  var emailInput = document.getElementById("emailInput");
  var passwordInput = document.getElementById("passwordInput");
  var loginButton = document.getElementById("loginButton");
  var loginInfo = document.getElementById("loginInfo");

  function renderLoggedIn(user) {
    loginInfo.hidden = false;
    loginInfo.innerHTML =
      "<h2>当前已登录</h2>" +
      '<p class="hero-copy auth-copy">' + window.app.escapeHtml(user.email || "已登录用户") + "</p>" +
      '<div class="action-row auth-actions">' +
      '<a class="button button-primary" href="' + window.app.escapeHtml(nextUrl) + '">继续进入</a>' +
      '<button id="signOutButton" class="button" type="button">退出登录</button>' +
      "</div>";

    document.getElementById("signOutButton").addEventListener("click", async function () {
      try {
        await window.auth.signOut();
        window.location.reload();
      } catch (error) {
        window.app.showToast(error.message || "退出失败，请稍后重试");
      }
    });
  }

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    loginButton.disabled = true;

    try {
      await window.auth.signInWithPassword(emailInput.value.trim(), passwordInput.value);
      window.app.showToast("登录成功");
      setTimeout(function () {
        window.location.href = nextUrl;
      }, 300);
    } catch (error) {
      loginButton.disabled = false;
      window.app.showToast(error.message || "登录失败，请检查邮箱和密码");
    }
  });

  async function init() {
    try {
      var user = await window.auth.getCurrentUser();

      if (user) {
        renderLoggedIn(user);
      }
    } catch (error) {
      window.app.renderBlockingState({
        title: "初始化失败",
        description: error.message || "无法初始化登录页。"
      });
    }
  }

  init();
})();
