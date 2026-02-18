import { Link } from 'react-router-dom'
import type { BlogPost } from '../types'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Clock, User, ArrowRight } from 'lucide-react'

interface BlogCardProps {
  post: BlogPost
}

export function BlogCard({ post }: BlogCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Card className="group h-full flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 border-slate-200">
      {/* Featured Image */}
      {post.featuredImage && (
        <div className="aspect-video overflow-hidden bg-slate-100">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback to placeholder if image fails
              (e.target as HTMLImageElement).src = '/images/blog/placeholder.jpg'
            }}
          />
        </div>
      )}

      <CardHeader className="pb-3">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {post.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Title */}
        <Link to={`/blog/${post.slug}`}>
          <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Excerpt */}
        <p className="text-slate-600 text-sm line-clamp-3 mb-4 flex-1">
          {post.excerpt}
        </p>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {post.author.name}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.readingTimeMinutes} min read
            </span>
          </div>
          <span>{formatDate(post.publishedAt)}</span>
        </div>

        {/* Read More Link */}
        <Link
          to={`/blog/${post.slug}`}
          className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 group/link"
        >
          Read article
          <ArrowRight className="ml-1 h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </CardContent>
    </Card>
  )
}
