export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u0590-\u05FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function getDirection(language: string): 'rtl' | 'ltr' {
  return language === 'he' ? 'rtl' : 'ltr'
}

export function sanitizeSearchQuery(query: string): string {
  return query.replace(/[%_,\\]/g, '').trim()
}
