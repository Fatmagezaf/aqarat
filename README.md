# نظام إدارة وقاعدة بيانات العقارات الداخلي
## Enterprise Internal Real Estate Management System (CRM)

نظام إدارة وقاعدة بيانات عقارية خاصة وشاملة مصممة للشركات والمكاتب العقارية لإدخال، حفظ، تصفية، والبحث المتقدم في بيانات العقارات والوحدات السكنية والتجارية، وعرض مواقعها وإحداثياتها الجغرافية على خرائط Google التفاعلية، مع دعم كامل للغة العربية (RTL) ونظام أمني محكم قائم على الصلاحيات والأدوار (Role-Based Access Control).

---

## 🌟 مميزات النظام الرئيسية (Key Features)

1. **إدارة العقارات والوحدات (29 حقلاً معتمداً)**:
   - دعم شامل لجميع الحقول والبيانات المستخرجة من شاشة النظام:
     - **كود العقار** (`code`)، **العنوان والوحدة** (`address`, `fullAddress`)، **اللون التعريفي** (`colorTag`)
     - **الغرض والاستخدام** (`purpose`): بيع، إيجار مفروش، إيجار قانون جديد، تجاري، تنازل
     - **الحالة التشغيلية** (`status`): متاح، محجوز، تم البيع، تم التأجير، معلق
     - **حالة العقار والجاهزية** (`deliveryStatus`): جاهز للتسليم، استلام فوري، تحت الإنشاء
     - **المبالغ والبيانات المالية** (`price`, `pricePerMeter` حساب تلقائي)
     - **المواصفات المعمارية**: المساحة المبنية (`area`)، المرحلة (`phase`)، النموذج (`model`)، الدور (`floor`)، الوجه/الإطلالة (`viewDirection`)، عدد الغرف (`bedrooms`)، عدد الحمامات (`bathrooms`)، مساحة الأرض (`landArea`)، مساحة الحديقة (`gardenArea`)، مستوى التشطيب (`finishing`)
     - **الموقع الجغرافي**: المدينة/المنطقة (`locationName`)، خط العرض (`latitude`)، خط الطول (`longitude`)، ورابط خرائط Google التلقائي (`locationUrl`)
     - **العلامات المميزة**: وصف المعلم البارز (`landmark`)، وتمييز العقار بنجمة (`isFeatured`)
     - **التواريخ**: تاريخ الاستلام (`deliveryDate`)، تاريخ الإضافة (`listingDate`)
     - **التدقيق وتتبع التعديلات (Audit)**: مسجل بواسطة (`createdBy`, `createdByName`)، وآخر تعديل (`updatedBy`, `updatedByName`, `updatedAt`).

2. **الخرائط التفاعلية (Interactive Google Maps)**:
   - تحديد وتعديل الإحداثيات بإسقاط المؤشر على الخريطة (Interactive Pin Drop) في نماذج الإضافة والتعديل.
   - صفحة خريطة كاملة ومستقلة (`/map`) تعرض جميع العقارات كمؤشرات، مع بطاقات معلومات منبثقة ورابط انتقال مباشر للتفاصيل.
   - توليد رابط Google Maps مباشر تلقائياً عند تغيير المؤشر.

3. **البحث المتقدم وتطبيع اللغة العربية (Arabic Search Normalization)**:
   - توليد رموز وكلمات مفتاحية مسبقة (`searchTokens`) للبحث الجزئي في Firestore دون استهلاك غير مبرر لقاعدة البيانات.
   - معالجة الفروق الإملائية الشائعة في اللغة العربية:
     - الألف: `أ`, `إ`, `آ`, `ٱ` ⟵ `ا`
     - التاء المربوطة والهاء: `ة` ⟵ `ه`
     - الياء والألف المقصورة: `ى` ⟵ `ي`
     - حذف التشكيل والتنوين والتطويل (الكشيدة).

4. **نظام الصلاحيات والأدوار (Role-Based Access Control - RBAC)**:
   - **مدير النظام (Admin)**: صلاحية مطلقة (إضافة، تعديل، حذف، وإدارة حسابات وصلاحيات الموظفين).
   - **وكيل المبيعات (Agent)**: إضافة وتعديل العقارات، واستعراض الخرائط والبحث.
   - **المشاهد (Viewer)**: استعراض وبحث وتصفية فقط مع حجب بيانات ملاك العقارات وأرقام الهواتف السرية.

