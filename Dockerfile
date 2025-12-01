# --- Build stage: compile the React/TypeScript app ---
FROM node:20 AS builder

WORKDIR /app

# Copy only package metadata first (for better caching)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Now copy the rest of the source code
COPY . .

# Build the production bundle (adjust if your script is different)
RUN npm run build

# --- Runtime stage: serve the built app with Nginx ---
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the Vite build output (dist folder) to nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
