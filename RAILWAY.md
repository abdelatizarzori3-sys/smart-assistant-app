# تشغيل نواة على Railway

تمت إضافة `railway.json` إلى جذر المشروع ليثبت إعدادات البناء والتشغيل دون تغيير سلوك التطبيق الحالي. يستخدم Railway ‏Railpack، ثم ينفذ `pnpm build`، ويشغّل الخادم عبر `pnpm run start`. التطبيق يقرأ `PORT` الذي يحقنه Railway تلقائيًا، ويستخدم المسار `/` لفحص الصحة.

## الربط مع GitHub

من لوحة Railway اختر **New Project** ثم **Deploy from GitHub Repo**، واختر المستودع:

`abdelatizarzori3-sys/smart-assistant-app`

اترك **Root Directory** على `/`، واختر الفرع `main`. بعد الربط سيعيد Railway النشر عند وصول أي commit جديد إلى الفرع. ملف `railway.json` يحدد أوامر البناء والتشغيل تلقائيًا.

> Railway استضافة خارجية اختيارية للمشروع. يبقى النشر الحالي على Manus WebDev قائمًا، ويمكن استخدام Railway كنسخة مستقلة مرتبطة بمستودع GitHub.

## المتغيرات المطلوبة

أضف المتغيرات التالية من تبويب **Variables** في Railway. يجب نقل القيم الفعلية من بيئة المشروع الحالية أو من مزود الخدمة، وعدم وضعها في GitHub أو هذا الملف.

| المتغير | الغرض |
|---|---|
| `DATABASE_URL` | اتصال MySQL/TiDB لقاعدة البيانات |
| `JWT_SECRET` | توقيع جلسات المصادقة |
| `OAUTH_SERVER_URL` | خادم Manus OAuth |
| `VITE_APP_ID` | معرّف تطبيق OAuth للواجهة |
| `VITE_OAUTH_PORTAL_URL` | رابط بوابة تسجيل الدخول |
| `OWNER_OPEN_ID` | معرّف مالك مساحة العمل |
| `OWNER_NAME` | اسم مالك مساحة العمل |
| `BUILT_IN_FORGE_API_URL` | عنوان خدمات Manus المدمجة للخادم |
| `BUILT_IN_FORGE_API_KEY` | مفتاح خدمات Manus المدمجة للخادم |
| `VITE_FRONTEND_FORGE_API_URL` | عنوان خدمات Manus المدمجة للواجهة أثناء البناء |
| `VITE_FRONTEND_FORGE_API_KEY` | مفتاح الواجهة أثناء البناء |
| `VITE_ANALYTICS_ENDPOINT` | اختياري: عنوان التحليلات |
| `VITE_ANALYTICS_WEBSITE_ID` | اختياري: معرّف موقع التحليلات |
| `VITE_APP_TITLE` | اختياري: عنوان التطبيق |
| `VITE_APP_LOGO` | اختياري: شعار التطبيق |

إذا كان رابط OAuth مضبوطًا على نطاق Railway، أضف نطاق Railway إلى إعدادات OAuth لدى المزود، واستخدم مسار callback الموجود في التطبيق:

`https://<نطاق-railway>/api/oauth/callback`

## قاعدة البيانات والتخزين

Railway لا ينسخ قاعدة بيانات Manus أو تخزين S3 تلقائيًا. يجب أن تشير `DATABASE_URL` إلى قاعدة بيانات يمكن لـ Railway الوصول إليها، وأن تبقى متغيرات التخزين وواجهات Manus صحيحة إذا كان التطبيق سيستخدم التخزين المدمج. لا تشغّل `db:push` تلقائيًا في كل نشر قبل أخذ نسخة احتياطية ومراجعة migrations.

## تحقق محلي قبل النشر

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
pnpm start
```

بعد اكتمال النشر، افتح نطاق Railway وتأكد من الصفحة الرئيسية، ثم اختبر تسجيل الدخول، إنشاء جلسة داخل مكتبة مهارة، رفع ملف، وإرسال رسالة. راقب **Deploy Logs** و**Healthcheck** عند ظهور أي فشل.
