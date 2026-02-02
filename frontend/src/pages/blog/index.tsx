import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, Tag } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  tags: string[];
  slug: string;
  image: string;
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "How AI Receptionists Are Transforming Healthcare Practices in 2024",
    excerpt: "Discover how medical practices are reducing missed calls by 85% and saving $50,000+ annually with AI receptionist technology.",
    content: "Full article content here...",
    author: "Dr. Sarah Johnson",
    date: "2024-01-15",
    readTime: "8 min read",
    tags: ["Healthcare", "AI", "Medical Practice"],
    slug: "ai-receptionists-healthcare-2024",
    image: "/api/placeholder/800/400"
  },
  {
    id: "2",
    title: "The ROI of AI Receptionists: A Complete Cost-Benefit Analysis",
    excerpt: "Comprehensive analysis showing how businesses save 70% on reception costs while improving customer satisfaction scores.",
    content: "Full article content here...",
    author: "Michael Chen",
    date: "2024-01-10",
    readTime: "12 min read",
    tags: ["ROI", "Cost Analysis", "Business"],
    slug: "roi-ai-receptionists-complete-analysis",
    image: "/api/placeholder/800/400"
  },
  {
    id: "3",
    title: "Legal Firms: Never Miss a Potential Client Call Again",
    excerpt: "How law firms are using AI receptionists to capture 40% more leads and provide 24/7 client intake without hiring additional staff.",
    content: "Full article content here...",
    author: "Jennifer Martinez",
    date: "2024-01-08",
    readTime: "10 min read",
    tags: ["Legal", "Lead Generation", "Client Intake"],
    slug: "legal-firms-never-miss-calls",
    image: "/api/placeholder/800/400"
  },
  {
    id: "4",
    title: "Small Business Guide: Implementing AI Receptionists in 30 Days",
    excerpt: "Step-by-step guide for small businesses to deploy AI receptionist technology quickly and effectively.",
    content: "Full article content here...",
    author: "David Thompson",
    date: "2024-01-05",
    readTime: "15 min read",
    tags: ["Small Business", "Implementation", "Guide"],
    slug: "small-business-ai-receptionist-guide",
    image: "/api/placeholder/800/400"
  },
  {
    id: "5",
    title: "Customer Service Revolution: AI vs Human Receptionists Performance Study",
    excerpt: "Data-driven comparison of AI receptionists vs human staff across 500+ businesses showing surprising results.",
    content: "Full article content here...",
    author: "Lisa Anderson",
    date: "2024-01-03",
    readTime: "11 min read",
    tags: ["Customer Service", "Performance", "Study"],
    slug: "ai-vs-human-receptionists-performance",
    image: "/api/placeholder/800/400"
  }
];

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
              VocalScale
            </Link>
            <nav className="flex space-x-8">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link to="/features" className="text-gray-600 hover:text-gray-900">
                Features
              </Link>
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-gray-900 mb-6"
          >
            VocalScale Blog
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
          >
            Discover insights, strategies, and success stories about AI receptionist technology 
            and how it's transforming businesses across industries.
          </motion.p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Image */}
                <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Tag className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-sm text-gray-600">Blog Post Image</p>
                  </div>
                </div>

                <div className="p-6">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600">
                    <Link to={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>

                  {/* Excerpt */}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {post.readTime}
                    </div>
                  </div>

                  {/* Author */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      By {post.author}
                    </span>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Read More
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white mb-4"
          >
            Ready to Transform Your Business?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-blue-100 mb-8"
          >
            Join thousands of businesses already using AI receptionists to handle calls 24/7
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}