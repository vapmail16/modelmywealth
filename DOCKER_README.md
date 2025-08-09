# ModelMyWealth Docker Setup

This guide will help you run the ModelMyWealth financial wizard application using Docker.

## 🐳 Prerequisites

- **Docker** - [Install Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Docker Compose** - Usually included with Docker Desktop
- **Git** - To clone the repository

## 🚀 Quick Start

### Option 1: Using the Management Script (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/vapmail16/modelmywealth.git
   cd modelmywealth
   ```

2. **Run the management script**
   ```bash
   ./docker-scripts.sh
   ```

3. **Select your environment**
   - Choose option 1 for **Production** (optimized, no hot reload)
   - Choose option 2 for **Development** (with hot reload)

### Option 2: Manual Docker Commands

#### Production Environment

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Development Environment

```bash
# Build and start development services
docker-compose -f docker-compose.dev.yml up -d --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

## 📊 Accessing the Application

Once the containers are running, you can access:

- **Frontend Application**: http://localhost:8080
- **Backend API**: http://localhost:3001
- **Database**: localhost:5432

## 🔧 Docker Management Script

The `docker-scripts.sh` script provides an interactive menu for managing your Docker environment:

```bash
./docker-scripts.sh
```

### Available Commands

```bash
# Start production environment
./docker-scripts.sh prod

# Start development environment
./docker-scripts.sh dev

# Stop all containers
./docker-scripts.sh stop

# View logs
./docker-scripts.sh logs

# Show container status
./docker-scripts.sh status

# Clean up everything
./docker-scripts.sh cleanup
```

## 🏗️ Architecture

The Docker setup includes three main services:

### 1. PostgreSQL Database (`postgres`)
- **Image**: `postgres:15-alpine`
- **Port**: 5432
- **Database**: `modelmywealth`
- **Credentials**: `postgres/postgres`

### 2. Backend API Server (`api-server`)
- **Image**: Custom Node.js with Python
- **Port**: 3001
- **Features**: 
  - Node.js API server
  - Python financial calculations
  - JWT authentication
  - Database connectivity

### 3. Frontend React App (`frontend`)
- **Image**: Custom React build
- **Port**: 8080
- **Features**:
  - React 18 with TypeScript
  - Vite build system
  - Chart.js visualizations
  - Shadcn UI components

## 🔄 Development vs Production

### Development Environment
- **Hot Reloading**: Code changes reflect immediately
- **Volume Mounts**: Source code is mounted for live editing
- **Debug Mode**: More verbose logging
- **File**: `docker-compose.dev.yml`

### Production Environment
- **Optimized Builds**: Smaller, faster containers
- **No Hot Reloading**: Changes require rebuild
- **Security**: Non-root user execution
- **File**: `docker-compose.yml`

## 🛠️ Customization

### Environment Variables

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

#### Backend (api-server/.env)
```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/modelmywealth
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=3001
NODE_ENV=production
```

### Database Configuration

To connect to the database from outside Docker:

```bash
# Using psql
psql -h localhost -p 5432 -U postgres -d modelmywealth

# Using any PostgreSQL client
Host: localhost
Port: 5432
Database: modelmywealth
Username: postgres
Password: postgres
```

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the ports
   lsof -i :8080
   lsof -i :3001
   lsof -i :5432
   
   # Stop conflicting services or change ports in docker-compose.yml
   ```

2. **Database Connection Issues**
   ```bash
   # Check if PostgreSQL is running
   docker-compose logs postgres
   
   # Restart the database
   docker-compose restart postgres
   ```

3. **Build Failures**
   ```bash
   # Clean and rebuild
   docker-compose down
   docker system prune -f
   docker-compose up -d --build
   ```

4. **Permission Issues**
   ```bash
   # Make script executable
   chmod +x docker-scripts.sh
   ```

### Useful Commands

```bash
# View all containers
docker ps

# View logs for specific service
docker-compose logs -f api-server

# Execute commands in running container
docker-compose exec api-server bash
docker-compose exec frontend sh

# View resource usage
docker stats

# Clean up unused resources
docker system prune -f
```

## 📦 Building Individual Images

### Frontend Only
```bash
docker build -t modelmywealth-frontend .
```

### Backend Only
```bash
docker build -t modelmywealth-api ./api-server
```

### Database Only
```bash
docker run -d \
  --name modelmywealth-postgres \
  -e POSTGRES_DB=modelmywealth \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15-alpine
```

## 🔐 Security Notes

1. **Change Default Passwords**: Update database and JWT secrets in production
2. **Use Environment Files**: Store sensitive data in `.env` files
3. **Network Security**: Consider using Docker networks for isolation
4. **Volume Security**: Be careful with volume mounts in production

## 📈 Performance Tips

1. **Use Alpine Images**: Smaller footprint and faster builds
2. **Multi-stage Builds**: Reduce final image size
3. **Volume Mounts**: Use named volumes for persistent data
4. **Resource Limits**: Set memory and CPU limits for containers

## 🚀 Deployment

### Local Development
```bash
./docker-scripts.sh dev
```

### Production Deployment
```bash
./docker-scripts.sh prod
```

### Cloud Deployment
The Docker setup is compatible with:
- **AWS ECS/Fargate**
- **Google Cloud Run**
- **Azure Container Instances**
- **DigitalOcean App Platform**
- **Heroku Container Runtime**

## 📞 Support

If you encounter issues:

1. Check the logs: `./docker-scripts.sh logs`
2. Verify Docker is running: `docker info`
3. Check container status: `./docker-scripts.sh status`
4. Create an issue in the GitHub repository

---

**Happy Dockerizing! 🐳** 