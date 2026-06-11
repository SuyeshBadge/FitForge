FROM node:20-alpine

WORKDIR /app

# Copy package files from ota-server directory
COPY ota-server/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy server files from ota-server directory
COPY ota-server/server.js .
COPY ota-server/publish.js .

# Create updates directory
RUN mkdir -p /app/updates

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/status || exit 1

# Start server
CMD ["node", "server.js"]
