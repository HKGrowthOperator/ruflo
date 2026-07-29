# Prüfungscoach Trockenbau — produktionsfertiges Image
# Build:  docker build -t pruefungscoach .
# Run:    docker run -p 3100:3100 -v pc-data:/data -e DATABASE_PATH=/data/pruefungscoach.db pruefungscoach
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app /app
VOLUME /data
ENV DATABASE_PATH=/data/pruefungscoach.db
EXPOSE 3100
# migrate + seed sind idempotent — sicher bei jedem Start
CMD ["sh", "-c", "npm run migrate && npm run seed && npm run start"]
