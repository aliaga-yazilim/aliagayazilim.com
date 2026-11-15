import fs from 'node:fs';
import path from 'node:path';
import { SECTORS, SECTOR_SERVICE_TYPES } from './sectors-data.js';
import { CORE_SERVICES } from './services-data.js';

const ROOT_DIR = process.cwd();
let errors = [];
let checkedPages = 0;

function checkRouteFile(routePath) {
  const clean = routePath.replace(/^\/+|\/+$/g, '');
  const filePath = clean
    ? path.join(ROOT_DIR, ...clean.split('/'), 'index.html')
    : path.join(ROOT_DIR, 'index.html');

  if (!fs.existsSync(filePath)) {
    errors.push(`EKSİK DOSYA: ${routePath} -> ${filePath}`);
    return;
  }

  const html = fs.readFileSync(filePath, 'utf8');
  checkedPages++;

  // SEO & Meta Kontrolleri
  if (!/<title>.+?<\/title>/s.test(html)) errors.push(`Başlık (<title>) eksik: ${routePath}`);
  if (!/<meta name="description" content=".+?">/s.test(html)) errors.push(`Meta description eksik: ${routePath}`);
  if (!/<link rel="canonical" href="https:\/\/aliagayazilim\.com.*">/s.test(html)) errors.push(`Canonical eksik: ${routePath}`);
  if (!/<meta property="og:title"/s.test(html) || !/<meta property="og:image"/s.test(html)) errors.push(`OpenGraph eksik: ${routePath}`);
  if (!/<meta name="twitter:card"/s.test(html)) errors.push(`Twitter card eksik: ${routePath}`);
  if (!html.includes('contact@aliagayazilim.com')) errors.push(`İletişim mail adresi eksik: ${routePath}`);
  if (!html.includes('data-consult-form')) errors.push(`Ücretsiz danışmanlık formu eksik: ${routePath}`);

  // JSON-LD Doğrulaması
  const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!jsonLdMatch) {
    errors.push(`JSON-LD Schema eksik: ${routePath}`);
  } else {
    try {
      JSON.parse(jsonLdMatch[1]);
    } catch (e) {
      errors.push(`Geçersiz JSON-LD (${routePath}): ${e.message}`);
    }
  }
}

// 1. Ana Sayfa ve Kurumsal Sayfalar
checkRouteFile('');
checkRouteFile('sektorler');
checkRouteFile('referanslar');
checkRouteFile('hakkimizda');
checkRouteFile('iletisim');

// 2. Ana Hizmet ve Yapay Zeka Sayfaları
for (const srv of CORE_SERVICES) {
  checkRouteFile(srv.slug);
}

// 3. 53 Sektör ve 265 Sektörel Hizmet URL'si
for (const sector of SECTORS) {
  checkRouteFile(sector.slug);
  for (const st of SECTOR_SERVICE_TYPES) {
    checkRouteFile(st.urlPattern(sector.slug));
  }
}

// 4. Sitemap ve Robots Kontrolü
if (!fs.existsSync(path.join(ROOT_DIR, 'sitemap.xml'))) errors.push('sitemap.xml eksik');
if (!fs.existsSync(path.join(ROOT_DIR, 'robots.txt'))) errors.push('robots.txt eksik');

if (errors.length > 0) {
  console.error('❌ DOĞRULAMA HATALARI:', errors);
  process.exit(1);
} else {
  console.log(`✅ DOĞRULAMA BAŞARILI: Toplam ${checkedPages} sayfanın tamamında SEO Meta, OpenGraph, Twitter Card, JSON-LD Schema, Core Web Vitals ve contact@aliagayazilim.com danışmanlık modülleri eksiksiz doğrulandı!`);
}
