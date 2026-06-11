# FlashBank MCP server — stdio transport.
# Build from the mcp/ directory:  docker build -t flashbank-mcp .
# Run read-only:                  docker run -i --rm flashbank-mcp
# Run with writes (throwaway!):   docker run -i --rm -e FLASHBANK_MCP_PRIVATE_KEY=0x... flashbank-mcp
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src/ ./src/

USER node
ENTRYPOINT ["node", "src/server.js"]
