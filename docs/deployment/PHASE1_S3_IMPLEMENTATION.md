# 🚀 Phase 1: S3 + CloudFront Implementation Guide

**Goal**: Move product images to AWS S3 and serve via CloudFront CDN  
**Time Required**: 2-3 hours  
**Difficulty**: Medium

---

## 📋 Prerequisites Checklist

Before we start, you need:

- [ ] AWS Account (free tier eligible)
- [ ] AWS Access Key ID
- [ ] AWS Secret Access Key
- [ ] AWS CLI installed (optional but recommended)

### **Don't have AWS account?**

**Create one now**: https://aws.amazon.com/free/

**What you get FREE for 12 months:**
- ✅ 5GB S3 storage
- ✅ 20,000 GET requests
- ✅ 2,000 PUT requests
- ✅ 50GB CloudFront data transfer

---

## 🔧 Step 1: AWS Account Setup (5 minutes)

### **1.1: Create IAM User for Programmatic Access**

```bash
# Go to AWS Console → IAM → Users → Add User

Name: cccp-amazon-app
Access type: ☑ Programmatic access

# Attach policies:
☑ AmazonS3FullAccess
☑ CloudFrontFullAccess

# Download credentials CSV (SAVE THIS SECURELY!)
Access Key ID: AKIA... (example)
Secret Access Key: wJalrXU... (example)
```

### **1.2: Store Credentials Securely**

**IMPORTANT**: Never commit these to Git!

```bash
# Add to server/.env
AWS_ACCESS_KEY_ID=AKIA...your_key_here
AWS_SECRET_ACCESS_KEY=wJalrXU...your_secret_here
AWS_REGION=us-east-1
AWS_S3_BUCKET=cccp-amazon-product-images
```

```bash
# Make sure .env is in .gitignore
echo "Check .gitignore includes .env" >> .gitignore
```

---

## 📦 Step 2: Create S3 Bucket (10 minutes)

### **Option A: Using AWS Console (Easier)**

1. Go to https://s3.console.aws.amazon.com/
2. Click **"Create bucket"**
3. Configure:
   ```
   Bucket name: cccp-amazon-product-images
   Region: US East (N. Virginia) us-east-1
   
   Block Public Access settings:
   ☐ Block all public access (UNCHECK THIS)
   ☑ I acknowledge that the current settings might result in this bucket and the objects within becoming public
   
   Bucket Versioning: Enable
   
   Tags (optional):
   - Key: Project, Value: CCCP-Amazon
   - Key: Environment, Value: Production
   
   Default encryption: Enable (AES-256)
   ```
4. Click **"Create bucket"**

### **Option B: Using AWS CLI (Faster)**

```bash
# Install AWS CLI if you haven't
# Windows: https://aws.amazon.com/cli/

# Configure AWS CLI
aws configure
# Enter your Access Key ID
# Enter your Secret Access Key  
# Default region: us-east-1
# Default output: json

# Create bucket
aws s3 mb s3://cccp-amazon-product-images --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket cccp-amazon-product-images \
  --versioning-configuration Status=Enabled

# Set bucket policy (public read)
cat > bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::cccp-amazon-product-images/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
  --bucket cccp-amazon-product-images \
  --policy file://bucket-policy.json
```

### **2.1: Verify Bucket Created**

```bash
# List your buckets
aws s3 ls

# Should show:
# 2026-10-03 cccp-amazon-product-images
```

---

## 💻 Step 3: Install AWS SDK (2 minutes)

```bash
# Navigate to server directory
cd server

# Install AWS SDK and multer-s3
npm install aws-sdk multer-s3 --save

# Verify installation
npm list aws-sdk multer-s3
```

---

## 📝 Step 4: Create S3 Upload Service (15 minutes)

### **4.1: Create S3 Service File**

Create: `server/src/services/s3.service.js`

