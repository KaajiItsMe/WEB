# Build stage
FROM node:20-slim AS build-stage
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Build argument for setting custom backend URL if needed
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Copy project files and build
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
