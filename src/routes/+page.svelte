<script>
  let loading = $state(false);
  let status = $state("idle"); // idle | updating | restarting | done | error
  let message = $state("");

  async function triggerUpdate() {
    if (!confirm("Are you sure you want to update the app?")) return;

    loading = true;
    status = "updating";
    message = "Starting update...";

    try {
      await fetch("/api/update", { method: "POST" });
      status = "restarting";
      message = "Server is restarting, please wait...";
      pollUntilOnline();
    } catch {
      status = "restarting";
      message = "Server is restarting, please wait...";
      pollUntilOnline();
    }
  }

  function pollUntilOnline() {
    setTimeout(async function poll() {
      try {
        const res = await fetch("/", { cache: "no-store" });
        if (res.ok) {
          status = "done";
          message = "Update complete! Refreshing...";
          setTimeout(() => location.reload(), 1500);
          return;
        }
      } catch {}
      setTimeout(poll, 2000);
    }, 5000);
  }
</script>

<div class="admin-panel">
  <h2>Update This App</h2>

  <button onclick={triggerUpdate} disabled={loading}>
    {loading ? "Updating..." : "Update"}
  </button>

  {#if status === "updating"}
    <p class="msg">{message}</p>
  {:else if status === "restarting"}
    <p class="msg restarting">{message}</p>
  {:else if status === "done"}
    <p class="msg success">{message}</p>
  {:else if status === "error"}
    <p class="msg error">{message}</p>
  {/if}
</div>

<style>
  .admin-panel {
    font-family: sans-serif;
    max-width: 400px;
    margin: 3rem auto;
    padding: 1.5rem;
  }

  h2 {
    margin-bottom: 1rem;
  }

  button {
    margin: auto;
    padding: 0.5rem 1.5rem;
    font-size: 1rem;
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .msg {
    padding: 0.5rem 0;
    font-size: 0.95rem;
  }

  .restarting {
    color: #d97706;
  }
  .success {
    color: #16a34a;
  }
  .error {
    color: #dc2626;
  }
</style>
