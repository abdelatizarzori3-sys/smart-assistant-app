# دليل النشر 🚀

شرح كامل لنشر Smart Assistant App على خوادم الإنتاج

## الخيارات المتاحة للنشر

### 1. Heroku (الأسهل)

```bash
# تثبيت Heroku CLI
npm install -g heroku

# تسجيل الدخول
heroku login

# إنشاء تطبيق جديد
heroku create your-app-name

# إضافة متغيرات البيئة
heroku config:set DATABASE_URL=your_database_url
heroku config:set OAUTH_CLIENT_ID=your_client_id
heroku config:set OAUTH_CLIENT_SECRET=your_client_secret
heroku config:set AWS_ACCESS_KEY_ID=your_key
heroku config:set AWS_SECRET_ACCESS_KEY=your_secret
heroku config:set AWS_REGION=us-east-1
heroku config:set AWS_S3_BUCKET=your-bucket

# النشر
git push heroku main
```

### 2. DigitalOcean (الأداء العالي)

```bash
# 1. إنشاء Droplet
# - اختر Ubuntu 22.04
# - حجم Droplet: $6/شهر (أساسي)

# 2. الاتصال بـ SSH
ssh root@your_droplet_ip

# 3. تثبيت المتطلبات
apt update && apt upgrade -y
apt install -y nodejs npm git
npm install -g pnpm

# 4. استنساخ المستودع
git clone https://github.com/abdelatizarzori3-sys/smart-assistant-app.git
cd smart-assistant-app

# 5. تثبيت المكتبات
pnpm install

# 6. إعداد متغيرات البيئة
nano .env

# 7. البناء والتشغيل
pnpm run build
npm install -g pm2
pm2 start "NODE_ENV=production node dist/index.js" --name "smart-assistant"
pm2 save
pm2 startup
```

### 3. Docker (الموصى به)

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# نسخ الملفات
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

# البناء
RUN pnpm run build

# تعيين المنفذ
EXPOSE 3000

# بدء التطبيق
CMD ["node", "dist/index.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://user:password@db:3306/smart_assistant
      - NODE_ENV=production
      - OAUTH_CLIENT_ID=${OAUTH_CLIENT_ID}
      - OAUTH_CLIENT_SECRET=${OAUTH_CLIENT_SECRET}
    depends_on:
      - db

  db:
    image: mysql:8
    environment:
      - MYSQL_DATABASE=smart_assistant
      - MYSQL_ROOT_PASSWORD=rootpassword
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
```

```bash
# تشغيل Docker
docker-compose up -d
```

### 4. AWS (Enterprise)

#### Step 1: إعداد RDS (قاعدة البيانات)
```bash
# 1. انتقل إلى AWS Console
# 2. RDS → Create Database
# 3. اختر MySQL 8.0
# 4. حفظ Connection String
```

#### Step 2: إعداد S3 (تخزين الملفات)
```bash
# 1. S3 → Create Bucket
# 2. حفظ Bucket Name
# 3. إنشاء IAM User مع صلاحيات S3
```

#### Step 3: النشر على Elastic Beanstalk
```bash
# تثبيت AWS CLI
pip install awscli

# تسجيل الدخول
aws configure

# إنشاء تطبيق Elastic Beanstalk
eb init -p "Node.js 18 running on 64bit Amazon Linux 2"

# النشر
eb create smart-assistant-env
eb deploy
```

## خطوات ما بعد النشر

### 1. إعداد قاعدة البيانات

```bash
# الاتصال بـ MySQL
mysql -u root -p

# إنشاء قاعدة البيانات
CREATE DATABASE smart_assistant;
USE smart_assistant;

# تطبيق الهجرات
pnpm run db:push
```

### 2. إعداد SSL/HTTPS

```bash
# استخدام Let's Encrypt (مجاني)
sudo apt install certbot python3-certbot-nginx -y
sudo certbot certonly --standalone -d your-domain.com

# إضافة الشهادة إلى التطبيق
# تحديث vite.config.ts و server config
```

### 3. إعداد CDN

```javascript
// استخدام Cloudflare CDN
// 1. اذهب إلى Cloudflare.com
// 2. أضف نطاقك
// 3. وجّه Nameservers
// 4. فعّل Caching Rules
```

### 4. مراقبة الأداء

```bash
# استخدام PM2 Plus (اختياري)
pm2 plus

# أو استخدام DataDog
npm install --save dd-trace

# إضافة للـ server
require('dd-trace').init()
```

## اختبار بعد النشر

```bash
# اختبار الاتصال
curl https://your-domain.com

# اختبار API
curl https://your-domain.com/api/trpc/health

# اختبار OAuth
# انتقل إلى https://your-domain.com وحاول تسجيل الدخول

# عرض السجلات
pm2 logs
```

## استكشاف الأخطاء

### المشكلة: "Database Connection Failed"
```bash
# تحقق من DATABASE_URL
echo $DATABASE_URL

# اختبر الاتصال
mysql -u root -p your_password -h your_host
```

### المشكلة: "Port Already in Use"
```bash
# تغيير المنفذ
PORT=5000 pnpm run start

# أو قتل العملية السابقة
lsof -i :3000
kill -9 <PID>
```

### المشكلة: "S3 Access Denied"
```bash
# تحقق من AWS Credentials
aws s3 ls

# تحقق من IAM Permissions
# في AWS Console → IAM → Users → Check Policies
```

## أداء الإنتاج

### تحسينات موصى بها:

1. **Enable Caching**
```javascript
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=3600');
  next();
});
```

2. **استخدام Compression**
```bash
npm install compression
```

3. **تحديد حدود معدل الطلب**
```bash
npm install express-rate-limit
```

4. **مراقبة الأداء**
```bash
pm2 install pm2-auto-pull
```

## الدعم والمساعدة

- 📧 support@smartassistant.com
- 📖 [الوثائق الكاملة](./README.md)
- 🐛 [تقرير الأخطاء](https://github.com/abdelatizarzori3-sys/smart-assistant-app/issues)

---

**النشر الناجح! 🎉**
