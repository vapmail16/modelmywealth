# Frontend Dockerfile - Multi-stage build
FROM node:18-alpine AS builder

# Accept build arguments for environment variables
ARG VITE_API_BASE_URL

# Set environment variables for the build process
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies needed for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application with environment variables
RUN echo "Building with VITE_API_BASE_URL: $VITE_API_BASE_URL"
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 8080

# Start the application
CMD ["serve", "-s", "dist", "-l", "8080"] 