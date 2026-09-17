<template>
  <footer class="yana-footer">
    <div aria-hidden="true" class="yana-footer-pattern" />
    <div class="yana-footer-inner">
      <div class="yana-footer-cols">
        <div class="yana-footer-brand">
          <img src="/images/yana-logo-gold.svg" alt="YANA" class="footer-logo-img">
          <p class="footer-tagline">Pan-Asian Fusion, Peruvian Flair — on Al Saadiyat Island.</p>
          <div class="footer-socials">
            <a href="https://wa.me/971501906122" aria-label="WhatsApp" class="social-btn" target="_blank" rel="noopener">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 21l1.6-4.2A8 8 0 1 1 8 20.4L3 21z" /><path d="M9 9c0 3 3 6 6 6M9 9c0-.6.5-1 1-1M15 15c.6 0 1-.5 1-1" /></svg>
            </a>
            <a href="https://www.instagram.com/yanarestaurants/" aria-label="Instagram" class="social-btn" target="_blank" rel="noopener">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
            </a>
            <a href="https://www.linkedin.com/company/yana-restaurants" aria-label="LinkedIn" class="social-btn" target="_blank" rel="noopener">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM3 9h4v12H3zM10 9h3.8v1.7c.6-1 1.8-1.9 3.7-1.9 2.7 0 4.5 1.7 4.5 5.3V21h-4v-6c0-1.6-.6-2.6-2-2.6-1.2 0-2 .8-2 2.6V21h-4z" /></svg>
            </a>
          </div>
        </div>

        <div class="yana-footer-nav">
          <span class="footer-heading">Explore</span>
          <nav class="footer-links">
            <NuxtLink to="/" class="footer-link">Home</NuxtLink>
            <NuxtLink to="/menu" class="footer-link">Menu</NuxtLink>
            <NuxtLink to="/about" class="footer-link">About Us</NuxtLink>
            <NuxtLink to="/gallery" class="footer-link">Gallery</NuxtLink>
            <NuxtLink to="/contact" class="footer-link">Reach Us</NuxtLink>
            <NuxtLink to="/reservation" class="footer-link">Reservations</NuxtLink>
          </nav>
        </div>

        <div class="yana-footer-contact">
          <span class="footer-heading">Contact</span>
          <div class="footer-contact-list">
            <a href="tel:+97124476998" class="footer-link">t. +971 2 447 6998</a>
            <a href="tel:+971501906122" class="footer-link">m. +971 50 190 6122</a>
            <a href="mailto:info@yanarestaurants.com" class="footer-link">e. info@yanarestaurants.com</a>
            <a href="https://www.google.com/maps/place/yana+restaurant+saadiyat" target="_blank" rel="noopener" class="footer-link footer-address">Al Saadiyat Island,<br>Abu Dhabi, UAE</a>
          </div>
        </div>
      </div>

      <div class="footer-rule" />

      <div class="footer-bottom">
        <span class="footer-copy">Copyright © 2026 Yana Restaurant</span>
        <span class="footer-copy">Al Saadiyat Island · Abu Dhabi</span>
      </div>
    </div>
  </footer>
</template>


<style scoped>
.yana-footer {
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #0f1e2e, #0a1622);
  border-top: 1px solid rgba(217, 182, 144, 0.35);
  padding: clamp(64px, 9vw, 104px) clamp(20px, 5vw, 64px) 40px;
  font-family: var(--sans);
  font-weight: 300;
}

.yana-footer-pattern {
  position: absolute;
  inset: 0;
  background: url('/images/yana-pattern-square.jpeg') center/cover no-repeat;
  opacity: 0.3;
  mix-blend-mode: screen;
  pointer-events: none;
}

.yana-footer-inner {
  position: relative;
  max-width: 1320px;
  margin: 0 auto;
}

.yana-footer-cols {
  display: flex;
  flex-wrap: wrap;
  gap: 48px;
  justify-content: space-between;
}

.yana-footer-brand {
  flex: 1 1 280px;
}

.footer-logo-img {
  display: block;
  height: 30px;
  width: auto;
}

.footer-tagline {
  font-family: var(--serif);
  font-style: italic;
  font-size: 17px;
  color: var(--cream-dim);
  margin: 18px 0 0;
  max-width: 34ch;
}

.footer-socials {
  display: flex;
  gap: 14px;
  margin-top: 26px;
}

.social-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border: 1px solid rgba(217, 182, 144, 0.45);
  color: var(--gold-lt);
  transition: all 0.35s ease;
  text-decoration: none;
}

.social-btn:hover {
  background: var(--gold);
  color: var(--blue-dk);
  border-color: var(--gold);
}

.yana-footer-nav,
.yana-footer-contact {
  flex: 0 1 auto;
}

.footer-heading {
  font-size: 10.5px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--gold-lt);
}

.footer-links,
.footer-contact-list {
  display: flex;
  flex-direction: column;
  gap: 13px;
  margin-top: 20px;
}

.footer-link {
  font-size: 13.5px;
  letter-spacing: 0.06em;
  color: #ffffff;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-link:hover {
  color: var(--gold-lt);
}

.footer-address {
  line-height: 1.7;
  color: var(--cream-dim);
}

.footer-rule {
  height: 1px;
  background: rgba(255, 255, 255, 0.12);
  margin: 52px 0 26px;
}

.footer-bottom {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  justify-content: space-between;
  align-items: center;
}

.footer-copy {
  font-size: 11px;
  letter-spacing: 0.1em;
  color: var(--cream-dim);
}
</style>
