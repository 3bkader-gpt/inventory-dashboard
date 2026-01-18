# 📦 Inventory Dashboard - منصة إدارة المخزون المدعومة بالذكاء الاصطناعي

منصة SaaS كاملة لإدارة المخزون مع واجهة أمامية وخلفية متكاملة. تستخدم Gemini 2.0 Flash للبحث باللغة الطبيعية، Redis للتخزين المؤقت (تحسين الأداء بنسبة 90%)، التحليلات التنبؤية، وواجهات برمجة محدودة المعدل. جاهزة للنشر باستخدام Docker.

## ✨ المميزات

- 🤖 **ذكاء اصطناعي**: استخدام Gemini 2.0 Flash للبحث باللغة الطبيعية
- ⚡ **أداء عالي**: Redis للتخزين المؤقت (تحسين الأداء بنسبة 90%)
- 📊 **تحليلات تنبؤية**: توقعات ذكية للمخزون والطلب
- 🔒 **أمان**: مصادقة JWT وآمنة
- 🚀 **Full-Stack**: FastAPI للخلفية و React للواجهة الأمامية
- 🐳 **Docker**: جاهز للنشر باستخدام Docker
- 📈 **Rate Limiting**: واجهات برمجة محدودة المعدل

## 🚀 البدء السريع

### المتطلبات

- Docker و Docker Compose
- مفتاح API لـ Gemini (اختياري للبحث بالذكاء الاصطناعي)
- Redis (للتحسينات)

### التثبيت باستخدام Docker

1. استنسخ المستودع:
```bash
git clone https://github.com/3bkader-gpt/inventory-dashboard.git
cd inventory-dashboard
```

2. قم بإعداد ملف `.env`:
```bash
cp .env.example .env
# قم بتعديل ملف .env بإضافة بياناتك
```

3. شغل التطبيق:
```bash
docker-compose up -d
```

4. افتح المتصفح على `http://localhost:3000`

### التثبيت اليدوي

#### الخلفية (Backend)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

#### الواجهة الأمامية (Frontend)

```bash
cd frontend
npm install
npm start
```

## 📁 هيكل المشروع

```
inventory-dashboard/
├── backend/           # API الخلفية (FastAPI)
├── frontend/          # الواجهة الأمامية (React)
├── docs/              # الوثائق
├── docker-compose.yml # إعداد Docker
└── .env.example       # مثال ملف البيئة
```

## ⚙️ الإعدادات

### متغيرات البيئة

```env
# Database
DATABASE_URL=postgresql://user:password@localhost/dbname

# Redis
REDIS_URL=redis://localhost:6379

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# JWT
SECRET_KEY=your_secret_key
JWT_ALGORITHM=HS256

# Frontend
REACT_APP_API_URL=http://localhost:8000
```

## 📝 الاستخدام

### البحث بالذكاء الاصطناعي

يمكنك البحث عن المنتجات باستخدام اللغة الطبيعية:
- "أعطني جميع المنتجات التي تنتهي صلاحيتها هذا الشهر"
- "ما هي المنتجات الأكثر مبيعاً؟"
- "عرض المنتجات قليلة المخزون"

### إدارة المخزون

- إضافة/تعديل/حذف المنتجات
- تتبع المخزون في الوقت الفعلي
- تحليلات وتقارير مفصلة
- تنبيهات للمخزون المنخفض

## 🛠️ التقنيات المستخدمة

### الخلفية
- **FastAPI**: إطار عمل الويب الحديث
- **PostgreSQL**: قاعدة البيانات
- **Redis**: التخزين المؤقت
- **Gemini 2.0 Flash**: الذكاء الاصطناعي
- **SQLAlchemy**: ORM
- **Pydantic**: التحقق من البيانات

### الواجهة الأمامية
- **React**: مكتبة JavaScript
- **TypeScript**: لغة البرمجة
- **Material-UI**: مكونات الواجهة
- **Axios**: طلبات HTTP

## 📊 المميزات المتقدمة

- **تحليلات تنبؤية**: توقع الطلب والمبيعات
- **تحسين الأداء**: Redis cache يقلل وقت الاستجابة بنسبة 90%
- **Rate Limiting**: حماية API من الإفراط في الاستخدام
- **Real-time Updates**: تحديثات فورية للمخزون

## 🚀 النشر

راجع ملف [DEPLOYMENT.md](DEPLOYMENT.md) لتعليمات النشر التفصيلية.

## 📄 الترخيص

هذا المشروع مفتوح المصدر ومتاح للاستخدام الحر.

## 🤝 المساهمة

نرحب بالمساهمات! يرجى فتح Issue أو Pull Request.

## 📧 التواصل

للاستفسارات والدعم، يرجى فتح Issue في المستودع.

---

**ملاحظة**: تأكد من إعداد متغيرات البيئة بشكل صحيح قبل التشغيل.