<<<<<<< HEAD
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: ["error", "warn"],
});
=======
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
>>>>>>> e2d8c13 (Deplyoment without docker)

module.exports = prisma;