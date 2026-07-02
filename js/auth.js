(function () {
  function buildLoginUrl() {
    var next = window.location.pathname.split("/").pop() || "index.html";

    if (window.location.search) {
      next += window.location.search;
    }

    return "login.html?next=" + encodeURIComponent(next);
  }

  function isMembershipPolicyError(error) {
    var message = String((error && error.message) || "").toLowerCase();
    return message.includes("workspace_members") || message.includes("policy") || message.includes("row-level security");
  }

  async function getSession() {
    var client = window.supabaseClient.getClient();
    var result = await client.auth.getSession();

    if (result.error) {
      throw result.error;
    }

    return result.data.session;
  }

  async function getCurrentUser() {
    var session = await getSession();
    return session ? session.user : null;
  }

  async function checkWorkspaceMembership(userId) {
    var client = window.supabaseClient.getClient();
    var result = await client
      .from("workspace_members")
      .select("workspace_id, user_id, role, created_at")
      .eq("workspace_id", window.supabaseConfig.workspaceId)
      .eq("user_id", userId)
      .maybeSingle();

    if (result.error) {
      throw result.error;
    }

    return result.data;
  }

  async function requireWorkspaceAccess() {
    var user = await getCurrentUser();

    if (!user) {
      window.app.renderBlockingState({
        title: "请先登录",
        description: "当前页面需要登录后才能访问共享菜谱数据。",
        actions: [
          { label: "前往登录", href: buildLoginUrl(), primary: true }
        ]
      });
      return null;
    }

    var membership;

    try {
      membership = await checkWorkspaceMembership(user.id);
    } catch (error) {
      if (isMembershipPolicyError(error)) {
        window.app.renderBlockingState({
          title: "权限校验失败",
          description: "当前工作区成员策略配置异常，请先修复 Supabase 的 workspace_members RLS。"
        });
        return null;
      }

      throw error;
    }

    if (!membership) {
      window.app.renderBlockingState({
        title: "无权限访问",
        description: "当前账号不在这个共享工作区内，无法查看或操作菜谱数据。"
      });
      return null;
    }

    return {
      user: user,
      membership: membership
    };
  }

  async function signInWithOtp(email) {
    var client = window.supabaseClient.getClient();
    var result = await client.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: window.supabaseConfig.emailRedirectTo
      }
    });

    if (result.error) {
      throw result.error;
    }

    return result.data;
  }

  async function signOut() {
    var client = window.supabaseClient.getClient();
    var result = await client.auth.signOut();

    if (result.error) {
      throw result.error;
    }
  }

  window.auth = {
    buildLoginUrl: buildLoginUrl,
    getSession: getSession,
    getCurrentUser: getCurrentUser,
    requireWorkspaceAccess: requireWorkspaceAccess,
    signInWithOtp: signInWithOtp,
    signOut: signOut
  };
})();
