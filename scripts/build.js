import fs from 'node:fs';
import path from 'node:path';
import { SECTORS, SECTOR_SERVICE_TYPES } from './sectors-data.js';
import { CORE_SERVICES } from './services-data.js';

const DOMAIN = 'https://aliagayazilim.com';
const CONTACT_EMAIL = 'contact@aliagayazilim.com';
const ROOT_DIR = process.cwd();
const TODAY_ISO = new Date().toISOString().split('T')[0];

// Yardımcı: Klasör oluşturup dosyayı yaz
function writePage(routePath, htmlContent) {
  const cleanRoute = routePath.replace(/^\/+|\/+$/g, '');
  const targetFile = cleanRoute
    ? path.join(ROOT_DIR, ...cleanRoute.split('/'), 'index.html')
    : path.join(ROOT_DIR, 'index.html');

  fs.mkdirSync(path.dirname(targetFile), { recursive: true });
  fs.writeFileSync(targetFile, htmlContent, 'utf8');
  return cleanRoute ? `${DOMAIN}/${cleanRoute}` : `${DOMAIN}/`;
}

// Yardımcı: Göreli kök dizin öneki (./ veya ../ veya ../../)
function getRootPrefix(routePath) {
  const cleanRoute = routePath.replace(/^\/+|\/+$/g, '');
  if (!cleanRoute) return './';
  const depth = cleanRoute.split('/').length;
  return '../'.repeat(depth);
}

// Yardımcı: Sayfa içi link üretici (Hem yerel dosya hem sunucu uyumlu)
function pageHref(rootPrefix, targetRoute) {
  const clean = targetRoute.replace(/^\/+|\/+$/g, '');
  if (!clean) return rootPrefix;
  return `${rootPrefix}${clean}/`;
}

// SVG İkon Üretici (Sıfır CLS, Hafif Vektörel İkonlar)
function renderIcon(name, size = 24) {
  const icons = {
    globe: `<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 0c2.5 2.5 4 6 4 10s-1.5 7.5-4 10c-2.5-2.5-4-6-4-10s1.5-7.5 4-10zM2 12h20"/>`,
    zap: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
    'shopping-cart': `<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>`,
    'map-pin': `<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>`,
    'share-2': `<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>`,
    mail: `<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>`,
    check: `<polyline points="20 6 9 17 4 12"/>`,
    cpu: `<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>`,
    smartphone: `<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>`,
    trending: `<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>`,
    shield: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`
  };
  const body = icons[name] || icons.globe;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

// Ortak Head, SEO Meta, OpenGraph, Twitter Card ve JSON-LD Schema Üretici
function renderHead({
  routePath,
  title,
  description,
  keywords = [],
  breadcrumbs = [],
  faqs = [],
  serviceType = 'Kurumsal Web Tasarım, SEO ve Yapay Zeka Çözümleri'
}) {
  const rootPrefix = getRootPrefix(routePath);
  const cleanRoute = routePath.replace(/^\/+|\/+$/g, '');
  const canonicalUrl = cleanRoute ? `${DOMAIN}/${cleanRoute}` : `${DOMAIN}/`;
  const keywordsStr = [...new Set([...keywords, 'aliağa yazılım', 'aliagayazilim.com', 'ücretsiz dijital danışmanlık'])].join(', ');

  const schemaGraph = [
    {
      '@type': 'ProfessionalService',
      '@id': `${DOMAIN}/#organization`,
      name: 'Aliağa Yazılım',
      alternateName: 'aliagayazilim.com',
      url: DOMAIN,
      logo: `${DOMAIN}/assets/img/aliaga-logo.png`,
      image: `${DOMAIN}/assets/img/og-image.svg`,
      email: CONTACT_EMAIL,
      description: 'Aliağa ve Türkiye genelinde Web Tasarım, Web Sitesi, SEO Hizmetleri, Google Business, Kurumsal Mail, E-Ticaret, Mobil Uygulama, Yapay Zeka ve Otomasyon çözümleri.',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Aliağa',
        addressRegion: 'İzmir',
        addressCountry: 'TR'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 38.7996,
        longitude: 26.9706
      },
      areaServed: [
        { '@type': 'City', name: 'Aliağa' },
        { '@type': 'AdministrativeArea', name: 'İzmir' },
        { '@type': 'Country', name: 'Türkiye' }
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        email: CONTACT_EMAIL,
        contactType: 'customer support and sales',
        availableLanguage: ['Turkish', 'English']
      }
    },
    {
      '@type': 'WebSite',
      '@id': `${DOMAIN}/#website`,
      url: DOMAIN,
      name: 'Aliağa Yazılım | Web Tasarım, SEO, E-Ticaret ve Yapay Zeka',
      publisher: { '@id': `${DOMAIN}/#organization` },
      inLanguage: 'tr-TR'
    },
    {
      '@type': 'WebPage',
      '@id': `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: title,
      description: description,
      isPartOf: { '@id': `${DOMAIN}/#website` },
      about: { '@id': `${DOMAIN}/#organization` },
      inLanguage: 'tr-TR',
      datePublished: '2026-01-01',
      dateModified: TODAY_ISO
    },
    {
      '@type': 'Service',
      name: title,
      serviceType: serviceType,
      provider: { '@id': `${DOMAIN}/#organization` },
      areaServed: { '@type': 'Country', name: 'Türkiye' },
      description: description,
      offers: {
        '@type': 'Offer',
        description: 'Ücretsiz Dijital Danışmanlık ve Ön Analiz Desteği',
        priceCurrency: 'TRY',
        availability: 'https://schema.org/InStock',
        url: canonicalUrl
      }
    }
  ];

  if (breadcrumbs.length > 0) {
    schemaGraph.push({
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((b, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: b.label,
        item: b.route ? `${DOMAIN}/${b.route.replace(/^\/+|\/+$/g, '')}` : `${DOMAIN}/`
      }))
    });
  }

  if (faqs.length > 0) {
    schemaGraph.push({
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.a
        }
      }))
    });
  }

  return `<!DOCTYPE html>
<html lang="tr" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <meta name="description" content="${description.replace(/"/g, '&quot;')}">
  <meta name="keywords" content="${keywordsStr.replace(/"/g, '&quot;')}">
  <meta name="author" content="Aliağa Yazılım - aliagayazilim.com">
  <meta name="publisher" content="Aliağa Yazılım">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <meta name="googlebot" content="index, follow">

  <!-- Yerel SEO Coğrafi Meta Etiketleri -->
  <meta name="geo.region" content="TR-35">
  <meta name="geo.placename" content="Aliağa, İzmir">
  <meta name="geo.position" content="38.7996;26.9706">
  <meta name="ICBM" content="38.7996, 26.9706">

  <!-- Canonical & Hreflang -->
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="alternate" hreflang="tr-TR" href="${canonicalUrl}">
  <link rel="alternate" hreflang="x-default" href="${canonicalUrl}">

  <!-- Open Graph / Facebook / LinkedIn / WhatsApp -->
  <meta property="og:locale" content="tr_TR">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Aliağa Yazılım | aliagayazilim.com">
  <meta property="og:title" content="${title.replace(/"/g, '&quot;')}">
  <meta property="og:description" content="${description.replace(/"/g, '&quot;')}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${DOMAIN}/assets/img/og-image.svg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${title.replace(/"/g, '&quot;')}">

  <!-- Twitter / X Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}">
  <meta name="twitter:description" content="${description.replace(/"/g, '&quot;')}">
  <meta name="twitter:image" content="${DOMAIN}/assets/img/og-image.svg">

  <!-- Favicon, Manifest & Kurumsal Tema Rengi -->
  <meta name="theme-color" content="#DC1E62">
  <link rel="icon" type="image/svg+xml" href="${rootPrefix}assets/img/favicon.svg">
  <link rel="apple-touch-icon" href="${rootPrefix}assets/img/aliaga-logo.png">
  <link rel="manifest" href="${rootPrefix}site.webmanifest">

  <!-- Stil Dosyası -->
  <link rel="stylesheet" href="${rootPrefix}assets/css/style.css">

  <!-- Yapısal Veri (JSON-LD Schema.org) -->
  <script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': schemaGraph })}</script>
</head>`;
}

// Referanslarımız (Tamamlanan ve Devam Eden Başarı Hikayeleri)
export const REFERENCES = [
  {
    domain: 'aliagakombibakim.com',
    url: 'https://aliagakombibakim.com',
    title: 'Aliağa Kombi Bakım Servisi',
    sectorLabel: 'Kombi Bakım Servisi',
    relatedRoute: 'kombi-bakim-web-sitesi',
    summary: 'Aliağa ve çevresinde kombi bakımı, petek temizliği ve 7/24 acil teknik servis hizmeti sunan işletme için yerel SEO (Google Harita) odaklı, mobil hızlı arama ve randevu dönüşümlü kurumsal web projesi.',
    tags: ['Kurumsal Web Tasarım', 'Yerel SEO & Harita', '100/100 Core Web Vitals', 'Mobil Acil Çağrı Modülü']
  },
  {
    domain: 'asmakinaotomasyon.com',
    url: 'https://asmakinaotomasyon.com',
    title: 'AS Makina Otomasyon',
    sectorLabel: 'Makina Otomasyon Yazılım Çözümleri',
    relatedRoute: 'yapay-zeka-destekli-otomasyon-hizmetleri',
    summary: 'Endüstriyel makina, PLC/SCADA ve fabrika otomasyon yazılım çözümleri sunan mühendislik firması için B2B kurumsal kimlik, teknik katalog, proje portfolyosu ve hızlı teklif altyapısı.',
    tags: ['Endüstriyel Web Sitesi', 'Makina & Otomasyon', 'B2B Teklif Altyapısı', 'Kurumsal SEO']
  },
  {
    domain: 'gursemabeauty.com',
    url: 'https://gursemabeauty.com',
    title: 'Gürsema Beauty Center',
    sectorLabel: 'Güzellik ve Bakım Merkezi',
    relatedRoute: 'guzellik-salonlari-web-sitesi',
    summary: 'Cilt bakımı, lazer epilasyon ve bölgesel incelme uygulamaları sunan güzellik ve bakım merkezi için estetik UI/UX arayüz, uygulama tanıtım sayfaları ve online randevu dönüşüm sistemi.',
    tags: ['Güzellik Merkezi UI/UX', 'Online Randevu & İletişim', 'Sosyal Medya Entegrasyonu', 'Mobil Öncelikli Tasarım']
  }
];

function renderReferencesCards(routePath) {
  const rootPrefix = getRootPrefix(routePath);
  return `
  <div class="references-grid">
    ${REFERENCES.map(
      (ref) => `
      <article class="reference-card">
        <div class="reference-browser-bar">
          <div class="browser-dots" aria-hidden="true"><span></span><span></span><span></span></div>
          <span class="browser-url">${ref.domain}</span>
        </div>
        <div class="reference-visual">
          <span class="reference-sector-badge">✓ ${ref.sectorLabel}</span>
          <h3 class="reference-domain-title">
            <a href="${ref.url}" target="_blank" rel="noopener noreferrer" style="color:inherit;">${ref.title}</a>
          </h3>
          <span style="font-size:0.84rem; font-weight:700; color:var(--aliaga-blue);">${ref.domain} ↗</span>
        </div>
        <div class="reference-body">
          <div>
            <p style="font-size:0.93rem; color:var(--text-body);">${ref.summary}</p>
            <div class="reference-tags">
              ${ref.tags.map((t) => `<span class="reference-tag">${t}</span>`).join('')}
            </div>
          </div>
          <div class="reference-actions">
            <a href="${ref.url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">
              Siteyi Ziyaret Et ↗
            </a>
            <a href="${pageHref(rootPrefix, ref.relatedRoute)}" class="feature-card-link">
              Sektör Paketini İncele →
            </a>
          </div>
        </div>
      </article>`
    ).join('')}
  </div>`;
}

