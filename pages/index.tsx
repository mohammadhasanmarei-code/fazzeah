import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  const handleJoinClick = () => {
    router.push('/order');
  };

  return (
    <>
      <Head>
        <title>فزعة</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:title" content="فزعة - بطاقة المزايا والامتيازات" />
        <meta property="og:description" content="انضم إلى فزعة واستمتع بأفضل المزايا والامتيازات الحصرية" />
        <meta property="og:image" content="/assets/images/opengraph.png" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="ar_AR" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/assets/fonts/fontawesome/css/all.min.css" />
        <link rel="stylesheet" href="/assets/css/styles.css" />
      </Head>

      <div className="page home-page">
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

        <main>
          <section className="slider">
            <div className="slider__viewport">
              <div className="slider__track">
                <article className="slider__slide slider__slide--active">
                  <img
                    className="slider__image"
                    src="/assets/images/slider/Fazaa-&-du-web-banner-arabic.png"
                    alt=""
                    aria-hidden="true"
                  />
                  <div className="slider__overlay"></div>
                </article>
                <article className="slider__slide">
                  <img
                    className="slider__image"
                    src="/assets/images/slider/Zero-dirhams-(arabic).png"
                    alt=""
                    aria-hidden="true"
                  />
                  <div className="slider__overlay"></div>
                </article>
              </div>
            </div>
          </section>

          <section className="catalog">
            <h2 className="catalog__title">اختر باقتك</h2>
            <div className="catalog__grid">
              <article className="product-card">
                <div className="product-card__inner">
                  <img className="product-card__image" src="/assets/images/products/Platinum.png" alt="Platinum" />
                  <h3 className="product-card__title">البلاتينية</h3>
                  <div className="product-card__price">
                    <span className="product-card__value">75</span>
                    <span className="product-card__currency">AED</span>
                  </div>
                  <ul className="product-card__features">
                    <li>✓ خصومات حصرية</li>
                    <li>✓ عروض مميزة</li>
                    <li>✓ دعم على مدار الساعة</li>
                  </ul>
                  <button className="product-card__action" onClick={handleJoinClick}>
                    انضم الآن
                  </button>
                </div>
              </article>

              <article className="product-card">
                <div className="product-card__inner">
                  <img className="product-card__image" src="/assets/images/products/Gold.png" alt="Gold" />
                  <h3 className="product-card__title">الذهبية</h3>
                  <div className="product-card__price">
                    <span className="product-card__value">75</span>
                    <span className="product-card__currency">AED</span>
                  </div>
                  <ul className="product-card__features">
                    <li>✓ خصومات مميزة</li>
                    <li>✓ عروض خاصة</li>
                    <li>✓ دعم فني</li>
                  </ul>
                  <button className="product-card__action" onClick={handleJoinClick}>
                    انضم الآن
                  </button>
                </div>
              </article>

              <article className="product-card">
                <div className="product-card__inner">
                  <img className="product-card__image" src="/assets/images/products/Silver.png" alt="Silver" />
                  <h3 className="product-card__title">الفضية</h3>
                  <div className="product-card__price">
                    <span className="product-card__value">مجاناً</span>
                  </div>
                  <ul className="product-card__features">
                    <li>✓ خصومات أساسية</li>
                    <li>✓ عروض محدودة</li>
                    <li>✓ دعم قياسي</li>
                  </ul>
                  <button className="product-card__action" onClick={handleJoinClick}>
                    انضم الآن
                  </button>
                </div>
              </article>
            </div>
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
