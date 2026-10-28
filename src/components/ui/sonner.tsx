"use client"

import * as React from "react"
import { Toaster as Sonner, toast, useSonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const DEFAULT_TOAST_DURATION = 2200

const Toaster = ({ ...props }: ToasterProps) => {
  const { toasts } = useSonner()
  const timersRef = React.useRef<Map<string | number, number>>(new Map())

  React.useEffect(() => {
    const timers = timersRef.current
    const activeIds = new Set(toasts.map((t) => t.id))

    // Clean up timers for toasts that have already been dismissed
    for (const [id, timerId] of timers.entries()) {
      if (!activeIds.has(id)) {
        window.clearTimeout(timerId)
        timers.delete(id)
      }
    }

    // Keep only the newest toast visible so stacked toasts never expand and block the mobile header
    if (toasts.length > 1) {
      for (const older of toasts.slice(1)) {
        toast.dismiss(older.id)
      }
    }

    // Guarantee every non-loading toast auto-dismisses even on mobile touch / hover
    for (const t of toasts) {
      if (t.type === "loading" || t.duration === Infinity) continue
      if (!timers.has(t.id)) {
        const lifetime =
          typeof t.duration === "number" && t.duration > 0
            ? t.duration
            : DEFAULT_TOAST_DURATION
        const timerId = window.setTimeout(() => {
          timers.delete(t.id)
          toast.dismiss(t.id)
        }, lifetime)
        timers.set(t.id, timerId)
      }
    }
  }, [toasts])

  React.useEffect(() => {
    const timers = timersRef.current
    return () => {
      for (const timerId of timers.values()) {
        window.clearTimeout(timerId)
      }
      timers.clear()
    }
  }, [])

  return (
    <div
      onMouseOverCapture={(e) => e.stopPropagation()}
      onMouseMoveCapture={(e) => e.stopPropagation()}
      onPointerDownCapture={(e) => e.stopPropagation()}
      onClick={() => toast.dismiss()}
    >
      <Sonner
        theme="dark"
        visibleToasts={1}
        duration={DEFAULT_TOAST_DURATION}
        closeButton
        className="toaster group max-sm:!inset-x-3 max-sm:!w-[calc(100vw-1.5rem)]"
        mobileOffset={12}
        toastOptions={{
          classNames: {
            toast:
              "group toast cursor-pointer group-[.toaster]:glass-strong group-[.toaster]:w-full group-[.toaster]:text-foreground group-[.toaster]:shadow-2xl group-[.toaster]:rounded-xl",
            description: "group-[.toast]:text-muted-foreground",
            actionButton:
              "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
            cancelButton:
              "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
            closeButton:
              "group-[.toast]:!border-gold/30 group-[.toast]:!bg-background/90 group-[.toast]:!text-foreground",
          },
        }}
        {...props}
      />
    </div>
  )
}

export { Toaster }
