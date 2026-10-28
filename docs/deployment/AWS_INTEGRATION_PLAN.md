# 🚀 AWS Integration Plan - CCCP Amazon E-Commerce

**Project**: CCCP Amazon Full-Stack E-Commerce Platform  
**Your Role**: Application Developer (Tanmay Shinde)  
**Date**: October 3, 2026  
**Status**: Planning Phase

---

## 📋 Table of Contents

1. [Current Architecture](#current-architecture)
2. [AWS Services to Integrate](#aws-services-to-integrate)
3. [Phase 1: Storage & CDN](#phase-1-storage--cdn)
4. [Phase 2: Database Migration](#phase-2-database-migration)
5. [Phase 3: Authentication](#phase-3-authentication)
6. [Phase 4: Serverless Functions](#phase-4-serverless-functions)
7. [Phase 5: CI/CD Pipeline](#phase-5-cicd-pipeline)
8. [Phase 6: Monitoring & Optimization](#phase-6-monitoring--optimization)
9. [Implementation Timeline](#implementation-timeline)
10. [Cost Estimation](#cost-estimation)

---

## 🏗️ Current Architecture

### **What We Have Now:**

```
┌─────────────────────────────────────────────────────────┐
│                    LOCAL DEVELOPMENT                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Frontend (React + Vite)                                │
│  └─> http://localhost:5173                              │
│  └─> Redux state management                             │
│  └─> Local storage for images                           │
│                                                          │
│  Backend (Node.js + Express)                            │
│  └─> http://localhost:5000                              │
│  └─> REST API with 12 routes                            │
│  └─> JWT authentication                                 │
│  └─> File uploads (local disk)                          │
│                                                          │
│  Database (MySQL in Docker)                             │
│  └─> localhost:3307                                     │
│  └─> 27 tables                                          │
│  └─> 10 products, 13 reviews, 10 Q&A                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### **Current Limitations:**
- ❌ Images stored on local disk (not scalable)
- ❌ Database runs in Docker (not production-ready)
- ❌ No CDN (slow image loading)
- ❌ No caching (repeated database queries)
- ❌ No email notifications
- ❌ No monitoring or logs
- ❌ No CI/CD pipeline
- ❌ No auto-scaling

---

## ☁️ AWS Services to Integrate

### **Priority 1: Critical for Production** 🔴

| Service | Purpose | Why It's Critical |
|---------|---------|-------------------|
| **S3** | Product image storage | Scalable, durable file storage |
| **CloudFront** | CDN for images | Fast global content delivery |
| **RDS (MySQL)** | Managed database | Production-grade, automated backups |
| **Elastic Beanstalk** | Application hosting | Easy deployment, auto-scaling |

### **Priority 2: Important Features** 🟡

| Service | Purpose | Benefits |
|---------|---------|----------|
| **SES** | Email notifications | Order confirmations, password resets |
| **CloudWatch** | Logging & monitoring | Track errors, performance metrics |
| **Lambda** | Serverless functions | Image processing, scheduled tasks |
| **API Gateway** | API management | Rate limiting, caching, monitoring |

### **Priority 3: Advanced Optimization** 🟢

| Service | Purpose | Benefits |
|---------|---------|----------|
| **ElastiCache (Redis)** | Caching layer | Faster queries, reduce DB load |
| **Cognito** | User management | Social login, MFA, user pools |
| **SNS** | Push notifications | Real-time alerts |
| **CodePipeline** | CI/CD automation | Automated testing & deployment |
| **Route 53** | DNS management | Custom domain, health checks |
| **WAF** | Web firewall | DDoS protection, security rules |

---

## 📦 Phase 1: Storage & CDN (Week 1-2)

### **Goal**: Move product images to AWS S3 and serve via CloudFront

### **What We'll Build:**

```
┌─────────────────────────────────────────────────────────┐
│                    IMAGE FLOW                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Admin uploads image                                    │
│       ↓                                                  │
│  Backend receives file                                  │
│       ↓                                                  │
│  Upload to S3 bucket                                    │
│       ↓                                                  │
│  Store S3 URL in database                               │
│       ↓                                                  │
│  Frontend loads from CloudFront CDN                     │
│       ↓                                                  │
│  Images cached globally (fast!)                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### **Implementation Steps:**

#### **Step 1.1: Setup S3 Bucket**
```bash
# Create S3 bucket for product images
aws s3 mb s3://cccp-amazon-product-images

# Configure bucket policy (public read)
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicRead",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::cccp-amazon-product-images/*"
  }]
}

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket cccp-amazon-product-images \
  --versioning-configuration Status=Enabled
```

#### **Step 1.2: Install AWS SDK**
```bash
cd server
npm install aws-sdk multer-s3
```

#### **Step 1.3: Create S3 Upload Service**
```javascript
// server/src/services/s3.service.js

const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'cccp-amazon-product-images',
    acl: 'public-read',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const uniqueName = `products/${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'));
    }
  }
});

module.exports = { upload, s3 };
```

#### **Step 1.4: Update Product Controller**
```javascript
// Modify server/src/routes/admin.routes.js

const { upload } = require('../services/s3.service');

router.post(
  '/products',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  upload.array('images', 5), // Upload to S3
  AdminController.createProduct
);
```

#### **Step 1.5: Setup CloudFront Distribution**
```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name cccp-amazon-product-images.s3.amazonaws.com \
  --default-root-object index.html

# Output: CloudFront URL
# Example: https://d1234abcd.cloudfront.net
```

#### **Step 1.6: Update Frontend to Use CloudFront**
```javascript
// Update image URLs in frontend
const imageUrl = product.images[0].imageUrl;
// Now returns: https://d1234abcd.cloudfront.net/products/image.jpg
```

### **Environment Variables to Add:**
```env
# server/.env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=cccp-amazon-product-images
CLOUDFRONT_URL=https://d1234abcd.cloudfront.net
```

### **Expected Results:**
- ✅ Images uploaded to S3 instead of local disk
- ✅ Images served via CloudFront CDN (faster loading)
- ✅ Auto image optimization
- ✅ Global caching

### **Testing:**
```bash
# Test S3 upload
curl -X POST http://localhost:5000/api/v1/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "images=@test-image.jpg"

# Verify image in S3
aws s3 ls s3://cccp-amazon-product-images/products/

# Test CloudFront URL
curl -I https://d1234abcd.cloudfront.net/products/image.jpg
```

---

## 🗄️ Phase 2: Database Migration (Week 3)

### **Goal**: Migrate from Docker MySQL to AWS RDS

### **What We'll Build:**

```
┌─────────────────────────────────────────────────────────┐
│              DATABASE MIGRATION                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Current: MySQL in Docker (localhost:3307)              │
│       ↓                                                  │
│  Create RDS MySQL instance                              │
│       ↓                                                  │
│  Export data from local DB                              │
│       ↓                                                  │
│  Import data to RDS                                     │
│       ↓                                                  │
│  Update backend connection string                       │
│       ↓                                                  │
│  Production-ready database!                             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### **Implementation Steps:**

#### **Step 2.1: Create RDS Instance**
```bash
# Create RDS MySQL instance
aws rds create-db-instance \
  --db-instance-identifier cccp-amazon-db \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --engine-version 8.0 \
  --master-username admin \
  --master-user-password YourSecurePassword123! \
  --allocated-storage 20 \
  --backup-retention-period 7 \
  --publicly-accessible \
  --storage-encrypted

# Wait for creation (5-10 minutes)
aws rds wait db-instance-available \
  --db-instance-identifier cccp-amazon-db
```

#### **Step 2.2: Export Current Data**
```bash
# Export from local MySQL
docker exec cccp_amazon_mysql mysqldump \
  -u cccp_admin \
  -pcccp_secure_db_pass_2026 \
  cccp_amazon > backup.sql

# Verify export
ls -lh backup.sql
```

#### **Step 2.3: Import to RDS**
```bash
# Get RDS endpoint
RDS_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier cccp-amazon-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

# Import data
mysql -h $RDS_ENDPOINT \
  -u admin \
  -pYourSecurePassword123! \
  cccp_amazon < backup.sql
```

#### **Step 2.4: Update Backend Connection**
```javascript
// server/.env
DB_HOST=cccp-amazon-db.c1234abcd.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=YourSecurePassword123!
DB_NAME=cccp_amazon
```

#### **Step 2.5: Test Connection**
```bash
# Restart backend
npm run dev

# Test API
curl http://localhost:5000/api/v1/health
# Should return: {"status": "ok", "database": "connected"}
```

### **RDS Features to Configure:**

1. **Automated Backups** (Daily snapshots)
2. **Multi-AZ Deployment** (High availability)
3. **Read Replicas** (Scale reads)
4. **Performance Insights** (Query monitoring)
5. **Enhanced Monitoring** (System metrics)

### **Expected Results:**
- ✅ Production-grade database
- ✅ Automated daily backups
- ✅ 99.95% uptime SLA
- ✅ Easy scaling (vertical & horizontal)
- ✅ Monitoring & alerts

---

## 🔐 Phase 3: Authentication (Week 4)

### **Goal**: Enhance authentication with AWS Cognito

### **What We'll Add:**

```
┌─────────────────────────────────────────────────────────┐
│           AUTHENTICATION FEATURES                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Current: JWT tokens in localStorage                    │
│                                                          │
│  New Features:                                          │
│  ✅ Social login (Google, Facebook)                     │
│  ✅ Multi-factor authentication (MFA)                   │
│  ✅ Email verification                                  │
│  ✅ Password reset via email                            │
│  ✅ User pools & identity management                    │
│  ✅ Federated identities                                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### **Implementation Steps:**

#### **Step 3.1: Create Cognito User Pool**
```bash
# Create user pool
aws cognito-idp create-user-pool \
  --pool-name cccp-amazon-users \
  --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=true}" \
  --auto-verified-attributes email \
  --mfa-configuration OPTIONAL

# Create app client
aws cognito-idp create-user-pool-client \
  --user-pool-id us-east-1_ABC123 \
  --client-name cccp-amazon-web \
  --generate-secret \
  --explicit-auth-flows ADMIN_NO_SRP_AUTH USER_PASSWORD_AUTH
```

#### **Step 3.2: Install Cognito SDK**
```bash
cd client
npm install amazon-cognito-identity-js

cd ../server
npm install amazon-cognito-identity-js aws-sdk
```

#### **Step 3.3: Update Auth Service**
```javascript
// server/src/services/cognito.service.js

const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();

class CognitoService {
  static async signUp(email, password, firstName, lastName) {
    const params = {
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'given_name', Value: firstName },
        { Name: 'family_name', Value: lastName }
      ]
    };
    
    return cognito.signUp(params).promise();
  }
  
  static async confirmSignUp(email, code) {
    const params = {
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: code
    };
    
    return cognito.confirmSignUp(params).promise();
  }
  
  // ... more methods
}
```

### **New Features Available:**
- ✅ Email verification on signup
- ✅ Password reset via email
- ✅ MFA with SMS or TOTP
- ✅ Social login (Google, Facebook, Apple)
- ✅ User session management
- ✅ Token refresh

---

## ⚡ Phase 4: Serverless Functions (Week 5)

### **Goal**: Add Lambda functions for background tasks

### **Lambda Functions to Create:**

#### **Lambda 1: Image Processing**
```javascript
// Resize product images on upload
// Input: S3 upload event
// Output: Create thumbnails (small, medium, large)

exports.handler = async (event) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;
  
  // Download image from S3
  // Resize to 3 sizes (100px, 500px, 1000px)
  // Upload thumbnails back to S3
  // Update database with thumbnail URLs
};
```

#### **Lambda 2: Daily Analytics**
```javascript
// Run daily at midnight
// Calculate: sales, revenue, top products
// Send summary email to admins

exports.handler = async (event) => {
  // Query RDS for yesterday's data
  // Calculate metrics
  // Send via SES
};
```

#### **Lambda 3: Low Stock Alerts**
```javascript
// Run every hour
// Check inventory levels
// Send alerts when stock < threshold

exports.handler = async (event) => {
  // Query inventory table
  // Find low stock items
  // Send SNS notification to admins
};
```

#### **Lambda 4: Order Confirmation Emails**
```javascript
// Triggered on order creation
// Send confirmation email to customer

exports.handler = async (event) => {
  const order = JSON.parse(event.body);
  // Format email template
  // Send via SES
};
```

---

## 🚀 Phase 5: CI/CD Pipeline (Week 6)

### **Goal**: Automate testing and deployment

### **Pipeline Architecture:**

```
┌─────────────────────────────────────────────────────────┐
│                  CI/CD PIPELINE                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Push code to GitHub                                 │
│       ↓                                                  │
│  2. CodePipeline detects change                         │
│       ↓                                                  │
│  3. CodeBuild runs tests                                │
│       ├─> Backend: npm test                             │
│       └─> Frontend: npm test                            │
│       ↓                                                  │
│  4. Build artifacts                                     │
│       ├─> Backend: Node.js app                          │
│       └─> Frontend: Static files                        │
│       ↓                                                  │
│  5. CodeDeploy deploys to:                              │
│       ├─> Backend: Elastic Beanstalk                    │
│       └─> Frontend: S3 + CloudFront                     │
│       ↓                                                  │
│  6. Send deployment notification (SNS)                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### **Setup Steps:**

#### **Step 5.1: Create buildspec.yml**
```yaml
# buildspec.yml (backend)
version: 0.2

phases:
  pre_build:
    commands:
      - echo Installing dependencies...
      - npm install
  build:
    commands:
      - echo Running tests...
      - npm test
      - echo Building application...
      - npm run build
  post_build:
    commands:
      - echo Build completed

artifacts:
  files:
    - '**/*'
```

#### **Step 5.2: Create CodePipeline**
```bash
# Create pipeline
aws codepipeline create-pipeline \
  --pipeline file://pipeline-config.json

# Pipeline stages:
# 1. Source (GitHub)
# 2. Build (CodeBuild)
# 3. Test (CodeBuild)
# 4. Deploy (Elastic Beanstalk)
```

---

## 📊 Phase 6: Monitoring & Optimization (Week 7)

### **Services to Setup:**

#### **CloudWatch Dashboards**
- API response times
- Error rates
- Database connections
- Active users
- Order volume

#### **CloudWatch Alarms**
- High error rate (> 5%)
- Slow response time (> 2s)
- Low disk space (< 20%)
- High CPU usage (> 80%)
- Database connection failures

#### **ElastiCache (Redis)**
```javascript
// Cache frequent queries
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_ENDPOINT,
  port: 6379
});

// Cache product list
app.get('/api/v1/products', async (req, res) => {
  const cacheKey = `products:${JSON.stringify(req.query)}`;
  
  // Check cache first
  const cached = await client.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  // Query database
  const products = await ProductService.queryProducts(req.query);
  
  // Cache for 5 minutes
  await client.setex(cacheKey, 300, JSON.stringify(products));
  
  res.json(products);
});
```

---

## 📅 Implementation Timeline

| Phase | Duration | Complexity | Priority |
|-------|----------|------------|----------|
| **Phase 1: S3 + CloudFront** | 1-2 weeks | Medium | 🔴 Critical |
| **Phase 2: RDS Migration** | 1 week | Low | 🔴 Critical |
| **Phase 3: Cognito Auth** | 1 week | Medium | 🟡 Important |
| **Phase 4: Lambda Functions** | 1 week | Medium | 🟡 Important |
| **Phase 5: CI/CD Pipeline** | 1 week | High | 🟡 Important |
| **Phase 6: Monitoring** | 1 week | Medium | 🟢 Nice to Have |

**Total Timeline**: 6-7 weeks (1.5-2 months)

---

## 💰 Cost Estimation (Monthly)

### **Free Tier (First 12 months)**
- ✅ EC2: 750 hours/month (t2.micro)
- ✅ RDS: 750 hours/month (db.t2.micro)
- ✅ S3: 5GB storage + 20,000 requests
- ✅ CloudFront: 50GB data transfer
- ✅ Lambda: 1M requests + 400,000 GB-seconds
- ✅ SES: 62,000 emails/month

### **After Free Tier**

| Service | Usage | Cost/Month |
|---------|-------|------------|
| **EC2 (t3.small)** | 1 instance | $15-20 |
| **RDS (db.t3.micro)** | 1 instance | $15-20 |
| **S3** | 100GB storage | $2-3 |
| **CloudFront** | 100GB transfer | $8-10 |
| **Lambda** | 5M invocations | $1-2 |
| **ElastiCache** | t3.micro | $12-15 |
| **SES** | 10,000 emails | $1 |
| **CloudWatch** | Logs & metrics | $5-10 |
| **Route 53** | 1 hosted zone | $0.50 |

**Total Estimated Cost**: $60-90/month (small-medium traffic)

**With Auto-Scaling**: $100-200/month (high traffic)

---

## 🎯 Success Metrics

### **Performance Goals:**
- ✅ Page load time: < 2 seconds
- ✅ API response time: < 500ms
- ✅ Image load time: < 1 second (via CDN)
- ✅ Database query time: < 100ms (with caching)

### **Reliability Goals:**
- ✅ Uptime: 99.9% (8.76 hours downtime/year)
- ✅ Error rate: < 0.1%
- ✅ Successful deployments: > 95%

### **Scalability Goals:**
- ✅ Support 1,000+ concurrent users
- ✅ Handle 10,000+ products
- ✅ Process 500+ orders/day

---

## 🚦 Next Steps

### **Immediate Actions:**

1. **Setup AWS Account** (if not done)
   - Create IAM user with programmatic access
   - Configure AWS CLI
   - Setup billing alerts

2. **Start with Phase 1** (S3 + CloudFront)
   - Create S3 bucket
   - Upload test images
   - Setup CloudFront distribution
   - Update backend code

3. **Document Everything**
   - Keep track of AWS resource ARNs
   - Document environment variables
   - Create runbook for common tasks

---

## 📚 Learning Resources

### **AWS Documentation:**
- [S3 Developer Guide](https://docs.aws.amazon.com/s3/)
- [RDS User Guide](https://docs.aws.amazon.com/rds/)
- [Lambda Developer Guide](https://docs.aws.amazon.com/lambda/)
- [Elastic Beanstalk Guide](https://docs.aws.amazon.com/elasticbeanstalk/)

### **Tutorials:**
- [AWS Getting Started](https://aws.amazon.com/getting-started/)
- [AWS Architecture Center](https://aws.amazon.com/architecture/)

---

## ✅ Completion Checklist

- [ ] AWS account created and configured
- [ ] S3 bucket for images created
- [ ] CloudFront distribution setup
- [ ] RDS MySQL instance created
- [ ] Data migrated to RDS
- [ ] Backend deployed to Elastic Beanstalk
- [ ] Frontend deployed to S3 + CloudFront
- [ ] Cognito user pool configured
- [ ] Lambda functions deployed
- [ ] CI/CD pipeline setup
- [ ] CloudWatch monitoring active
- [ ] ElastiCache Redis configured
- [ ] SES email service configured
- [ ] Custom domain configured (Route 53)
- [ ] SSL certificate installed
- [ ] Performance testing completed
- [ ] Security audit completed
- [ ] Documentation completed

---

**Ready to start implementing?** 🚀

Let me know which phase you want to start with!