// Ortak Header & Navigasyon
function renderHeader(routePath) {
  const rootPrefix = getRootPrefix(routePath);
  return `
  <div class="brand-ribbon" aria-hidden="true"></div>
  <div class="topbar">
    <div class="container topbar-inner">
      <div class="topbar-left">
        <span class="topbar-badge">Ücretsiz Ön Analiz</span>
        <span>Tüm sektörler için ücretsiz dijital check-up ve proje danışmanlığı!</span>
      </div>
      <div class="topbar-right">
        <span class="hide-mobile">7/24 Destek &amp; Teklif Hattı:</span>
        <a href="mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Ücretsiz Dijital Danışmanlık Talebi')}" class="topbar-mail" title="Ücretsiz Danışmanlık İçin Mail Gönderin">
          ${renderIcon('mail', 15)} ${CONTACT_EMAIL}
        </a>
      </div>
    </div>
  </div>

  <header class="site-header">
    <div class="container header-inner">
      <a href="${pageHref(rootPrefix, '')}" class="brand-logo" aria-label="Aliağa Yazılım Ana Sayfa">
        <img src="${rootPrefix}assets/img/aliaga-logo.png" alt="Aliağa Yazılım Kurumsal Logo" class="brand-logo-img" width="115" height="44" decoding="async">
        <div class="brand-logo-text">
          <span class="brand-logo-title">Yazılım<span class="dot-magenta">.</span><span class="dot-blue">A</span><span class="dot-green">I</span></span>
          <span class="brand-logo-sub">aliagayazilim.com</span>
        </div>
      </a>

      <button type="button" class="mobile-menu-toggle" data-mobile-toggle aria-expanded="false" aria-label="Menüyü Aç/Kapat">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>

      <nav class="main-nav" data-main-nav aria-label="Ana Navigasyon">
        <a href="${pageHref(rootPrefix, '')}" class="nav-link">Ana Sayfa</a>

        <div class="nav-item-dropdown">
          <a href="${pageHref(rootPrefix, 'web-tasarim')}" class="nav-link">Hizmetlerimiz ▾</a>
          <div class="dropdown-menu">
            <a href="${pageHref(rootPrefix, 'web-tasarim')}" class="dropdown-link">Web Tasarım <span class="badge-mini">UI/UX</span></a>
            <a href="${pageHref(rootPrefix, 'web-sitesi')}" class="dropdown-link">Kurumsal Web Sitesi <span class="badge-mini">Anahtar Teslim</span></a>
            <a href="${pageHref(rootPrefix, 'seo-hizmetleri')}" class="dropdown-link">SEO Hizmetleri <span class="badge-mini">1. Sıra</span></a>
            <a href="${pageHref(rootPrefix, 'google-bussiness')}" class="dropdown-link">Google Business Danışmanlık <span class="badge-mini">Harita</span></a>
            <a href="${pageHref(rootPrefix, 'e-ticaret')}" class="dropdown-link">E-Ticaret Kurulumu <span class="badge-mini">B2C/B2B</span></a>
            <a href="${pageHref(rootPrefix, 'mobil-uygulama')}" class="dropdown-link">Mobil Uygulama <span class="badge-mini">iOS/Android</span></a>
            <a href="${pageHref(rootPrefix, 'mail-hizmetleri')}" class="dropdown-link">Kurumsal Mail Hizmetleri <span class="badge-mini">Spamsiz</span></a>
          </div>
        </div>

        <div class="nav-item-dropdown">
          <a href="${pageHref(rootPrefix, 'yapay-zeka-danismanlik')}" class="nav-link">Yapay Zeka &amp; Otomasyon ▾</a>
          <div class="dropdown-menu">
            <a href="${pageHref(rootPrefix, 'yapay-zeka-danismanlik')}" class="dropdown-link">Yapay Zeka Danışmanlık <span class="badge-mini">AI Strateji</span></a>
            <a href="${pageHref(rootPrefix, 'yapay-zeka-destekli-otomasyon-hizmetleri')}" class="dropdown-link">AI Otomasyon Hizmetleri <span class="badge-mini">7/24 Akış</span></a>
            <a href="${pageHref(rootPrefix, 'yapay-zeka-destekli-musteri-temsilcisi')}" class="dropdown-link">AI Müşteri Temsilcisi <span class="badge-mini">Asistan</span></a>
            <a href="${pageHref(rootPrefix, 'kurumsal-yapay-zeka-donusum-hizmetleri')}" class="dropdown-link">Kurumsal AI Dönüşümü <span class="badge-mini">360°</span></a>
          </div>
        </div>

        <a href="${pageHref(rootPrefix, 'sektorler')}" class="nav-link">Sektörler (53+)</a>
        <a href="${pageHref(rootPrefix, 'referanslar')}" class="nav-link">Referanslarımız</a>
        <a href="${pageHref(rootPrefix, 'hakkimizda')}" class="nav-link">Hakkımızda</a>
        <a href="${pageHref(rootPrefix, 'iletisim')}" class="nav-link">İletişim</a>
      </nav>

      <div class="header-actions">
        <a href="#ucretsiz-danismanlik" class="btn btn-primary btn-sm">
          ${renderIcon('mail', 16)} Ücretsiz Danışmanlık Al
        </a>
      </div>
    </div>
  </header>`;
}

// Breadcrumb Çubuğu
function renderBreadcrumbBar(routePath, breadcrumbs) {
  if (!breadcrumbs || breadcrumbs.length <= 1) return '';
  const rootPrefix = getRootPrefix(routePath);
  return `
  <nav class="breadcrumb-bar" aria-label="Sayfa Konumu (Breadcrumb)">
    <div class="container">
      <ol class="breadcrumb-list">
        ${breadcrumbs
          .map((b, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            if (isLast) {
              return `<li class="breadcrumb-current" aria-current="page">${b.label}</li>`;
            }
            return `<li><a href="${pageHref(rootPrefix, b.route)}">${b.label}</a> <span>/</span></li>`;
          })
          .join('')}
      </ol>
    </div>
  </nav>`;
}

