async function loadLeaderboard() {
  try {
    // Make sure CONFIG exists
    if (!window.CONFIG || !CONFIG.API_URL) {
      console.warn("CONFIG.API_URL is missing, using static table.");
      return;
    }

    const res = await fetch(CONFIG.API_URL + "/leaderboard");

    if (!res.ok) {
      throw new Error("Failed to fetch leaderboard");
    }

    const data = await res.json();

    const tbody = document.querySelector("#leaderboardTable tbody");

    if (!tbody) {
      console.error("Leaderboard table body not found");
      return;
    }

    // Clear table safely
    tbody.innerHTML = "";

    const leaderboard = data.leaderboard || data || [];

    // If empty data → keep page usable
    if (!Array.isArray(leaderboard) || leaderboard.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4">No leaderboard data available</td>
        </tr>
      `;
      return;
    }

    leaderboard.forEach((player, index) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${player.rank ?? index + 1}</td>
        <td>${player.medal ?? "🏅"}</td>
        <td>${player.player_name ?? "Unknown"}</td>
        <td>${player.successful_attempts ?? 0}</td>
      `;

      tbody.appendChild(row);
    });

  } catch (err) {
    console.error("Leaderboard error:", err);

    // fallback UI so table is NOT empty
    const tbody = document.querySelector("#leaderboardTable tbody");
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4">Failed to load leaderboard</td>
        </tr>
      `;
    }
  }
}

// Run on page load
document.addEventListener("DOMContentLoaded", loadLeaderboard);