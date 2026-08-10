# 🌿 دَوْر — DAWR
> **الشعار:** "لا ترمِه… أعطه دَوْرًا آخر"  
> **Tagline:** "Don't waste it… give it another cycle."

---

## 🇸🇦 نبذة عن مشروع دَوْر (DAWR)

**دَوْر (DAWR)** هو منصة رقمية وتطبيق ذكي يعتمد على **الذكاء الاصطناعي (Gemini 3.6 Flash)** ومبادئ **الاقتصاد الدائري (Circular Economy)** لمساعدة الأفراد والمؤسسات على تقييم المنتجات المستعملة والأغراض المنزلية بصرياً، وتحديد أفضل المسارات البيئية للاستفادة منها بدلاً من التخلص منها في المرادم.

### 🎯 المشكلة والحل

* **المشكلة:** يواجه العالم العربي زيادة في حجم النفايات القابلة لإعادة الاستخدام والتدوير، مع غياب أدوات سهلة وسريعة تُوجّه المستخدم نحو الخيار الأنسب (التبرع، التعديل والتصنيع اليدوي UP-cycling، أو التدوير الصناعي) بناءً على نوع خامة المنتج وحالته.
* **الحل:** يوفر تطبيق **دَوْر** تحليل كاميرا مباشر يحلل المنتج بصرياً، ويحسب **مؤشر الدائرية الاستدامي (Circular Score 0-100)**، ثم يعرض مسارات مرتبة تصاعدياً حسب الأثر البيئي ومقدار الوفر في انبعاثات الكربون والماء، مع ربطه بآليات جمع النقاط (Circular Points) وقاعدة بيانات سحابية موثوقة (Google Cloud Firestore).

---

## 🌍 About DAWR (English Summary)

**DAWR** is an AI-powered Circular Economy assistant leveraging **Google Gemini 3.6 Flash** and **Google Cloud Firestore**. It allows users to visually inspect any item or apparel using their camera or photo, compute an instant **Circular Sustainability Score (0-100)**, and receive optimized eco-pathways (Donation, Upcycling/Repair, Recycling, or Sorting).

---

## 🛠️ التقنيات المستخدمة (Tech Stack)

* **الواجهة الأمامية (Frontend):** React 18, Vite, TypeScript, Tailwind CSS, Motion (Framer Motion), Lucide Icons.
* **الخادم الخلفي (Backend):** Node.js, Express, TypeScript (esbuild / tsx).
* **الذكاء الاصطناعي (AI Engine):** Google GenAI SDK (`@google/genai`) مع نموذج `gemini-3.6-flash`.
* **قاعدة البيانات والتخزين السحابي (Database):** Google Cloud Firestore & Firebase Auth integration.

---

## 📁 المجموعات الرئيسية في قاعدة البيانات (Firestore Collections)

1. **`users`**: تخزين بيانات حسابات المستخدمين ومجموع النقاط الاستدامية المكتسبة (`points`) ومقدار الانبعاثات الموفرة (`co2SavedKg`).
2. **`scans`**: أرشفة سجل التحليلات البصرية والمنتجات المحللة عبر الكاميرا ومؤشرها الاستدامي.
3. **`impact`**: تسجيل القرارات البيئية المتخذة (التبرع، إعادة الاستخدام، التدوير) والنقاط الممنوحة.

---

## 🚀 خطوات التشغيل المحلي (Local Setup & Installation)

### 1. استكشاف المشروع وتثبيت الحزم:
```bash
git clone <repository-url>
cd dawr-app
npm install
```

### 2. إعداد متغيرات البيئة (Environment Variables):
قم بإنشاء ملف `.env` بناءً على النموذج المرفق في `.env.example`:
```env
# .env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### 3. تشغيل خادم التطوير (Development Server):
```bash
npm run dev
```
افتح المتصفح على العنوان: `http://localhost:3000`

### 4. بناء وتشغيل نسخة الإنتاج (Production Build):
```bash
npm run build
npm start
```

---

## 🔐 أمان الأسرار ومفاتيح الـ API (Security & Secrets)

* **الحماية جهة الخادم (Server-Side Proxy):** يتم استدعاء كافة مفاتيح الـ API الحساسة (مثل `GEMINI_API_KEY` و `FIREBASE_PROJECT_ID`) داخل بيئة الخادم (`server.ts`) حصراً.
* **منع التسريب:** لا يتم تسريب أو مكاشفة أي مفتاح سري إلى كود الواجهة الأمامية (Client-side Browser Context)، مما يضمن حماية الكوتا والاعتمادات.
* **الاستجابة الاحتياطية (Fallback Mechanism):** يحتوي التطبيق على محاكاة احتياطية سلسة تعمل آلياً في حال عدم وجود اتصال مباشر ببيئة السحابة لضمان التصفح المستقر أثناء المعاينة والتطوير.

---

© 2026 دَوْر (DAWR) — نحو مستقبل دائري ومستدام.