// Sağ Hero / Sayfa İçi Hızlı Ücretsiz Danışmanlık & Destek Formu Kartı
function renderConsultationCard({ prefillSector = '', prefillService = '', cardTitle = 'Ücretsiz Dijital Danışmanlık & Fiyat Teklifi Alın' } = {}) {
  return `
  <aside class="consultation-card" id="ucretsiz-danismanlik" aria-label="Ücretsiz Danışmanlık Talep Formu">
    <div class="consultation-card-header">
      <span class="consultation-tag">✓ %100 Ücretsiz Ön Analiz &amp; Strateji</span>
      <h2>${cardTitle}</h2>
      <p>Formu doldurun veya doğrudan <strong>${CONTACT_EMAIL}</strong> adresimize mail gönderin; uzman ekibimiz işletmenize özel yol haritasını ücretsiz hazırlasın.</p>
    </div>

    <form class="quick-form" data-consult-form>
      <div class="form-group">
        <label for="cf-name">Adınız Soyadınız / Firma Adı *</label>
        <input type="text" id="cf-name" name="name" class="form-control" placeholder="Örn: Ahmet Yılmaz - Yılmaz İnşaat" required>
      </div>
      <div class="form-group">
        <label for="cf-phone">Telefon Numaranız veya E-Postanız *</label>
        <input type="text" id="cf-phone" name="phone" class="form-control" placeholder="Örn: 05XX XXX XX XX" required>
      </div>
      <div class="form-group">
        <label for="cf-sector">Faaliyet Gösterdiğiniz Sektör</label>
        <input type="text" id="cf-sector" name="sector" class="form-control" value="${prefillSector.replace(/"/g, '&quot;')}" placeholder="Örn: Diş Hekimi, Demir-Çelik, Emlak, Restoran...">
      </div>
      <div class="form-group">
        <label for="cf-service">İlgilendiğiniz Hizmet</label>
        <select id="cf-service" name="service" class="form-control">
          <option value="${prefillService || 'Genel Dijital Danışmanlık'}" selected>${prefillService || 'Hizmet Seçiniz (Tüm Hizmetler)'}</option>
          <option value="Kurumsal Web Sitesi & Web Tasarım">Kurumsal Web Sitesi &amp; Web Tasarım</option>
          <option value="Hazır Web Sitesi Paketi">Hazır Web Sitesi Paketi</option>
          <option value="E-Ticaret Sitesi Kurulumu">E-Ticaret Sitesi Kurulumu</option>
          <option value="SEO Hizmetleri (Google 1. Sıra)">SEO Hizmetleri (Google 1. Sıra)</option>
          <option value="Google Business (Harita) Danışmanlığı">Google Business (Harita) Danışmanlığı</option>
          <option value="Sosyal Medya & Reklam Yönetimi">Sosyal Medya &amp; Reklam Yönetimi</option>
          <option value="Yapay Zeka Danışmanlık & Otomasyon">Yapay Zeka Danışmanlık &amp; Otomasyon</option>
          <option value="Yapay Zeka Destekli Müşteri Temsilcisi">Yapay Zeka Destekli Müşteri Temsilcisi</option>
          <option value="Kurumsal Mail & Mobil Uygulama">Kurumsal Mail &amp; Mobil Uygulama</option>
        </select>
      </div>
      <div class="form-group">
        <label for="cf-message">Kısa Notunuz / Beklentiniz</label>
        <textarea id="cf-message" name="message" rows="2" class="form-control" placeholder="Mevcut web siteniz varsa adresini veya projenizle ilgili hedeflerinizi yazabilirsiniz..."></textarea>
      </div>
      <button type="submit" class="btn btn-primary btn-lg" style="width:100%;">
        ${renderIcon('mail', 18)} Ücretsiz Danışmanlık Maili Gönder
      </button>
      <div data-form-feedback style="display:none; font-size:0.84rem; background:var(--aliaga-green-soft); color:var(--aliaga-charcoal); padding:0.65rem; border-radius:8px; margin-top:0.35rem;"></div>
    </form>

    <div class="form-direct-mail">
      <span>Doğrudan Mail: <a href="mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Ücretsiz Danışmanlık Talebi - ${prefillSector || ''} ${prefillService || ''}`)}" style="font-weight:800;">${CONTACT_EMAIL}</a></span>
      <button type="button" class="copy-mail-btn" data-copy-email="${CONTACT_EMAIL}">Adresi Kopyala</button>
    </div>
  </aside>`;
}

// Ortak Dönüşüm CTA Banner + Footer + Sticky Bar
function renderFooter(routePath, contextTitle = 'Ücretsiz Dijital Danışmanlık') {
  const rootPrefix = getRootPrefix(routePath);
  const mailSubject = encodeURIComponent(`[Ücretsiz Danışmanlık] ${contextTitle}`);

  return `
  <section class="section">
    <div class="container">
      <div class="cta-banner">
        <div class="cta-banner-grid">
          <div>
            <span class="topbar-badge" style="margin-bottom:0.85rem; display:inline-block;">Ücretsiz Proje &amp; SEO Check-Up</span>
            <h2>İşletmenizi Dijitalde Büyütmek İçin İlk Adımı Ücretsiz Atın!</h2>
            <p>İster yeni bir web sitesi veya e-ticaret mağazası kurun, ister mevcut sitenizi Google’da 1. sıraya taşımak ve yapay zeka otomasyonlarıyla tanışmak isteyin; uzman ekibimizden <strong>hiçbir ücret ödemeden</strong> ön analiz ve strateji raporu alabilirsiniz.</p>
            <div style="display:flex; flex-wrap:wrap; gap:0.85rem;">
              <a href="mailto:${CONTACT_EMAIL}?subject=${mailSubject}" class="btn btn-primary btn-lg">
                ${renderIcon('mail', 18)} Hemen Mail Gönderin (Ücretsiz Danışmanlık)
              </a>
              <a href="${pageHref(rootPrefix, 'iletisim')}" class="btn btn-secondary btn-lg">
                Destek &amp; Teklif Formu
              </a>
            </div>
          </div>
          <div class="cta-mail-box">
            <span style="font-size:0.82rem; text-transform:uppercase; letter-spacing:0.06em; color:#CBD5E1; font-weight:700;">Resmi İletişim &amp; Destek E-Posta</span>
            <a href="mailto:${CONTACT_EMAIL}?subject=${mailSubject}" class="cta-mail-address">${CONTACT_EMAIL}</a>
            <p style="font-size:0.85rem; color:#E2E8F0; margin-bottom:1rem;">7/24 gönderilen tüm destek ve danışmanlık taleplerine aynı gün içinde uzman analiz raporuyla dönüş sağlıyoruz.</p>
            <button type="button" class="btn btn-success btn-sm" data-copy-email="${CONTACT_EMAIL}" style="width:100%;">
              E-Posta Adresini Kopyala
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <a href="${pageHref(rootPrefix, '')}" class="brand-logo" style="margin-bottom:1rem;">
            <img src="${rootPrefix}assets/img/aliaga-logo.png" alt="Aliağa Yazılım" class="brand-logo-img" width="110" height="42" loading="lazy" style="background:#fff; padding:4px 8px; border-radius:8px;">
            <div class="brand-logo-text">
              <span class="brand-logo-title" style="color:#FFFFFF;">Aliağa Yazılım</span>
              <span class="brand-logo-sub" style="color:#94A3B8;">aliagayazilim.com</span>
            </div>
          </a>
          <p style="margin-bottom:1rem;">Aliağa, İzmir ve tüm Türkiye genelinde Core Web Vitals standartlarında Web Tasarım, SEO, E-Ticaret, Google Business, Kurumsal Mail, Mobil Uygulama ve Yapay Zeka Otomasyon çözümleri üretiyoruz.</p>
          <p><strong style="color:#fff;">Ücretsiz Danışmanlık &amp; İletişim:</strong><br>
          <a href="mailto:${CONTACT_EMAIL}" style="color:var(--aliaga-magenta); font-weight:800; font-size:1.02rem;">${CONTACT_EMAIL}</a></p>
        </div>

        <div class="footer-col">
          <h4>Kurumsal Hizmetlerimiz</h4>
          <ul class="footer-links">
            <li><a href="${pageHref(rootPrefix, 'web-tasarim')}">Web Tasarım Hizmetleri</a></li>
            <li><a href="${pageHref(rootPrefix, 'web-sitesi')}">Kurumsal Web Sitesi</a></li>
            <li><a href="${pageHref(rootPrefix, 'seo-hizmetleri')}">Profesyonel SEO Hizmetleri</a></li>
            <li><a href="${pageHref(rootPrefix, 'google-bussiness')}">Google Business Danışmanlık</a></li>
            <li><a href="${pageHref(rootPrefix, 'e-ticaret')}">E-Ticaret Sitesi Kurulumu</a></li>
            <li><a href="${pageHref(rootPrefix, 'mail-hizmetleri')}">Kurumsal Mail Hizmetleri</a></li>
            <li><a href="${pageHref(rootPrefix, 'mobil-uygulama')}">Mobil Uygulama Geliştirme</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Yapay Zeka &amp; Otomasyon</h4>
          <ul class="footer-links">
            <li><a href="${pageHref(rootPrefix, 'yapay-zeka-danismanlik')}">Yapay Zeka Danışmanlık</a></li>
            <li><a href="${pageHref(rootPrefix, 'yapay-zeka-destekli-otomasyon-hizmetleri')}">Yapay Zeka Destekli Otomasyon</a></li>
            <li><a href="${pageHref(rootPrefix, 'yapay-zeka-destekli-musteri-temsilcisi')}">AI Müşteri Temsilcisi (7/24 Bot)</a></li>
            <li><a href="${pageHref(rootPrefix, 'kurumsal-yapay-zeka-donusum-hizmetleri')}">Kurumsal Yapay Zeka Dönüşümü</a></li>
            <li><a href="${pageHref(rootPrefix, 'sektorler')}">Tüm Sektörel Çözümler (53+)</a></li>
            <li><a href="${pageHref(rootPrefix, 'referanslar')}">Referanslarımız</a></li>
            <li><a href="${pageHref(rootPrefix, 'hakkimizda')}">Hakkımızda</a></li>
            <li><a href="${pageHref(rootPrefix, 'iletisim')}">İletişim &amp; Destek Talebi</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Popüler Sektörel Paketler</h4>
          <ul class="footer-links">
            <li><a href="${pageHref(rootPrefix, 'dis-hekimleri-web-sitesi')}">Diş Hekimleri Web Sitesi</a></li>
            <li><a href="${pageHref(rootPrefix, 'demir-celik-web-sitesi')}">Demir-Çelik Web Sitesi</a></li>
            <li><a href="${pageHref(rootPrefix, 'fabrika-web-sitesi')}">Fabrika Kurumsal Web Sitesi</a></li>
            <li><a href="${pageHref(rootPrefix, 'insaat-web-sitesi')}">İnşaat Firması Web Sitesi</a></li>
            <li><a href="${pageHref(rootPrefix, 'emlak-web-sitesi')}">Emlak &amp; Gayrimenkul Web Sitesi</a></li>
            <li><a href="${pageHref(rootPrefix, 'restorant-web-sitesi')}">Restoran QR Menü &amp; Sipariş</a></li>
            <li><a href="${pageHref(rootPrefix, 'nakliye-web-sitesi')}">Nakliye &amp; Lojistik Web Sitesi</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-sectors-cloud">
        <h5>53 Sektör İçin Özel Web Sitesi, Hazır Site, E-Ticaret, Google Business ve Sosyal Medya Çözümleri</h5>
        <div class="sector-tags-wrap">
          ${SECTORS.map(
            (s) => `<a href="${pageHref(rootPrefix, `${s.slug}-web-sitesi`)}" title="${s.title} Web Sitesi">${s.shortTitle}</a>`
          ).join('')}
        </div>
      </div>

      <div class="footer-bottom">
        <div>&copy; ${new Date().getFullYear()} <strong>Aliağa Yazılım</strong> (<a href="${DOMAIN}" style="color:#fff;">aliagayazilim.com</a>). Tüm hakları saklıdır.</div>
        <div>İletişim &amp; Ücretsiz Danışmanlık: <a href="mailto:${CONTACT_EMAIL}" style="color:#fff; font-weight:700;">${CONTACT_EMAIL}</a> | <a href="${rootPrefix}sitemap.xml" style="color:#94A3B8;">Sitemap (XML)</a></div>
      </div>
    </div>
  </footer>

  <!-- Sabit (Sticky) Ücretsiz Danışmanlık Motivasyon Barı -->
  <div class="sticky-consult-bar" role="region" aria-label="Hızlı Ücretsiz Danışmanlık Çubuğu">
    <div class="container sticky-consult-inner">
      <div class="sticky-consult-text">
        <span class="topbar-badge" style="background:var(--aliaga-magenta);">ÜCRETSİZ DANIŞMANLIK</span>
        <span><strong>Projeniz veya işletmeniz için ücretsiz analiz ister misiniz?</strong> <span class="hide-sm">Hemen mail gönderin, uzman ekibimiz yanıtlasın:</span></span>
      </div>
      <div class="sticky-consult-actions">
        <a href="mailto:${CONTACT_EMAIL}?subject=${mailSubject}" class="btn btn-primary btn-sm">
          ${renderIcon('mail', 15)} ${CONTACT_EMAIL}
        </a>
        <a href="#ucretsiz-danismanlik" class="btn btn-secondary btn-sm hide-sm">Hızlı Form</a>
      </div>
    </div>
  </div>

  <script src="${rootPrefix}assets/js/main.js" defer></script>
</body>
</html>`;
}

// 53 Sektör Kartları Listesi Bileşeni (Ana Sayfa ve /sektorler Sayfası İçin)
function renderSectorsDirectory(routePath) {
  const rootPrefix = getRootPrefix(routePath);
  const categories = [...new Set(SECTORS.map((s) => s.category))];

  return `
  <div class="sector-filter-bar">
    <input type="search" class="sector-search-input" data-sector-search placeholder="Sektörünüzü arayın (Örn: diş hekimi, demir-çelik, inşaat, emlak, restoran, nakliye, vinç...)" aria-label="Sektör Ara">
    <div class="sector-category-btns">
      <button type="button" class="cat-filter-btn active" data-sector-cat="all">Tümü (${SECTORS.length})</button>
      ${categories.map((cat) => `<button type="button" class="cat-filter-btn" data-sector-cat="${cat}">${cat}</button>`).join('')}
    </div>
    <span data-sector-count style="font-size:0.82rem; font-weight:700; color:var(--text-muted);">${SECTORS.length} sektör gösteriliyor</span>
  </div>

  <div class="sectors-directory-grid">
    ${SECTORS.map(
      (s) => `
      <article class="sector-dir-card" data-sector-card data-category="${s.category}" data-keywords="${s.rawName} ${s.shortTitle} ${s.title} ${s.keywords.join(' ')}">
        <div class="sector-dir-header">
          <h3><a href="${pageHref(rootPrefix, `${s.slug}-web-sitesi`)}">${s.shortTitle}</a></h3>
          <span class="sector-cat-tag">${s.category}</span>
        </div>
        <p style="font-size:0.83rem; color:var(--text-muted); margin-bottom:0.8rem;">${s.title} için SEO uyumlu dijital paketler:</p>
        <div class="sector-links-list">
          <a href="${pageHref(rootPrefix, `${s.slug}-web-sitesi`)}">
            <span>• ${s.shortTitle} Web Sitesi</span> <span>→</span>
          </a>
          <a href="${pageHref(rootPrefix, `${s.slug}/hazir-web-sitesi`)}">
            <span>• ${s.shortTitle} Hazır Web Sitesi</span> <span>→</span>
          </a>
          <a href="${pageHref(rootPrefix, `${s.slug}-e-ticaret-kurulumu`)}">
            <span>• ${s.shortTitle} E-Ticaret Kurulumu</span> <span>→</span>
          </a>
          <a href="${pageHref(rootPrefix, `${s.slug}-google-bussiness-danismanlik`)}">
            <span>• ${s.shortTitle} Google Business</span> <span>→</span>
          </a>
          <a href="${pageHref(rootPrefix, `${s.slug}-sosyal-medya-yonetimi`)}">
            <span>• ${s.shortTitle} Sosyal Medya Yönetimi</span> <span>→</span>
          </a>
        </div>
      </article>`
    ).join('')}
  </div>`;
}

// 1. ANA SAYFA ÜRETİMİ (index.html)
function buildHomePage() {
  const routePath = '';
  const rootPrefix = getRootPrefix(routePath);
  const title = 'Aliağa Yazılım | Web Tasarım, SEO, E-Ticaret, Yapay Zeka & Otomasyon';
  const description = 'Aliağa Yazılım (aliagayazilim.com); Web Tasarım, Web Sitesi, SEO Hizmetleri, Google Business, Kurumsal Mail, E-Ticaret, Mobil Uygulama ve Yapay Zeka Otomasyon çözümleri sunar. Ücretsiz danışmanlık: contact@aliagayazilim.com';

  const faqs = [
    {
      q: 'Aliağa Yazılım hangi alanlarda hizmet veriyor?',
      a: 'Web Tasarım, Kurumsal Web Sitesi, Hazır Web Sitesi, SEO Hizmetleri, Google Business (Harita) Danışmanlığı, Kurumsal Mail Hizmetleri, E-Ticaret Kurulumu, Mobil Uygulama Geliştirme, Yapay Zeka Danışmanlığı, AI Destekli Otomasyon ve AI Müşteri Temsilcisi alanlarında uçtan uca hizmet veriyoruz.'
    },
    {
      q: 'Ücretsiz dijital danışmanlık ve site analizi nasıl alabilirim?',
      a: 'Sayfalarımızdaki hızlı danışmanlık formunu doldurarak veya doğrudan contact@aliagayazilim.com adresimize e-posta göndererek işletmeniz için tamamen ücretsiz SEO, web tasarım veya yapay zeka dönüşüm analizi talep edebilirsiniz.'
    },
    {
      q: 'Geliştirdiğiniz web siteleri Google SEO ve Core Web Vitals kurallarına uyumlu mu?',
      a: 'Evet! Tüm web sitelerimiz Google Core Web Vitals (LCP, INP, CLS) metriklerinde 95-100 puan alacak şekilde temiz kod mimarisi, Schema.org JSON-LD yapısal verileri, OpenGraph sosyal medya etiketleri ve %100 mobil uyumlulukla kodlanmaktadır.'
    },
    {
      q: 'Sadece Aliağa’daki firmalara mı hizmet veriyorsunuz?',
      a: 'Aliağa ve İzmir merkezli mühendislik yaklaşımımızla hem bölgemizdeki sanayi, ticaret ve hizmet işletmelerine hem de Türkiye’nin 81 ilindeki ve yurt dışındaki kurumsal müşterilerimize hizmet sunuyoruz.'
    }
  ];

  const html = `${renderHead({
    routePath,
    title,
    description,
    keywords: ['aliağa yazılım', 'aliağa web tasarım', 'aliağa seo hizmetleri', 'google bussiness danışmanlık', 'e-ticaret kurulumu', 'yapay zeka danışmanlık', 'otomasyon hizmetleri'],
    breadcrumbs: [{ label: 'Ana Sayfa', route: '' }],
    faqs
  })}
