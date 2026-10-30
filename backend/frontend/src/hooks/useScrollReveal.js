import { useEffect } from 'react'

export function useScrollReveal(dependency) {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.reducedMotion === 'true'
    const elements = document.querySelectorAll('[data-reveal], .landing main > section, .page-content > section, .page-content > .panel, .page-content > .dashboard-grid')

    if (reduced || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'))
      return undefined
    }

    elements.forEach((element, index) => {
      element.classList.add('reveal-ready')
      element.style.setProperty('--reveal-delay', `${Math.min(index * 35, 180)}ms`)
    })

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.08, rootMargin: '0px 0px -40px' })

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [dependency])
}
