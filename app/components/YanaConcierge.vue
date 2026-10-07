<template>
  <div v-if="config.enabled" class="concierge" :class="{ 'is-open': isOpen }">
    <!-- Chat panel -->
    <Transition name="concierge-panel">
      <section v-if="isOpen" class="concierge-panel" role="dialog" aria-label="YANA concierge">
        <header class="concierge-head">
          <div class="concierge-id">
            <span class="concierge-avatar" aria-hidden="true">
              <img src="/images/yana-logo-gold.svg" alt="">
            </span>
            <div>
              <p class="concierge-name">{{ config.name }}</p>
              <p v-if="config.status" class="concierge-status"><span class="concierge-dot" />{{ config.status }}</p>
            </div>
          </div>
          <button type="button" class="concierge-close" aria-label="Close chat" @click="isOpen = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M5 5l14 14M19 5 5 19" /></svg>
          </button>
        </header>

        <div ref="threadEl" class="concierge-thread" aria-live="polite">
          <div v-for="(msg, i) in messages" :key="i" class="concierge-msg" :class="`concierge-msg--${msg.from}`">
            <p v-for="(line, j) in msg.lines" :key="j">{{ line }}</p>
            <div v-if="msg.actions?.length" class="concierge-actions">
              <template v-for="action in msg.actions" :key="action.label">
                <NuxtLink v-if="action.to" :to="action.to" class="concierge-action" :class="{ 'is-primary': action.primary }" @click="isOpen = false">
                  {{ action.label }}
                </NuxtLink>
                <a v-else :href="action.href" target="_blank" rel="noopener" class="concierge-action" :class="{ 'is-primary': action.primary, 'is-whatsapp': action.whatsapp }">
                  {{ action.label }}
                </a>
              </template>
            </div>
          </div>
          <div v-if="isTyping" class="concierge-msg concierge-msg--bot concierge-typing" aria-label="Typing">
            <span /><span /><span />
          </div>
        </div>

        <div class="concierge-options">
          <button
            v-for="topic in topics"
            :key="topic.id"
            type="button"
            class="concierge-chip"
            :disabled="isTyping"
            @click="ask(topic)"
          >
            {{ topic.label }}
          </button>
        </div>
      </section>
    </Transition>

    <!-- Launchers -->
    <div class="concierge-launchers">
      <a
        v-show="!isOpen"
        :href="whatsappUrl"
        target="_blank"
        rel="noopener"
        class="concierge-wa"
        aria-label="Chat with YANA on WhatsApp"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm0 18.15a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.24-8.24 8.24Zm4.52-6.16c-.25-.12-1.47-.72-1.7-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z" /></svg>
      </a>
      <button
        type="button"
        class="concierge-launcher"
        :aria-label="isOpen ? 'Close chat' : 'Open chat'"
        :aria-expanded="isOpen"
        @click="toggle"
      >
        <svg v-if="!isOpen" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z" /><path d="M8 9.5h8M8 12.5h5" /></svg>
        <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19" /></svg>
        <span v-if="!isOpen && !hasOpened" class="concierge-badge" aria-hidden="true">1</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DEFAULT_CONCIERGE, conciergeWhatsappUrl, normalizeConcierge, resolveConciergeAction } from '#shared/utils/concierge'
import type { ConciergeTopic, ResolvedConciergeAction } from '#shared/utils/concierge'

// A scripted (no AI) concierge: fixed answers that steer guests to booking.
// Managers edit the greeting, options and replies in Admin → Website chatbot;
// until anything is saved it uses DEFAULT_CONCIERGE (shared/utils/concierge.ts).
const { data } = useFetch('/api/concierge', { lazy: true, default: () => DEFAULT_CONCIERGE })
const config = computed(() => normalizeConcierge(data.value))

const topics = computed(() => config.value.topics.filter(t => t.enabled))
const whatsappUrl = computed(() => conciergeWhatsappUrl(config.value))

interface Message { from: 'bot' | 'guest', lines: string[], actions?: ResolvedConciergeAction[] }

const splitLines = (text: string) => text.split('\n').map(l => l.trim()).filter(Boolean)

const isOpen = ref(false)
const hasOpened = ref(false)
const isTyping = ref(false)
const history = ref<Message[]>([])
const threadEl = ref<HTMLElement | null>(null)

// The greeting always reflects the latest settings; the rest is the visit's chat.
const messages = computed<Message[]>(() => [
  { from: 'bot', lines: splitLines(config.value.greeting) },
  ...history.value
])

function toggle() {
  isOpen.value = !isOpen.value
  hasOpened.value = true
}

async function scrollToEnd() {
  await nextTick()
  threadEl.value?.scrollTo({ top: threadEl.value.scrollHeight, behavior: 'smooth' })
}

