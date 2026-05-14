#!/bin/bash

# AWS EC2 Deployment Script for Ubuntu
# Run this script on your Ubuntu EC2 instance after uploading the project files

echo "=========================================="
echo "  4-Tier Docker App - EC2 Deployment"
echo "=========================================="

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
sudo apt install docker.io -y

# Start Docker service
echo "▶️  Starting Docker service..."
sudo systemctl start docker
sudo systemctl enable docker

# Add current user to docker group
echo "👤 Adding user to docker group..."
sudo usermod -a -G docker $USER

# Install Docker Compose
echo "📦 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
echo ""
echo "✅ Verifying installations..."
docker --version
docker-compose --version

echo ""
echo "=========================================="
echo "  Installation Complete!"
echo "=========================================="
echo ""
echo "⚠️  IMPORTANT: You need to logout and login again for docker group changes to take effect"
echo ""
echo "After re-login, run:"
echo "  cd ~/app"
echo "  docker-compose up -d"
echo ""
echo "Then access your app at:"
echo "  http://YOUR_EC2_PUBLIC_IP:3000"
echo ""
