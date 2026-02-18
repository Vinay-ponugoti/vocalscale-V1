import type { BlogPost } from '../types'
import { BlogCard } from './BlogCard'
import InputField from '@/components/ui/InputField'
import { Badge } from '@/components/ui/Badge'
import { Search, Tag } from 'lucide-react'
import { useState, useMemo } from 'react'

interface BlogListProps {
  posts: BlogPost[]
  showSearch?: boolean
  showTags?: boolean
}

export function BlogList({ posts, showSearch = true, showTags = true }: BlogListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    posts.forEach(post => post.tags.forEach(tag => tags.add(tag)))
    return Array.from(tags).sort()
  }, [posts])

  // Filter posts based on search and tag
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = !searchQuery || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesTag = !selectedTag || post.tags.includes(selectedTag)
      
      return matchesSearch && matchesTag
    })
  }, [posts, searchQuery, selectedTag])

  return (
    <div className="space-y-8">
      {/* Search and Filter */}
      {(showSearch || showTags) && (
        <div className="space-y-4">
          {/* Search */}
          {showSearch && (
            <div className="relative max-w-md">
              <InputField
                label="Search articles"
                icon={Search}
                type="search"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                containerClassName="mb-0"
              />
            </div>
          )}

          {/* Tags Filter */}
          {showTags && allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1 text-sm text-slate-500 mr-2">
                <Tag className="h-4 w-4" />
                Filter by:
              </span>
              <Badge
                variant={selectedTag === null ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedTag(null)}
              >
                All
              </Badge>
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-slate-500">
        Showing {filteredPosts.length} of {posts.length} articles
      </div>

      {/* Posts Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-500 text-lg">No articles found</p>
          <p className="text-slate-400 text-sm mt-1">
            Try adjusting your search or filter
          </p>
        </div>
      )}
    </div>
  )
}