<body>
  ${renderHeader(routePath)}

  <main id="main-content">
    <section class="hero-section">
      <div class="container hero-grid">
        <div>
          <div class="hero-badge-row">
            <span class="hero-badge-dot">ALİAĞA YAZILIM</span>
            <span class="hero-badge-text">Web • SEO • E-Ticaret • Yapay Zeka &amp; Otomasyon</span>
          </div>
          <h1 class="hero-title">
            İşletmenizi Geleceğe Taşıyan <span class="highlight-magenta">Web Tasarım</span>, <span class="highlight-blue">SEO</span> ve <span class="highlight-green">Yapay Zeka</span> Çözümleri
          </h1>
          <p class="hero-subtitle">
            <strong>aliagayazilim.com</strong> olarak 53+ sektöre özel Core Web Vitals uyumlu web siteleri, komisyonsuz e-ticaret sistemleri, Google 1. sıra SEO stratejileri ve 7/24 çalışan yapay zeka otomasyonları kuruyoruz. Hemen <strong>${CONTACT_EMAIL}</strong> üzerinden ücretsiz danışmanlık alın!
          </p>
          <div class="hero-cta-group">
            <a href="mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Ücretsiz Dijital Danışmanlık Talebi - aliagayazilim.com')}" class="btn btn-primary btn-lg">
              ${renderIcon('mail', 20)} Ücretsiz Danışmanlık Alın
            </a>
            <a href="#referanslarimiz" class="btn btn-outline btn-lg">
              Referanslarımızı İncele
            </a>
          </div>
          <div class="hero-trust-strip">
            <div class="trust-item">
              <span class="trust-icon">✓</span>
              <div class="trust-text">
                <strong>100/100 Core Web Vitals</strong>
                <span>Işık hızında açılan SEO mimarisi</span>
              </div>
            </div>
            <div class="trust-item">
              <span class="trust-icon">✓</span>
              <div class="trust-text">
                <strong>53 Sektör × 5 Özel Paket</strong>
                <span>Sektörünüze terzi işi modüller</span>
              </div>
            </div>
            <div class="trust-item">
              <span class="trust-icon">✓</span>
              <div class="trust-text">
                <strong>Ücretsiz Ön Analiz</strong>
                <span>contact@aliagayazilim.com</span>
              </div>
            </div>
          </div>
        </div>

        ${renderConsultationCard({
          cardTitle: 'Ücretsiz Dijital Check-Up & Fiyat Teklifi Alın'
        })}
      </div>
    </section>

    <!-- Başarı Metrikleri -->
    <section class="section">
      <div class="container">
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-value">275+</div>
            <div class="metric-label">Sektörel Dijital Çözüm Paketi</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">&lt; 0.7 sn</div>
            <div class="metric-label">Ortalama Sayfa Açılış Hızı (LCP)</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">%100</div>
            <div class="metric-label">Mobil, Tablet &amp; Masaüstü Uyum</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">7/24</div>
            <div class="metric-label">Yapay Zeka &amp; Otomasyon Desteği</div>
          </div>
        </div>

        <div class="section-header">
          <span class="section-eyebrow">360° Dijital Teknoloji Ajansı</span>
          <h2 class="section-title">Web Tasarımdan Yapay Zekaya Tüm Dijital İhtiyaçlarınız Tek Merkezde</h2>
          <p class="section-desc">Aliağa’nın üretim ve ticaret gücünü modern yazılım mühendisliğiyle buluşturuyoruz. Her hizmetimiz doğrudan satış ve müşteri talebi (lead) üretmek üzere tasarlanmıştır.</p>
        </div>

        <div class="cards-grid-3">
          ${CORE_SERVICES.map(
            (srv) => `
            <article class="feature-card">
              <div>
                <div class="feature-icon-wrap">${renderIcon(srv.category.includes('Yapay') ? 'cpu' : 'globe', 24)}</div>
                <span style="font-size:0.75rem; font-weight:800; color:var(--aliaga-magenta); text-transform:uppercase;">${srv.badge}</span>
                <h3 style="margin-top:0.25rem;"><a href="${pageHref(rootPrefix, srv.slug)}" style="color:inherit;">${srv.shortTitle}</a></h3>
                <p>${srv.heroSubtitle}</p>
              </div>
              <a href="${pageHref(rootPrefix, srv.slug)}" class="feature-card-link">
                Hizmet Detayları &amp; Ücretsiz Danışmanlık →
              </a>
            </article>`
          ).join('')}
        </div>
      </div>
    </section>

    <!-- Referanslarımız Bölümü -->
    <section class="section section-soft" id="referanslarimiz">
      <div class="container">
        <div class="section-header">
          <span class="section-eyebrow">Mutlu Müşteriler &amp; Canlı Projeler</span>
          <h2 class="section-title">Referanslarımız ve Başarı Hikayelerimiz</h2>
          <p class="section-desc">Farklı sektörlerde dijital dönüşümünü, kurumsal web tasarımını, SEO ve otomasyon altyapısını başarıyla hayata geçirdiğimiz seçkin referans projelerimiz:</p>
        </div>

        ${renderReferencesCards(routePath)}

        <div style="text-align:center; margin-top:2.25rem; display:flex; justify-content:center; gap:1rem; flex-wrap:wrap;">
          <a href="${pageHref(rootPrefix, 'referanslar')}" class="btn btn-secondary">
            Tüm Referans Detaylarını Gör →
          </a>
          <a href="mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Referanslarınız Gibi Yeni Proje Talebi (Ücretsiz Danışmanlık)')}" class="btn btn-primary">
            ${renderIcon('mail', 18)} İşletmeniz İçin Ücretsiz Danışmanlık Alın
          </a>
        </div>
      </div>
    </section>

    <!-- Yapay Zeka & Otomasyon Özel Vitrini -->
    <section class="section section-dark">
      <div class="container">
        <div class="section-header">
          <span class="section-eyebrow" style="background:rgba(0,143,213,0.2); color:#38BDF8;">Yapay Zeka Dönüşüm Merkezi</span>
          <h2 class="section-title">Şirketinizi Yapay Zeka ve Otomasyonla 10 Kat Hızlandırın</h2>
          <p class="section-desc" style="color:#CBD5E1;">Tekrarlayan operasyonları otonom iş akışlarına devredin, müşterilerinize 7/24 anında yanıt verin ve kurumsal verilerinizi kazanca dönüştürün.</p>
        </div>

        <div class="cards-grid-2">
          <div class="feature-card" style="background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.12); color:#fff;">
            <div>
              <span class="topbar-badge" style="background:var(--aliaga-magenta); margin-bottom:0.75rem; display:inline-block;">AI Strateji &amp; LLM</span>
              <h3><a href="${pageHref(rootPrefix, 'yapay-zeka-danismanlik')}" style="color:#fff;">Yapay Zeka Danışmanlık Hizmetleri</a></h3>
              <p style="color:#CBD5E1;">Şirketinizin departmanlarını analiz ediyor, verilerinizi dışarı sızdırmayan özel bilgi bankaları (RAG) ve yüksek geri dönüşlü AI projeleri kurguluyoruz.</p>
            </div>
            <a href="${pageHref(rootPrefix, 'yapay-zeka-danismanlik')}" class="feature-card-link" style="color:#38BDF8;">Yapay Zeka Danışmanlığı İncele →</a>
          </div>

          <div class="feature-card" style="background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.12); color:#fff;">
            <div>
              <span class="topbar-badge" style="background:var(--aliaga-blue); margin-bottom:0.75rem; display:inline-block;">Sıfır Manuel İş Yükü</span>
              <h3><a href="${pageHref(rootPrefix, 'yapay-zeka-destekli-otomasyon-hizmetleri')}" style="color:#fff;">Yapay Zeka Destekli Otomasyon Hizmetleri</a></h3>
              <p style="color:#CBD5E1;">E-posta, teklif hazırlama, fatura okuma, CRM/ERP veri girişi ve raporlama süreçlerinizi 7/24 hatasız çalışan otonom iş akışlarına dönüştürüyoruz.</p>
            </div>
            <a href="${pageHref(rootPrefix, 'yapay-zeka-destekli-otomasyon-hizmetleri')}" class="feature-card-link" style="color:#38BDF8;">Otomasyon Çözümlerini İncele →</a>
          </div>

          <div class="feature-card" style="background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.12); color:#fff;">
            <div>
              <span class="topbar-badge" style="background:var(--aliaga-green); margin-bottom:0.75rem; display:inline-block;">7/24 Satış &amp; Randevu</span>
              <h3><a href="${pageHref(rootPrefix, 'yapay-zeka-destekli-musteri-temsilcisi')}" style="color:#fff;">Yapay Zeka Destekli Müşteri Temsilcisi</a></h3>
              <p style="color:#CBD5E1;">Web sitenizde, WhatsApp ve Instagram’da müşterilerinizi 3 saniyede karşılayan, randevu alan ve 50+ dilde satış yapan akıllı AI temsilci.</p>
            </div>
            <a href="${pageHref(rootPrefix, 'yapay-zeka-destekli-musteri-temsilcisi')}" class="feature-card-link" style="color:#38BDF8;">AI Müşteri Temsilcisini İncele →</a>
          </div>

          <div class="feature-card" style="background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.12); color:#fff;">
            <div>
              <span class="topbar-badge" style="background:var(--aliaga-magenta); margin-bottom:0.75rem; display:inline-block;">Uçtan Uca Dönüşüm</span>
              <h3><a href="${pageHref(rootPrefix, 'kurumsal-yapay-zeka-donusum-hizmetleri')}" style="color:#fff;">Kurumsal Yapay Zeka Dönüşüm Hizmetleri</a></h3>
              <p style="color:#CBD5E1;">Üretimden finansa, İK’dan yönetime kadar tüm organizasyonunuzu AI-First mimariyle yeniden yapılandıran tam kapsamlı dönüşüm programı.</p>
            </div>
            <a href="${pageHref(rootPrefix, 'kurumsal-yapay-zeka-donusum-hizmetleri')}" class="feature-card-link" style="color:#38BDF8;">Kurumsal Dönüşüm Programını İncele →</a>
          </div>
        </div>
      </div>
    </section>

    <!-- 53 Sektör Fihristi -->
    <section class="section section-soft" id="sektorler-fihristi">
      <div class="container">
        <div class="section-header">
          <span class="section-eyebrow">53 Sektör × 5 Hizmet = 265 Özel Çözüm</span>
          <h2 class="section-title">Sektörünüze Özel Web Sitesi, E-Ticaret, Google Business ve Sosyal Medya Paketleri</h2>
          <p class="section-desc">Her sektörün müşteri kitlesi ve arama alışkanlığı farklıdır. Aşağıdan kendi sektörünüzü seçerek size özel hazırladığımız dijital çözümleri inceleyin ve ücretsiz danışmanlık alın.</p>
        </div>

        ${renderSectorsDirectory(routePath)}
      </div>
    </section>

    <!-- Sıkça Sorulan Sorular -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <span class="section-eyebrow">Merak Edilenler</span>
          <h2 class="section-title">Sıkça Sorulan Sorular</h2>
          <p class="section-desc">Aklınıza takılan diğer tüm sorular için <a href="mailto:${CONTACT_EMAIL}"><strong>${CONTACT_EMAIL}</strong></a> adresimize 7/24 yazabilirsiniz.</p>
        </div>
        <div class="faq-list">
          ${faqs
            .map(
              (f, i) => `
            <details class="faq-item" ${i === 0 ? 'open' : ''}>
              <summary>${f.q} <span>+</span></summary>
              <div class="faq-answer">${f.a}</div>
            </details>`
            )
            .join('')}
        </div>
      </div>
    </section>
  </main>

  ${renderFooter(routePath, 'Ana Sayfa Dijital Dönüşüm Talebi')}
