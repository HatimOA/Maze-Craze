window.CONFIG = {
  API_URL: "/api",

  ROUTES: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",

    STATES: "/Agents_behaviors",
    CREATE_STATE: "/Agents_behaviors/create",
    RECOMMEND: (id) => `/Agents_behaviors/${id}/recommend`,
  },

  FIELDS: {
    LOGIN: ["email", "password"],
    REGISTER: ["email", "password", "name"],
  },

  STORAGE_KEY: "jwt_token",
};