const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const CONFIG = {
  API_URL: isLocalhost
    ? "http://localhost:3000/api"
    : "https://maze-craze.vercel.app/api",

  ROUTES: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    STATES: "/Agents_behaviors",
    CREATE_STATE: "/Agents_behaviors/create",
    RECOMMEND: (id) => `/Agents_behaviors/${id}/recommend`,
  },

  STORAGE_KEY: "token",
};