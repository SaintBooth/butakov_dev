export const SCHEMA_BUSINESS = {
  '@context': 'https://schema.org',
  '@type': ['ProfessionalService', 'LocalBusiness'],
  '@id': 'https://butakov.dev/#business',
  name: 'ИП Бутаков Александр Сергеевич',
  url: 'https://butakov.dev',
  telephone: '+79126315779',
  email: 'hello@butakov.dev',
  taxID: '667011271708',
  legalName: 'ИП Бутаков Александр Сергеевич',
  priceRange: '₽₽₽',
  areaServed: { '@type': 'Country', name: 'Россия' },
  sameAs: ['https://t.me/SashaBooth', 'https://github.com/SaintBooth', 'https://promptspace.ru'],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Услуги IT-разработки и маркетинга',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Сложные веб-сервисы и стартапы',
          description:
            'Разработка кастомных платформ, SaaS, маркетплейсов на Django 5 и Next.js 15.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'E-commerce на 1С-Битрикс',
          description: 'Разработка интернет-магазинов с синхронизацией 1С:УТ.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Digital-маркетинг и Яндекс Директ',
          description:
            'Настройка и ведение Яндекс Директ, сквозная аналитика, оптимизация воронки.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Корпоративные сайты на WordPress',
          description: 'Быстрые SEO-оптимизированные корпоративные сайты.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'ИИ-консалтинг',
          description: 'Внедрение LLM и нейросетей в бизнес-процессы.',
        },
      },
    ],
  },
};

export const SCHEMA_PERSON = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': 'https://butakov.dev/#person',
  name: 'Александр Бутаков',
  jobTitle: 'IT-консультант и разработчик веб-приложений',
  url: 'https://butakov.dev',
  telephone: '+79126315779',
  sameAs: ['https://t.me/SashaBooth', 'https://github.com/SaintBooth', 'https://promptspace.ru'],
  worksFor: { '@id': 'https://butakov.dev/#business' },
};

export const SCHEMA_FAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Работаете ли вы по официальному договору?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Да. Работаю по договору, подписываю NDA. Предоставляю все закрывающие документы и чеки, принимаю безналичный расчет через ЭДО. ИП Бутаков А.С., ИНН 667011271708.',
      },
    },
    {
      '@type': 'Question',
      name: 'Какая гарантия на разработку?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '6 месяцев бесплатной технической поддержки. Если после сдачи проекта обнаружится баг — исправлю его бесплатно.',
      },
    },
    {
      '@type': 'Question',
      name: 'Почему работать с вами выгоднее, чем со студией?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Я работаю один и использую ИИ-инструменты для ускорения рутины. Вы не оплачиваете раздутый штат менеджеров и получаете прямой доступ к исполнителю.',
      },
    },
    {
      '@type': 'Question',
      name: 'Как начать сотрудничество?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Три шага: 1) Оставьте заявку. 2) Я подготовлю смету и roadmap. 3) Работаем спринтами с регулярной демонстрацией результатов.',
      },
    },
    {
      '@type': 'Question',
      name: 'Вы работаете с клиентами из других городов и регионов?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Да, работаю удалённо со всей России. Вся коммуникация через Telegram или видеозвонки, документооборот — через ЭДО.',
      },
    },
  ],
};
