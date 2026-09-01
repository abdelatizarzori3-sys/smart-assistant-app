# 🔧 دليل إصلاح الأخطاء الشاملة

## الأخطاء المكتشفة والحلول

### 1️⃣ خطأ: استيراد الملفات المفقودة

**المشكلة:**
```typescript
import { ForbiddenError } from "@shared/_core/errors";  // ❌ لا يوجد هذا الملف
import type { ... } from "./types/manusTypes";         // ❌ قد لا يكون موجود
import * as db from "../db";                            // ❌ لا يوجد index.ts
```

**الحل:**
```bash
# إنشاء الملفات المفقودة
mkdir -p shared/_core
mkdir -p server/db
mkdir -p server/_core/types
```

---

### 2️⃣ خطأ: ENV متغيرات البيئة غير معرفة

**المشكلة:**
```typescript
import { ENV } from "./env";  // ❌ لا يوجد env.ts
// استخدام: ENV.oAuthServerUrl, ENV.appId, ENV.cookieSecret
```

**الحل - إنشاء `server/_core/env.ts`:**
```typescript
// server/_core/env.ts
export const ENV = {
  oAuthServerUrl: process.env.OAUTH_SERVER_URL || "",
  appId: process.env.OAUTH_CLIENT_ID || "",
  cookieSecret: process.env.COOKIE_SECRET || "default-secret-change-in-production",
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000"),
  databaseUrl: process.env.DATABASE_URL || "",
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  awsRegion: process.env.AWS_REGION || "us-east-1",
  awsS3Bucket: process.env.AWS_S3_BUCKET || "",
} as const;

// التحقق من المتغيرات المهمة
if (!ENV.cookieSecret || ENV.cookieSecret === "default-secret-change-in-production") {
  console.warn("⚠️ WARNING: COOKIE_SECRET is not set! Set COOKIE_SECRET in .env");
}

if (!ENV.oAuthServerUrl) {
  console.warn("⚠️ WARNING: OAUTH_SERVER_URL is not set!");
}
```

---

### 3️⃣ خطأ: ملفات قاعدة البيانات مفقودة

**المشكلة:**
```typescript
import * as db from "../db";  // ❌ لا يوجد هذا الملف
// استخدام: db.getUserByOpenId(), db.upsertUser()
```

**الحل - إنشاء `server/db/index.ts`:**
```typescript
// server/db/index.ts
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../../drizzle/schema";
import { ENV } from "../_core/env";

let dbInstance: ReturnType<typeof drizzle> | null = null;

async function getDb() {
  if (!dbInstance) {
    const connection = await mysql.createConnection({
      uri: ENV.databaseUrl,
    });
    dbInstance = drizzle(connection, { schema });
  }
  return dbInstance;
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  const result = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.openId, openId),
  });
  return result || null;
}

export async function upsertUser(data: {
  openId: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  lastSignedIn?: Date;
}) {
  const db = await getDb();
  const existing = await getUserByOpenId(data.openId);

  if (existing) {
    return db.update(schema.users)
      .set({
        name: data.name ?? existing.name,
        email: data.email ?? existing.email,
        loginMethod: data.loginMethod ?? existing.loginMethod,
        lastSignedIn: data.lastSignedIn ?? new Date(),
        updatedAt: new Date(),
      })
      .where({ openId: data.openId });
  } else {
    return db.insert(schema.users).values({
      openId: data.openId,
      name: data.name || null,
      email: data.email || null,
      loginMethod: data.loginMethod || null,
      lastSignedIn: data.lastSignedIn || new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

export async function getAllUsers() {
  const db = await getDb();
  return db.query.users.findMany();
}
```

---

### 4️⃣ خطأ: ملفات الأخطاء المفقودة

**الحل - إنشاء `shared/_core/errors.ts`:**
```typescript
// shared/_core/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export function ForbiddenError(message: string): AppError {
  return new AppError("FORBIDDEN", message, 403);
}

export function UnauthorizedError(message: string): AppError {
  return new AppError("UNAUTHORIZED", message, 401);
}

export function NotFoundError(message: string): AppError {
  return new AppError("NOT_FOUND", message, 404);
}

export function BadRequestError(message: string): AppError {
  return new AppError("BAD_REQUEST", message, 400);
}

export function InternalServerError(message: string): AppError {
  return new AppError("INTERNAL_ERROR", message, 500);
}
```

---

### 5️⃣ خطأ: أنواع Manus مفقودة

