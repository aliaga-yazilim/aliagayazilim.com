/**
 * ALİAĞA YAZILIM (aliagayazilim.com) - İnteraktif Dönüşüm ve Navigasyon Betiği
 * Sıfır Harici Bağımlılık - Maksimum Core Web Vitals (INP < 30ms)
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobil Menü Kontrolü
  const menuToggle = document.querySelector('[data-mobile-toggle]');
  const mainNav = document.querySelector('[data-main-nav]');
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // 2. Tek Tıkla E-Posta Adresi Kopyalama (contact@aliagayazilim.com)
  const copyButtons = document.querySelectorAll('[data-copy-email]');
  copyButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const email = btn.getAttribute('data-copy-email') || 'contact@aliagayazilim.com';
      const originalText = btn.innerHTML;
      try {
        await navigator.clipboard.writeText(email);
        btn.innerHTML = '✓ Kopyalandı: ' + email;
        setTimeout(() => {
          btn.innerHTML = originalText;
        }, 2500);
      } catch {
        window.location.href = 'mailto:' + email;
      }
    });
  });

  // 3. Ücretsiz Danışmanlık & Destek Talebi Akıllı Mail Formu
  const consultForms = document.querySelectorAll('[data-consult-form]');
  consultForms.forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const name = (formData.get('name') || '').toString().trim();
      const phone = (formData.get('phone') || '').toString().trim();
      const sector = (formData.get('sector') || '').toString().trim();
      const service = (formData.get('service') || '').toString().trim();
      const message = (formData.get('message') || '').toString().trim();
      const pageUrl = window.location.href;

      const subject = `[Ücretsiz Danışmanlık Talebi] ${sector ? sector + ' - ' : ''}${service || 'Dijital Çözümler'}`;
      const bodyLines = [
        'Merhaba Aliağa Yazılım Ekibi,',
        '',
        'Web siteniz üzerinden ücretsiz dijital danışmanlık ve fiyat teklifi talep ediyorum:',
        '--------------------------------------------------',
        `Ad Soyad / Firma : ${name || 'Belirtilmedi'}`,
        `Telefon / İletişim: ${phone || 'Belirtilmedi'}`,
        `Sektör           : ${sector || 'Genel'}`,
        `İlgilenilen Hizmet: ${service || 'Genel Danışmanlık'}`,
        `Mesaj / Not      : ${message || 'Ücretsiz analiz ve danışmanlık rica ediyorum.'}`,
        `Talep Sayfası    : ${pageUrl}`,
        '--------------------------------------------------',
        'En kısa sürede dönüşünüzü rica ederim.'
      ];

      const mailtoUrl = `mailto:contact@aliagayazilim.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
      window.location.href = mailtoUrl;

      const feedbackEl = form.querySelector('[data-form-feedback]');
      if (feedbackEl) {
        feedbackEl.style.display = 'block';
        feedbackEl.innerHTML = '<strong>E-posta uygulamanız açılıyor...</strong> Dilerseniz doğrudan <a href="mailto:contact@aliagayazilim.com">contact@aliagayazilim.com</a> adresine de gönderebilirsiniz.';
      }
    });
  });

  // 4. 53 Sektör Canlı Arama ve Kategori Filtreleme
  const searchInput = document.querySelector('[data-sector-search]');
  const catButtons = document.querySelectorAll('[data-sector-cat]');
  const sectorCards = document.querySelectorAll('[data-sector-card]');
  const countDisplay = document.querySelector('[data-sector-count]');

  if (sectorCards.length > 0) {
    let activeCategory = 'all';
    let searchQuery = '';

    const normalizeTr = (str) =>
      str
        .toLocaleLowerCase('tr-TR')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c');

    const filterSectors = () => {
      let visibleCount = 0;
      const q = normalizeTr(searchQuery);

      sectorCards.forEach((card) => {
        const cardCat = card.getAttribute('data-category') || '';
        const cardKeywords = normalizeTr(card.getAttribute('data-keywords') || card.textContent || '');
        const matchCat = activeCategory === 'all' || cardCat === activeCategory;
        const matchQuery = !q || cardKeywords.includes(q);

        if (matchCat && matchQuery) {
          card.style.display = '';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (countDisplay) {
        countDisplay.textContent = `${visibleCount} sektör gösteriliyor`;
      }
    };

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        filterSectors();
      });
    }

    catButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        catButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.getAttribute('data-sector-cat') || 'all';
        filterSectors();
      });
    });
  }
});
