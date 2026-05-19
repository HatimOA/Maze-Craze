// =====================
// CONFIG SAFETY CHECK
// =====================
if (!window.CONFIG) {
  window.CONFIG = {
    STORAGE_KEY: "token",
    API_URL: "",
    ROUTES: { LOGIN: "/login", REGISTER: "/register" }
  };
}

// =====================
// STATE
// =====================
let isRegisterMode = false;
let visibility = 3;

let aiScores = Array(18).fill(0);
let lastAIUpdate = 0;

// =====================
// ACTIONS
// =====================
const ACTIONS = [
  "No operation","Fire","Move up","Fire right","Move left","Move down",
  "Move up-right","Move up-left","Move down-right","Move down-left",
  "Fire up","Fire right","Fire left","Fire down",
  "Fire up-right","Fire up-left","Fire down-right","Fire down-left"
];

// =====================
// AUTH HELPERS
// =====================
function getToken() {
  return localStorage.getItem(CONFIG.STORAGE_KEY);
}

function setToken(token) {
  localStorage.setItem(CONFIG.STORAGE_KEY, token);
}

function removeToken() {
  localStorage.removeItem(CONFIG.STORAGE_KEY);
}

function getCurrentUser() {
  const token = getToken();
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

// =====================
// 🔥 SEND STATE TO BACKEND
// =====================
async function sendState(a1, a2, robbers) {
  const user = getCurrentUser();
  if (!user) return;

  try {
    await fetch(CONFIG.API_URL + "/states/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + getToken(),
      },
      body: JSON.stringify({
        state_id: Date.now().toString(),
        player_id: user.id,

        p1_x: a1.x,
        p1_y: a1.y,
        p2_x: a2.x,
        p2_y: a2.y,

        r_x: robbers[0]?.x || 0,
        r_y: robbers[0]?.y || 0,

        robbers_left: robbers.length,
        visibility
      }),
    });
  } catch (err) {
    console.error("State send error:", err);
  }
}

// =====================
// AUTH UI
// =====================
function showAuth() {
  const auth = document.getElementById("auth-section");
  const app = document.getElementById("app-section");
  const logout = document.getElementById("logout-btn");

  auth.style.display = "block";
  app.style.display = "none";
  logout.style.display = "none";

  auth.innerHTML = `
    <div style="max-width:300px;margin:auto;text-align:center">
      <h2>${isRegisterMode ? "Register" : "Login"}</h2>

      ${isRegisterMode ? `
        <input id="name" placeholder="Player Name" style="width:100%;margin:5px 0"/>
      ` : ""}

      <input id="email" placeholder="Email" style="width:100%;margin:5px 0"/>
      <input id="password" type="password" placeholder="Password" style="width:100%;margin:5px 0"/>

      <button onclick="handleAuth()" style="width:100%">Submit</button>

      <p onclick="toggleMode()" style="cursor:pointer;color:blue">
        ${isRegisterMode ? "Go to Login" : "Go to Register"}
      </p>
    </div>
  `;
}

function toggleMode() {
  isRegisterMode = !isRegisterMode;
  showAuth();
}

// =====================
// LOGIN
// =====================
async function handleAuth() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const body = isRegisterMode
    ? {
        name: document.getElementById("name").value,
        email,
        password,
      }
    : { email, password };

  try {
    const route = isRegisterMode
      ? CONFIG.ROUTES.REGISTER
      : CONFIG.ROUTES.LOGIN;

    const res = await fetch(CONFIG.API_URL + route, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.msg);

    setToken(data.token);
    showApp();
  } catch (e) {
    alert(e.message);
  }
}

// =====================
// APP UI
// =====================
function showApp() {
  document.getElementById("auth-section").style.display = "none";
  document.getElementById("app-section").style.display = "block";
  document.getElementById("logout-btn").style.display = "inline-block";

  const user = getCurrentUser();
  document.getElementById("username").innerText =
    "User: " + (user?.name || "Unknown");

  initMazeGame();
}

// =====================
// MAZE GENERATION
// =====================
function generateMaze(cols, rows) {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(1));

  function dfs(r, c) {
    grid[r][c] = 0;

    const dirs = [[0,-1],[1,0],[0,1],[-1,0]].sort(() => Math.random() - 0.5);

    for (const [dx, dy] of dirs) {
      const nr = r + dy * 2;
      const nc = c + dx * 2;

      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
        grid[r + dy][c + dx] = 0;
        dfs(nr, nc);
      }
    }
  }

  dfs(0, 0);
  return grid;
}