`;

  return writePage(routePath, html);
}

// 2. ANA HİZMET & YAPAY ZEKA SAYFALARI ÜRETİMİ
function buildCoreServicePage(srv) {
  const routePath = srv.slug;
  const rootPrefix = getRootPrefix(routePath);
  const title = `${srv.title} | Aliağa Yazılım`;
  const description = srv.metaDescription;

  const breadcrumbs = [
    { label: 'Ana Sayfa', route: '' },
    { label: srv.shortTitle, route: srv.slug }
  ];

  const html = `${renderHead({
    routePath,
    title,
    description,
    keywords: srv.keywords,
    breadcrumbs,
    faqs: srv.faqs,
    serviceType: srv.title
  })}
<body>
  ${renderHeader(routePath)}
  ${renderBreadcrumbBar(routePath, breadcrumbs)}

  <main id="main-content">
    <section class="hero-section">
      <div class="container hero-grid">
        <div>
          <div class="hero-badge-row">
            <span class="hero-badge-dot">${srv.category}</span>
            <span class="hero-badge-text">${srv.badge}</span>
          </div>
          <h1 class="hero-title">${srv.title}</h1>
          <p class="hero-subtitle">${srv.heroSubtitle}</p>
          <div class="hero-cta-group">
            <a href="mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Ücretsiz Danışmanlık Talebi: ${srv.shortTitle}`)}" class="btn btn-primary btn-lg">
              ${renderIcon('mail', 18)} Ücretsiz ${srv.shortTitle} Analizi Alın
            </a>
            <a href="#hizmet-kapsami" class="btn btn-outline btn-lg">Kapsamı İncele</a>
          </div>
          <div class="hero-trust-strip">
            <div class="trust-item">
              <span class="trust-icon">✓</span>
              <div class="trust-text">
                <strong>Ücretsiz Ön Değerlendirme</strong>
                <span>${CONTACT_EMAIL}</span>
              </div>
            </div>
            <div class="trust-item">
              <span class="trust-icon">✓</span>
              <div class="trust-text">
                <strong>Ölçülebilir Sonuçlar</strong>
                <span>Veri ve ROI odaklı mühendislik</span>
              </div>
            </div>
            <div class="trust-item">
              <span class="trust-icon">✓</span>
              <div class="trust-text">
                <strong>Anahtar Teslim Süreç</strong>
                <span>7/24 uzman teknik destek</span>
              </div>
            </div>
          </div>
        </div>

        ${renderConsultationCard({
          prefillService: srv.shortTitle,
          cardTitle: `${srv.shortTitle} İçin Ücretsiz Danışmanlık Alın`
        })}
      </div>
    </section>

    <section class="section" id="hizmet-kapsami">
      <div class="container">
        <div class="metrics-grid">
          ${srv.highlights
            .map(
              (h) => `
            <div class="metric-card">
              <div class="metric-value">${h.metric}</div>
              <div class="metric-label">${h.label}</div>
            </div>`
            )
            .join('')}
        </div>

        <div class="section-header">
          <span class="section-eyebrow">Problemin Tespiti &amp; Çözüm Mimarimiz</span>
          <h2 class="section-title">${srv.problemTitle}</h2>
          <p class="section-desc">${srv.problemText}</p>
        </div>

        <div class="cards-grid-3">
          ${srv.features
            .map(
              (f) => `
            <article class="feature-card">
              <div>
                <div class="feature-icon-wrap">${renderIcon('check', 22)}</div>
                <h3>${f.title}</h3>
                <p>${f.desc}</p>
              </div>
              <a href="mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`${srv.shortTitle} - ${f.title} Hakkında Bilgi`)}" class="feature-card-link">
                Bu Modül İçin Ücretsiz Bilgi Al →
              </a>
            </article>`
            )
            .join('')}
        </div>
      </div>
    </section>

    <section class="section section-soft">
      <div class="container">
        <div class="section-header">
          <span class="section-eyebrow">Adım Adım Uygulama</span>
          <h2 class="section-title">Nasıl Çalışıyoruz?</h2>
          <p class="section-desc">İlk ücretsiz analizden canlıya geçiş ve sürekli büyümeye kadar şeffaf, planlı ve ölçülebilir 4 adımlı çalışma metodolojimiz:</p>
        </div>

        <div class="process-grid">
          ${srv.processSteps
            .map(
              (p) => `
            <div class="process-step">
              <span class="step-number">${p.step}</span>
              <h3>${p.title}</h3>
              <p>${p.desc}</p>
            </div>`
            )
            .join('')}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header">
          <span class="section-eyebrow">Sıkça Sorulan Sorular</span>
          <h2 class="section-title">${srv.shortTitle} Hakkında Merak Edilenler</h2>
        </div>
        <div class="faq-list">
          ${srv.faqs
            .map(
              (f, i) => `
            <details class="faq-item" ${i === 0 ? 'open' : ''}>
              <summary>${f.q} <span>+</span></summary>
              <div class="faq-answer">${f.a}</div>
            </details>`
            )
            .join('')}
        </div>
      </div>
    </section>
  </main>

  ${renderFooter(routePath, srv.title)}
