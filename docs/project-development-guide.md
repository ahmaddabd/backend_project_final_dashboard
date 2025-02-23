# 📖 دليل تطوير المشروع - توثيق آلية العمل

## 🏗️ الهيكلة العامة للمشروع

```plaintext
src/
├── application/          # يحتوي على وحدات العمل الرئيسية
│   ├── auth/             # وحدة المصادقة
│   │   ├── controllers/  # المتحكمات (Endpoints)
│   │   ├── dto/          # كائنات نقل البيانات (Data Transfer Objects)
│   │   ├── guards/       # الحراس (Guards) لحماية نقاط النهاية
│   │   ├── services/     # الخدمات (Business Logic)
│   │   ├── strategies/   # استراتيجيات المصادقة
│   │   ├── auth.module.ts # تعريف الوحدة
│   ├── stores/           # وحدة المتاجر
│   │   ├── controllers/  # المتحكمات (Endpoints)
│   │   ├── dto/          # كائنات نقل البيانات
│   │   ├── guards/       # الحراس لحماية نقاط النهاية
│   │   ├── services/     # الخدمات (Business Logic)
│   │   ├── stores.module.ts # تعريف الوحدة
├── domain/               # يحتوي على تعريف الكيانات (Entities) والعلاقات
│   ├── entities/         # كيانات قواعد البيانات
│   ├── repositories/     # واجهات المستودعات (Repositories)
├── infrastructure/       # يحتوي على الخدمات الأساسية والمستودعات
│   ├── repositories/     # تنفيذات قواعد البيانات (TypeORM Repositories)
│   ├── services/         # خدمات البنية التحتية مثل رفع الملفات
├── utils/                # الأدوات المساعدة (مثل slugify)
├── docs/                 # التوثيق الخاص بالمشروع
│   ├── authentication.md # توثيق وحدة المصادقة
│   ├── stores.md         # توثيق وحدة المتاجر
│   ├── project-guide.md  # دليل التطوير
├── main.ts               # نقطة تشغيل التطبيق
├── app.module.ts         # الوحدة الأساسية لتشغيل الوحدات
├── package.json          # إدارة الحزم والمكتبات
├── tsconfig.json         # إعدادات TypeScript
```

## 📌 معايير التسمية والتنظيم
- **المجلدات والمكونات تتبع نمط `feature-based structure`**.
- **المتحكمات (`Controllers`) يجب أن توضع داخل `controllers/` وتستخدم `@Controller()`**.
- **الخدمات (`Services`) توضع داخل `services/` وتستخدم `@Injectable()`**.
- **الحراس (`Guards`) توضع داخل `guards/` لحماية نقاط النهاية.
- **المستودعات (`Repositories`) يتم تعريفها داخل `infrastructure/repositories/` للتعامل مع `TypeORM`**.

---

## 🔐 تدفق المصادقة (`Authentication Flow`)

1️⃣ **المستخدم يقوم بالتسجيل (`Register`)**
   - يرسل البيانات (`username`, `email`, `password`) إلى `/auth/register`.
   - يتم تشفير كلمة المرور (`bcrypt`) وتخزينها في قاعدة البيانات.
   - يتم إرجاع رسالة تأكيد `User registered successfully`.

2️⃣ **المستخدم يقوم بتسجيل الدخول (`Login`)**
   - يرسل بيانات الاعتماد (`email`, `password`) إلى `/auth/login`.
   - يتم التحقق من البيانات (`bcrypt.compare`) وجلب المستخدم.
   - يتم إنشاء `access_token` و `refresh_token` وإرسالهما.

3️⃣ **المصادقة عبر `JWT`**
   - يتم إرسال `Authorization: Bearer <token>` مع كل طلب محمي.
   - `JwtAuthGuard` يتحقق من صحة `JWT` ويفك تشفيره لاسترداد بيانات المستخدم.

4️⃣ **تحديث `access_token` باستخدام `refresh_token`**
   - عند انتهاء صلاحية `access_token`، يتم إرسال `refresh_token` إلى `/auth/refresh`.
   - يتم التحقق من `refresh_token` وإنشاء `access_token` جديد.

---

## 🏪 إدارة المتاجر (`Store Management Flow`)

1️⃣ **إنشاء متجر (`Create Store`)**
   - يرسل المستخدم بيانات (`name`, `description`, `logo`) إلى `/stores`.
   - يتم توليد `slug` فريد (`slugify(name)`).

2️⃣ **استعراض جميع المتاجر (`Get All Stores`)**
   - يرسل العميل طلب `GET` إلى `/stores`.

3️⃣ **تحديث متجر (`Update Store`)**
   - يرسل المستخدم البيانات الجديدة إلى `/stores/:id`.
   - يتم التحقق من ملكية المتجر (`StoreOwnerGuard`).

4️⃣ **حذف متجر (`Delete Store`)**
   - يتم إرسال طلب `DELETE` إلى `/stores/:id`.

---

## 🚀 أفضل الممارسات (`Best Practices`)
✅ **استخدام `class-validator` للتحقق من صحة المدخلات (`DTOs`).**  
✅ **استخدام `JwtAuthGuard` لحماية العمليات الحساسة.**  
✅ **عدم تخزين كلمات المرور بشكل نصي (`bcrypt.hash`).**  
✅ **استخدام `slugify` لإنشاء روابط صديقة لمحركات البحث (`SEO`).**  
✅ **فصل `Repositories` عن `Services` لتجنب التعقيد.**  
✅ **تخزين `refreshToken` مشفر (`bcrypt.hash`).**  
✅ **عدم كشف معلومات حساسة داخل `JWT` (مثل `password`).**  

---

📌 **هذا الدليل سيضمن أن أي مطور جديد يمكنه فهم هيكلة المشروع والعمل عليها بكفاءة دون مشاكل.** 🎯
