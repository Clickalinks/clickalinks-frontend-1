const MEASUREMENT_ID = (process.env.REACT_APP_GA_MEASUREMENT_ID || '').trim();

export const hasAnalytics = Boolean(MEASUREMENT_ID);

export function initAnalytics() {
  if (!MEASUREMENT_ID || window.__clickalinksGaLoaded) return;
  window.__clickalinksGaLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, {
    anonymize_ip: true,
    send_page_view: false
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
  document.head.appendChild(script);
}

export function trackPageView(path) {
  if (!MEASUREMENT_ID || typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title
  });
}
