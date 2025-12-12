"use client"

import { useEffect, useState } from "react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }

    const handleInstalled = () => {
      setVisible(false)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)
    window.addEventListener("appinstalled", handleInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
      window.removeEventListener("appinstalled", handleInstalled)
    }
  }, [])

  const onInstall = async () => {
    if (!deferredPrompt) return
    setBusy(true)
    try {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === "accepted") {
        setVisible(false)
        setDeferredPrompt(null)
      }
    } finally {
      setBusy(false)
    }
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 rounded-md border bg-background/90 px-3 py-2 shadow">
      <div className="flex items-center gap-3">
        <div className="text-sm font-medium">Установить как приложение?</div>
        <button
          type="button"
          className="rounded-md bg-foreground px-3 py-1 text-xs text-background hover:bg-foreground/90 transition-colors disabled:opacity-60"
          onClick={onInstall}
          disabled={busy}
        >
          Установить
        </button>
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setVisible(false)}
        >
          Позже
        </button>
      </div>
    </div>
  )
}