`;

  return writePage(routePath, html);
}

// 3. 53 SEKTÖR × 5 HİZMET SAYFALARI ÜRETİMİ (265 Sayfa)
function buildSectorServicePage(sector, serviceType, sectorIndex) {
  const routePath = serviceType.urlPattern(sector.slug);
  const rootPrefix = getRootPrefix(routePath);

  // Her hizmet tipine göre benzersiz başlık, açıklama ve sektörel içerik üretimi
  let pageTitle = '';
  let heroHeading = '';
  let heroLead = '';
  let metaDesc = '';
  let specificDeliverables = [];
  let whyNeedText = '';
  let faqs = [];

  if (serviceType.key === 'web-sitesi') {
    pageTitle = `${sector.shortTitle} Web Sitesi Tasarımı & Kurumsal Çözümler | Aliağa Yazılım`;
    heroHeading = `${sector.title} İçin <span class="highlight-magenta">Profesyonel Web Sitesi</span>`;
    heroLead = `${sector.audience} kitlesine dijitalde güven verin. ${sector.shortTitle} sektörüne özel modüllerle donatılmış, %100 mobil uyumlu, Core Web Vitals (100/100) standartlarında ve Google SEO odaklı kurumsal web sitesi.`;
    metaDesc = `${sector.shortTitle} web sitesi tasarımı ve kurulumu. ${sector.title} için mobil uyumlu, SEO odaklı profesyonel web sitesi. Ücretsiz danışmanlık: contact@aliagayazilim.com`;
    specificDeliverables = sector.webFeatures;
    whyNeedText = `${sector.painPoints} Aliağa Yazılım olarak ${sector.rawName} alanında faaliyet gösteren işletmeniz için sadece görsel bir vitrin değil, 7/24 yeni müşteri talebi ve telefon/e-posta üreten güçlü bir dijital şube kuruyoruz.`;
    faqs = [
      {
        q: `${sector.shortTitle} web sitesi kurulumu ne kadar sürer?`,
        a: `${sector.title} için geliştirdiğimiz kurumsal web sitelerini içerik ve modül kapsamına göre 5 ila 10 iş günü içerisinde tüm SEO ve hız optimizasyonları tamamlanmış olarak yayına alıyoruz.`
      },
      {
        q: `${sector.shortTitle} sitemiz Google aramalarında üst sırada çıkar mı?`,
        a: `Evet. Sitenizi "${sector.keywords.join(', ')}" gibi sektörel anahtar kelimelere uyumlu Schema.org yapısal verileri, semantik başlık hiyerarşisi ve 100/100 hız skoruyla kodluyoruz.`
      },
      {
        q: `Ücretsiz ${sector.rawName} web sitesi danışmanlığı nasıl alabiliriz?`,
        a: `Bu sayfadaki formu doldurarak veya doğrudan ${CONTACT_EMAIL} adresimize e-posta göndererek işletmenize özel ücretsiz demo ve fiyat teklifi alabilirsiniz.`
      }
    ];
  } else if (serviceType.key === 'hazir-web-sitesi') {
    pageTitle = `${sector.shortTitle} Hazır Web Sitesi Paketleri (Hızlı Kurulum) | Aliağa Yazılım`;
    heroHeading = `${sector.title} İçin <span class="highlight-blue">Hazır Web Sitesi</span> Paketleri`;
    heroLead = `Zaman kaybetmeden hemen yayına geçin! ${sector.shortTitle} sektörünün tüm ihtiyaçları düşünülerek önceden optimize edilmiş, ekonomik, ultra hızlı ve %100 SEO uyumlu anahtar teslim hazır web sitesi.`;
    metaDesc = `${sector.shortTitle} hazır web sitesi paketleri ile 48 saatte yayına geçin. ${sector.title} için mobil uyumlu, ekonomik ve SEO destekli hazır site. Ücretsiz bilgi: contact@aliagayazilim.com`;
    specificDeliverables = [
      ...sector.webFeatures,
      '48-72 Saat İçinde Hızlı Anahtar Teslim Kurulum',
      'Alan Adı (Domain), SSL Güvenlik Sertifikası ve Yüksek Hızlı Hosting Dahil'
    ];
    whyNeedText = `Yüksek ajans maliyetleri ve aylarca süren tasarım süreçleri beklemeden ${sector.rawName} işletmenizi dijitale taşımak istiyorsanız hazır web sitesi paketimiz tam size göredir. Logonuz, kurumsal renkleriniz ve hizmet bilgilerinizle kişiselleştirilerek hemen müşteri toplamaya hazır hale getirilir.`;
    faqs = [
      {
        q: `${sector.shortTitle} hazır web sitesi ne kadar sürede açılır?`,
        a: `Logo, iletişim ve temel hizmet bilgilerinizi iletmenizin ardından 48 ila 72 saat içinde ${sector.rawName} hazır web siteniz kendi alan adınızla yayına açılır.`
      },
      {
        q: `Hazır web sitesinde kendi renklerimizi ve içeriklerimizi kullanabilir miyiz?`,
        a: `Kesinlikle! Hazır paketlerimiz kalitesiz kopya şablonlar değildir; ${sector.shortTitle} sektörüne özel modüler altyapımız firmanızın kurumsal kimliğine göre birebir uyarlanır.`
      },
      {
        q: `İleride e-ticaret veya ek modül eklenebilir mi?`,
        a: `Evet, esnek mimarimiz sayesinde istediğiniz zaman online ödeme, ek dil veya yapay zeka müşteri temsilcisi modüllerini sitenize entegre edebiliriz.`
      }
    ];
  } else if (serviceType.key === 'e-ticaret-kurulumu') {
    pageTitle = `${sector.shortTitle} E-Ticaret Sitesi Kurulumu & Online Satış | Aliağa Yazılım`;
    heroHeading = `${sector.title} İçin <span class="highlight-green">E-Ticaret ve Online Tahsilat</span> Kurulumu`;
    heroLead = `${sector.shortTitle} ürün ve hizmetlerinizi 7/24 kredi kartı ile komisyonsuz satın! Sanal POS, kargo, stok/rezervasyon ve fatura entegrasyonlu profesyonel ${sector.rawName} e-ticaret altyapısı.`;
    metaDesc = `${sector.shortTitle} e-ticaret kurulumu ile 7/24 online satış ve kredi kartı tahsilatı yapın. Sanal POS ve kargo entegrasyonlu ${sector.rawName} e-ticaret sitesi için ücretsiz danışmanlık.`;
    specificDeliverables = sector.ecommerceFeatures;
    whyNeedText = `${sector.audience} artık ürün, paket veya hizmet satın alırken güvenli online ödeme ve taksit imkanı arıyor. ${sector.shortTitle} e-ticaret kurulumumuz ile aracı platformlara yüksek komisyon ödemeden kendi markanızla Türkiye geneline ve bölgenize satış yapabilirsiniz.`;
    faqs = [
      {
        q: `${sector.shortTitle} e-ticaret sitesinde kredi kartına taksit yapılabilir mi?`,
        a: `Evet, Iyzico, PayTR ve tüm banka Sanal POS entegrasyonlarımızla müşterilerinize 12 aya varan taksit ve 3D Secure güvenli ödeme imkanı sunabilirsiniz.`
      },
      {
        q: `Satışlarımızdan komisyon alıyor musunuz?`,
        a: `Hayır! Kurduğumuz e-ticaret sitesi tamamen sizin mülkiyetinizdedir; yaptığınız hiçbir satıştan komisyon veya ciro payı alınmaz.`
      },
      {
        q: `${sector.shortTitle} e-ticaret paketleri için ücretsiz danışmanlık veriyor musunuz?`,
        a: `Evet, ${CONTACT_EMAIL} adresimize mail göndererek ürün/hizmet yapınıza en uygun e-ticaret ve sanal POS kurgusunu ücretsiz öğrenebilirsiniz.`
      }
    ];
  } else if (serviceType.key === 'google-bussiness-danismanlik') {
    pageTitle = `${sector.shortTitle} Google Business (Harita) Danışmanlığı & Yerel SEO | Aliağa Yazılım`;
    heroHeading = `${sector.title} İçin <span class="highlight-blue">Google Business &amp; Harita</span> Danışmanlığı`;
    heroLead = `Bölgenizde "${sector.rawName}" araması yapan müşterilerin karşısına Google Haritalar’da 1. sırada çıkın! Doğrulanmış işletme profili, 5 yıldızlı yorum stratejisi ve doğrudan telefon/yol tarifi artışı.`;
    metaDesc = `${sector.shortTitle} Google Business danışmanlık ve harita kaydı optimizasyonu. Bölgesel "${sector.rawName}" aramalarında üst sıraya çıkın. Ücretsiz harita analizi: contact@aliagayazilim.com`;
    specificDeliverables = sector.gbpFeatures;
    whyNeedText = `Potansiyel müşterileriniz acil veya yerel ${sector.rawName} ihtiyacı olduğunda ilk olarak Google Haritalar sonuçlarına bakar ve ilk 3 işletmeden birini arar. ${sector.shortTitle} Google Business danışmanlığımızla işletmenizi yerel aramalarda rakipsiz konuma taşıyoruz.`;
    faqs = [
      {
        q: `${sector.shortTitle} işletmemiz Google Haritalar’da ne kadar sürede yükselir?`,
        a: `Kategori, hizmet bölgesi, NAP (İsim-Adres-Telefon) tutarlılığı ve görsel optimizasyonların ardından genellikle ilk 3-6 hafta içinde harita görüntülenme ve telefon arama sayılarında belirgin artış başlar.`
      },
      {
        q: `Askıya alınan veya doğrulanamayan ${sector.rawName} harita kaydını açıyor musunuz?`,
        a: `Evet, Google politikalarına uygun kanıt dokümanları ve teknik başvuru süreciyle askıya alınan profillerin kurtarılması ve doğrulanması konusunda tam destek sağlıyoruz.`
      },
      {
        q: `Mevcut Google Business profilimizi ücretsiz analiz eder misiniz?`,
        a: `Elbette! ${CONTACT_EMAIL} adresimize işletme adınızı ve ilçenizi yazarak ücretsiz Harita Sıralama ve Rakip Analizi raporunuzu isteyebilirsiniz.`
      }
    ];
  } else {
    // sosyal-medya-yonetimi
    pageTitle = `${sector.shortTitle} Sosyal Medya ve Reklam Yönetimi | Aliağa Yazılım`;
    heroHeading = `${sector.title} İçin <span class="highlight-magenta">Sosyal Medya ve Reklam</span> Yönetimi`;
    heroLead = `Instagram, Facebook ve LinkedIn’de ${sector.shortTitle} markanızı büyütün! Profesyonel Reels kurgusu, kurumsal post tasarımları ve doğrudan müşteri getiren sponsorlu reklam yönetimi.`;
    metaDesc = `${sector.shortTitle} sosyal medya yönetimi, Reels içerik üretimi ve Meta/Google reklam danışmanlığı. ${sector.title} için müşteri kazandıran dijital pazarlama. Ücretsiz analiz alın.`;
    specificDeliverables = sector.socialFeatures;
    whyNeedText = `Sosyal medyada düzensiz veya amatör paylaşımlar yapmak ${sector.rawName} markanızın prestijini düşürür. Hedef kitleniz olan "${sector.audience}" grubunu yakalayan görsel tasarımlar, yüksek izlenmeli Reels videoları ve nokta atışı reklam hedeflemeleriyle takipçilerinizi gerçek müşteriye dönüştürüyoruz.`;
    faqs = [
      {
        q: `${sector.shortTitle} sosyal medya yönetiminde hangi platformlar kapsanıyor?`,
        a: `Sektörünüzün dinamiklerine göre Instagram, Facebook, LinkedIn, YouTube Shorts ve TikTok platformlarında içerik planlama, grafik tasarım, Reels kurgu ve reklam yönetimi sağlıyoruz.`
      },
      {
        q: `Sponsorlu reklam bütçesi nasıl belirlenir?`,
        a: `Hedeflediğiniz bölgeye (örneğin Aliağa, İzmir veya tüm Türkiye) ve aylık kazanmak istediğiniz müşteri/form sayısına göre en verimli reklam bütçesini ücretsiz ön analizde birlikte planlıyoruz.`
      },
      {
        q: `Sosyal medya hesaplarımız için ücretsiz inceleme yapıyor musunuz?`,
        a: `Evet, ${CONTACT_EMAIL} adresimize Instagram veya sosyal medya kullanıcı adınızı göndererek ücretsiz Profil Check-Up ve İçerik Stratejisi alabilirsiniz.`
      }
    ];
  }

  // Komşu sektörler (İç linkleme gücünü artırmak için)
  const prevSector = SECTORS[(sectorIndex - 1 + SECTORS.length) % SECTORS.length];
  const nextSector = SECTORS[(sectorIndex + 1) % SECTORS.length];

  const breadcrumbs = [
    { label: 'Ana Sayfa', route: '' },
    { label: 'Sektörler', route: 'sektorler' },
    { label: sector.shortTitle, route: sector.slug },
    { label: `${sector.shortTitle} ${serviceType.shortLabel}`, route: routePath }
  ];

  const html = `${renderHead({
    routePath,
    title: pageTitle,
    description: metaDesc,
    keywords: [...sector.keywords, `${sector.rawName} ${serviceType.shortLabel.toLocaleLowerCase('tr-TR')}`, `aliağa ${sector.rawName}`],
    breadcrumbs,
    faqs,
    serviceType: `${sector.shortTitle} ${serviceType.titleSuffix}`
  })}
