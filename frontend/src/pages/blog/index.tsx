import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, Search, Filter } from 'lucide-react';
import { Header } from '../landing/components/Header';
import { Footer } from '../landing/components/Footer';
import { SEO } from '../../components/SEO';
import { blogPosts } from '../../content/blog/posts';

export default function BlogIndex() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique tags (limit to 8 for "Topics")
  const allTags = Array.from(new Set(blogPosts.flatMap(post => post.tags)));
  const topics = allTags.slice(0, 8);

  // Filter posts
  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = activeCategory === 'All' || post.tags.includes(activeCategory);
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
      <SEO
        title="VocalScale Blog | AI Receptionist Insights"
        description="Latest news, tips, and insights on AI receptionists, business automation, and customer service trends."
        canonical="https://www.vocalscale.com/blog"
      />

      {/* Dot Background Pattern - Matches "Space design" */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 flex flex-col w-full">
        <Header />

        <main className="pt-48 pb-24 px-6 md:px-8 max-w-7xl mx-auto w-full">
          {/* Page Title - Centered & Clean */}
          <div className="mb-20 text-center">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
              VocalScale Blog
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Insights on customer service, product updates, engineering, and tips to deliver exceptional support experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Sidebar - Left */}
            <aside className="lg:col-span-3 space-y-12 order-2 lg:order-1">

              {/* Categories Section */}
              <div>
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">
                  Categories
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveCategory('All')}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-colors flex items-center gap-3 ${activeCategory === 'All' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                  >
                    <span className="text-lg">📰</span> Blog
                  </button>
                  {/* Mock "Product Updates" to match screenshot vibe */}
                  <button
                    className="w-full text-left px-4 py-3 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-3"
                  >
                    <span className="text-lg">🚀</span> Product Updates
                  </button>
                </div>
              </div>

              {/* Topics Section (Pills) */}
              <div>
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">
                  Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {topics.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setActiveCategory(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${activeCategory === tag
                          ? 'bg-blue-50 border-blue-200 text-blue-600'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Content - Right (Vertical List) */}
            <div className="lg:col-span-9 order-1 lg:order-2 space-y-16">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row gap-8 items-start group"
                  >
                    {/* Image - Rounded & Clean */}
                    <div className="w-full md:w-5/12 aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden relative shadow-sm border border-slate-100/50">
                      <Link to={`/blog/${post.slug}`} className="block h-full w-full">
                        <div className="absolute inset-0 flex items-center justify-center text-slate-300 bg-slate-50">
                          <Filter className="w-10 h-10 opacity-20" />
                        </div>
                        {/* <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" /> */}
                      </Link>
                    </div>

                    {/* Content */}
                    <div className="w-full md:w-7/12 py-2">
                      {/* Meta Top */}
                      <div className="flex items-center gap-3 text-xs font-semibold mb-3">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md">
                          {post.tags[0] || 'Featured'}
                        </span>
                        <span className="text-slate-400">
                          {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      <Link to={`/blog/${post.slug}`}>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                          {post.title}
                        </h2>
                      </Link>

                      <p className="text-slate-500 leading-relaxed mb-6 line-clamp-3">
                        {post.excerpt}
                      </p>

                      {/* Author */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                          {/* img placeholder */}
                        </div>
                        <span className="text-sm font-bold text-slate-700">
                          {post.author.name}
                        </span>
                      </div>
                    </div>
                  </motion.article>
                ))
              ) : (
                <div className="text-center py-20">
                  <h3 className="text-lg font-bold text-slate-900">No articles found</h3>
                  <p className="text-slate-500">Try adjusting your filters.</p>
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}