5. **تصميم عصري فائق الجودة (Obsidian Luxury Dark Theme)**:
   - واجهة مستخدم مبنية بـ Vanilla CSS بنمط بطاقات زجاجية عصرية (Glassmorphism)، وتأثيرات ضوئية تفاعلية.
   - دعم كامل ومثالي للاتجاه من اليمين لليسار (`dir="rtl"`).
   - خطوط طباعية عربية حديثة (`Cairo`) وإنجليزية (`Plus Jakarta Sans`).

---

## 🛠️ التقنيات المستخدمة (Tech Stack)

- **Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **Language**: TypeScript 5
- **Styling**: Vanilla CSS Design Tokens (Strictly adhering to no TailwindCSS requirement)
- **Forms & Validation**: React Hook Form + Zod
- **Database & Auth**: Firebase Authentication, Cloud Firestore, Firebase Storage
- **Maps**: Google Maps JavaScript API (Geocoding & Places)
- **Deployment**: Vercel & GitHub

---

## 🚀 التشغيل والتطوير المحلي (Local Development)

### المتطلبات الأساسية:
- Node.js (v20 أو v22 أو v24 LTS)
- npm (v10 أو v11)

### خطوات التثبيت:

1. استنساخ المستودع (Clone):
```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <PROJECT_DIR>
```

2. تثبيت الحزم:
```bash
npm install
```

3. إعداد متغيرات البيئة:
قم بنسخ ملف `.env.local.example` إلى `.env.local`:
```bash
cp .env.local.example .env.local
```

4. تشغيل خادم التطوير:
```bash
npm run dev
```
افتح المتصفح على: `http://localhost:3000`

5. فحص وبناء النسخة الإنتاجية:
```bash
npm run build
npm run start
```

---

## 🔑 إعداد Firebase خطوة بخطوة من الصفر (Firebase Setup Guide)

