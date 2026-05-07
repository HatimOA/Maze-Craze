const CONFIG = {
  API_URL: "http://localhost:3000",

  ROUTES: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",

    STATES: "/api/Agents_behaviors",
    CREATE_STATE: "/api/Agents_behaviors/create",
    RECOMMEND: (id) => `/api/Agents_behaviors/${id}/recommend`,
  },

  FIELDS: {
    LOGIN: ["email", "password"],
    REGISTER: ["email", "password", "name"],
  },

  STORAGE_KEY: "jwt_token",
};