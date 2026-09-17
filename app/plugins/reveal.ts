export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('reveal', {
    mounted(el: HTMLElement, binding) {
      const opts = binding.value || {}
      const y = opts.y ?? 24
      const duration = opts.duration ?? 1.1
      const delay = opts.delay ?? 0

      el.style.opacity = '0'
      el.style.transform = `translateY(${y}px)`
      el.style.transition = `opacity ${duration}s cubic-bezier(.2,.7,.2,1) ${delay}s, transform ${duration}s cubic-bezier(.2,.7,.2,1) ${delay}s`

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              el.style.opacity = '1'
              el.style.transform = 'none'
              io.unobserve(el)
            }
          })
        },
        { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
      )
      io.observe(el)
    }
  })
})