1. ادخل إلى [Firebase Console](https://console.firebase.google.com/) وسجل الدخول بحساب Google.
2. اضغط على **Add Project (إضافة مشروع)**، وأدخل اسم المشروع (مثلاً: `company-realestate-crm`).
3. عطل أو فعّل Google Analytics حسب الرغبة، ثم اضغط **Create Project**.
4. داخل لوحة تحكم المشروع، اضغط على أيقونة الويب (`</>`) لإنشاء **Web App**:
   - ضع اسماً للتطبيق، مثلاً: `realestate-web`.
   - انسخ كائن الإعدادات (`firebaseConfig`).
5. **تفعيل المصادقة (Authentication)**:
   - من القائمة الجانبية، اختر **Authentication** ثم اضغط **Get Started**.
   - من تبويب **Sign-in method**، اختر **Email/Password** وقم بتفعيله ثم اضغط **Save**.
6. **إنشاء قاعدة بيانات Cloud Firestore**:
   - من القائمة الجانبية، اختر **Firestore Database** ثم اضغط **Create Database**.
   - اختر موقع الخادم (مثلاً: `europe-west1` أو الأقرب لمصر والشرق الأوسط).
   - اختر **Start in production mode** (سنقوم برفع القواعد الآمنة المرفقة في المشروع).
7. **تطبيق قواعد الأمان (Security Rules)**:
   - افتح ملف `firestore.rules` في المشروع وانسخ محتواه، ثم الصقه في تبويب **Rules** في Firestore Console واضغط **Publish**.
8. **تطبيق الفهارس المركبة (Firestore Indexes)**:
   - افتح تبويب **Indexes** في Firestore Console وأنشئ الفهارس المذكورة في ملف `firestore.indexes.json`.
9. الصق المفاتيح في ملف `.env.local` في الحقول المقابلة.

---

## 🗺️ إعداد Google Maps API من الصفر (Google Maps Setup Guide)

1. ادخل إلى [Google Cloud Console](https://console.cloud.google.com/).
2. اختر أو أنشئ مشروعاً جديداً (مثلاً: `RealEstate-Maps`).
3. تأكد من تفعيل الفوترة (Billing Account) في حساب Google Cloud.
4. انتقل إلى **APIs & Services** ثم **Library** وقم بتفعيل الآتي:
   - **Maps JavaScript API**
   - **Places API** (اختياري للإكمال التلقائي)
   - **Geocoding API** (اختياري لتحويل الإحداثيات لعناوين)
5. انتقل إلى **Credentials** واضغط **Create Credentials** ثم اختر **API key**.
6. **تقييد مفتاح الـ API (API Restrictions) لأمان الإنتاج**:
   - في قسم **Set application restrictions**، اختر **Websites** وأضف:
     - `http://localhost:3000/*` (للتطوير المحلي)
     - `https://your-project.vercel.app/*` (لنطاق Vercel)
     - `https://*.vercel.app/*`
   - في قسم **API restrictions**، اختر **Restrict key** وحدد فقط:
     - `Maps JavaScript API`
     - `Places API`
7. انسخ المفتاح والصقه في متغير `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` داخل `.env.local`.

---

## 📁 هيكلية المشروع (Project Structure)

```
├── public/                 # الملفات الثابتة والأيقونات
├── src/
│   ├── app/                # مسارات Next.js App Router
│   │   ├── layout.tsx      # الغلاف الجذري مع AuthProvider وتفعيل RTL
│   │   ├── globals.css     # نظام التصميم العصري (Vanilla CSS)
│   │   ├── page.tsx        # لوحة التحكم والإحصائيات الرئيسية (Dashboard)
│   │   ├── login/          # صفحة الدخول مع خيارات الدخول التجريبي السريع
│   │   ├── properties/     # قائمة العقارات مع البحث والفلاتر والجدول والشبكة
│   │   │   ├── new/        # صفحة إضافة عقار جديد (29 حقلاً + خريطة)
│   │   │   └── [id]/       # صفحة تفاصيل العقار الشاملة
│   │   │       └── edit/   # صفحة تعديل العقار للمصرح لهم
│   │   ├── map/            # صفحة خريطة العقارات التفاعلية المستقلة
│   │   └── users/          # صفحة إدارة المستخدمين والصلاحيات (Admin Only)
│   ├── components/         # المكونات القابلة لإعادة الاستخدام
│   │   ├── layout/         # AppShell, Navbar, Sidebar
│   │   ├── properties/     # PropertyForm, PropertyTable, PropertyCard, PropertyFilters
│   │   └── map/            # PropertyMap (Viewer & Picker Modes)
│   ├── context/            # AuthContext ودارة جلسات المستخدمين
│   ├── lib/
│   │   ├── firebase/       # إعداد Firebase Client و Auth/Firestore
│   │   └── utils/          # تطبيع النصوص العربية وتنسيق العملات والتواريخ
│   ├── services/           # دوال استعلامات Firestore والبيانات التجريبية
│   └── types/              # تعريفات TypeScript للعقارات والمستخدمين
├── firestore.rules         # قواعد أمان Firestore الإنتاجية
├── firestore.indexes.json  # إعدادات فهارس الاستعلامات المركبة
└── .env.local.example      # نموذج متغيرات البيئة
```

---

## 🔐 هيكل قواعد الأمان (Firestore Security Rules Summary)

- **الحظر الافتراضي**: حظر أي اتصال غير مصرح (Unauthenticated users are completely blocked).
- **العقارات (`/properties/{id}`)**:
  - القراءة متاحة فقط للأعضاء المسجلين (`admin`, `agent`, `viewer`).
  - الإضافة متاحة فقط للـ `admin` والـ `agent`.
  - التعديل محكوم بحيث يمنع العميل من تزوير بيانات `createdAt` أو `createdBy`.
  - الحذف محصور لـ `admin` فقط.
- **المستخدمين (`/users/{id}`)**:
  - تعديل الأدوار والصلاحيات محصور لمدير النظام (`admin`) فقط.

---

## 🚢 النشر على Vercel و GitHub

### 1. الرفع على GitHub:
```bash
git init
git add .
git commit -m "Initial commit: Complete Real Estate CRM System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. النشر على Vercel:
1. ادخل إلى [Vercel.com](https://vercel.com) وسجل الدخول بحساب GitHub.
2. اضغط **Add New Project** ثم استورد المستودع.
3. يتعرف Vercel تلقائياً على Next.js.
4. في قسم **Environment Variables**، أضف المتغيرات الموجودة في `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
5. اضغط **Deploy**.
6. بعد اكتمال النشر، أضف رابط الموقع من Vercel إلى:
   - **Authorized Domains** في Firebase Authentication Console.
   - **Website restrictions** في Google Maps API Key في Google Cloud Console.
# aqarat
