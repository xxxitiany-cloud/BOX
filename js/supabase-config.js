(function () {
  window.supabaseConfig = {
    url: "https://jgmppdsxdnoibvvhlwpi.supabase.co",
    anonKey: "sb_publishable_QuFfJdIOlAG2apO1okIsPQ_yHT1q-8z",
    workspaceId: "d9ac4ac4-0ebd-4d88-98b6-a8b68f69b7b7"
  };

  var client;

  function getClient() {
    if (client) {
      return client;
    }

    if (!window.supabase || !window.supabase.createClient) {
      throw new Error("Supabase client not loaded");
    }

    client = window.supabase.createClient(
      window.supabaseConfig.url,
      window.supabaseConfig.anonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: "my-recipes-supabase-auth"
        }
      }
    );

    return client;
  }

  window.supabaseClient = {
    getClient: getClient
  };
})();
