import { useParams, Navigate } from 'react-router-dom'
import { BlogPost } from '../components/BlogPost'
import { getPostBySlug, getAllPosts } from '../data/posts'
import { Card, CardContent } from '@/components/ui/Card'
import { BlogCard } from '../components/BlogCard'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getPostBySlug(slug) : undefined

  // Get related posts (same tags, excluding current)
  const relatedPosts = post 
    ? getAllPosts()
        .filter(p => p.id !== post.id && p.tags.some(tag => post.tags.includes(tag)))
        .slice(0, 3)
    : []

  if (!post) {
    return <Navigate to="/blog" replace />
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Post Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BlogPost post={post} />
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <BlogCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Browse All CTA */}
      <div className="bg-slate-100 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card>
            <CardContent className="py-8">
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Want to read more?
              </h3>
              <p className="text-slate-600 mb-4">
                Explore all our articles on AI voice technology and customer service.
              </p>
              <Link 
                to="/blog" 
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Browse all articles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
