<script>
  let loading = $state(false);
  let statusMessage = $state("");

  async function triggerUpdate() {
    if (!confirm("Are you sure you want to update the app?")) return;

    loading = true;
    statusMessage = "Updating... please wait. The app will restart";

    try {
      const response = await fetch("/api/update", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        statusMessage = `Update successful! New version: ${data.newVersion}`;
      } else {
        statusMessage = `Update failed: ${data.error}`;
      }
    } catch (error) {
      statusMessage = "An error occurred during the update process.";
      console.error(error);
    } finally {
      loading = false;
    }
  }
</script>

<div class="admin-panel">
  <h2>Update This APP</h2>
  <button onclick={triggerUpdate} disabled={loading}>
    {loading ? "Updating..." : "Update"}
  </button>
  {#if statusMessage}
    <p>{statusMessage}</p>
  {/if}
</div>
