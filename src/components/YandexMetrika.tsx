'use client';

import { useEffect } from 'react';

const YM_ID = 107722106;

declare global {
  interface Window {
    ym: (id: number, action: string, params?: Record<string, unknown>) => void;
  }
}

export function YandexMetrika() {
  useEffect(() => {
    /* eslint-disable */
    (function (m: any, e: any, t: any, r: any, i: any, k?: any, a?: any) {
      m[i] =
        m[i] ||
        function () {
          (m[i].a = m[i].a || []).push(arguments);
        };
      m[i].l = 1 * (new Date() as unknown as number);
      for (let j = 0; j < document.scripts.length; j++) {
        if (document.scripts[j].src === r) return;
      }
      k = e.createElement(t);
      a = e.getElementsByTagName(t)[0];
      k.async = 1;
      k.src = r;
      a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
    /* eslint-enable */

    window.ym(YM_ID, 'init', {
      webvisor: true,
      clickmap: true,
      ecommerce: 'dataLayer',
      accurateTrackBounce: true,
      trackLinks: true,
    });
  }, []);

  return (
    <noscript>
      <img
        src={`https://mc.yandex.ru/watch/${YM_ID}`}
        style={{ position: 'absolute', left: '-9999px' }}
        alt=""
      />
    </noscript>
  );
}
