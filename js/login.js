(function () {
  var params = new URLSearchParams(window.location.search);
  var nextUrl = "index.html";
  var loginForm = document.getElementById("loginForm");
  var emailInput = document.getElementById("emailInput");
  var loginButton = document.getElementById("loginButton");
  var loginInfo = document.getElementById("loginInfo");

  function renderInfo(title, description, actionsHtml) {
    loginInfo.hidden = false;
    loginInfo.innerHTML =
      "<h2>" + window.app.escapeHtml(title) + "</h2>" +
      '<p class="hero-copy auth-copy">' + window.app.escapeHtml(description) + "</p>" +
      (actionsHtml ? '<div class="action-row auth-actions">' + actionsHtml + "</div>" : "");
  }

  function renderLoggedIn(user) {
    renderInfo(
      "当前已登录",
      user.email || "已登录用户",
      '<a class="button button-primary" href="' + window.app.escapeHtml(nextUrl) + '">进入首页</a>' +
      '<button id="signOutButton" class="button" type="button">退出登录</button>'
    );

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
      await window.auth.signInWithOtp(emailInput.value.trim());
      renderInfo(
        "登录链接已发送",
        "请检查邮箱并点击邮件中的登录链接，登录完成后会回到首页。"
      );
      window.app.showToast("登录链接已发送");
    } catch (error) {
      loginButton.disabled = false;
      window.app.showToast(error.message || "登录失败，请稍后重试");
    }
  });

  async function init() {
    try {
      var user = await window.auth.getCurrentUser();

      if (user) {
        window.location.href = nextUrl;
        return;
      }
      
      renderInfo("未登录", "请输入邮箱，我们会向你发送一个魔法登录链接。");
    } catch (error) {
      window.app.renderBlockingState({
        title: "初始化失败",
        description: error.message || "无法初始化登录页。"
      });
    }
  }

  init();
})();
