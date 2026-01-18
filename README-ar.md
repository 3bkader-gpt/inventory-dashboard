<div align="center">

# 📦 Inventory Dashboard

### منصة SaaS لإدارة المخزون المدعومة بالذكاء الاصطناعي

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-Latest-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Latest-3178C6.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

**ذكاء اصطناعي • أداء عالي • تحليلات تنبؤية • Full-Stack**

[المميزات](#-المميزات) • [التثبيت](#-التثبيت) • [الاستخدام](#-الاستخدام) • [المساهمة](#-المساهمة)

</div>

---

## 📋 جدول المحتويات

- [نظرة عامة](#-نظرة-عامة)
- [المميزات](#-المميزات)
- [المتطلبات](#-المتطلبات)
- [التثبيت](#-التثبيت)
- [الإعدادات](#-الإعدادات)
- [الاستخدام](#-الاستخدام)
- [هيكل المشروع](#-هيكل-المشروع)
- [التقنيات المستخدمة](#-التقنيات-المستخدمة)
- [النشر](#-النشر)
- [المساهمة](#-المساهمة)

---

## 🎯 نظرة عامة

**Inventory Dashboard** هي منصة SaaS كاملة لإدارة المخزون مع واجهة أمامية وخلفية متكاملة. تستخدم Gemini 2.0 Flash للبحث باللغة الطبيعية، Redis للتخزين المؤقت (تحسين الأداء بنسبة 90%)، التحليلات التنبؤية، وواجهات برمجة محدودة المعدل.

### ✨ لماذا Inventory Dashboard؟

- 🤖 **ذكاء اصطناعي** - بحث باللغة الطبيعية باستخدام Gemini
- ⚡ **أداء فائق** - Redis cache يقلل وقت الاستجابة بنسبة 90%
- 📊 **تحليلات ذكية** - توقعات تنبؤية للمخزون والطلب
- 🔒 **آمن** - مصادقة JWT وآمنة
- 🚀 **Full-Stack** - FastAPI + React

---

## 🌟 المميزات

### 🚀 المميزات الرئيسية

| الميزة | الوصف |
|--------|-------|
| 🤖 **ذكاء اصطناعي** | استخدام Gemini 2.0 Flash للبحث باللغة الطبيعية |
| ⚡ **أداء عالي** | Redis للتخزين المؤقت (تحسين الأداء بنسبة 90%) |
| 📊 **تحليلات تنبؤية** | توقعات ذكية للمخزون والطلب |
| 🔒 **أمان** | مصادقة JWT وآمنة |
| 🚀 **Full-Stack** | FastAPI للخلفية و React للواجهة الأمامية |
| 🐳 **Docker** | جاهز للنشر باستخدام Docker |
| 📈 **Rate Limiting** | واجهات برمجة محدودة المعدل |

### 🎯 المميزات المتقدمة

- ✅ **بحث ذكي** - البحث باللغة الطبيعية
- ✅ **Real-time Updates** - تحديثات فورية للمخزون
- ✅ **تقارير مفصلة** - تحليلات وإحصائيات شاملة
- ✅ **تنبيهات** - إشعارات للمخزون المنخفض
- ✅ **تصدير البيانات** - تصدير التقارير بصيغ مختلفة

---

## 📦 المتطلبات

قبل البدء، تأكد من تثبيت:

- **Docker** و **Docker Compose** (موصى به)
- **Python** 3.8+ (للخلفية)
- **Node.js** 16+ (للأمامية)
- **PostgreSQL** (أو استخدام Docker)
- **Redis** (أو استخدام Docker)
- **Gemini API Key** (اختياري للبحث بالذكاء الاصطناعي)

---

## 🚀 التثبيت

### الطريقة الأولى: استخدام Docker (موصى به)

```bash
# 1. استنسخ المستودع
git clone https://github.com/3bkader-gpt/inventory-dashboard.git
cd inventory-dashboard

# 2. قم بإعداد ملف البيئة
cp .env.example .env
# قم بتعديل ملف .env بإضافة بياناتك

# 3. شغل التطبيق
docker-compose up -d

# 4. افتح المتصفح
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### الطريقة الثانية: التثبيت اليدوي

#### الخلفية (Backend)

```bash
cd backend

# أنشئ بيئة افتراضية
python -m venv venv
source venv/bin/activate  # على Windows: venv\Scripts\activate

# ثبت المتطلبات
pip install -r requirements.txt

# قم بإعداد قاعدة البيانات
# أنشئ قاعدة بيانات PostgreSQL

# شغل الخادم
uvicorn main:app --reload
```

#### الواجهة الأمامية (Frontend)

```bash
cd frontend

# ثبت المتطلبات
npm install

# شغل التطبيق
npm start
```

---

## ⚙️ الإعدادات

### متغيرات البيئة

أنشئ ملف `.env` في المجلد الرئيسي:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/inventory_db

# Redis
REDIS_URL=redis://localhost:6379

# Gemini AI (اختياري)
GEMINI_API_KEY=your_gemini_api_key_here

# JWT
SECRET_KEY=your_secret_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Frontend
REACT_APP_API_URL=http://localhost:8000

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### إعداد قاعدة البيانات

```bash
# باستخدام Docker
docker-compose up -d postgres

# أو يدوياً
createdb inventory_db
```

---

## 📖 الاستخدام

### البحث بالذكاء الاصطناعي

يمكنك البحث عن المنتجات باستخدام اللغة الطبيعية:

- "أعطني جميع المنتجات التي تنتهي صلاحيتها هذا الشهر"
- "ما هي المنتجات الأكثر مبيعاً؟"
- "عرض المنتجات قليلة المخزون"
- "ما هي المنتجات التي تحتاج لإعادة طلب؟"

### إدارة المخزون

#### إضافة منتج جديد

1. اذهب إلى صفحة "إضافة منتج"
2. املأ البيانات المطلوبة
3. احفظ المنتج

#### تعديل منتج

1. ابحث عن المنتج
2. اضغط على "تعديل"
3. قم بالتعديلات المطلوبة
4. احفظ التغييرات

#### عرض التقارير

1. اذهب إلى صفحة "التقارير"
2. اختر نوع التقرير
3. حدد الفترة الزمنية
4. اعرض التقرير

---

## 📁 هيكل المشروع

```
inventory-dashboard/
├── 📂 backend/              # API الخلفية (FastAPI)
│   ├── 📂 app/
│   │   ├── 📂 api/          # نقاط النهاية
│   │   ├── 📂 models/      # نماذج البيانات
│   │   ├── 📂 services/    # منطق العمل
│   │   └── 📂 utils/       # أدوات مساعدة
│   ├── 📄 main.py          # نقطة الدخول
│   └── 📄 requirements.txt # المتطلبات
├── 📂 frontend/            # الواجهة الأمامية (React)
│   ├── 📂 src/
│   │   ├── 📂 components/  # المكونات
│   │   ├── 📂 pages/       # الصفحات
│   │   ├── 📂 services/    # خدمات API
│   │   └── 📂 utils/       # أدوات مساعدة
│   └── 📄 package.json     # المتطلبات
├── 📂 docs/                # الوثائق
├── 🐳 docker-compose.yml   # إعداد Docker
└── 📄 .env.example         # مثال ملف البيئة
```

---

## 🛠️ التقنيات المستخدمة

### الخلفية (Backend)

<div align="center">

| التقنية | الوصف |
|---------|-------|
| ![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?logo=fastapi&logoColor=white) | إطار عمل الويب |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-316192?logo=postgresql&logoColor=white) | قاعدة البيانات |
| ![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?logo=redis&logoColor=white) | التخزين المؤقت |
| ![Gemini](https://img.shields.io/badge/Gemini-AI-4285F4?logo=google&logoColor=white) | الذكاء الاصطناعي |
| ![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-ORM-29A4D1?logo=sqlalchemy&logoColor=white) | ORM |
| ![Pydantic](https://img.shields.io/badge/Pydantic-Validation-E92063?logo=pydantic&logoColor=white) | التحقق من البيانات |

</div>

### الواجهة الأمامية (Frontend)

<div align="center">

| التقنية | الوصف |
|---------|-------|
| ![React](https://img.shields.io/badge/React-Latest-61DAFB?logo=react&logoColor=white) | مكتبة JavaScript |
| ![TypeScript](https://img.shields.io/badge/TypeScript-Latest-3178C6?logo=typescript&logoColor=white) | لغة البرمجة |
| ![Material-UI](https://img.shields.io/badge/Material--UI-Latest-0081CB?logo=material-ui&logoColor=white) | مكونات الواجهة |
| ![Axios](https://img.shields.io/badge/Axios-HTTP-5A29E4?logo=axios&logoColor=white) | طلبات HTTP |

</div>

---

## 📊 المميزات المتقدمة

### تحليلات تنبؤية

- 📈 توقع الطلب المستقبلي
- 📊 تحليل اتجاهات المبيعات
- 🔮 تنبؤات المخزون المثالي
- ⚠️ تنبيهات المخزون المنخفض

### تحسين الأداء

- ⚡ Redis cache يقلل وقت الاستجابة بنسبة 90%
- 🔄 تحديثات فورية للمخزون
- 📦 تحميل البيانات بشكل تدريجي
- 🚀 تحسين استعلامات قاعدة البيانات

---

## 🚀 النشر

راجع ملف [DEPLOYMENT.md](DEPLOYMENT.md) لتعليمات النشر التفصيلية.

### النشر على Docker

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### النشر على Cloud

- **Render**: راجع ملف `render.yaml`
- **Heroku**: راجع ملف `Procfile`
- **AWS**: استخدم ECS أو EC2
- **DigitalOcean**: استخدم App Platform

---

## 🤝 المساهمة

نرحب بمساهماتك! 🎉

1. 🍴 Fork المشروع
2. 🌿 أنشئ فرع (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push (`git push origin feature/AmazingFeature`)
5. 🔄 افتح Pull Request

---

## 📄 الترخيص

هذا المشروع مفتوح المصدر ومتاح للاستخدام الحر.

---

## 📞 التواصل والدعم

- 🐛 **الإبلاغ عن مشاكل**: [افتح Issue](https://github.com/3bkader-gpt/inventory-dashboard/issues)
- 💡 **اقتراح ميزات**: [افتح Issue](https://github.com/3bkader-gpt/inventory-dashboard/issues)
- 📧 **البريد الإلكتروني**: medo.omar.salama@gmail.com

---

<div align="center">

**صُنع بـ ❤️ بواسطة [Mohamed Omar](https://github.com/3bkader-gpt)**

⭐ إذا أعجبك المشروع، لا تنسى إعطائه نجمة!

[⬆ العودة للأعلى](#-inventory-dashboard)

</div>