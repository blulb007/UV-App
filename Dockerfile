FROM node:18-alpine

ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
EXPOSE 8080/tcp

LABEL maintainer="TitaniumNetwork Ultraviolet Team"
LABEL summary="Ultraviolet Proxy Image"
LABEL description="Example application of Ultraviolet which can be deployed in production."

WORKDIR /app

# Enable corepack to use pnpm
RUN corepack enable && corepack prepare pnpm@9.12.2 --activate

# Install build dependencies
RUN apk add --upgrade --no-cache python3 make g++

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy application files
COPY . .

ENTRYPOINT [ "node" ]
CMD ["src/index.js"]
