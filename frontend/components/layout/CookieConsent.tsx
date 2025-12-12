"use client"

import { useEffect, useRef } from "react"
import "vanilla-cookieconsent/dist/cookieconsent.css"
import { useLocale, useTranslations } from "next-intl"

type CookieConsentInstance = {
  destroy?: () => void
  showPreferences?: () => void
}

function loadScript(id: string, src: string, onload?: () => void) {
  if (document.getElementById(id)) return
  const script = document.createElement("script")
  script.id = id
  script.async = true
  script.src = src
  if (onload) script.onload = onload
  document.head.appendChild(script)
}

function loadAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  const ymId = process.env.NEXT_PUBLIC_YM_ID

  if (gaId) {
    loadScript("ga-script", `https://www.googletagmanager.com/gtag/js?id=${gaId}`, () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any
      w.dataLayer = w.dataLayer || []
      function gtag(...args: unknown[]) {
        w.dataLayer.push(args)
      }
      gtag("js", new Date())
      gtag("config", gaId)
    })
  }

  if (ymId) {
    loadScript("ym-script", `https://mc.yandex.ru/metrika/tag.js`, () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any
      w.ym =
        w.ym ||
        function (...args: unknown[]) {
          ;(w.ym.a = w.ym.a || []).push(args)
        }
      w.ym.l = Number(new Date())
      w.ym(ymId, "init", {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: false,
      })
    })
  }
}

type CookieConsentProps = {
  showFloatingButton?: boolean
}

export function CookieConsent({ showFloatingButton = false }: CookieConsentProps) {
  const locale = useLocale()
  const t = useTranslations("cookie")
  const instanceRef = useRef<CookieConsentInstance | null>(null)

  const initConsent = async () => {
    if (instanceRef.current) return
    const mod = await import("vanilla-cookieconsent")
    const cc =
      (mod as any).default && typeof (mod as any).default.run === "function"
        ? (mod as any).default
        : typeof (mod as any).run === "function"
          ? (mod as any)
          : null

    if (!cc || typeof cc.run !== "function") return

    const translations = {
      consentModal: {
        title: t("title"),
        description: t("description"),
        acceptAllBtn: t("acceptAll"),
        acceptNecessaryBtn: t("acceptNecessary"),
        showPreferencesBtn: t("showPrefs"),
      },
      preferencesModal: {
        title: t("prefsTitle"),
        acceptAllBtn: t("acceptAll"),
        acceptNecessaryBtn: t("acceptNecessary"),
        savePreferencesBtn: t("savePrefs"),
        closeIconLabel: t("close"),
        sections: [
          {
            title: t("prefsSectionEssentialTitle"),
            description: t("prefsSectionEssentialDesc"),
          },
          {
            title: t("prefsSectionAnalyticsTitle"),
            description: t("prefsSectionAnalyticsDesc"),
            linkedCategory: "analytics",
          },
        ],
      },
    }

    cc.run({
      guiOptions: {
        consentModal: {
          layout: "box",
          position: "bottom right",
          flipButtons: false,
        },
      },
      categories: {
        necessary: {
          enabled: true,
          readOnly: true,
        },
        analytics: {
          enabled: false,
        },
      },
      language: {
        default: locale,
        translations: {
          [locale]: translations,
        },
      },
      onConsent: ({ cookie }: { cookie: { categories: Record<string, boolean> } }) => {
        if (cookie.categories.analytics) {
          loadAnalytics()
        }
      },
    })

    instanceRef.current = cc
    // Expose a helper to open preferences from anywhere (e.g., footer link)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).openCookieSettings = () => cc.showPreferences?.()
  }

  useEffect(() => {
    let isMounted = true
    if (!isMounted) return
    void initConsent()
    return () => {
      isMounted = false
      instanceRef.current?.destroy?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])

  if (!showFloatingButton) return null

  return (
    <button
      type="button"
      className="fixed bottom-4 right-4 z-50 rounded-md bg-background/80 px-3 py-2 text-xs text-muted-foreground shadow hover:bg-background transition-colors"
      onClick={() => {
        if (!instanceRef.current) {
          void initConsent() // try initialize on demand
          return
        }
        instanceRef.current.showPreferences?.()
      }}
    >
      {t("showPrefs")}
    </button>
  )
}

