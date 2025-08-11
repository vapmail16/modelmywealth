# Backend Dockerfile
FROM node:18-slim

# Install Python and required packages for financial calculations
RUN apt-get update && apt-get install -y python3 python3-pip python3-dev python3-venv && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Copy Python requirements (if any)
COPY requirements.txt ./

# Create and activate virtual environment, then install Python dependencies
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip3 install --no-cache-dir -r requirements.txt

# Create symlink for expected Python path
RUN ln -sf /opt/venv/bin/python3 /usr/local/bin/python3

# Copy source code
COPY . .

# Create non-root user
RUN groupadd -g 1001 nodejs
RUN useradd -u 1001 -g nodejs -s /bin/bash -m nextjs

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"] 