<body>
  ${renderHeader(routePath)}
  ${renderBreadcrumbBar(routePath, breadcrumbs)}

  <main id="main-content">
    <section class="hero-section">
      <div class="container hero-grid">
        <div>
          <div class="hero-badge-row">
            <span class="hero-badge-dot">${sector.category}</span>
            <span class="hero-badge-text">${serviceType.badge}</span>
          </div>
          <h1 class="hero-title">${heroHeading}</h1>
          <p class="hero-subtitle">${heroLead}</p>
          <div class="hero-cta-group">
            <a href="mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Ücretsiz Danışmanlık: ${sector.shortTitle} - ${serviceType.shortLabel}`)}" class="btn btn-primary btn-lg">
              ${renderIcon('mail', 18)} Ücretsiz Danışmanlık &amp; Teklif Al
            </a>
            <a href="#sektorel-paketler" class="btn btn-outline btn-lg">
              ${sector.shortTitle} Paketlerini Gör
            </a>
          </div>
          <div class="hero-trust-strip">
            <div class="trust-item">
              <span class="trust-icon">✓</span>
              <div class="trust-text">
                <strong>${sector.shortTitle} Odaklı</strong>
                <span>Sektöre özel modül ve içerik</span>
              </div>
            </div>
            <div class="trust-item">
              <span class="trust-icon">✓</span>
              <div class="trust-text">
                <strong>%100 SEO &amp; Mobil Uyum</strong>
                <span>Core Web Vitals standartlarında</span>
              </div>
            </div>
            <div class="trust-item">
              <span class="trust-icon">✓</span>
              <div class="trust-text">
                <strong>Ücretsiz Ön Analiz</strong>
                <span>${CONTACT_EMAIL}</span>
              </div>
            </div>
          </div>
        </div>

        ${renderConsultationCard({
          prefillSector: sector.shortTitle,
          prefillService: `${sector.shortTitle} ${serviceType.shortLabel}`,
          cardTitle: `${sector.shortTitle} İçin Ücretsiz Danışmanlık Alın`
        })}
      </div>
    </section>

    <!-- Bu Sektörün 5 Hizmeti Arasında Hızlı Geçiş Sekmeleri -->
    <section class="section" id="sektorel-paketler">
      <div class="container">
        <div class="section-header" style="margin-bottom:1.75rem;">
          <span class="section-eyebrow">${sector.title} Dijital Ekosistemi</span>
          <h2 class="section-title">${sector.shortTitle} Sektörü İçin Tüm Dijital Çözümlerimiz</h2>
          <p class="section-desc">İşletmenizin ihtiyacına göre ${sector.rawName} sektörüne özel hazırladığımız 5 farklı uzmanlık paketimiz arasında geçiş yapabilirsiniz:</p>
        </div>

        <nav class="sector-services-bar" aria-label="${sector.shortTitle} Hizmet Paketleri">
          ${SECTOR_SERVICE_TYPES.map((st) => {
            const isCurrent = st.key === serviceType.key;
            const stRoute = st.urlPattern(sector.slug);
            return `
            <a href="${pageHref(rootPrefix, stRoute)}" class="sector-service-pill ${isCurrent ? 'active' : ''}" ${isCurrent ? 'aria-current="page"' : ''}>
              ${renderIcon(st.icon, 20)}
              <span>${sector.shortTitle} ${st.shortLabel}</span>
              <span class="pill-sub">${st.badge}</span>
            </a>`;
          }).join('')}
        </nav>

        <!-- Sektörel İhtiyaç Analizi ve Teslim Edilecek Özellikler -->
        <div class="cards-grid-2" style="align-items:stretch; margin-top:2rem;">
          <article class="feature-card" style="border-left:4px solid var(--aliaga-magenta);">
            <div>
              <span class="section-eyebrow" style="margin-bottom:0.6rem;">Sektörel Rekabet Analizi</span>
              <h3>Neden ${sector.shortTitle} İşletmeniz İçin Profesyonel ${serviceType.shortLabel} Şart?</h3>
              <p style="margin-top:0.75rem;">${whyNeedText}</p>
              <div style="background:var(--bg-soft); padding:1rem; border-radius:8px; margin-top:1rem; border:1px solid var(--border-color);">
                <strong style="color:var(--aliaga-charcoal); display:block; margin-bottom:0.35rem;">Hedeflenen Müşteri Kitlesi:</strong>
                <span style="font-size:0.9rem;">${sector.audience}</span>
              </div>
            </div>
            <div style="margin-top:1.25rem;">
              <a href="mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`${sector.shortTitle} ${serviceType.shortLabel} Ücretsiz Analiz Talebi`)}" class="btn btn-primary btn-sm">
                ${renderIcon('mail', 15)} İşletmem İçin Ücretsiz Analiz İste
              </a>
            </div>
          </article>

          <article class="feature-card" style="border-left:4px solid var(--aliaga-blue);">
            <div>
              <span class="section-eyebrow" style="background:var(--aliaga-blue-soft); color:var(--aliaga-blue); margin-bottom:0.6rem;">Paket Kapsamı &amp; Modüller</span>
              <h3>${sector.shortTitle} ${serviceType.titleSuffix} Kapsamında Neler Sunuyoruz?</h3>
              <ul style="margin-top:0.85rem; display:flex; flex-direction:column; gap:0.65rem;">
                ${specificDeliverables
                  .map(
                    (item) => `
                  <li style="display:flex; align-items:flex-start; gap:0.6rem; font-size:0.94rem;">
                    <span style="color:var(--aliaga-green); font-weight:900; flex-shrink:0;">✓</span>
                    <span><strong>${item}</strong></span>
                  </li>`
                  )
                  .join('')}
                <li style="display:flex; align-items:flex-start; gap:0.6rem; font-size:0.94rem;">
                  <span style="color:var(--aliaga-green); font-weight:900; flex-shrink:0;">✓</span>
                  <span><strong>Tam Kapsamlı SEO, Schema.org ve Sosyal Medya Meta Kurgusu</strong></span>
                </li>
                <li style="display:flex; align-items:flex-start; gap:0.6rem; font-size:0.94rem;">
                  <span style="color:var(--aliaga-green); font-weight:900; flex-shrink:0;">✓</span>
                  <span><strong>Pixel-Perfect Mobil, Tablet ve Masaüstü Uyumluluk</strong></span>
                </li>
              </ul>
            </div>
            <div style="margin-top:1.25rem;">
              <a href="#ucretsiz-danismanlik" class="btn btn-secondary btn-sm">
                Hemen Fiyat Teklifi Al →
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Bu Sektör İçin Yapay Zeka ve SEO Entegrasyon Avantajları -->
    <section class="section section-soft">
      <div class="container">
        <div class="section-header">
          <span class="section-eyebrow">Rakiplerinizin Önüne Geçin</span>
          <h2 class="section-title">${sector.shortTitle} İçin SEO ve Yapay Zeka Gücü</h2>
          <p class="section-desc">Sadece standart bir hizmet sunmuyor; ${sector.rawName} işletmenizi Google’da zirveye taşıyacak ve müşteri iletişiminizi otomatikleştirecek teknolojileri entegre ediyoruz.</p>
        </div>

        <div class="cards-grid-3">
          <div class="feature-card">
            <div>
              <div class="feature-icon-wrap">${renderIcon('trending', 22)}</div>
              <h3>${sector.shortTitle} SEO &amp; Google Hakimiyeti</h3>
              <p>"${sector.keywords.slice(0, 3).join(', ')}" gibi yüksek dönüşümlü aramalarda potansiyel müşterilerin ilk size ulaşması için teknik SEO mimarisi kuruyoruz.</p>
            </div>
            <a href="${pageHref(rootPrefix, 'seo-hizmetleri')}" class="feature-card-link">SEO Hizmetlerimizi İncele →</a>
          </div>

          <div class="feature-card">
            <div>
              <div class="feature-icon-wrap">${renderIcon('cpu', 22)}</div>
              <h3>${sector.shortTitle} 7/24 AI Müşteri Temsilcisi</h3>
              <p>Mesai saatleri dışında bile müşterilerinizin sorularını yanıtlayan, fiyat/hizmet bilgisi veren ve randevu/talep toplayan yapay zeka asistanı kuruyoruz.</p>
            </div>
            <a href="${pageHref(rootPrefix, 'yapay-zeka-destekli-musteri-temsilcisi')}" class="feature-card-link">AI Müşteri Temsilcisini İncele →</a>
          </div>

          <div class="feature-card">
            <div>
              <div class="feature-icon-wrap">${renderIcon('zap', 22)}</div>
              <h3>${sector.shortTitle} İş Akışı Otomasyonu</h3>
              <p>Web sitenizden ve e-postadan gelen müşteri taleplerini otomatik olarak WhatsApp’ınıza, CRM’inize veya teklif şablonunuza aktarıyoruz.</p>
            </div>
            <a href="${pageHref(rootPrefix, 'yapay-zeka-destekli-otomasyon-hizmetleri')}" class="feature-card-link">Otomasyon Hizmetlerini İncele →</a>
          </div>
        </div>
      </div>
    </section>

    <!-- SSS -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <span class="section-eyebrow">Sıkça Sorulan Sorular</span>
          <h2 class="section-title">${sector.shortTitle} ${serviceType.shortLabel} Hakkında Sıkça Sorulanlar</h2>
        </div>
        <div class="faq-list">
          ${faqs
            .map(
              (f, i) => `
            <details class="faq-item" ${i === 0 ? 'open' : ''}>
              <summary>${f.q} <span>+</span></summary>
              <div class="faq-answer">${f.a}</div>
            </details>`
            )
            .join('')}
        </div>

        <!-- Komşu Sektör Bağlantıları -->
        <div style="margin-top:3rem; padding-top:2rem; border-top:1px solid var(--border-color); display:flex; justify-content:space-between; flex-wrap:wrap; gap:1rem; font-size:0.9rem;">
          <a href="${pageHref(rootPrefix, serviceType.urlPattern(prevSector.slug))}">← ${prevSector.shortTitle} ${serviceType.shortLabel}</a>
          <a href="${pageHref(rootPrefix, 'sektorler')}"><strong>Tüm Sektörleri Gör (53 Sektör)</strong></a>
          <a href="${pageHref(rootPrefix, serviceType.urlPattern(nextSector.slug))}">${nextSector.shortTitle} ${serviceType.shortLabel} →</a>
        </div>
      </div>
    </section>
  </main>

  ${renderFooter(routePath, `${sector.shortTitle} ${serviceType.shortLabel}`)}
`;

  return writePage(routePath, html);
}

// 4. SEKTÖR ANA MERKEZ (HUB) SAYFASI (/{sektor}/index.html)
function buildSectorHubPage(sector) {
  const routePath = sector.slug;
  const rootPrefix = getRootPrefix(routePath);
  const title = `${sector.title} Dijital Çözümler, Web Sitesi, E-Ticaret & SEO | Aliağa Yazılım`;
  const description = `${sector.title} için profesyonel web sitesi, hazır web sitesi, e-ticaret kurulumu, Google Business danışmanlığı ve sosyal medya yönetimi. Ücretsiz danışmanlık: ${CONTACT_EMAIL}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', route: '' },
    { label: 'Sektörler', route: 'sektorler' },
    { label: sector.shortTitle, route: sector.slug }
  ];

  const html = `${renderHead({
    routePath,
    title,
    description,
    keywords: sector.keywords,
    breadcrumbs,
    serviceType: `${sector.title} Dijital Dönüşüm Çözümleri`
  })}
<body>
  ${renderHeader(routePath)}
  ${renderBreadcrumbBar(routePath, breadcrumbs)}

  <main id="main-content">
    <section class="hero-section">
      <div class="container hero-grid">
        <div>
          <div class="hero-badge-row">
            <span class="hero-badge-dot">${sector.category}</span>
            <span class="hero-badge-text">${sector.shortTitle} Dijital Dönüşüm Paketi</span>
          </div>
          <h1 class="hero-title">${sector.title} İçin <span class="highlight-magenta">360° Dijital</span> Çözümler</h1>
          <p class="hero-subtitle">${sector.painPoints} <strong>Aliağa Yazılım</strong> olarak ${sector.rawName} işletmenize özel web tasarım, hazır site, e-ticaret, Google Harita SEO ve sosyal medya yönetimi sunuyoruz.</p>
          <div class="hero-cta-group">
            <a href="mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Ücretsiz Danışmanlık: ${sector.shortTitle}`)}" class="btn btn-primary btn-lg">
              ${renderIcon('mail', 18)} Ücretsiz ${sector.shortTitle} Danışmanlığı Al
            </a>
          </div>
        </div>
        ${renderConsultationCard({
          prefillSector: sector.shortTitle,
          cardTitle: `${sector.shortTitle} İçin Ücretsiz Danışmanlık`
        })}
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header">
          <span class="section-eyebrow">5 Uzmanlık Paketi</span>
          <h2 class="section-title">${sector.shortTitle} Sektörüne Özel Hizmetlerimiz</h2>
        </div>
        <div class="cards-grid-3">
          ${SECTOR_SERVICE_TYPES.map((st) => {
            const stRoute = st.urlPattern(sector.slug);
            return `
            <article class="feature-card">
              <div>
                <div class="feature-icon-wrap">${renderIcon(st.icon, 24)}</div>
                <span style="font-size:0.75rem; font-weight:800; color:var(--aliaga-magenta);">${st.badge}</span>
                <h3><a href="${pageHref(rootPrefix, stRoute)}" style="color:inherit;">${sector.shortTitle} ${st.titleSuffix}</a></h3>
                <p>${sector.title} için yüksek dönüşümlü, %100 SEO ve mobil uyumlu ${st.shortLabel.toLocaleLowerCase('tr-TR')} çözümü.</p>
              </div>
              <a href="${pageHref(rootPrefix, stRoute)}" class="feature-card-link">Paketi İncele &amp; Teklif Al →</a>
            </article>`;
          }).join('')}
        </div>
      </div>
    </section>
  </main>

  ${renderFooter(routePath, `${sector.shortTitle} Dijital Çözümler`)}
`;

  return writePage(routePath, html);
}

// 5. TÜM SEKTÖRLER FİHRİSTİ (/sektorler/index.html)
function buildSectorsIndexPage() {
  const routePath = 'sektorler';
  const title = 'Hizmet Verdiğimiz 53+ Sektör | Sektörel Web Sitesi, E-Ticaret ve SEO | Aliağa Yazılım';
  const description = 'Diş hekimlerinden demir-çelik sanayine, inşaattan restorana kadar 53 sektöre özel web sitesi, hazır web sitesi, e-ticaret, Google Business ve sosyal medya çözümleri.';
  const breadcrumbs = [
    { label: 'Ana Sayfa', route: '' },
    { label: 'Sektörler (53+)', route: 'sektorler' }
  ];

  const html = `${renderHead({
    routePath,
    title,
    description,
    keywords: ['sektörel web tasarım', 'sektörel web sitesi paketleri', 'hazır web sitesi sektörler', 'aliağa yazılım sektörler'],
    breadcrumbs
  })}
<body>
  ${renderHeader(routePath)}
  ${renderBreadcrumbBar(routePath, breadcrumbs)}

  <main id="main-content">
    <section class="section section-soft">
      <div class="container">
        <div class="section-header">
          <span class="section-eyebrow">53 Sektör × 5 Hizmet = 265 Özel Çözüm</span>
          <h1 class="section-title">Tüm Sektörler İçin Özel Dijital Çözüm Rehberi</h1>
          <p class="section-desc">Sektörünüzü aşağıdan aratın; size özel hazırladığımız Kurumsal Web Sitesi, Hazır Web Sitesi, E-Ticaret Kurulumu, Google Business Danışmanlığı ve Sosyal Medya Yönetimi sayfalarını inceleyin.</p>
        </div>
        ${renderSectorsDirectory(routePath)}

        <div style="margin-top:3.5rem; max-width:680px; margin-left:auto; margin-right:auto;">
          ${renderConsultationCard({ cardTitle: 'Sektörünüz İçin Ücretsiz Dijital Danışmanlık & Teklif Alın' })}
        </div>
      </div>
    </section>
  </main>

  ${renderFooter(routePath, 'Sektörel Danışmanlık Talebi')}
`;

  return writePage(routePath, html);
}

// 6. REFERANSLAR, HAKKIMIZDA VE İLETİŞİM SAYFALARI
function buildAboutAndContactPages() {
  const urls = [];

  // Referanslarımız Sayfası (/referanslar)
  const refRoute = 'referanslar';
  const refBreadcrumbs = [
    { label: 'Ana Sayfa', route: '' },
    { label: 'Referanslarımız', route: refRoute }
  ];
  const refHtml = `${renderHead({
    routePath: refRoute,
    title: 'Referanslarımız & Tamamlanan Projeler | Aliağa Yazılım',
    description: 'Aliağa Yazılım referansları: aliagakombibakim.com (Kombi Bakım Servisi), asmakinaotomasyon.com (Makina Otomasyon Yazılım Çözümleri), gursemabeauty.com (Güzellik ve Bakım Merkezi) ve kurumsal projelerimiz.',
    keywords: ['aliağa yazılım referanslar', 'aliagakombibakim.com', 'asmakinaotomasyon.com', 'gursemabeauty.com', 'aliağa web tasarım referansları'],
    breadcrumbs: refBreadcrumbs
  })}
