"use client"

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground px-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold">Offline</h1>
        <p className="text-muted-foreground">
          You are offline. Cached pages will be available when the network is restored.
        </p>
      </div>
    </div>
  )
}