function ask(topic: ConciergeTopic) {
  history.value.push({ from: 'guest', lines: [topic.label] })
  isTyping.value = true
  scrollToEnd()
  setTimeout(() => {
    isTyping.value = false
    history.value.push({
      from: 'bot',
      lines: splitLines(topic.reply),
      actions: topic.actions.map(a => resolveConciergeAction(a, config.value))
    })
    scrollToEnd()
  }, 650)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') isOpen.value = false
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.concierge {
  position: fixed;
  right: clamp(16px, 2.4vw, 32px);
  bottom: clamp(16px, 2.4vw, 32px);
  z-index: 150;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 14px;
  font-family: var(--sans);
}

/* ---------- Launchers ---------- */
.concierge-launchers {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.concierge-launcher,
.concierge-wa {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  box-shadow: 0 12px 30px -8px rgba(6, 14, 24, 0.45);
  transition: transform 0.3s ease, background 0.3s, color 0.3s;
}

.concierge-launcher {
  width: 52px;
  height: 52px;
  border: 1px solid var(--gold);
  background: var(--blue-dk);
  color: var(--gold);
  cursor: pointer;
}

.concierge-launcher:hover {
  transform: translateY(-2px);
  background: var(--gold);
  color: var(--blue-dk);
}

.concierge-wa {
  width: 52px;
  height: 52px;
  background: #25d366;
  color: #ffffff;
}

.concierge-wa:hover {
  transform: translateY(-2px);
}

.concierge-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--gold);
  color: var(--blue-dk);
  font-size: 11px;
  font-weight: 600;
}

/* ---------- Panel ---------- */
.concierge-panel {
  display: flex;
  flex-direction: column;
  width: min(370px, calc(100vw - 32px));
  height: min(560px, calc(100vh - 140px));
  height: min(560px, calc(100dvh - 140px));
  background: var(--panel);
  border: 1px solid rgba(217, 182, 144, 0.45);
  box-shadow: 0 30px 70px -20px rgba(6, 14, 24, 0.55);
  overflow: hidden;
  transform-origin: bottom right;
}

.concierge-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  background: linear-gradient(180deg, #08172a, #0d2440);
  color: #ffffff;
}

.concierge-id {
  display: flex;
  align-items: center;
  gap: 12px;
}

.concierge-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(217, 182, 144, 0.6);
  border-radius: 50%;
}

.concierge-avatar img {
  width: 26px;
  height: auto;
}

.concierge-name {
  margin: 0;
  font-size: 12.5px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--gold);
}

.concierge-status {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 3px 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.concierge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4ade80;
}

.concierge-close {
  display: inline-flex;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  padding: 4px;
}

.concierge-close:hover {
  color: var(--gold);
}

.concierge-thread {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px 16px;
}

.concierge-msg {
  max-width: 86%;
  padding: 11px 14px;
  font-size: 13.5px;
  line-height: 1.55;
}

.concierge-msg p {
  margin: 0;
}

.concierge-msg p + p {
  margin-top: 4px;
}

.concierge-msg--bot {
  align-self: flex-start;
  background: #ffffff;
  color: var(--ink);
  border: 1px solid rgba(217, 182, 144, 0.35);
}

.concierge-msg--guest {
  align-self: flex-end;
  background: var(--blue-dk);
  color: #ffffff;
}

.concierge-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.concierge-action {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid rgba(138, 107, 69, 0.5);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--gold-dk);
  text-decoration: none;
  transition: background 0.3s, color 0.3s, border-color 0.3s;
}

.concierge-action:hover {
  background: var(--gold-dk);
  border-color: var(--gold-dk);
  color: #ffffff;
}

.concierge-action.is-primary {
  background: var(--gold);
  border-color: var(--gold);
  color: var(--blue-dk);
}

.concierge-action.is-primary:hover {
  background: var(--blue-dk);
  border-color: var(--blue-dk);
  color: var(--gold);
}

.concierge-action.is-whatsapp {
  border-color: #25d366;
  color: #128c4b;
}

.concierge-action.is-whatsapp:hover {
  background: #25d366;
  color: #ffffff;
}

.concierge-typing {
  display: inline-flex;
  gap: 4px;
  padding: 14px;
}

.concierge-typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--gold-dk);
  animation: conciergeDot 1s infinite ease-in-out;
}

.concierge-typing span:nth-child(2) {
  animation-delay: 0.15s;
}

.concierge-typing span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes conciergeDot {
  0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
  40% { opacity: 1; transform: translateY(-3px); }
}

.concierge-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 14px 16px 16px;
  border-top: 1px solid rgba(217, 182, 144, 0.35);
  background: rgba(255, 255, 255, 0.5);
}

.concierge-chip {
  padding: 8px 13px;
  border: 1px solid rgba(15, 30, 46, 0.25);
  border-radius: 999px;
  background: #ffffff;
  font-family: inherit;
  font-size: 12.5px;
  color: var(--ink);
  cursor: pointer;
  transition: background 0.3s, color 0.3s, border-color 0.3s;
}

.concierge-chip:hover:not(:disabled) {
  background: var(--blue-dk);
  border-color: var(--blue-dk);
  color: #ffffff;
}

.concierge-chip:disabled {
  opacity: 0.5;
  cursor: default;
}

.concierge-panel-enter-active,
.concierge-panel-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.concierge-panel-enter-from,
.concierge-panel-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.97);
}

@media (max-width: 520px) {
  .concierge-launcher,
  .concierge-wa {
    width: 48px;
    height: 48px;
  }
}
</style>
