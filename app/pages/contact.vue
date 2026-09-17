<template>
  <div class="yana-page">
    <header class="contact-banner">
      <div aria-hidden="true" class="banner-bg" />
      <div aria-hidden="true" class="banner-scrim" />
      <div class="banner-content">
        <span class="eyebrow-plain"><span class="rule-short" />Al Saadiyat Island · Abu Dhabi</span>
        <h1 class="banner-title">Reach Us</h1>
      </div>
    </header>

    <!-- FORM + INFO -->
    <section class="form-section">
      <div class="form-grid">
        <div>
          <span class="eyebrow-plain eyebrow-plain--dark"><span class="rule-short" />Get in touch</span>
          <h2 class="h2-dark">Let's Talk</h2>
          <p class="form-helper">If you have questions Please write us a message</p>
          <form class="contact-form" @submit.prevent="onSubmit">
            <div class="form-fields">
              <input v-model="form.name" class="yana-input" type="text" name="name" placeholder="Your name" required>
              <input v-model="form.email" class="yana-input" type="email" name="email" placeholder="Email address" required>
              <input v-model="form.phone" class="yana-input" type="tel" name="phone" placeholder="Phone (optional)">
              <input v-model="form.subject" class="yana-input" type="text" name="subject" placeholder="Subject">
            </div>
            <textarea v-model="form.message" class="yana-input" name="message" placeholder="Your message" required />
            <div class="form-actions">
              <button type="submit" class="send-btn">Send Message</button>
              <span class="form-status">{{ status }}</span>
            </div>
          </form>
        </div>

        <div>
          <span class="contact-info-label">Contact info</span>
          <div class="contact-links">
            <a href="https://www.google.com/maps/place/yana+restaurant+saadiyat" target="_blank" rel="noopener" class="contact-link">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#D9B690" stroke-width="1.5" class="contact-icon"><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
              <span class="contact-link-text">Al Saadiyat Island - Abu Dhabi</span>
            </a>
            <a href="mailto:info@yanarestaurants.com" class="contact-link">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#D9B690" stroke-width="1.5" class="contact-icon"><rect x="3" y="5" width="18" height="14" /><polyline points="3 6 12 13 21 6" /></svg>
              <span class="contact-link-text">info@yanarestaurants.com</span>
            </a>
            <a href="tel:+97124476998" class="contact-link">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#D9B690" stroke-width="1.5" class="contact-icon"><path d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v4a12 12 0 0 1-16-16z" /></svg>
              <span class="contact-link-text">+971 2 447 6998</span>
            </a>
            <a href="tel:+971501906122" class="contact-link">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#D9B690" stroke-width="1.5" class="contact-icon"><rect x="7" y="2" width="10" height="20" rx="2" /><line x1="11" y1="18.5" x2="13" y2="18.5" /></svg>
              <span class="contact-link-text">+971 50 190 6122</span>
            </a>
          </div>

          <span class="contact-info-label contact-info-label--hours">Opening Hours</span>
          <div class="hours-list">
            <div class="hours-row">
              <span>Sunday – Thursday</span><span class="hours-time">09.00 AM – 22.00 PM</span>
            </div>
            <div class="hours-row">
              <span>Friday</span><span class="hours-time">09.00 AM – 12.00 AM</span>
            </div>
            <div class="hours-row hours-row--last">
              <span>Saturday</span><span class="hours-time">09.00 AM – 12.00 AM</span>
            </div>
          </div>

          <div class="contact-socials">
            <a href="https://wa.me/971501906122" aria-label="WhatsApp" class="social-btn" target="_blank" rel="noopener">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 21l1.6-4.2A8 8 0 1 1 8 20.4L3 21z" /><path d="M9 9c0 3 3 6 6 6M9 9c0-.6.5-1 1-1M15 15c.6 0 1-.5 1-1" /></svg>
            </a>
            <a href="https://www.instagram.com/yanarestaurants/" aria-label="Instagram" class="social-btn" target="_blank" rel="noopener">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
            </a>
            <a href="https://www.linkedin.com/company/yana-restaurants" aria-label="LinkedIn" class="social-btn" target="_blank" rel="noopener">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM3 9h4v12H3zM10 9h3.8v1.7c.6-1 1.8-1.9 3.7-1.9 2.7 0 4.5 1.7 4.5 5.3V21h-4v-6c0-1.6-.6-2.6-2-2.6-1.2 0-2 .8-2 2.6V21h-4z" /></svg>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- MAP -->
    <section class="map-section">
      <iframe
        title="YANA Restaurant on the map"
        src="https://maps.google.com/maps?q=24.56190282214312%2C%2054.45993442883627&t=m&z=18&output=embed&iwloc=near"
        class="map-iframe"
      />
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div aria-hidden="true" class="cta-bg" />
      <div aria-hidden="true" class="cta-scrim" />
      <div class="cta-content">
        <span class="eyebrow-plain">Reservations</span>
        <h2 class="cta-title">Visit Yana Restaurant</h2>
        <NuxtLink to="/reservation" class="btn-gold">Reserve Now</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const form = reactive({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
})

const status = ref('')

function onSubmit(e: Event) {
  status.value = 'Thank you — we will be in touch shortly.'
  Object.assign(form, { name: '', email: '', phone: '', subject: '', message: '' })
  ;(e.target as HTMLFormElement)?.reset()
}
</script>

<style scoped>
.contact-banner {
  position: relative;
  overflow: hidden;
  min-height: clamp(360px, 48vh, 480px);
  display: flex;
  align-items: flex-end;
  background: #0f1e2e;
}