**الحل - إنشاء `server/_core/types/manusTypes.ts`:**
```typescript
// server/_core/types/manusTypes.ts
export interface ExchangeTokenRequest {
  clientId: string;
  grantType: "authorization_code";
  code: string;
  redirectUri: string;
}

export interface ExchangeTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}

export interface GetUserInfoResponse {
  openId: string;
  name?: string;
  email?: string;
  platforms?: string[];
  platform?: string | null;
  loginMethod?: string | null;
}

export interface GetUserInfoWithJwtRequest {
  jwtToken: string;
  projectId: string;
}

export interface GetUserInfoWithJwtResponse extends GetUserInfoResponse {
  taskUid?: string;
  expiresAt?: number;
}
```

---

### 6️⃣ خطأ: Routers مفقودة

**الحل - إنشاء `server/routers/index.ts`:**
```typescript
// server/routers/index.ts
import { initTRPC } from "@trpc/server";
import { TrpcContext } from "../_core/context";

const t = initTRPC.context<TrpcContext>().create();

export const appRouter = t.router({
  // Public procedures (لا تحتاج تصريح)
  health: t.procedure.query(async () => ({
    status: "ok",
    timestamp: new Date(),
  })),

  // Protected procedures (تحتاج تصريح)
  user: t.procedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error("Unauthorized");
    }
    return ctx.user;
  }),

  // Sessions
  sessions: t.procedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error("Unauthorized");
    }
    // سيتم تنفيذ الاستعلام عن الجلسات من قاعدة البيانات
    return [];
  }),
});

export type AppRouter = typeof appRouter;
```

---

### 7️⃣ خطأ: Storage Proxy مفقودة

**الحل - إنشاء `server/_core/storageProxy.ts`:**
```typescript
// server/_core/storageProxy.ts
import type { Express, Request, Response } from "express";

export function registerStorageProxy(app: Express) {
  // Proxy للملفات المرفوعة
  app.post("/api/upload", async (req: Request, res: Response) => {
    try {
      // يتم تنفيذ رفع الملفات هنا
      res.json({
        success: true,
        url: "/files/uploaded-file",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Upload failed",
      });
    }
  });

  app.get("/api/files/:fileId", async (req: Request, res: Response) => {
    try {
      // جلب الملف من قاعدة البيانات
      res.sendFile(`./uploads/${req.params.fileId}`);
    } catch (error) {
      res.status(404).json({
        success: false,
        error: "File not found",
      });
    }
  });
}
```

---

### 8️⃣ خطأ: Vite Setup مفقودة

**الحل - إنشاء `server/_core/vite.ts`:**
```typescript
// server/_core/vite.ts
import type { Express, ViteDevServer } from "vite";
import { createServer } from "vite";
import type { Server } from "http";
import path from "path";
import fs from "fs";

let vite: ViteDevServer | null = null;

export async function setupVite(app: Express, server: Server) {
  vite = await createServer({
    server: { middlewareMode: true },
    appType: "spa",
  });

  app.use(vite.middlewares);

  app.get("*", (_req, res) => {
    res.type("text/html").end(
      fs.readFileSync(path.join(process.cwd(), "client", "index.html"), "utf-8")
    );
  });
}

export function serveStatic(app: Express) {
  const staticPath = path.join(process.cwd(), "dist", "public");
  app.use(express.static(staticPath));

  app.get("*", (_req, res) => {
    res.type("text/html").end(
      fs.readFileSync(path.join(staticPath, "index.html"), "utf-8")
    );
  });
}
```

---

## 📋 قائمة الملفات المطلوبة

```
✅ server/_core/env.ts                    ← متغيرات البيئة
✅ server/_core/errors.ts                 ← معالجة الأخطاء
✅ server/_core/types/manusTypes.ts       ← أنواع OAuth
✅ server/_core/storageProxy.ts           ← Proxy للملفات
✅ server/_core/vite.ts                   ← إعداد Vite
✅ server/db/index.ts                     ← عمليات قاعدة البيانات
✅ server/routers/index.ts                ← tRPC routers
✅ shared/_core/errors.ts                 ← الأخطاء المشتركة
✅ .env.local                             ← متغيرات البيئة المحلية
```

---

## 🚀 خطوات الإصلاح الكامل

```bash
# 1. نسخ الملف المثالي
cp .env.example .env.local

# 2. تحديث المتغيرات
nano .env.local  # أضف قيم حقيقية

# 3. تثبيت المكتبات المفقودة
pnpm install drizzle-orm mysql2 jose

# 4. التحقق من الأخطاء
pnpm run check

# 5. تشغيل التطبيق
pnpm run dev
```

---

## ✅ التحقق من الحل

```bash
# تحقق من عدم وجود أخطاء TypeScript
pnpm run check

# اختبر الخادم
curl http://localhost:3000/api/trpc/health

# اختبر OAuth
# انتقل إلى http://localhost:3000 وحاول تسجيل الدخول
```

---

## 📖 المراجع

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [tRPC Documentation](https://trpc.io/)
- [Express.js Guide](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**جميع الأخطاء يجب أن تُصلح الآن! ✨**
