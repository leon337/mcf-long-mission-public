(() => {
  const $ = (id) => document.getElementById(id);
  let paused = false;
  let syncing = false;

  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);

  const formatDate = (value) =>
    value ? new Date(value).toLocaleString("pt-BR") : "—";

  async function sync() {
    if (syncing) return;
    syncing = true;
    $("syncState").textContent = "Lendo snapshot publicado…";
    $("syncDot").className = "dot";
    try {
      const response = await fetch("/snapshot.json?ts=" + Date.now(), { cache: "no-store" });
      if (!response.ok) throw new Error("snapshot HTTP " + response.status);
      const data = await response.json();

      $("mainSha").textContent = data.main.sha.slice(0, 12) + "…";
      $("releaseTag").textContent = data.latest_release.tag || "sem release";
      $("openPRs").textContent = data.counts.open_pull_requests + (data.counts.truncated ? "+" : "");
      $("openIssues").textContent = data.counts.open_issues + (data.counts.truncated ? "+" : "");
      $("lastSync").textContent = formatDate(data.generated_at);

      $("syncState").textContent = "Snapshot orientado a evento publicado";
      $("syncDot").className = "dot ok";
      $("apiStatus").className = "badge ok";
      $("apiStatus").textContent = "EVENT LIVE";
      $("rateInfo").textContent = "sem polling da API GitHub no navegador";

      const rows = Array.isArray(data.recent) ? data.recent : [];
      $("recentRows").innerHTML = rows.length
        ? rows.map((item) => `<tr>
            <td>${esc(item.type)}</td>
            <td><a target="_blank" rel="noreferrer" href="${esc(item.url)}">#${esc(item.number)}</a></td>
            <td>${esc(item.title)}</td>
            <td>${esc(formatDate(item.updated_at))}</td>
          </tr>`).join("")
        : '<tr><td colspan="4">Nenhum item aberto.</td></tr>';
    } catch (error) {
      $("syncState").textContent = "Falha ao ler snapshot: " + error.message;
      $("syncDot").className = "dot bad";
      $("apiStatus").className = "badge warn";
      $("apiStatus").textContent = "DEGRADED";
    } finally {
      syncing = false;
    }
  }

  $("refreshBtn").addEventListener("click", sync);
  $("pauseBtn").addEventListener("click", () => {
    paused = !paused;
    $("pauseBtn").textContent = paused ? "Retomar auto-sync" : "Pausar auto-sync";
  });

  setInterval(() => { if (!paused) sync(); }, 30000);
  sync();
})();
