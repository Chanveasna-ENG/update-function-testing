<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let loading = $state(false);
  let status = $state("idle"); // idle | checking | update_ready | updating | restarting | done
  let message = $state("");
  let updateData = $state<any>(null);
  
  let scheduledTime = $state("03:00");
  let autoUpdate = $state(true);

  // Poll for updates every 24 hours while the admin UI is open
  let pollInterval: ReturnType<typeof setInterval>;

  onMount(() => {
    checkStatus();
    pollInterval = setInterval(checkStatus, 24 * 60 * 60 * 1000); 
  });

  onDestroy(() => {
    clearInterval(pollInterval);
  });

  async function checkStatus() {
    status = "checking";
    message = "Checking GitHub for updates...";
    try {
      const res = await fetch("/api/update/check");
      const data = await res.json();
      
      scheduledTime = data.settings.scheduledTime;
      autoUpdate = data.settings.autoUpdate;

      if (data.updateAvailable) {
        status = "update_ready";
        updateData = data;
        message = `New update found! Commit: ${data.message} (${data.remoteHash})`;
      } else {
        status = "idle";
        message = "System is up to date.";
      }
    } catch {
      status = "idle";
      message = "Failed to check for updates.";
    }
  }

  async function saveSettings() {
    await fetch("/api/update/check", {
      method: "POST",
      body: JSON.stringify({ scheduledTime, autoUpdate })
    });
    alert("Schedule saved!");
  }

  async function triggerUpdate() {
    if (!confirm("Are you sure you want to pull and restart the app?")) return;
    loading = true;
    status = "updating";
    message = "Pulling code and building... (This may take a minute)";
    
    try {
      await fetch("/api/update", { method: "POST" });
      setTimeout(() => {
          status = "restarting";
          message = "Restarting PM2 process...";
          pollUntilOnline();
      }, 5000); // Give it a buffer before polling
    } catch {
      message = "Failed to trigger update.";
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
  <h2>App Update Manager</h2>

  <div class="settings">
    <label>
      <input type="checkbox" bind:checked={autoUpdate}> Enable Auto Update
    </label>
    <br>
    <label>
      Update Time (24h): 
      <input type="time" bind:value={scheduledTime} disabled={!autoUpdate}>
    </label>
    <button class="save-btn" onclick={saveSettings}>Save Schedule</button>
  </div>

  <hr>

  <button onclick={checkStatus} disabled={status === 'checking' || loading}>
    Check for Updates
  </button>

  {#if status === "update_ready"}
    <div class="update-box">
      <p><strong>{message}</strong></p>
      <button class="update-btn" onclick={triggerUpdate} disabled={loading}>
        {loading ? "Updating..." : "Install Update Now"}
      </button>
    </div>
  {:else if status === "idle"}
     <p class="msg">{message}</p>
  {:else}
    <p class="msg {status}">{message}</p>
    {#if status === "updating" || status === "restarting"}
       <div class="spinner">Loading...</div> 
    {/if}
  {/if}
</div>

<style>
  .admin-panel { max-width: 500px; margin: 3rem auto; padding: 1.5rem; font-family: sans-serif; border: 1px solid #ddd; border-radius: 8px;}
  .settings { background: #f9f9f9; padding: 1rem; border-radius: 6px; margin-bottom: 1rem; }
  .update-box { margin-top: 1rem; padding: 1rem; border: 1px solid #16a34a; background: #f0fdf4; border-radius: 6px;}
  button { padding: 0.5rem 1rem; cursor: pointer; margin-top: 0.5rem; }
  .update-btn { background: #16a34a; color: white; border: none; font-weight: bold; }
  .save-btn { font-size: 0.8rem; }
  .restarting, .updating { color: #d97706; }
</style>