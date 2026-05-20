FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy Prisma first (important for generate)
COPY prisma ./prisma
RUN npx prisma generate

# Copy EVERYTHING (including public frontend)
COPY . .

# Build safety env
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Run migrations + start server
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]