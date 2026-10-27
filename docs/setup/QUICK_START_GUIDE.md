# 🚀 CCCP Amazon - Quick Start Guide

**Developer**: Tanmay Shinde  
**Date**: October 3, 2026  
**Status**: Ready to start database setup

---

## ✅ What's Already Done

1. ✅ Node.js and npm installed and verified
2. ✅ All dependencies installed (server + client)
3. ✅ Environment files configured
4. ✅ Helper scripts created

---

## 🎯 Current Step: Starting Docker Desktop

### YOU ARE HERE 👇

**Action Required**: 
1. Open Docker Desktop application
2. Wait for it to fully start (whale icon in system tray)
3. Tell Kiro "ready" when Docker Desktop shows "running"

---

## 📁 Helper Scripts Created For You

I've created 3 batch files in your project root that you can double-click:

### 1. `START_MYSQL.bat`
- Starts MySQL in Docker container
- Automatically waits 15 seconds for MySQL to initialize
- Shows container status

### 2. `START_DEV.bat`
- Starts backend server (port 5000)
- Starts frontend server (port 5173)
- Opens both in separate windows

### 3. `STOP_MYSQL.bat`
- Stops and removes MySQL container
- Use this when you're done working

---

## 🔄 What Will Happen After Docker Starts

Once you tell me Docker is ready, I'll automatically:

1. **Start MySQL container** (using the helper script)
2. **Wait for MySQL to initialize** (~15 seconds)
3. **Run database migrations** - Creates all 27 tables
4. **Seed the database** - Adds test data:
   - Super Admin account
   - Admin account
   - Customer account
   - Sample products
   - Categories
   - Coupons
5. **Start the backend server**
6. **Start the frontend server**
7. **Test the application**
8. **Create a full bug report and task list**

---

## 🔐 Default Login Credentials (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | superadmin@amazon.com | SuperAdmin123! |
| **Admin** | admin@amazon.com | Admin123! |
| **Customer** | customer@amazon.com | Customer123! |

---

## 🌐 Access URLs (Once Running)

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/v1
- **API Health Check**: http://localhost:5000/api/v1/health

---

## 📊 Database Connection Details

```
Host: localhost
Port: 3307 (mapped from 3306 in container)
Database: cccp_amazon
Username: cccp_admin
Password: cccp_secure_db_pass_2026
```

---

## 🛠️ Useful Commands

### Check Docker Containers:
```bash
docker ps -a
```

### Check MySQL Container Logs:
```bash
docker logs cccp_amazon_mysql
```

### Connect to MySQL (if needed):
```bash
docker exec -it cccp_amazon_mysql mysql -u cccp_admin -pcccp_secure_db_pass_2026 cccp_amazon
```

### Run Migrations Manually:
```bash
cd server
npm run migrate
```

### Run Seeders Manually:
```bash
cd server
npm run seed
```

### Start Backend Only:
```bash
cd server
npm run dev
```

### Start Frontend Only:
```bash
cd client
npm run dev
```

---

## 🐛 If Something Goes Wrong

### MySQL Container Already Exists:
```bash
docker stop cccp_amazon_mysql
docker rm cccp_amazon_mysql
```

### Port 3307 Already in Use:
```bash
# Find what's using the port:
netstat -ano | findstr :3307

# Kill the process (replace PID with actual process ID):
taskkill /PID <PID> /F
```

### Reset Everything:
```bash
# Stop and remove container
docker stop cccp_amazon_mysql
docker rm cccp_amazon_mysql

# Remove volumes (WARNING: deletes all data)
docker volume rm cccp_amazon_mysql_data

# Start fresh
# Run START_MYSQL.bat again
```

---

## 📋 Next Steps After Everything Starts

1. **Test Authentication**
   - Try logging in with default credentials
   - Test all three user roles

2. **Test Customer Features**
   - Browse products
   - Add to cart
   - Checkout process
   - View orders

3. **Test Admin Features**
   - View dashboard
   - Manage products
   - View orders
   - Process returns

4. **Identify Bugs**
   - Document any errors
   - Note missing features
   - Check console for errors

---

## 🎯 Your Development Focus Areas

As Application Developer, you'll work on:

### Frontend (React):
- [ ] Product listing page
- [ ] Product detail page
- [ ] Shopping cart
- [ ] Checkout flow
- [ ] User profile
- [ ] Order history

### Backend (Node.js):
- [ ] Product APIs
- [ ] User APIs
- [ ] Cart APIs
- [ ] Order APIs
- [ ] Database integration
- [ ] Query optimization

### Testing:
- [ ] API endpoint testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] Bug fixes

---

## 🤝 Team Collaboration

- **Yogeshwar**: Will handle AWS infrastructure, ECS, RDS
- **Soham**: Will handle Docker, CI/CD pipeline, ECR
- **Rushil**: Co-developer + Scrum coordination
- **You (Tanmay)**: Application development + testing

---

## 📞 Need Help?

If you encounter any issues:
1. Check the console output for errors
2. Check Docker Desktop logs
3. Check MySQL container logs
4. Ask Kiro for help! 😊

---

**Current Status**: ⏳ Waiting for Docker Desktop to start...

Once Docker is running, tell me "ready" and I'll handle the rest! 🚀