.banner-bg {
  position: absolute;
  inset: 0;
  background: url('/images/yana-pattern-tall.png') center/cover no-repeat;
}

.banner-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 30, 46, 0.72), rgba(15, 30, 46, 0.5) 45%, rgba(15, 30, 46, 0.94));
}

.banner-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 clamp(20px, 5vw, 64px) clamp(46px, 6vw, 74px);
}

.eyebrow-plain {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  font-size: 11px;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: var(--gold-lt);
  font-weight: 400;
}

.eyebrow-plain--dark {
  color: var(--gold-dk);
  letter-spacing: 0.32em;
}

.rule-short {
  width: 34px;
  height: 1px;
  background: var(--gold);
  display: inline-block;
}

.banner-title {
  font-family: var(--serif);
  font-weight: 400;
  font-size: clamp(44px, 9vw, 104px);
  line-height: 1;
  margin: 20px 0 0;
  color: #ffffff;
  letter-spacing: 0.02em;
}

.form-section {
  position: relative;
  overflow: hidden;
  padding: clamp(72px, 10vw, 140px) clamp(20px, 5vw, 64px);
}

.pattern-light {
  position: absolute;
  inset: 0;
  background: url('/images/yana-pattern-square.jpeg') center/cover no-repeat;
  filter: invert(1) saturate(0.25) contrast(1.1);
  opacity: 0.55;
  pointer-events: none;
}

.form-grid {
  position: relative;
  max-width: 1320px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: clamp(48px, 6vw, 96px);
}

.h2-dark {
  font-family: var(--serif);
  font-weight: 400;
  font-size: clamp(32px, 5vw, 58px);
  line-height: 1.06;
  margin: 22px 0 0;
  color: var(--ink);
}

.form-helper {
  font-size: 15px;
  line-height: 1.9;
  color: var(--ink-dim);
  margin: 18px 0 0;
}

.contact-form {
  margin-top: 38px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px 28px;
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 18px;
  margin-top: 26px;
}

.send-btn {
  font-size: 12px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: #0f1e2e;
  background: var(--gold);
  border: 1px solid var(--gold);
  padding: 18px 42px;
  cursor: pointer;
  font-family: var(--sans);
  font-weight: 400;
  transition: all 0.4s ease;
}

.send-btn:hover {
  background: transparent;
  color: var(--gold-dk);
}

.form-status {
  font-size: 12.5px;
  color: var(--gold-dk);
}

.contact-info-label {
  font-size: 10.5px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--gold-dk);
}

.contact-info-label--hours {
  display: block;
  margin-top: 44px;
}

.contact-links {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
}

.contact-link {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 20px 0;
  border-bottom: 1px solid rgba(18, 66, 109, 0.12);
  text-decoration: none;
  color: var(--ink);
  transition: color 0.3s;
}

.contact-link:hover {
  color: var(--gold-dk);
}

.contact-icon {
  flex: 0 0 auto;
  margin-top: 2px;
}

.contact-link-text {
  font-size: 15px;
  line-height: 1.6;
}

.hours-list {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.hours-row {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  font-size: 14.5px;
  color: var(--ink);
  border-bottom: 1px solid rgba(18, 66, 109, 0.12);
  padding-bottom: 11px;
}

.hours-row--last {
  border-bottom: none;
}

.hours-time {
  color: var(--ink-dim);
}

.contact-socials {
  display: flex;
  gap: 14px;
  margin-top: 38px;
}

.social-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid rgba(217, 182, 144, 0.55);
  color: var(--gold-dk);
  transition: all 0.35s ease;
  text-decoration: none;
}

.social-btn:hover {
  background: var(--gold);
  color: #ffffff;
  border-color: var(--gold);
}

.map-section {
  position: relative;
  border-top: 1px solid rgba(217, 182, 144, 0.35);
}

.map-iframe {
  display: block;
  width: 100%;
  height: clamp(340px, 44vh, 520px);
  border: 0;
  filter: grayscale(0.45) contrast(1.05);
}

.cta-section {
  position: relative;
  overflow: hidden;
  text-align: center;
  padding: clamp(80px, 12vw, 150px) clamp(20px, 5vw, 64px);
}

.cta-bg {
  position: absolute;
  inset: 0;
  background: url('/images/yana-image-4-mrt9r8ad-uvfn.webp') center/cover no-repeat;
}

.cta-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 30, 46, 0.84), rgba(15, 30, 46, 0.92));
}

.pattern-dark {
  position: absolute;
  inset: 0;
  background: url('/images/yana-pattern-square.jpeg') center/cover no-repeat;
  opacity: 0.3;
  mix-blend-mode: screen;
  pointer-events: none;
}

.cta-content {
  position: relative;
  z-index: 2;
  max-width: 700px;
  margin: 0 auto;
}

.cta-title {
  font-family: var(--serif);
  font-weight: 400;
  font-size: clamp(34px, 5.6vw, 66px);
  line-height: 1.06;
  margin: 20px 0 0;
  color: #ffffff;
}

.btn-gold {
  display: inline-block;
  margin-top: 38px;
  font-size: 12px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: #0f1e2e;
  background: var(--gold);
  padding: 19px 46px;
  text-decoration: none;
  transition: all 0.4s ease;
  border: 1px solid var(--gold);
}

.btn-gold:hover {
  background: transparent;
  color: #ffffff;
}
</style>