// =====================
// DRAW MAZE
// =====================
function drawMaze(ctx, maze, size) {
  let alpha = visibility === 3 ? 1 : visibility === 2 ? 0.6 : visibility === 1 ? 0.25 : 0.08;

  ctx.fillStyle = `rgba(26,26,46,${alpha})`;

  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      if (maze[y][x] === 1) {
        ctx.fillRect(x * size, y * size, size, size);
      }
    }
  }
}

// =====================
// AI TABLE
// =====================
function updateAITable() {
  const table = document.querySelector("#aiTable");
  if (!table) return;

  table.innerHTML = `
    <tr>
      <th>Action</th>
      <th>Description</th>
      <th>%</th>
    </tr>
  `;

  let bestIndex = 0;

  for (let i = 0; i < 18; i++) {
    aiScores[i] = Math.floor(Math.random() * 100);
    if (aiScores[i] > aiScores[bestIndex]) bestIndex = i;
  }

  for (let i = 0; i < 18; i++) {
    const row = document.createElement("tr");

    if (i === bestIndex) {
      row.style.background = "#d4ffd4";
      row.style.fontWeight = "bold";
    }

    row.innerHTML = `
      <td>${i}</td>
      <td>${ACTIONS[i]}</td>
      <td>${aiScores[i]}%</td>
    `;

    table.appendChild(row);
  }
}

// =====================
// ROBBERS
// =====================
function moveRobbers(robbers, size, cols, rows) {
  robbers.forEach(r => {
    const d = Math.floor(Math.random() * 4);
    if (d === 0 && r.y > 0) r.y -= size;
    if (d === 1 && r.y < rows * size - size) r.y += size;
    if (d === 2 && r.x > 0) r.x -= size;
    if (d === 3 && r.x < cols * size - size) r.x += size;
  });
}

// =====================
// DRAW GAME
// =====================
function draw(ctx, maze, size, a1, a2, robbers) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  drawMaze(ctx, maze, size);

  ctx.fillStyle = "blue";
  ctx.fillRect(a1.x, a1.y, size - 2, size - 2);

  ctx.fillStyle = "green";
  ctx.fillRect(a2.x, a2.y, size - 2, size - 2);

  ctx.fillStyle = "red";
  robbers.forEach(r => ctx.fillRect(r.x, r.y, size - 2, size - 2));
}

// =====================
// INIT GAME
// =====================
function initMazeGame() {
  const canvas = document.getElementById("mazeCanvas");
  const ctx = canvas.getContext("2d");

  const cols = 20;
  const rows = 20;
  const size = 30;

  canvas.width = cols * size;
  canvas.height = rows * size;

  const maze = generateMaze(cols, rows);

  const a1 = { x: size, y: size, dx: 0, dy: 0 };
  const a2 = { x: 2 * size, y: size, dx: 0, dy: 0 };

  const robbers = [
    { x: 5 * size, y: 5 * size },
    { x: 10 * size, y: 10 * size },
  ];

  function move(a) {
    const nx = a.x + a.dx;
    const ny = a.y + a.dy;

    const c = Math.floor(nx / size);
    const r = Math.floor(ny / size);

    if (maze[r] && maze[r][c] === 0) {
      a.x = nx;
      a.y = ny;
    }
  }

  function loop(timestamp) {
    requestAnimationFrame(loop);

    move(a1);
    move(a2);
    moveRobbers(robbers, size, cols, rows);

    draw(ctx, maze, size, a1, a2, robbers);

    // ✅ SEND STATE + UPDATE AI
    if (timestamp - lastAIUpdate > 1000) {
      updateAITable();
      sendState(a1, a2, robbers);
      lastAIUpdate = timestamp;
    }
  }

  requestAnimationFrame(loop);
}

// =====================
// START
// =====================
document.addEventListener("DOMContentLoaded", () => {
  if (getToken()) showApp();
  else showAuth();

  const logout = document.getElementById("logout-btn");
  if (logout) {
    logout.onclick = () => {
      removeToken();
      showAuth();
    };
  }
});