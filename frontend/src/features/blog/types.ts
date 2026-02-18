export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  author: {
    name: string
    avatar?: string
  }
  publishedAt: string
  updatedAt?: string
  tags: string[]
  featuredImage?: string
  readingTimeMinutes: number
  metaTitle?: string
  metaDescription?: string
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description?: string
}
