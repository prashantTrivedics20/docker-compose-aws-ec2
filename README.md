# 4-Tier Docker Application for AWS EC2

A complete 4-tier application with persistent data storage, ready for deployment on AWS EC2.

## 🏗️ Architecture

```
┌─────────────┐
│  Frontend   │ ← Tier 1: React/HTML UI (Port 3000)
│  (Node.js)  │
└──────┬──────┘
       │
┌──────▼──────┐
│   Backend   │ ← Tier 2: REST API (Port 5000)
│  (Node.js)  │
└──────┬──────┘
       │
   ┌───┴────┐
   │        │
┌──▼───┐ ┌─▼────┐
│ Mongo│ │Redis │ ← Tier 3 & 4: Database & Cache
│  DB  │ │Cache │
└──────┘ └──────┘
```

## 📦 Components

1. **Frontend** (Tier 1): Simple HTML/JS interface served by Express
2. **Backend** (Tier 2): Node.js REST API with Express
3. **MongoDB** (Tier 3): NoSQL database for persistent data storage
4. **Redis** (Tier 4): In-memory cache for performance optimization

## ✨ Features

- ✅ Persistent data storage (MongoDB & Redis volumes)
- ✅ Automatic container restart
- ✅ Health monitoring endpoints
- ✅ Redis caching with automatic invalidation
- ✅ User management demo (CRUD operations)
- ✅ Beautiful responsive UI
- ✅ Network isolation with Docker bridge network

## 🚀 Quick Start

### Prerequisites
- Docker installed
- Docker Compose installed

### Local Development

1. **Clone or create the project structure**
2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Check service status:**
   ```bash
   docker-compose ps
   ```

4. **View logs:**
   ```bash
   docker-compose logs -f
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017
   - Redis: localhost:6379

### Stop Services
```bash
docker-compose down
```

### Stop and Remove Volumes (Delete all data)
```bash
docker-compose down -v
```

## 🌐 AWS EC2 Deployment

### Step 1: Launch EC2 Instance

1. **Choose AMI**: Amazon Linux 2023 or Ubuntu 22.04
2. **Instance Type**: t2.medium or larger (minimum t2.micro for testing)
3. **Security Group**: Configure inbound rules:
   - SSH (22) - Your IP
   - HTTP (80) - Anywhere (0.0.0.0/0)
   - Custom TCP (3000) - Anywhere (for frontend)
   - Custom TCP (5000) - Anywhere (for backend API)
   - Custom TCP (27017) - Your IP only (MongoDB - optional, for external access)
   - Custom TCP (6379) - Your IP only (Redis - optional, for external access)

### Step 2: Connect to EC2

```bash
ssh -i your-key.pem ec2-user@your-ec2-public-ip
```

### Step 3: Install Docker & Docker Compose

**For Amazon Linux 2023:**
```bash
# Update system
sudo yum update -y

# Install Docker
sudo yum install docker -y

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# Logout and login again for group changes to take effect
exit
```

**For Ubuntu:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install docker.io -y

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -a -G docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again
exit
```

### Step 4: Deploy Application

```bash
# Clone your repository or upload files
# If using git:
git clone your-repo-url
cd your-repo

# Or create files manually and upload via SCP:
scp -i your-key.pem -r ./* ec2-user@your-ec2-ip:~/app/

# Navigate to project directory
cd ~/app

# Start the application
docker-compose up -d

# Check if containers are running
docker-compose ps

# View logs
docker-compose logs -f
```

### Step 5: Access Your Application

- Frontend: `http://your-ec2-public-ip:3000`
- Backend API: `http://your-ec2-public-ip:5000`

### Step 6: Configure Domain (Optional)

1. Point your domain to EC2 public IP
2. Update frontend code to use your domain instead of localhost
3. Consider using Nginx as reverse proxy for port 80/443

## 📊 API Endpoints

### Health Check
```bash
GET http://localhost:5000/health
```

### Get All Users
```bash
GET http://localhost:5000/api/users
```

### Create User
```bash
POST http://localhost:5000/api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Test Redis Cache
```bash
GET http://localhost:5000/api/cache/test
```

## 💾 Data Persistence

All data is stored in Docker volumes:

- `mongodb_data`: MongoDB database files
- `mongodb_config`: MongoDB configuration
- `redis_data`: Redis persistent storage

**View volumes:**
```bash
docker volume ls
```

**Inspect volume:**
```bash
docker volume inspect mongodb_data
```

**Backup MongoDB data:**
```bash
docker exec mongodb mongodump --out /data/backup
docker cp mongodb:/data/backup ./mongodb-backup
```

**Backup Redis data:**
```bash
docker exec redis redis-cli BGSAVE
docker cp redis:/data/dump.rdb ./redis-backup.rdb
```

## 🔧 Troubleshooting

### Check container logs
```bash
docker-compose logs frontend
docker-compose logs backend
docker-compose logs mongodb
docker-compose logs redis
```

### Restart a specific service
```bash
docker-compose restart backend
```

### Rebuild containers
```bash
docker-compose up -d --build
```

### Check network connectivity
```bash
docker network inspect app-network
```

### Access container shell
```bash
docker exec -it backend sh
docker exec -it mongodb mongosh
docker exec -it redis redis-cli
```

## 🧪 Testing the Application

1. **Open Frontend**: Navigate to http://localhost:3000
2. **Check Health**: Click "Refresh Status" to verify all services are connected
3. **Add Users**: Fill in name and email, click "Add User"
4. **Test Caching**: 
   - Click "Load Users" - data comes from MongoDB (blue badge)
   - Click "Load Users" again within 60 seconds - data comes from Redis cache (green badge)
5. **Test Cache Invalidation**: Add a new user and notice cache is cleared

## 📈 Monitoring

### Check resource usage
```bash
docker stats
```

### Monitor logs in real-time
```bash
docker-compose logs -f --tail=100
```

## 🔒 Security Best Practices for Production

1. **Use environment variables** for sensitive data
2. **Enable MongoDB authentication**
3. **Use Redis password protection**
4. **Configure firewall rules** properly
5. **Use HTTPS** with SSL certificates
6. **Regular backups** of volumes
7. **Keep Docker images updated**
8. **Use Docker secrets** for sensitive data

## 📝 Environment Variables

Create a `.env` file for custom configuration:

```env
# Backend
PORT=5000
MONGODB_URI=mongodb://mongodb:27017/myapp
REDIS_HOST=redis
REDIS_PORT=6379

# Frontend
REACT_APP_API_URL=http://localhost:5000
```

## 🛠️ Customization

### Change Ports
Edit `docker-compose.yml` ports section:
```yaml
ports:
  - "8080:3000"  # Change host port (left side)
```

### Add More Services
Add new service in `docker-compose.yml`:
```yaml
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    networks:
      - app-network
```

## 📚 Learn More

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Redis Documentation](https://redis.io/documentation)
- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)

## 🤝 Contributing

Feel free to fork, modify, and use this project for learning!

## 📄 License

MIT License - Free to use for learning and development.
