<div align="center">

# 🖼️ Photo Frame Creator System

**Capstone Project - Online Photo Frame Creation and Management Web Application**

[![GitHub Stars](https://img.shields.io/github/stars/quoclam204/do-an-chuyen-nganh? style=social)](https://github.com/quoclam204/do-an-chuyen-nganh/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/quoclam204/do-an-chuyen-nganh?style=social)](https://github.com/quoclam204/do-an-chuyen-nganh/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/quoclam204/do-an-chuyen-nganh)](https://github.com/quoclam204/do-an-chuyen-nganh/issues)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Screenshots](#-screenshots) • [Contributing](#-contributing)

</div>

---

## 📋 About The Project

The Photo Frame Creator System is a **capstone project** (Đồ án chuyên ngành) that demonstrates the practical application of full-stack web development. This project is a comprehensive web application that allows users to create, edit, and manage photo frames online.  Built with modern client-server architecture and deployed on Microsoft Azure cloud platform, it showcases proficiency in both frontend and backend technologies.

### 🎓 Project Context

This capstone project was developed as part of the Computer Science curriculum, demonstrating: 
- Full-stack web development skills
- Cloud deployment and DevOps practices
- Database design and management
- RESTful API development
- Modern frontend frameworks
- Software engineering principles

### 🎯 Project Objectives

- 📚 **Apply theoretical knowledge** to real-world application development
- 🏗️ **Design and implement** a complete full-stack web application
- ☁️ **Deploy and manage** cloud-based infrastructure
- 🔄 **Integrate** multiple technologies into a cohesive system
- 📊 **Demonstrate** software development best practices

### Why This Project?

- 🎯 **Easy to Use** - Intuitive interface for creating beautiful photo frames
- 🚀 **Fast & Reliable** - Optimized performance with cloud infrastructure
- 🔒 **Secure** - User authentication and data protection
- 📱 **Responsive** - Works seamlessly across all devices
- 🎓 **Educational** - Demonstrates comprehensive understanding of web technologies

## ✨ Features

### 🎨 Core Features
- **Custom Frame Design** - Create and personalize photo frames with various styles and templates
- **Frame Library** - Browse and save your favorite frame designs
- **User Management** - Complete authentication system with registration and login
- **Photo Upload** - Upload and manage your photos
- **Real-time Preview** - See changes instantly as you design
- **Export Options** - Download frames in multiple formats

### 🔐 User Features
- User registration and authentication
- Personal dashboard
- Frame history and favorites
- Profile management
- Secure session handling

### 🎯 Admin Features
- User management
- Frame template management
- Analytics and statistics
- Content moderation
- System monitoring

## 🛠️ Tech Stack

<div align="center">

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

### Backend
![. NET](https://img.shields.io/badge/.NET-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![C#](https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=c-sharp&logoColor=white)

### Database
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)

### Cloud & Deployment
![Azure](https://img.shields.io/badge/Microsoft_Azure-0089D6?style=for-the-badge&logo=microsoft-azure&logoColor=white)

</div>

### Technology Details

| Layer | Technology | Purpose | Justification |
|-------|-----------|---------|---------------|
| **Frontend** | ReactJS | Building interactive user interfaces | Component-based architecture, large ecosystem, excellent performance |
| | HTML5 & CSS3 | Markup and styling | Web standards, responsive design capabilities |
| | JavaScript (ES6+) | Client-side programming | Modern syntax, async capabilities, wide browser support |
| **Backend** | ASP.NET Core Web API | RESTful API development | High performance, cross-platform, robust framework |
| | C# | Server-side programming | Strong typing, extensive libraries, enterprise-ready |
| **Database** | MySQL | Relational database management | Open-source, reliable, excellent performance for web apps |
| **Cloud** | Microsoft Azure | Hosting (Frontend, Backend, Database) | Scalable, integrated services, industry-standard |
| **Domain** | Namecheap | Domain management | Cost-effective, reliable DNS management |

## 📂 Project Structure

```
do-an-chuyen-nganh/
├── 📁 khunghinh-client/          # Frontend - ReactJS Application
│   ├── 📁 public/                # Static files
│   │   ├── index.html            # HTML entry point
│   │   ├── favicon.ico           # Website icon
│   │   └── manifest.json         # PWA manifest
│   ├── 📁 src/                   # Source code
│   │   ├── 📁 components/        # Reusable React components
│   │   ├── 📁 pages/             # Page components
│   │   ├── 📁 services/          # API communication services
│   │   ├── 📁 utils/             # Utility functions
│   │   ├── 📁 hooks/             # Custom React hooks
│   │   ├── 📁 contexts/          # React context providers
│   │   ├── 📁 assets/            # Images, fonts, etc.
│   │   ├── App.js                # Main app component
│   │   ├── index.js              # Application entry point
│   │   └── routes.js             # Route configuration
│   ├── package.json              # Frontend dependencies
│   └── . env. example              # Environment variables template
│
├── 📁 khunghinh-server/          # Backend - ASP.NET Core Web API
│   ├── 📁 Controllers/           # API Controllers
│   │   ├── AuthController.cs    # Authentication endpoints
│   │   ├── FrameController.cs   # Frame management endpoints
│   │   └── UserController.cs    # User management endpoints
│   ├── 📁 Models/                # Data models
│   │   ├── User.cs              # User entity
│   │   ├── Frame.cs             # Frame entity
│   │   └── Template.cs          # Template entity
│   ├── 📁 Services/              # Business logic layer
│   ├── 📁 Repositories/          # Data access layer
│   ├── 📁 DTOs/                  # Data transfer objects
│   ├── 📁 Middleware/            # Custom middleware
│   ├── 📁 Helpers/               # Helper classes
│   ├── appsettings.json          # Configuration
│   ├── Program.cs                # Application entry point
│   └── Startup.cs                # Service configuration
│
├── 📁 . github/                   # GitHub configurations
│   └── 📁 workflows/             # CI/CD workflows
│       ├── frontend-deploy.yml   # Frontend deployment
│       └── backend-deploy. yml    # Backend deployment
│
├── 📁 docs/                      # Project documentation (optional)
│   ├── api-documentation.md      # API reference
│   ├── database-schema.md        # Database design
│   └── user-manual.md            # User guide
│
├── 📄 khunghinh. sql              # Database schema & seed data
├── 📄 ghi-chu-dacn.txt           # Project notes (Vietnamese)
├── 📄 . gitignore                 # Git ignore rules
├── 📄 LICENSE                    # License file
└── 📄 README.md                  # This file
```

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           ReactJS Frontend Application                 │  │
│  │  - Components  - Pages  - Services  - State Mgmt      │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS/REST API
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         ASP.NET Core Web API                          │  │
│  │  - Controllers  - Services  - Middleware              │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ Entity Framework Core
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              MySQL Database                           │  │
│  │  - Users  - Frames  - Templates  - Sessions           │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │ Microsoft Azure │
              │  Cloud Platform │
              └────────────────┘
```

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.x or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Package manager
- **.NET Core SDK** (v6.0 or higher) - [Download](https://dotnet.microsoft.com/download)
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/)
- **Git** - [Download](https://git-scm.com/)
- **Code Editor** - VS Code, Visual Studio, or similar

### Installation

#### 1️⃣ Clone the Repository

```bash
# Clone the project
git clone https://github.com/quoclam204/do-an-chuyen-nganh.git

# Navigate to project directory
cd do-an-chuyen-nganh
```

#### 2️⃣ Setup Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE khunghinh CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Exit MySQL
exit

# Import the schema and seed data
mysql -u root -p khunghinh < khunghinh.sql

# Verify database creation
mysql -u root -p -e "SHOW DATABASES;"
mysql -u root -p -e "USE khunghinh; SHOW TABLES;"
```

#### 3️⃣ Configure & Run Backend

```bash
# Navigate to server directory
cd khunghinh-server

# Update connection string in appsettings.json
# Example appsettings.json:
# {
#   "ConnectionStrings": {
#     "DefaultConnection": "Server=localhost;Database=khunghinh;User=root;Password=your_password;Port=3306;"
#   },
#   "Jwt": {
#     "Secret": "your-super-secret-key-at-least-32-characters-long",
#     "Issuer": "PhotoFrameAPI",
#     "Audience":  "PhotoFrameClient",
#     "ExpiryInDays": 7
#   }
# }

# Restore dependencies
dotnet restore

# Apply database migrations (if using EF Core)
dotnet ef database update

# Build the project
dotnet build

# Run the API server
dotnet run
```

✅ The API will be running at:  **`http://localhost:5000`** or **`https://localhost:5001`**

#### 4️⃣ Configure & Run Frontend

```bash
# Open a new terminal and navigate to client directory
cd khunghinh-client

# Install dependencies
npm install
# or
yarn install

# Create . env file
cp .env.example .env

# Update . env file with your configuration: 
# REACT_APP_API_URL=http://localhost:5000/api
# REACT_APP_ENV=development
# REACT_APP_MAX_FILE_SIZE=5242880
# REACT_APP_ALLOWED_FORMATS=jpg,jpeg,png,gif

# Start development server
npm start
# or
yarn start
```

✅ The application will open at: **`http://localhost:3000`**

#### 5️⃣ Verify Installation

1. Open browser and navigate to `http://localhost:3000`
2. You should see the home page
3. Try creating an account
4. Test the frame creation functionality
5. Check the API at `http://localhost:5000/swagger` (if Swagger is enabled)

## 🔧 Configuration

### Environment Variables

#### Frontend (. env)
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development

# File Upload Configuration
REACT_APP_MAX_FILE_SIZE=5242880
REACT_APP_ALLOWED_FORMATS=jpg,jpeg,png,gif,webp

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_SOCIAL_SHARE=true

# Azure Storage (if using)
REACT_APP_AZURE_STORAGE_URL=https://your-storage-account.blob.core.windows.net
```

#### Backend (appsettings.json)
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=khunghinh;User=root;Password=your_password;Port=3306;"
  },
  "Jwt": {
    "Secret": "your-super-secret-key-minimum-32-characters-for-security",
    "Issuer":  "PhotoFrameAPI",
    "Audience": "PhotoFrameClient",
    "ExpiryInDays": 7
  },
  "Azure": {
    "StorageConnectionString": "DefaultEndpointsProtocol=https;AccountName=... ;AccountKey=... ;EndpointSuffix=core.windows.net",
    "ContainerName": "frames",
    "BlobBaseUrl": "https://your-storage-account.blob.core.windows.net/frames/"
  },
  "FileUpload": {
    "MaxFileSize": 5242880,
    "AllowedExtensions": [".jpg", ".jpeg", ".png", ".gif", ". webp"],
    "UploadPath": "wwwroot/uploads"
  },
  "Cors": {
    "AllowedOrigins":  ["http://localhost:3000", "https://your-production-domain.com"]
  }
}
```

## 📸 Screenshots

### 🏠 Home Page
<!-- Replace with your actual screenshot -->
![Home Page](https://via.placeholder.com/800x400/4A90E2/ffffff?text=Home+Page+Screenshot)
*Modern and intuitive home page with featured frame templates*

---

### 🎨 Frame Editor
<!-- Replace with your actual screenshot -->
![Frame Editor](https://via.placeholder.com/800x400/7B68EE/ffffff?text=Frame+Editor+Screenshot)
*Powerful editor with real-time preview and customization options*

---

### 📱 Responsive Design
<!-- Replace with your actual screenshot -->
![Responsive Design](https://via.placeholder.com/800x400/50C878/ffffff?text=Responsive+Design+Screenshot)
*Seamless experience across all devices - Desktop, Tablet, and Mobile*

---

### 🖼️ Frame Gallery
<!-- Replace with your actual screenshot -->
![Frame Gallery](https://via.placeholder.com/800x400/FF6347/ffffff?text=Frame+Gallery+Screenshot)
*Browse through hundreds of beautiful frame templates*

---

### 👤 User Dashboard
<!-- Replace with your actual screenshot -->
![User Dashboard](https://via.placeholder.com/800x400/FFD700/ffffff?text=User+Dashboard+Screenshot)
*Manage your frames, favorites, and account settings*

---

### 🔐 Authentication
<!-- Replace with your actual screenshot -->
![Login Page](https://via.placeholder.com/800x400/9370DB/ffffff?text=Login+Page+Screenshot)
*Secure login and registration system*

---

## 🎬 Demo

### Create Frame Process
<!-- Replace with your actual GIF -->
![Create Frame Demo](https://via.placeholder.com/800x400/FF69B4/ffffff?text=Create+Frame+Demo+GIF)
*Quick demonstration of creating a custom photo frame from start to finish*

---

### Upload & Preview
<!-- Replace with your actual GIF -->
![Upload Demo](https://via.placeholder.com/800x400/20B2AA/ffffff?text=Upload+%26+Preview+Demo+GIF)
*Upload your photo and see instant real-time preview*

---

### Customization Options
<!-- Replace with your actual GIF -->
![Customization Demo](https://via.placeholder.com/800x400/FFA500/ffffff?text=Customization+Demo+GIF)
*Explore various customization options and filters*

---

> **📝 How to add your screenshots and GIFs:**
> 
> **Method 1: Store in repository (Recommended)**
> ```bash
> # Create screenshots folder
> mkdir screenshots
> 
> # Add your images
> # Then update the links above to: 
> # ![Home Page](./screenshots/home-page.png)
> # ![Demo](./screenshots/demo.gif)
> ```
>
> **Method 2: Use GitHub Issues**
> 1. Go to Issues → New Issue
> 2. Drag and drop your image
> 3. GitHub will generate a URL
> 4. Copy and paste the URL in README
>
> **Method 3: Use image hosting**
> - Upload to [Imgur](https://imgur.com/)
> - Upload to [GitHub Assets](https://docs.github.com/assets)
> - Use the generated URL

## 📖 API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | User login | ❌ |
| POST | `/api/auth/logout` | User logout | ✅ |
| GET | `/api/auth/profile` | Get user profile | ✅ |
| PUT | `/api/auth/profile` | Update user profile | ✅ |
| POST | `/api/auth/change-password` | Change password | ✅ |
| POST | `/api/auth/forgot-password` | Request password reset | ❌ |

### Frame Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/frames` | Get all frames (paginated) | ❌ |
| GET | `/api/frames/{id}` | Get frame by ID | ❌ |
| POST | `/api/frames` | Create new frame | ✅ |
| PUT | `/api/frames/{id}` | Update frame | ✅ |
| DELETE | `/api/frames/{id}` | Delete frame | ✅ |
| GET | `/api/frames/user/{userId}` | Get user's frames | ✅ |
| GET | `/api/frames/search? query={query}` | Search frames | ❌ |
| POST | `/api/frames/{id}/favorite` | Add to favorites | ✅ |

### Template Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/templates` | Get all templates | ❌ |
| GET | `/api/templates/{id}` | Get template by ID | ❌ |
| GET | `/api/templates/category/{category}` | Get by category | ❌ |
| POST | `/api/templates` | Create template (Admin) | ✅ |
| PUT | `/api/templates/{id}` | Update template (Admin) | ✅ |
| DELETE | `/api/templates/{id}` | Delete template (Admin) | ✅ |

### File Upload Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/upload/photo` | Upload photo | ✅ |
| POST | `/api/upload/frame` | Upload custom frame | ✅ |
| DELETE | `/api/upload/{fileId}` | Delete uploaded file | ✅ |

### Example Requests

#### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john. doe@example.com",
  "password": "SecurePassword123!",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": 1,
    "username": "johndoe",
    "email": "john.doe@example.com",
    "fullName": "John Doe"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example. com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john. doe@example.com",
    "fullName": "John Doe",
    "avatar": "https://example.com/avatar.jpg"
  }
}
```

#### Create Frame
```http
POST /api/frames
Content-Type: application/json
Authorization: Bearer {your_token}

{
  "name": "My Beautiful Frame",
  "description": "A custom photo frame for my vacation photos",
  "templateId": 5,
  "photoUrl": "https://example.com/photo.jpg",
  "customizations": {
    "borderColor": "#FF5733",
    "borderWidth":  10,
    "filter": "vintage"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Frame created successfully",
  "data": {
    "frameId": 123,
    "name": "My Beautiful Frame",
    "previewUrl": "https://example.com/frames/123/preview. jpg",
    "downloadUrl": "https://example.com/frames/123/download.jpg",
    "createdAt": "2025-12-11T10:30:00Z"
  }
}
```

#### Get Frames (Paginated)
```http
GET /api/frames?page=1&pageSize=12&sortBy=createdAt&order=desc
Authorization: Bearer {your_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "frameId": 123,
        "name": "My Beautiful Frame",
        "previewUrl": "https://example.com/frames/123/preview.jpg",
        "createdAt": "2025-12-11T10:30:00Z",
        "user": {
          "id": 1,
          "username": "johndoe"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 12,
      "totalPages": 5,
      "totalItems": 60
    }
  }
}
```

### Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ],
  "statusCode": 400
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 💾 Database Schema

### Users Table
```sql
CREATE TABLE Users (
    UserId INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(50) UNIQUE NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    FullName VARCHAR(100),
    Avatar VARCHAR(255),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    IsActive BOOLEAN DEFAULT TRUE
);
```

### Frames Table
```sql
CREATE TABLE Frames (
    FrameId INT PRIMARY KEY AUTO_INCREMENT,
    UserId INT NOT NULL,
    TemplateId INT,
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    PhotoUrl VARCHAR(255),
    PreviewUrl VARCHAR(255),
    Customizations JSON,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(UserId),
    FOREIGN KEY (TemplateId) REFERENCES Templates(TemplateId)
);
```

### Templates Table
```sql
CREATE TABLE Templates (
    TemplateId INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Category VARCHAR(50),
    ThumbnailUrl VARCHAR(255),
    TemplateUrl VARCHAR(255),
    Description TEXT,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🧪 Testing

### Frontend Tests

```bash
cd khunghinh-client

# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- UserProfile.test.js
```

### Backend Tests

```bash
cd khunghinh-server

# Run all tests
dotnet test

# Run with detailed output
dotnet test --logger "console;verbosity=detailed"

# Run with coverage
dotnet test /p:CollectCoverage=true /p:CoverageReportFormat=opencover

# Run specific test
dotnet test --filter "FullyQualifiedName~AuthControllerTests"
```

### Integration Tests

```bash
# Run end-to-end tests (if configured)
npm run test:e2e
```

## 📦 Build for Production

### Build Frontend

```bash
cd khunghinh-client

# Install dependencies
npm install

# Create production build
npm run build

# Output will be in:  build/
# Files are minified and optimized for production
```

**Build output:**
```
build/
├── static/
│   ├── css/
│   │   └── main.{hash}.css
│   └── js/
│       ├── main.{hash}.js
│       └── {chunk}.{hash}.js
├── index. html
└── asset-manifest.json
```

### Build Backend

```bash
cd khunghinh-server

# Restore dependencies
dotnet restore

# Publish for production
dotnet publish -c Release -o ./publish

# Output will be in: publish/
```

**Optimization checklist:**
- ✅ Minify JavaScript and CSS
- ✅ Optimize images
- ✅ Enable gzip compression
- ✅ Remove development dependencies
- ✅ Configure caching headers
- ✅ Enable HTTPS

## 🚀 Deployment

### Deploy to Microsoft Azure

#### Prerequisites
- Azure account
- Azure CLI installed
- Azure subscription

#### 1. Deploy Frontend (Azure Static Web Apps)

```bash
# Login to Azure
az login

# Create resource group
az group create --name photo-frame-rg --location eastus

# Create Static Web App
az staticwebapp create \
  --name photo-frame-frontend \
  --resource-group photo-frame-rg \
  --source ./khunghinh-client \
  --location eastus \
  --branch main \
  --app-location "/" \
  --output-location "build"

# Get deployment URL
az staticwebapp show \
  --name photo-frame-frontend \
  --resource-group photo-frame-rg \
  --query "defaultHostname"
```

#### 2. Deploy Backend (Azure App Service)

```bash
# Create App Service Plan
az appservice plan create \
  --name photo-frame-plan \
  --resource-group photo-frame-rg \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --name photo-frame-api \
  --resource-group photo-frame-rg \
  --plan photo-frame-plan \
  --runtime "DOTNET:6.0"

# Deploy code
cd khunghinh-server
az webapp up \
  --name photo-frame-api \
  --resource-group photo-frame-rg

# Configure connection strings
az webapp config connection-string set \
  --name photo-frame-api \
  --resource-group photo-frame-rg \
  --connection-string-type MySql \
  --settings DefaultConnection="Server=your-server;Database=khunghinh;User=admin;Password=your-password;"
```

#### 3. Deploy Database (Azure Database for MySQL)

```bash
# Create MySQL server
az mysql server create \
  --resource-group photo-frame-rg \
  --name photo-frame-mysql \
  --location eastus \
  --admin-user myadmin \
  --admin-password YourPassword123! \
  --sku-name B_Gen5_1 \
  --version 8.0

# Create database
az mysql db create \
  --resource-group photo-frame-rg \
  --server-name photo-frame-mysql \
  --name khunghinh

# Configure firewall
az mysql server firewall-rule create \
  --resource-group photo-frame-rg \
  --server photo-frame-mysql \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Import database
mysql -h photo-frame-mysql.mysql.database.azure.com \
  -u myadmin@photo-frame-mysql \
  -p \
  khunghinh < khunghinh.sql
```

#### 4. Configure CI/CD with GitHub Actions

Create `.github/workflows/azure-deploy.yml`:

```yaml
name: Deploy to Azure

on: 
  push:
    branches: [ main ]
  pull_request: 
    branches: [ main ]

jobs:
  build-and-deploy-frontend:
    runs-on:  ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version:  '16'
      
      - name: Install and Build
        run: |
          cd khunghinh-client
          npm install
          npm run build
      
      - name: Deploy to Azure Static Web Apps
        uses:  Azure/static-web-apps-deploy@v1
        with: 
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets. GITHUB_TOKEN }}
          action:  "upload"
          app_location: "/khunghinh-client"
          output_location: "build"

  build-and-deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name:  Setup .NET
        uses: actions/setup-dotnet@v1
        with:
          dotnet-version: '6.0.x'
      
      - name: Build and Publish
        run: |
          cd khunghinh-server
          dotnet restore
          dotnet build --configuration Release
          dotnet publish -c Release -o ./publish
      
      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v2
        with:
          app-name: 'photo-frame-api'
          publish-profile: ${{ secrets. AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: ./khunghinh-server/publish
```

### Alternative: Deploy with Docker

```dockerfile
# Frontend Dockerfile
FROM node:16-alpine AS build
WORKDIR /app
COPY khunghinh-client/package*. json ./
RUN npm install
COPY khunghinh-client/ ./
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```dockerfile
# Backend Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /app
COPY khunghinh-server/*. csproj ./
RUN dotnet restore
COPY khunghinh-server/ ./
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:6.0
WORKDIR /app
COPY --from=build /app/out . 
EXPOSE 80
ENTRYPOINT ["dotnet", "KhungHinh.dll"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: 
      context: .
      dockerfile: Dockerfile. frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

  backend:
    build: 
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "5000:80"
    environment:
      - ConnectionStrings__DefaultConnection=Server=db;Database=khunghinh;User=root;Password=rootpassword;
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE:  khunghinh
    ports: 
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./khunghinh.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  mysql_data:
```

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

### How to Contribute

1. **Fork the Project**
   - Click the 'Fork' button at the top right of this page

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/your-username/do-an-chuyen-nganh.git
   cd do-an-chuyen-nganh
   ```

3. **Create a Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

4. **Make Your Changes**
   - Write clean, maintainable code
   - Follow the existing code style
   - Add comments where necessary
   - Update documentation if needed
   - Add tests for new features

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m 'Add some AmazingFeature'
   ```

6. **Push to Your Fork**
   ```bash
   git push origin feature/AmazingFeature
   ```

7. **Open a Pull Request**
   - Go to the original repository
   - Click 'New Pull Request'
   - Select your fork and branch
   - Describe your changes in detail

### Code Style Guidelines

#### Frontend (JavaScript/React)
- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use functional components and hooks
- Use meaningful component and variable names
- Keep components small and focused
- Use PropTypes for type checking

```javascript
// Good
const UserProfile = ({ user, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  return (
    <div className="user-profile">
      {/* Component content */}
    </div>
  );
};

UserProfile.propTypes = {
  user: PropTypes.object.isRequired,
  onEdit: PropTypes.func
};
```

#### Backend (C#/.NET)
- Follow [Microsoft C# Coding Conventions](https://docs.microsoft.com/en-us/dotnet/csharp/fundamentals/coding-style/coding-conventions)
- Use PascalCase for class and method names
- Use camelCase for local variables
- Add XML documentation comments for public APIs

```csharp
/// <summary>
/// Gets a frame by its unique identifier.
/// </summary>
/// <param name="id">The frame identifier</param>
/// <returns>The frame object if found</returns>
public async Task<Frame> GetFrameByIdAsync(int id)
{
    return await _context.Frames
        .Include(f => f.User)
        .FirstOrDefaultAsync(f => f. FrameId == id);
}
```

### Commit Message Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(auth): add password reset functionality
fix(frame-editor): resolve image upload bug
docs(readme): update installation instructions
refactor(api): improve error handling
```

## 🗺️ Roadmap

### ✅ Completed
- [x] User authentication system
- [x] Basic frame creation
- [x] Photo upload functionality
- [x] Template library
- [x] User dashboard
- [x] Azure deployment

### 🚧 In Progress
- [ ] Advanced editing tools
  - [ ] Filters and effects
  - [ ] Text overlay with custom fonts
  - [ ] Stickers and decorations
  - [ ] Cropping and rotation tools

### 📋 Planned Features

**Phase 1: Enhanced Features**
- [ ] Social features
  - [ ] Share frames on social media (Facebook, Instagram, Twitter)
  - [ ] Like and comment system
  - [ ] Follow other users
  - [ ] Public/private frame visibility
- [ ] Payment integration
  - [ ] Premium templates
  - [ ] Subscription plans
  - [ ] One-time purchases

**Phase 2: Mobile & AI**
- [ ] Mobile application
  - [ ] React Native mobile app
  - [ ] Offline mode
  - [ ] Push notifications
- [ ] AI-powered features
  - [ ] Automatic background removal
  - [ ] Smart frame suggestions based on photo content
  - [ ] AI-generated templates
  - [ ] Face detection and auto-centering

**Phase 3: Enterprise Features**
- [ ] Multi-language support (i18n)
  - [ ] Vietnamese
  - [ ] English
  - [ ] Other languages
- [ ] Accessibility improvements (WCAG compliance)
- [ ] Advanced analytics dashboard
- [ ] Bulk processing
- [ ] API for third-party integrations
- [ ] White-label solution

## 🐛 Known Issues

Current known issues and their status: 

| Issue | Description | Priority | Status |
|-------|-------------|----------|--------|
| #1 | Large file uploads may timeout on slow connections | High | 🔍 Investigating |
| #2 | Some frame templates not displaying correctly in Safari | Medium | 📋 To Do |
| #3 | Performance optimization needed for complex frames | Medium | 🚧 In Progress |
| #4 | Mobile responsiveness issues on very small screens | Low | 📋 To Do |

See [open issues](https://github.com/quoclam204/do-an-chuyen-nganh/issues) for a full list of known issues and proposed features.

**Report a Bug:**
If you find a bug, please [create an issue](https://github.com/quoclam204/do-an-chuyen-nganh/issues/new? template=bug_report.md) with detailed information. 

## 📚 Learning Resources

This project was built using various technologies.  Here are some helpful resources:

### Frontend
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [React Hooks](https://reactjs.org/docs/hooks-intro.html)
- [Modern JavaScript](https://javascript.info/)
- [CSS Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [CSS Grid](https://css-tricks.com/snippets/css/complete-guide-grid/)

### Backend
- [ASP.NET Core Documentation](https://docs.microsoft.com/aspnet/core)
- [Entity Framework Core](https://docs.microsoft.com/ef/core)
- [RESTful API Design](https://restfulapi.net/)
- [JWT Authentication](https://jwt.io/introduction)

### Database
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Database Design](https://www.mysqltutorial.org/mysql-sample-database.aspx)

### Cloud & DevOps
- [Microsoft Azure Documentation](https://docs.microsoft.com/azure)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)

## 📝 License

This project is developed as a **capstone project** for educational purposes. 

Distributed under the MIT License.  See `LICENSE` file for more information.

```
MIT License

Copyright (c) 2025 Quoc Lam

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. 
```

## 👨‍💻 Author

**Quoc Lam**

- 🎓 Computer Science Student
- 💻 Full-Stack Developer
- 📍 Location: Vietnam
- 🔗 GitHub: [@quoclam204](https://github.com/quoclam204)
- 📧 Email: [Your Email] *(Add if you want)*
- 💼 LinkedIn: [Your LinkedIn] *(Add if you want)*
- 🌐 Portfolio: [Your Website] *(Add if you want)*

### Project Supervisor
- **[Supervisor Name]** - *Academic Advisor*
- **[Institution Name]** - *University/College*

## 🙏 Acknowledgments

This capstone project would not have been possible without:

### Academic
- **[Your University/College Name]** - For providing the academic framework and support
- **[Your Supervisor/Professor Name]** - For guidance and mentorship throughout the project
- **Computer Science Department** - For the comprehensive curriculum and resources

### Technical Resources
- [React Team](https://reactjs.org/) - For the amazing frontend library
- [Microsoft . NET Team](https://dotnet.microsoft.com/) - For the robust backend framework
- [MySQL Team](https://www.mysql.com/) - For the reliable database system
- [Microsoft Azure](https://azure.microsoft.com/) - For cloud infrastructure
- [Stack Overflow Community](https://stackoverflow.com/) - For countless solutions and help

### Inspiration & Learning
- [GitHub](https://github.com/) - For hosting and version control
- [MDN Web Docs](https://developer.mozilla.org/) - For comprehensive web development documentation
- [freeCodeCamp](https://www.freecodecamp.org/) - For free coding education
- [YouTube Tutorials](https://youtube.com/) - For video learning resources

### Special Thanks
- Family and friends for their support and encouragement
- Beta testers who provided valuable feedback
- Open-source community for amazing tools and libraries

## 📞 Contact & Support

### Get Help

**For Issues and Bugs:**
- 🐛 [Create an Issue](https://github.com/quoclam204/do-an-chuyen-nganh/issues/new?template=bug_report.md)
- 📋 [View Existing Issues](https://github.com/quoclam204/do-an-chuyen-nganh/issues)

**For Questions and Discussions:**
- 💬 [Start a Discussion](https://github.com/quoclam204/do-an-chuyen-nganh/discussions/new)
- 📖 [Browse Discussions](https://github.com/quoclam204/do-an-chuyen-nganh/discussions)

**For Feature Requests:**
- ✨ [Request a Feature](https://github.com/quoclam204/do-an-chuyen-nganh/issues/new?template=feature_request.md)

### Connect With Me

- 📧 Email: [your.email@example.com]
- 💼 LinkedIn: [Your LinkedIn Profile]
- 🐦 Twitter: [@YourTwitter]
- 🌐 Website: [your-website.com]

### Project Links

- 🏠 [Homepage](https://github.com/quoclam204/do-an-chuyen-nganh)
- 📚 [Documentation](https://github.com/quoclam204/do-an-chuyen-nganh/wiki)
- 🚀 [Live Demo](https://your-demo-url.azurewebsites.net) *(if available)*
- 📊 [Project Board](https://github.com/quoclam204/do-an-chuyen-nganh/projects)

## 📊 Project Statistics

![GitHub language count](https://img.shields.io/github/languages/count/quoclam204/do-an-chuyen-nganh)
![GitHub top language](https://img.shields.io/github/languages/top/quoclam204/do-an-chuyen-nganh)
![GitHub repo size](https://img.shields.io/github/repo-size/quoclam204/do-an-chuyen-nganh)
![GitHub code size](https://img.shields.io/github/languages/code-size/quoclam204/do-an-chuyen-nganh)
![Lines of code](https://img.shields.io/tokei/lines/github/quoclam204/do-an-chuyen-nganh)
![GitHub last commit](https://img.shields.io/github/last-commit/quoclam204/do-an-chuyen-nganh)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/quoclam204/do-an-chuyen-nganh)

## 🌟 Star History

If you found this project helpful, please consider giving it a star! ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=quoclam204/do-an-chuyen-nganh&type=Date)](https://star-history.com/#quoclam204/do-an-chuyen-nganh&Date)

---

<div align="center">

### 🎓 Capstone Project - Computer Science

**⭐ If you found this project helpful, please consider giving it a star! ⭐**

**Made with ❤️ by [Quoc Lam](https://github.com/quoclam204)**

*This project demonstrates the practical application of full-stack web development skills acquired during the Computer Science program.*

[⬆ Back to Top](#-photo-frame-creator-system)

---

**© 2025 Quoc Lam. All Rights Reserved.**

</div>
