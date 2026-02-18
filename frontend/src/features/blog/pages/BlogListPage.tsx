import { BlogList } from '../components/BlogList'
import { getAllPosts } from '../data/posts'
import { Button } from '@/components/ui/Button'
import { ArrowRight, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'

export function BlogListPage() {
  const posts = getAllPosts()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">
              VocalScale Blog
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Insights on AI Voice Technology
          </h1>
          
          <p className="text-lg text-slate-600 max-w-2xl">
            Discover how AI voice agents are transforming businesses, improving customer experience, and reducing costs.
          </p>

          <div className="mt-8">
            <Link to="/signup">
              <Button size="lg" className="gap-2">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Blog Posts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BlogList posts={posts} />
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Customer Service?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join thousands of businesses using VocalScale AI voice agents.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="gap-2">
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
