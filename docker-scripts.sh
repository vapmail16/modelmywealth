#!/bin/bash

# ModelMyWealth Docker Management Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Build and start production environment
start_production() {
    print_header "Starting ModelMyWealth in Production Mode"
    check_docker
    
    print_status "Building and starting containers..."
    docker-compose up -d --build
    
    print_status "Waiting for services to start..."
    sleep 10
    
    print_status "Production environment is ready!"
    echo -e "${GREEN}Frontend:${NC} http://localhost:8080"
    echo -e "${GREEN}Backend API:${NC} http://localhost:3001"
    echo -e "${GREEN}Database:${NC} localhost:5432"
}

# Build and start development environment
start_development() {
    print_header "Starting ModelMyWealth in Development Mode"
    check_docker
    
    print_status "Building and starting development containers..."
    docker-compose -f docker-compose.dev.yml up -d --build
    
    print_status "Waiting for services to start..."
    sleep 15
    
    print_status "Development environment is ready!"
    echo -e "${GREEN}Frontend:${NC} http://localhost:8080"
    echo -e "${GREEN}Backend API:${NC} http://localhost:3001"
    echo -e "${GREEN}Database:${NC} localhost:5432"
    echo -e "${YELLOW}Hot reloading is enabled for development${NC}"
}

# Stop all containers
stop_all() {
    print_header "Stopping ModelMyWealth Containers"
    check_docker
    
    print_status "Stopping production containers..."
    docker-compose down
    
    print_status "Stopping development containers..."
    docker-compose -f docker-compose.dev.yml down
    
    print_status "All containers stopped!"
}

# View logs
view_logs() {
    print_header "Viewing Container Logs"
    check_docker
    
    echo "Select which logs to view:"
    echo "1) Frontend logs"
    echo "2) Backend logs"
    echo "3) Database logs"
    echo "4) All logs"
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            docker-compose logs -f frontend
            ;;
        2)
            docker-compose logs -f api-server
            ;;
        3)
            docker-compose logs -f postgres
            ;;
        4)
            docker-compose logs -f
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
}

# Clean up everything
cleanup() {
    print_header "Cleaning Up Docker Environment"
    check_docker
    
    print_warning "This will remove all containers, images, and volumes!"
    read -p "Are you sure? (y/N): " confirm
    
    if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
        print_status "Stopping and removing containers..."
        docker-compose down -v
        docker-compose -f docker-compose.dev.yml down -v
        
        print_status "Removing images..."
        docker rmi $(docker images -q modelmywealth*) 2>/dev/null || true
        
        print_status "Removing volumes..."
        docker volume prune -f
        
        print_status "Cleanup complete!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Show status
show_status() {
    print_header "ModelMyWealth Container Status"
    check_docker
    
    echo -e "${BLUE}Production Containers:${NC}"
    docker-compose ps
    
    echo -e "\n${BLUE}Development Containers:${NC}"
    docker-compose -f docker-compose.dev.yml ps
    
    echo -e "\n${BLUE}All Docker Containers:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Main menu
show_menu() {
    echo -e "${BLUE}ModelMyWealth Docker Management${NC}"
    echo "=================================="
    echo "1) Start Production Environment"
    echo "2) Start Development Environment"
    echo "3) Stop All Containers"
    echo "4) View Logs"
    echo "5) Show Status"
    echo "6) Cleanup Everything"
    echo "7) Exit"
    echo ""
}

# Main script
main() {
    if [ $# -eq 0 ]; then
        while true; do
            show_menu
            read -p "Enter your choice (1-7): " choice
            echo ""
            
            case $choice in
                1)
                    start_production
                    ;;
                2)
                    start_development
                    ;;
                3)
                    stop_all
                    ;;
                4)
                    view_logs
                    ;;
                5)
                    show_status
                    ;;
                6)
                    cleanup
                    ;;
                7)
                    print_status "Goodbye!"
                    exit 0
                    ;;
                *)
                    print_error "Invalid choice. Please try again."
                    ;;
            esac
            echo ""
            read -p "Press Enter to continue..."
        done
    else
        # Handle command line arguments
        case $1 in
            "prod"|"production")
                start_production
                ;;
            "dev"|"development")
                start_development
                ;;
            "stop")
                stop_all
                ;;
            "logs")
                view_logs
                ;;
            "status")
                show_status
                ;;
            "cleanup")
                cleanup
                ;;
            *)
                echo "Usage: $0 [prod|dev|stop|logs|status|cleanup]"
                echo "Or run without arguments for interactive menu"
                exit 1
                ;;
        esac
    fi
}

# Run main function
main "$@" 