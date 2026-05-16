'use client'

import {useCallback, useEffect, useRef, useState} from 'react'

const COLLAPSE_THRESHOLD = 140
const SNAP_MIN = 200
const DEFAULT_WIDTH = 260
const MAX_WIDTH = 400
const STORAGE_KEY = 'hajime-sidebar-w'

const getValidWidth = (value: number) => {
  if (!Number.isFinite(value) || value < SNAP_MIN) return DEFAULT_WIDTH
  return Math.min(value, MAX_WIDTH)
}

const getStoredWidth = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved ? getValidWidth(parseInt(saved, 10)) : DEFAULT_WIDTH
}

export const useSidebarResize = () => {
  const [width, setWidth] = useState(DEFAULT_WIDTH)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const dragging = useRef(false)
  const startX = useRef(0)
  const startW = useRef(0)

  // Load persisted width after mount to avoid SSR hydration mismatch
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setWidth(getStoredWidth())
    })

    return () => cancelAnimationFrame(frame)
  }, [])

  const onDragStart = useCallback(
    (e: React.MouseEvent) => {
      dragging.current = true
      startX.current = e.clientX
      startW.current = width
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      e.preventDefault()
    },
    [width],
  )

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      const next = Math.max(0, Math.min(MAX_WIDTH, startW.current + e.clientX - startX.current))
      setWidth(next)
    }

    const onUp = () => {
      if (!dragging.current) return
      dragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      setWidth((prev) => {
        if (prev < COLLAPSE_THRESHOLD) {
          setIsCollapsed(true)
          localStorage.setItem(STORAGE_KEY, String(DEFAULT_WIDTH))
          return DEFAULT_WIDTH
        }
        const snapped = Math.max(SNAP_MIN, prev)
        localStorage.setItem(STORAGE_KEY, String(snapped))
        return snapped
      })
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [])

  const expandSidebar = useCallback(() => {
    setWidth((prev) => {
      const next = prev >= SNAP_MIN ? getValidWidth(prev) : getStoredWidth()
      localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
    setIsCollapsed(false)
  }, [])

  const collapseSidebar = useCallback(() => {
    setIsCollapsed(true)
  }, [])

  const toggleCollapse = useCallback(() => {
    if (isCollapsed) {
      expandSidebar()
      return
    }

    collapseSidebar()
  }, [collapseSidebar, expandSidebar, isCollapsed])

  return {width, isCollapsed, onDragStart, toggleCollapse}
}
