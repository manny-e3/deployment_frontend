/**
 * Utility functions for formatting dates, durations, and commit messages
 */

export function formatTimeAgo(dateInput) {
  if (!dateInput) return 'Recently'
  const date = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (isNaN(diffInSeconds) || diffInSeconds < 0) return 'Just now'
  if (diffInSeconds < 45) return 'Just now'
  if (diffInSeconds < 90) return '1m ago'

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) return `${diffInDays}d ago`

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) return `${diffInMonths}mo ago`

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function formatDuration(startedAt, finishedAt) {
  if (!startedAt) return null
  const start = new Date(startedAt).getTime()
  const end = finishedAt ? new Date(finishedAt).getTime() : Date.now()
  const diffSec = Math.max(0, Math.floor((end - start) / 1000))

  if (diffSec < 60) return `${diffSec}s`
  const minutes = Math.floor(diffSec / 60)
  const remainingSec = diffSec % 60
  return `${minutes}m ${remainingSec}s`
}

export function truncateText(text, maxLength = 40) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