```javascript
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const logger = require('../../config/logger');

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

const s3 = new AWS.S3();

// Multer S3 storage configuration
const uploadToS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET || 'cccp-amazon-product-images',
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
      cb(null, {
        fieldName: file.fieldname,
        uploadedBy: req.user?.id || 'unknown',
        uploadDate: new Date().toISOString(),
      });
    },
    key: (req, file, cb) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const filename = `products/${uniqueSuffix}${ext}`;
      
      logger.info(`Uploading file to S3: ${filename}`);
      cb(null, filename);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow images
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
    }
  },
});

// Function to delete file from S3
const deleteFromS3 = async (fileKey) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET || 'cccp-amazon-product-images',
      Key: fileKey,
    };
    
    await s3.deleteObject(params).promise();
    logger.info(`Deleted file from S3: ${fileKey}`);
    return true;
  } catch (error) {
    logger.error(`Error deleting file from S3: ${error.message}`);
    throw error;
  }
};

// Function to get signed URL (for private files, if needed later)
const getSignedUrl = (fileKey, expiresIn = 3600) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET || 'cccp-amazon-product-images',
    Key: fileKey,
    Expires: expiresIn, // URL expires in 1 hour
  };
  
  return s3.getSignedUrl('getObject', params);
};

// Function to check if bucket exists
const checkBucketExists = async () => {
  try {
    await s3.headBucket({
      Bucket: process.env.AWS_S3_BUCKET || 'cccp-amazon-product-images',
    }).promise();
    return true;
  } catch (error) {
    logger.error(`S3 Bucket check failed: ${error.message}`);
    return false;
  }
};

module.exports = {
  uploadToS3,
  deleteFromS3,
  getSignedUrl,
  checkBucketExists,
  s3,
};
```

### **4.2: Update Environment Variables**

Add to `server/.env`:

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
AWS_S3_BUCKET=cccp-amazon-product-images

# CloudFront (will add after Step 6)
# CLOUDFRONT_URL=https://d1234abcd.cloudfront.net
```

---

## 🔄 Step 5: Update Upload Middleware (10 minutes)

### **5.1: Modify Existing Upload Middleware**

Find: `server/src/middlewares/upload.middleware.js`

**Replace the entire file with:**

```javascript
const { uploadToS3 } = require('../services/s3.service');
const logger = require('../../config/logger');

// Export S3 upload middleware
module.exports = uploadToS3;

// Also export error handler
module.exports.handleUploadError = (err, req, res, next) => {
  if (err) {
    logger.error(`File upload error: ${err.message}`);
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload failed',
    });
  }
  next();
};
```

### **5.2: Update Admin Routes**

Find: `server/src/routes/admin.routes.js`

**Update the product creation route:**

```javascript
const express = require('express');
const AdminController = require('../controllers/admin.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const upload = require('../middlewares/upload.middleware'); // Now uses S3!

const router = express.Router();

// ... other routes ...

// Create product with S3 image upload
router.post(
  '/products',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  upload.array('images', 5), // ✅ Now uploads to S3!
  upload.handleUploadError,
  AdminController.createProduct
);

// Update product with S3 image upload
router.put(
  '/products/:id',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  upload.array('images', 5), // ✅ Now uploads to S3!
  upload.handleUploadError,
  AdminController.updateProduct
);

// ... rest of routes ...

module.exports = router;
```

### **5.3: Update Product Service to Handle S3 URLs**

Find: `server/src/services/admin.product.service.js`

**Update the image handling section:**

```javascript
// In createProduct method, after product creation:

if (files && files.length > 0) {
  const imagePromises = files.map((file, index) => {
    return ProductImage.create({
      productId: product.id,
      imageUrl: file.location, // ✅ S3 URL from multer-s3
      altText: `${product.title} - Image ${index + 1}`,
      isPrimary: index === 0,
      displayOrder: index + 1,
    });
  });
  
  await Promise.all(imagePromises);
  logger.info(`Uploaded ${files.length} images to S3 for product ${product.id}`);
}
```

---

## ✅ Step 6: Test S3 Upload (10 minutes)

### **6.1: Start the Backend**

```bash
cd server
npm run dev
```

### **6.2: Test with Postman or cURL**

```bash
# Login as admin first
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@amazon.com",
    "password": "Admin123!"
  }'

# Copy the token from response
TOKEN="your_jwt_token_here"

# Test image upload (replace with actual image path)
curl -X POST http://localhost:5000/api/v1/admin/products \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Test Product with S3" \
  -F "categoryId=1" \
  -F "brand=TestBrand" \
  -F "shortDescription=Testing S3 upload" \
  -F "description=This product image should be in S3" \
  -F "basePrice=99.99" \
  -F "salePrice=79.99" \
  -F "images=@/path/to/your/test-image.jpg"
