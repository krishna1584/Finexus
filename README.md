# 🏛️ Finexus: Banking Application

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.java.com/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)

A comprehensive banking application built using **microservices architecture** with Spring Boot backend and React TypeScript frontend. This project demonstrates modern enterprise-level software development practices including service discovery, API gateway, inter-service communication, and secure authentication.

## 📋 Table of Contents

- [🎯 Project Overview](#-project-overview)
- [🏗️ Architecture](#️-architecture)
- [🚀 Microservices](#-microservices)
- [🛠️ Technologies Used](#️-technologies-used)
- [📊 Database Design](#-database-design)
- [⚙️ Prerequisites](#️-prerequisites)
- [🚀 Getting Started](#-getting-started)
- [🔧 Configuration](#-configuration)
- [📝 API Documentation](#-api-documentation)
- [🔒 Security](#-security)
- [🧪 Testing](#-testing)
- [📈 Monitoring](#-monitoring)
- [🔧 Troubleshooting](#-troubleshooting)
- [🤝 Contributing](#-contributing)

## 🎯 Project Overview

This Banking Application is built using a **microservices architecture** that provides:

### Core Features:
- 👤 **User Management**: Registration, authentication, profile management
- 💼 **Account Management**: Account creation, balance management, account closure
- 💸 **Fund Transfer**: Inter-account transfers with real-time balance updates
- 💳 **Transaction Management**: Deposits, withdrawals, transaction history
- 🔍 **Transaction Tracking**: View transactions by account or reference ID
- 🔒 **Security**: JWT authentication and OAuth2 integration
- 📱 **Responsive Frontend**: Modern React TypeScript interface

### Architecture Benefits:
- **Scalability**: Each service can be scaled independently
- **Fault Isolation**: Service failures don't affect the entire system
- **Technology Diversity**: Different services can use different technologies
- **Independent Deployment**: Services can be deployed independently
- **Team Autonomy**: Different teams can work on different services

## 🏗️ Architecture

### System Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │────│   API Gateway   │
│  (React App)    │    │   (Port 8088)   │
│  (Port 3000)    │    └─────────────────┘
└─────────────────┘             │
                                 │
                    ┌─────────────────┐
                    │ Service Registry│
                    │   (Eureka)      │
                    │  (Port 8761)    │
                    └─────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                       │                        │
┌───────────────┐    ┌───────────────┐         ┌───────────────┐
│ User Service  │    │Account Service│         │Transaction    │
│ (Port 8082)   │    │ (Port 8081)   │         │Service        │
└───────────────┘    └───────────────┘         │(Port 8084)    │
        │                       │              └───────────────┘
        │                       │                        │
┌───────────────┐    ┌───────────────┐         ┌───────────────┐
│Fund Transfer  │    │Sequence       │         │               │
│Service        │    │Generator      │         │    MySQL      │
│(Port 8085)    │    │(Port 8083)    │         │   Database    │
└───────────────┘    └───────────────┘         └───────────────┘
```

### Key Architectural Patterns:
- **Service Registry Pattern**: Netflix Eureka for service discovery
- **API Gateway Pattern**: Single entry point for all client requests
- **Database per Service**: Each microservice has its own database
- **Circuit Breaker Pattern**: Fault tolerance and resilience
- **Event-Driven Architecture**: Asynchronous communication between services

## 🚀 Microservices

### 1. 🗂️ Service Registry (Eureka Server)
- **Port**: 8761
- **Purpose**: Service discovery and registration hub
- **Features**:
  - Service registration and discovery
  - Health monitoring
  - Load balancing support
  - Web dashboard for monitoring

### 2. 🌐 API Gateway
- **Port**: 8088
- **Purpose**: Single entry point for all client requests
- **Features**:
  - Request routing to appropriate microservices
  - CORS handling for frontend communication
  - OAuth2 and JWT integration
  - Load balancing with service discovery

### 3. 👤 User Service
- **Port**: 8082
- **Purpose**: User management and authentication
- **Database**: `user_db`
- **Features**:
  - User registration and authentication
  - User profile management
  - Status management (ACTIVE, INACTIVE, PENDING)
  - Integration with Keycloak OAuth2

### 4. 💼 Account Service
- **Port**: 8081
- **Purpose**: Bank account management
- **Database**: `account_db`
- **Features**:
  - Account creation and management
  - Balance tracking
  - Account type management (SAVINGS, CURRENT, LOAN)
  - Account closure functionality

### 5. 💳 Transaction Service
- **Port**: 8084
- **Purpose**: Transaction processing and history
- **Database**: `transaction_db`
- **Features**:
  - Deposit and withdrawal operations
  - Transaction history tracking
  - Transaction status management
  - Integration with account service for balance updates

### 6. 💸 Fund Transfer Service
- **Port**: 8085
- **Purpose**: Inter-account fund transfers
- **Database**: `fund_transfer_db`
- **Features**:
  - Fund transfer between accounts
  - Transfer validation and processing
  - Transfer history and tracking
  - Real-time balance updates

### 7. 🔢 Sequence Generator Service
- **Port**: 8083
- **Purpose**: Generate unique IDs for various entities
- **Features**:
  - Account number generation
  - Transaction ID generation
  - Reference number generation
  - Configurable sequence patterns

### 8. 🖥️ Banking Frontend
- **Port**: 3000
- **Technology**: React 19 with TypeScript
- **Features**:
  - Modern Material-UI interface
  - Responsive design
  - Real-time updates
  - Complete banking operations UI

## 🛠️ Technologies Used

### Backend Technologies
- **Java 17**: Latest LTS version for enterprise applications
- **Spring Boot 3.x**: Rapid application development framework
- **Spring Cloud**: Microservices infrastructure components
- **Spring Data JPA**: Data access and ORM layer
- **Spring Security**: Authentication and authorization
- **Netflix Eureka**: Service discovery and registration
- **Spring Cloud Gateway**: API gateway and routing
- **MySQL 8.0**: Relational database management system
- **Maven**: Dependency management and build tool
- **Lombok**: Reduce boilerplate code

### Frontend Technologies
- **React 19.1.1**: Modern JavaScript library for UI
- **TypeScript 4.9.5**: Type-safe JavaScript development
- **Material-UI (MUI) 7.3.2**: React component library
- **Axios 1.12.2**: HTTP client for API communication
- **React Router 7.9.3**: Client-side routing

### DevOps & Tools
- **Git**: Version control
- **Postman**: API testing
- **MySQL Workbench**: Database management

## 📊 Database Design

### User Service Database (`user_db`)
```sql
-- Users table
CREATE TABLE user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email_id VARCHAR(255) UNIQUE NOT NULL,
    contact_no VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    auth_id VARCHAR(255),
    identification_number VARCHAR(50),
    status ENUM('ACTIVE', 'INACTIVE', 'PENDING') DEFAULT 'PENDING',
    user_profile_id BIGINT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User Profile table
CREATE TABLE user_profile (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    address TEXT,
    date_of_birth DATE
);
```

### Account Service Database (`account_db`)
```sql
-- Accounts table
CREATE TABLE account (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    account_type ENUM('SAVINGS', 'CURRENT', 'LOAN') NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    status ENUM('ACTIVE', 'INACTIVE', 'CLOSED') DEFAULT 'ACTIVE',
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Transaction Service Database (`transaction_db`)
```sql
-- Transactions table
CREATE TABLE transaction (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    account_id BIGINT NOT NULL,
    transaction_type ENUM('DEPOSIT', 'WITHDRAWAL', 'TRANSFER_IN', 'TRANSFER_OUT'),
    amount DECIMAL(15,2) NOT NULL,
    balance_after DECIMAL(15,2) NOT NULL,
    description TEXT,
    status ENUM('PENDING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Fund Transfer Database (`fund_transfer_db`)
```sql
-- Fund Transfers table
CREATE TABLE fund_transfer (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    transfer_id VARCHAR(50) UNIQUE NOT NULL,
    from_account_id BIGINT NOT NULL,
    to_account_id BIGINT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    status ENUM('PENDING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## ⚙️ Prerequisites

Before running this application, ensure you have the following installed:

### Required Software
- **Java Development Kit (JDK) 17 or higher**
  ```bash
  java -version
  # Should show version 17 or higher
  ```

- **Maven 3.6+ or use the included Maven wrapper**
  ```bash
  mvn -version
  # Or use ./mvnw (Linux/Mac) or mvnw.cmd (Windows)
  ```

- **MySQL 8.0+**
  ```bash
  mysql --version
  # Ensure MySQL server is running on port 3306
  ```

- **Node.js 16+ and npm**
  ```bash
  node --version
  npm --version
  ```

### Database Setup
1. **Install MySQL 8.0** and ensure it's running on port 3306
2. **Create a main database** (services may share or have individual databases):
   ```sql
   CREATE DATABASE banking;
   ```

3. **Update database credentials** in each service's `application.properties` file or set environment variables:
   ```bash
   # Environment variables (recommended)
   set MYSQL_HOST=localhost
   set MYSQL_PORT=3306
   set MYSQL_DB_NAME=banking
   set MYSQL_USER=root
   set MYSQL_PASSWORD=your_password
   ```

   Or update the `application.properties` files directly:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/banking
   spring.datasource.username=root
   spring.datasource.password=your_password
   ```

## 🚀 Getting Started

Follow these steps to set up and run the complete banking application:

### Step 1: Clone the Repository
```bash
git clone <your-repository-url>
cd banking-application
```

### Step 2: Start MySQL Database
Ensure MySQL is running on your system:
```bash
# On Windows (if MySQL is installed as a service)
net start mysql

# On Linux/Mac
sudo systemctl start mysql
# or
brew services start mysql
```

### Step 3: Start the Microservices (In Order)

**Important**: Start the services in the following order to ensure proper service registration and dependency resolution.

#### 3.1 Start Service Registry (Eureka Server)
```bash
cd Service-Registry
mvn spring-boot:run
# Or using Maven wrapper:
# ./mvnw spring-boot:run (Linux/Mac)
# mvnw.cmd spring-boot:run (Windows)
```
Wait for the service to start completely. You can verify at: http://localhost:8761

#### 3.2 Start API Gateway
```bash
cd ../API-Gateway
mvn spring-boot:run
```
Wait for registration with Eureka. Verify at: http://localhost:8761

#### 3.3 Start Core Services
Open separate terminals for each service:

**User Service:**
```bash
cd User-Service
mvn spring-boot:run
```

**Account Service:**
```bash
cd Account-Service
mvn spring-boot:run
```

**Transaction Service:**
```bash
cd Transaction-Service
mvn spring-boot:run
```

**Fund Transfer Service:**
```bash
cd Fund-Transfer
mvn spring-boot:run
```

**Sequence Generator Service:**
```bash
cd Sequence-Generator
mvn spring-boot:run
```

#### 3.4 Verify All Services
Check the Eureka dashboard at http://localhost:8761 to ensure all services are registered:
- SERVICE-REGISTRY
- API-GATEWAY
- USER-SERVICE
- ACCOUNT-SERVICE
- TRANSACTION-SERVICE
- FUND-TRANSFER-SERVICE
- SEQUENCE-GENERATOR

### Step 4: Start the Frontend Application
```bash
cd banking-frontend
npm install
npm start
```

The frontend will be available at: http://localhost:3000

### Alternative: Quick Start Script (Windows)

For convenience, you can use the provided batch script to start all services automatically:

```bash
# Run the startup script
start-services.bat
```

This script will:
1. Start Service Registry and wait for it to initialize
2. Start API Gateway and wait for registration
3. Start all microservices in parallel
4. Open separate command windows for each service

### Alternative: Using Maven for All Services

You can also build and run all backend services using the parent POM:

```bash
# Build all services
mvn clean install

# Run all services (you'll need separate terminals)
# Or use your IDE to run multiple Spring Boot applications
```

## 🔧 Configuration

### Database Configuration

Each microservice connects to the MySQL database. You can configure the connection using environment variables or by updating the `application.properties` files:

**Example for User Service:**
```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://${MYSQL_HOST:localhost}:${MYSQL_PORT:3306}/${MYSQL_DB_NAME:banking}
spring.datasource.username=${MYSQL_USER:root}
spring.datasource.password=${MYSQL_PASSWORD:your_password}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect

# Service Configuration
spring.application.name=user-service
server.port=8082

# Eureka Configuration
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
```

### API Gateway Routes

The API Gateway routes requests to appropriate microservices:

```properties
# User Service Routes
spring.cloud.gateway.routes[0].id=user-service
spring.cloud.gateway.routes[0].uri=lb://user-service
spring.cloud.gateway.routes[0].predicates[0]=Path=/api/users/**

# Account Service Routes
spring.cloud.gateway.routes[1].id=account-service
spring.cloud.gateway.routes[1].uri=lb://account-service
spring.cloud.gateway.routes[1].predicates[0]=Path=/accounts/**

# Transaction Service Routes
spring.cloud.gateway.routes[2].id=transaction-service
spring.cloud.gateway.routes[2].uri=lb://transaction-service
spring.cloud.gateway.routes[2].predicates[0]=Path=/transactions/**

# Fund Transfer Service Routes
spring.cloud.gateway.routes[3].id=fund-transfer-service
spring.cloud.gateway.routes[3].uri=lb://fund-transfer-service
spring.cloud.gateway.routes[3].predicates[0]=Path=/api/fund-transfers/**
```

### Environment Variables

For easier configuration management, you can set up environment variables. A sample environment file is provided:

1. **Copy the environment template:**
   ```bash
   copy .env.example .env
   ```

2. **Update the `.env` file** with your actual values:
   ```properties
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_DB_NAME=banking
   MYSQL_USER=root
   MYSQL_PASSWORD=your_actual_password
   ```

3. **Set environment variables** (Windows):
   ```bash
   # For current session
   set MYSQL_PASSWORD=your_actual_password
   
   # For permanent setup, use System Properties > Environment Variables
   ```

### Environment-Specific Configuration

For different environments, you can create additional property files:

- `application-dev.properties` (Development)
- `application-prod.properties` (Production)
- `application-test.properties` (Testing)

## 📝 API Documentation

### User Service API Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/api/users` | Create new user | User details |
| GET | `/api/users/{id}` | Get user by ID | - |
| PUT | `/api/users/{id}` | Update user details | Updated user details |
| DELETE | `/api/users/{id}` | Delete user | - |
| GET | `/api/users/{id}/accounts` | Get user's accounts | - |

### Account Service API Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/accounts` | Create new account | Account details |
| GET | `/accounts/{id}` | Get account by ID | - |
| PUT | `/accounts/{id}` | Update account | Updated account details |
| DELETE | `/accounts/{id}` | Close account | - |
| GET | `/accounts/{id}/balance` | Get account balance | - |
| GET | `/accounts/user/{userId}` | Get accounts by user ID | - |

### Transaction Service API Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/transactions/deposit` | Deposit money | Deposit details |
| POST | `/transactions/withdraw` | Withdraw money | Withdrawal details |
| GET | `/transactions/{id}` | Get transaction by ID | - |
| GET | `/transactions/account/{accountId}` | Get account transactions | - |
| GET | `/transactions/reference/{refId}` | Get transaction by reference | - |

### Fund Transfer Service API Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/api/fund-transfers` | Transfer funds | Transfer details |
| GET | `/api/fund-transfers/{id}` | Get transfer by ID | - |
| GET | `/api/fund-transfers/account/{accountId}` | Get account transfers | - |
| GET | `/api/fund-transfers/user/{userId}` | Get user transfers | - |

### Example API Requests

#### Create User
```bash
curl -X POST http://localhost:8088/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "emailId": "john.doe@example.com",
    "contactNo": "1234567890",
    "password": "securePassword123",
    "userProfile": {
      "firstName": "John",
      "lastName": "Doe",
      "address": "123 Main St, City, State",
      "dateOfBirth": "1990-01-01"
    }
  }'
```

#### Create Account
```bash
curl -X POST http://localhost:8088/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "accountType": "SAVINGS",
    "initialDeposit": 1000.00
  }'
```

#### Transfer Funds
```bash
curl -X POST http://localhost:8088/api/fund-transfers \
  -H "Content-Type: application/json" \
  -d '{
    "fromAccountId": 1,
    "toAccountId": 2,
    "amount": 500.00,
    "description": "Payment for services"
  }'
```

## 🔒 Security

The application implements multiple layers of security:

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication mechanism
- **OAuth2 Integration**: Support for external identity providers
- **Keycloak Integration**: Enterprise-grade identity management
- **Role-Based Access Control**: Different access levels for different users

### API Security
- **CORS Configuration**: Controlled cross-origin requests
- **Request Validation**: Input validation and sanitization
- **Rate Limiting**: Prevent API abuse
- **HTTPS Support**: Encrypted communication (configurable)

### Database Security
- **Connection Pooling**: Efficient database connections
- **SQL Injection Prevention**: Parameterized queries with JPA
- **Database User Permissions**: Restricted database access

## 🧪 Testing

### Running Unit Tests
```bash
# Test all services
mvn test

# Test specific service
cd User-Service
mvn test
```

### Running Integration Tests
```bash
# Run integration tests
mvn verify
```

### Frontend Testing
```bash
cd banking-frontend
npm test
```

### API Testing with Postman

1. Import the Postman collection (if available)
2. Set up environment variables:
   - `base_url`: http://localhost:8088
   - `eureka_url`: http://localhost:8761

### Manual Testing Checklist

- [ ] All services register with Eureka
- [ ] API Gateway routes requests correctly
- [ ] User registration and authentication works
- [ ] Account creation and management works
- [ ] Fund transfers work correctly
- [ ] Transaction history is accurate
- [ ] Frontend integrates with backend APIs
- [ ] Database transactions are consistent

## 📈 Monitoring

### Eureka Dashboard
- **URL**: http://localhost:8761
- **Purpose**: Monitor service registration and health

### Spring Boot Actuator
Each service exposes actuator endpoints for monitoring:
- Health: `/actuator/health`
- Metrics: `/actuator/metrics`
- Info: `/actuator/info`

### Logging
- **Default Level**: INFO
- **Log Files**: Available in each service's log directory
- **Configuration**: Customizable via `logback-spring.xml`

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Services Not Registering with Eureka
1. Check if Eureka Server is running on port 8761
2. Verify `eureka.client.service-url.defaultZone` configuration
3. Check firewall settings

#### Database Connection Issues
1. Verify MySQL is running on port 3306
2. Check database credentials in `application.properties`
3. Ensure databases are created
4. Verify database user permissions

#### Frontend Not Connecting to Backend
1. Check if API Gateway is running on port 8088
2. Verify CORS configuration in API Gateway
3. Check browser console for errors
4. Verify API endpoint URLs in frontend code

#### Port Already in Use Errors
1. Check if ports are already occupied:
   ```bash
   # Windows
   netstat -ano | findstr :8761
   
   # Linux/Mac
   lsof -i :8761
   ```
2. Kill the process or change the port in configuration

### Logs Location
- **Service Logs**: Check console output or configure file logging
- **Frontend Logs**: Browser developer tools console
- **Database Logs**: MySQL error logs

## 🤝 Contributing

We welcome contributions to improve this banking application! Here's how you can contribute:

### Getting Started
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guidelines
- Follow Java coding standards and Spring Boot best practices
- Write unit tests for new functionality
- Update documentation for new features
- Follow the existing code style and formatting
- Ensure all tests pass before submitting

### Areas for Contribution
- [ ] Additional security features
- [ ] Performance optimizations
- [ ] Additional transaction types
- [ ] Enhanced frontend UI/UX
- [ ] CI/CD pipeline setup
- [ ] Additional testing coverage
- [ ] Documentation improvements

---

**Happy Banking! 🏦✨**

> This application is for educational and demonstration purposes. For production use, ensure proper security measures, monitoring, and compliance with banking regulations.