<body>
  ${renderHeader(refRoute)}
  ${renderBreadcrumbBar(refRoute, refBreadcrumbs)}

  <main id="main-content">
    <section class="hero-section">
      <div class="container hero-grid">
        <div>
          <div class="hero-badge-row">
            <span class="hero-badge-dot">BAŞARI HİKAYELERİMİZ</span>
            <span class="hero-badge-text">Web Tasarım • SEO • Otomasyon • Dijital Dönüşüm</span>
          </div>
          <h1 class="hero-title">Gerçek Sonuçlar Üreten <span class="highlight-magenta">Seçkin Referanslarımız</span></h1>
          <p class="hero-subtitle">Aliağa, İzmir ve Türkiye genelinde farklı sektörlerden işletmelerin dijital vitrinlerini, arama motoru (SEO) görünürlüklerini ve otomasyon altyapılarını başarıyla inşa ediyoruz.</p>
          <div class="hero-cta-group">
            <a href="mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Referanslarınız Gibi Yeni Proje Talebi (Ücretsiz Danışmanlık)')}" class="btn btn-primary btn-lg">
              ${renderIcon('mail', 18)} Sizin Projeniz İçin Ücretsiz Danışmanlık Alın
            </a>
          </div>
        </div>
        ${renderConsultationCard({ cardTitle: 'Sıradaki Başarı Hikayemiz Siz Olun' })}
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header">
          <span class="section-eyebrow">Canlı Projelerimiz</span>
          <h2 class="section-title">Referans Projelerimiz</h2>
          <p class="section-desc">Her biri Core Web Vitals, mobil uyumluluk ve sektörel dönüşüm kriterlerine göre özel olarak geliştirilen referanslarımız:</p>
        </div>
        ${renderReferencesCards(refRoute)}
      </div>
    </section>
  </main>

  ${renderFooter(refRoute, 'Referanslar Sayfası Proje Talebi')}
`;
  urls.push(writePage(refRoute, refHtml));

  // Hakkımızda
  const aboutRoute = 'hakkimizda';
  const aboutBreadcrumbs = [
    { label: 'Ana Sayfa', route: '' },
    { label: 'Hakkımızda', route: aboutRoute }
  ];
  const aboutHtml = `${renderHead({
    routePath: aboutRoute,
    title: 'Hakkımızda | Aliağa Yazılım (aliagayazilim.com)',
    description: 'Aliağa Yazılım; Aliağa, İzmir ve Türkiye genelinde işletmelere yüksek performanslı web tasarım, SEO, e-ticaret, mobil uygulama ve yapay zeka otomasyon çözümleri sunar.',
    keywords: ['aliağa yazılım hakkında', 'aliagayazilim.com', 'aliağa bilişim ve yazılım firması'],
    breadcrumbs: aboutBreadcrumbs
  })}
<body>
  ${renderHeader(aboutRoute)}
  ${renderBreadcrumbBar(aboutRoute, aboutBreadcrumbs)}

  <main id="main-content">
    <section class="hero-section">
      <div class="container hero-grid">
        <div>
          <div class="hero-badge-row">
            <span class="hero-badge-dot">KURUMSAL KİMLİK</span>
            <span class="hero-badge-text">Aliağa’nın Teknoloji ve Dijital Dönüşüm Gücü</span>
          </div>
          <h1 class="hero-title">İşletmenizin Dijital Büyüme Ortağı: <span class="highlight-magenta">Aliağa Yazılım</span></h1>
          <p class="hero-subtitle">Aliağa’nın dinamik sanayi, ticaret ve hizmet ekosisteminden aldığımız ilhamla; her ölçekten işletmeyi dünya standartlarında web teknolojileri, arama motoru optimizasyonu (SEO) ve yapay zeka otomasyonlarıyla buluşturuyoruz.</p>
          <div class="cards-grid-2" style="margin-top:1.5rem;">
            <div class="feature-card">
              <h3>Misyonumuz</h3>
              <p>53’ten fazla sektörde faaliyet gösteren esnaf, KOBİ ve sanayi kuruluşlarının dijitalde görünür olmasını, aracılara yüksek komisyon ödemeden kendi markalarıyla büyümelerini sağlamak.</p>
            </div>
            <div class="feature-card">
              <h3>Mühendislik Standartlarımız</h3>
              <p>Geliştirdiğimiz her projede Google Core Web Vitals kurallarını, kusursuz mobil uyumluluğu, eksiksiz Schema/Meta etiketlerini ve yüksek dönüşüm oranını standart olarak sunuyoruz.</p>
            </div>
          </div>
        </div>
        ${renderConsultationCard({ cardTitle: 'Ekibimizle Tanışın & Ücretsiz Danışmanlık Alın' })}
      </div>
    </section>

    <section class="section section-soft">
      <div class="container">
        <div class="section-header">
          <span class="section-eyebrow">Güven &amp; Kalite</span>
          <h2 class="section-title">Referanslarımız</h2>
          <p class="section-desc">Birlikte değer ürettiğimiz iş ortaklarımız ve tamamladığımız projeler:</p>
        </div>
        ${renderReferencesCards(aboutRoute)}
      </div>
    </section>
  </main>

  ${renderFooter(aboutRoute, 'Kurumsal İş Birliği & Danışmanlık')}
`;
  urls.push(writePage(aboutRoute, aboutHtml));

  // İletişim
  const contactRoute = 'iletisim';
  const contactBreadcrumbs = [
    { label: 'Ana Sayfa', route: '' },
    { label: 'İletişim & Ücretsiz Danışmanlık', route: contactRoute }
  ];
  const contactHtml = `${renderHead({
    routePath: contactRoute,
    title: 'İletişim & Ücretsiz Dijital Danışmanlık | Aliağa Yazılım',
    description: 'Aliağa Yazılım ile iletişime geçin. Web tasarım, SEO, e-ticaret ve yapay zeka çözümleri için contact@aliagayazilim.com adresinden ücretsiz danışmanlık alın.',
    keywords: ['aliağa yazılım iletişim', 'contact@aliagayazilim.com', 'ücretsiz web tasarım danışmanlığı'],
    breadcrumbs: contactBreadcrumbs
  })}
<body>
  ${renderHeader(contactRoute)}
  ${renderBreadcrumbBar(contactRoute, contactBreadcrumbs)}

  <main id="main-content">
    <section class="hero-section">
      <div class="container hero-grid">
        <div>
          <div class="hero-badge-row">
            <span class="hero-badge-dot">7/24 DESTEK &amp; DANIŞMANLIK</span>
            <span class="hero-badge-text">${CONTACT_EMAIL}</span>
          </div>
          <h1 class="hero-title">Ücretsiz Dijital Danışmanlık İçin <span class="highlight-blue">Bize Yazın</span></h1>
          <p class="hero-subtitle">Projeniz, mevcut web siteniz veya işletmenizin dijital hedefleri hakkında hiçbir ücret ödemeden uzman görüşü alın. Gönderdiğiniz tüm e-postalara aynı gün içinde detaylı analizle yanıt veriyoruz.</p>

          <div class="feature-card" style="margin-bottom:1.25rem; border-left:4px solid var(--aliaga-magenta);">
            <h3>Resmi E-Posta &amp; Destek Kanalımız</h3>
            <p style="font-size:1.15rem; font-weight:800; margin:0.5rem 0;">
              <a href="mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Ücretsiz Danışmanlık ve Destek Talebi')}">${CONTACT_EMAIL}</a>
            </p>
            <p>Doğrudan e-posta gönderebilir veya yandaki akıllı danışmanlık formunu doldurarak hazır şablonla başvurunuzu saniyeler içinde iletebilirsiniz.</p>
            <div style="margin-top:0.75rem;">
              <button type="button" class="btn btn-outline btn-sm" data-copy-email="${CONTACT_EMAIL}">E-Posta Adresini Kopyala</button>
            </div>
          </div>

          <div class="feature-card" style="border-left:4px solid var(--aliaga-green);">
            <h3>Ücretsiz Danışmanlık Kapsamında Neler Yapıyoruz?</h3>
            <ul style="display:flex; flex-direction:column; gap:0.45rem; margin-top:0.5rem; font-size:0.92rem;">
              <li>✓ Mevcut web sitenizin hız (Core Web Vitals) ve SEO hatalarının analizi</li>
              <li>✓ Sektörünüzdeki yerel ve ulusal rakiplerin dijital durum incelemesi</li>
              <li>✓ Google Business (Harita) görünürlük ve yorum stratejisi kontrolü</li>
              <li>✓ İşletmenize uygun yapay zeka ve otomasyon fırsatlarının belirlenmesi</li>
              <li>✓ Net süre ve şeffaf bütçe planlaması</li>
            </ul>
          </div>
        </div>

        ${renderConsultationCard({ cardTitle: 'Hemen Ücretsiz Danışmanlık Talebi Oluşturun' })}
      </div>
    </section>
  </main>

  ${renderFooter(contactRoute, 'İletişim Sayfası Danışmanlık Talebi')}
`;
  urls.push(writePage(contactRoute, contactHtml));

  return urls;
}

// 7. SITEMAP.XML, ROBOTS.TXT ve SITE.WEBMANIFEST ÜRETİMİ
function buildSeoSystemFiles(allUrls) {
  const uniqueUrls = [...new Set(allUrls)];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueUrls
  .map((url) => {
    const isHome = url === `${DOMAIN}/`;
    const priority = isHome ? '1.0' : url.split('/').length <= 4 ? '0.9' : '0.8';
    return `  <url>
    <loc>${url}</loc>
    <lastmod>${TODAY_ISO}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
  })
  .join('\n')}
</urlset>
`;
  fs.writeFileSync(path.join(ROOT_DIR, 'sitemap.xml'), sitemapXml, 'utf8');

  const robotsTxt = `User-agent: *
Allow: /

Host: ${DOMAIN}
Sitemap: ${DOMAIN}/sitemap.xml
`;
  fs.writeFileSync(path.join(ROOT_DIR, 'robots.txt'), robotsTxt, 'utf8');

  const manifestJson = {
    name: 'Aliağa Yazılım | Web Tasarım, SEO, E-Ticaret & Yapay Zeka',
    short_name: 'Aliağa Yazılım',
    description: 'Web Tasarım, Web Sitesi, SEO Hizmetleri, Google Business, Kurumsal Mail, E-Ticaret, Mobil Uygulama, Yapay Zeka ve Otomasyon Çözümleri.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#DC1E62',
    icons: [
      {
        src: '/assets/img/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml'
      },
      {
        src: '/assets/img/aliaga-logo.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  };
  fs.writeFileSync(path.join(ROOT_DIR, 'site.webmanifest'), JSON.stringify(manifestJson, null, 2), 'utf8');
}

// TÜM SİTEYİ DERLE
function buildAll() {
  const generatedUrls = [];

  // 1. Ana Sayfa
  generatedUrls.push(buildHomePage());

  // 2. Ana Hizmet ve Yapay Zeka Sayfaları (11 Sayfa)
  for (const srv of CORE_SERVICES) {
    generatedUrls.push(buildCoreServicePage(srv));
  }

  // 3. Sektörler Fihristi, Hakkımızda, İletişim
  generatedUrls.push(buildSectorsIndexPage());
  generatedUrls.push(...buildAboutAndContactPages());

  // 4. 53 Sektör Hub Sayfası + 53 × 5 = 265 Sektörel Hizmet Sayfası
  SECTORS.forEach((sector, idx) => {
    generatedUrls.push(buildSectorHubPage(sector));
    for (const serviceType of SECTOR_SERVICE_TYPES) {
      generatedUrls.push(buildSectorServicePage(sector, serviceType, idx));
    }
  });

  // 5. Sitemap, Robots ve Webmanifest
  buildSeoSystemFiles(generatedUrls);

  console.log(`✅ Toplam ${generatedUrls.length} statik sayfa, sitemap.xml, robots.txt ve site.webmanifest başarıyla üretildi!`);
}

buildAll();