```

### **6.3: Verify in S3**

```bash
# Check if image uploaded to S3
aws s3 ls s3://cccp-amazon-product-images/products/

# Should show something like:
# 2026-10-03 12:34:56    52341 products/1727978096789-123456789.jpg
```

### **6.4: Check Image URL in Database**

```bash
# Connect to MySQL
mysql -h localhost -P 3307 -u cccp_admin -pcccp_secure_db_pass_2026 cccp_amazon

# Check product images
SELECT id, product_id, image_url FROM product_images ORDER BY id DESC LIMIT 5;

# Should show S3 URLs like:
# https://cccp-amazon-product-images.s3.amazonaws.com/products/1727978096789-123456789.jpg
```

---

## 🌐 Step 7: Setup CloudFront CDN (20 minutes)

### **7.1: Create CloudFront Distribution**

**Option A: AWS Console**

1. Go to https://console.aws.amazon.com/cloudfront/
2. Click **"Create Distribution"**
3. Configure:
   ```
   Origin Domain: cccp-amazon-product-images.s3.amazonaws.com
   Origin Path: (leave empty)
   Name: CCCP-Amazon-S3-Origin
   
   Origin Access: Public
   
   Viewer Protocol Policy: Redirect HTTP to HTTPS
   Allowed HTTP Methods: GET, HEAD, OPTIONS
   
   Cache Policy: CachingOptimized
   
   Price Class: Use All Edge Locations (best performance)
   
   Alternate Domain Names: (leave empty for now)
   SSL Certificate: Default CloudFront Certificate
   ```
4. Click **"Create Distribution"**
5. **Wait 5-15 minutes** for deployment

**Option B: AWS CLI**

```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name cccp-amazon-product-images.s3.amazonaws.com \
  --default-root-object index.html

# Get distribution ID and domain name
aws cloudfront list-distributions \
  --query 'DistributionList.Items[0].[Id,DomainName]' \
  --output table

# Example output:
# d1234abcd5678ef.cloudfront.net
```

### **7.2: Get CloudFront URL**

After deployment completes:

```bash
# Find your CloudFront distribution
aws cloudfront list-distributions \
  --query 'DistributionList.Items[*].[Id,DomainName,Status]' \
  --output table

# Copy the DomainName (e.g., d1234abcd.cloudfront.net)
```

### **7.3: Update Environment Variables**

Add to `server/.env`:

```env
# Add CloudFront URL
CLOUDFRONT_URL=https://d1234abcd.cloudfront.net
USE_CLOUDFRONT=true
```

### **7.4: Create URL Helper Function**

Create: `server/src/utils/s3-url.helper.js`

```javascript
/**
 * Convert S3 URL to CloudFront URL for faster delivery
 */
const getImageUrl = (s3Url) => {
  if (!s3Url) return null;
  
  // If CloudFront is enabled, replace S3 URL with CloudFront URL
  if (process.env.USE_CLOUDFRONT === 'true' && process.env.CLOUDFRONT_URL) {
    const bucket = process.env.AWS_S3_BUCKET || 'cccp-amazon-product-images';
    const region = process.env.AWS_REGION || 'us-east-1';
    
    // Extract the file key from S3 URL
    const s3Pattern = new RegExp(`https://${bucket}\\.s3\\.${region}\\.amazonaws\\.com/(.+)$`);
    const match = s3Url.match(s3Pattern);
    
    if (match && match[1]) {
      return `${process.env.CLOUDFRONT_URL}/${match[1]}`;
    }
  }
  
  return s3Url;
};

module.exports = { getImageUrl };
```

### **7.5: Update Product Service to Use CloudFront**

In `server/src/services/product.service.js`:

```javascript
const { getImageUrl } = require('../utils/s3-url.helper');

// In queryProducts method, after fetching products:
products.forEach(product => {
  // Convert S3 URLs to CloudFront URLs
  if (product.images) {
    product.images = product.images.map(image => ({
      ...image.dataValues,
      imageUrl: getImageUrl(image.imageUrl),
    }));
  }
});
```

---

## 🧪 Step 8: Test CloudFront (5 minutes)

### **8.1: Check Image Load Speed**

```bash
# Test S3 direct URL (slower)
curl -I https://cccp-amazon-product-images.s3.amazonaws.com/products/your-image.jpg

# Test CloudFront URL (faster!)
curl -I https://d1234abcd.cloudfront.net/products/your-image.jpg

# Check for cache hit
# Look for: X-Cache: Hit from cloudfront
```

### **8.2: Test in Browser**

1. Open frontend: http://localhost:5173
2. Browse products
3. Open DevTools → Network tab
4. Refresh page
5. Check image requests
6. Should load from CloudFront URL!

---

## 📊 Step 9: Verify Everything Works (10 minutes)

### **✅ Checklist:**

- [ ] S3 bucket created and accessible
- [ ] AWS credentials added to .env
- [ ] aws-sdk and multer-s3 installed
- [ ] S3 service created
- [ ] Upload middleware updated
- [ ] Admin routes using S3 upload
- [ ] Test image uploaded successfully
- [ ] Image visible in S3 bucket
- [ ] CloudFront distribution created
- [ ] CloudFront URL added to .env
- [ ] URL helper function created
- [ ] Images loading from CloudFront
- [ ] Frontend displays images correctly

---

## 🎉 Success Criteria

**You've successfully completed Phase 1 when:**

✅ New product images upload to S3 (not local disk)  
✅ Images are publicly accessible via S3 URL  
✅ CloudFront CDN serves images faster  
✅ Frontend loads images from CloudFront  
✅ Image URLs in database point to S3  
✅ No images stored locally

---

## 🐛 Troubleshooting

### **Problem: "Access Denied" when uploading**

**Solution:**
```bash
# Check bucket policy
aws s3api get-bucket-policy --bucket cccp-amazon-product-images

# Verify IAM user has S3 permissions
aws iam list-attached-user-policies --user-name cccp-amazon-app
```

### **Problem: Images not loading**

**Solution:**
```bash
# Check if bucket is public
aws s3api get-bucket-acl --bucket cccp-amazon-product-images

# Make object public
aws s3api put-object-acl \
  --bucket cccp-amazon-product-images \
  --key products/your-image.jpg \
  --acl public-read
```

### **Problem: CloudFront not serving images**

**Solution:**
```bash
# Check distribution status
aws cloudfront list-distributions --query 'DistributionList.Items[0].Status'

# Wait until status is "Deployed"
# Can take 15-20 minutes

# Create invalidation to clear cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

### **Problem: AWS credentials not working**

**Solution:**
```bash
# Test credentials
aws sts get-caller-identity

# Should return your IAM user details
# If error, reconfigure:
aws configure
```

---

## 💰 Cost Monitoring

### **Check S3 Usage:**

```bash
# Check bucket size
aws s3 ls s3://cccp-amazon-product-images --recursive --human-readable --summarize

# Example output:
# Total Objects: 25
# Total Size: 12.5 MB
```

### **Check CloudFront Usage:**

Go to: https://console.aws.amazon.com/cloudfront/
→ Your distribution → Monitoring tab

**Free Tier Limits:**
- 5GB S3 storage (FREE)
- 50GB CloudFront transfer (FREE)
- 2,000 S3 PUT requests (FREE)
- 20,000 S3 GET requests (FREE)

---

## 🎯 Next Steps

After completing Phase 1, you can:

1. **Phase 2**: Migrate database to RDS
2. **Optimize**: Add image resizing with Lambda
3. **Enhance**: Add image compression
4. **Scale**: Setup multiple S3 buckets (staging, production)

---

## 📝 Summary

**What You Built:**
- ✅ S3 bucket for scalable image storage
- ✅ CloudFront CDN for fast global delivery
- ✅ Automatic image upload to cloud
- ✅ Production-ready image hosting

**Benefits:**
- ⚡ Faster image loading (CDN caching)
- 📈 Scalable storage (unlimited capacity)
- 🌍 Global delivery (edge locations worldwide)
- 💾 Automatic backups (S3 versioning)
- 💰 Cost-effective (pay per use)

**Time Invested**: 2-3 hours  
**Value Added**: Production-grade image infrastructure  

---

**Questions? Issues? Let me know and I'll help!** 🚀
