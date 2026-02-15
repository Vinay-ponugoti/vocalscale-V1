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

  // Extract unique categories (Limit to top 5 + All)
  const allCategories = Array.from(new Set(blogPosts.flatMap(post => post.tags)));
  const categories = ['All', ...allCategories.slice(0, 5)];

  // Filter posts based on search and category
  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = activeCategory === 'All' || post.tags.includes(activeCategory);
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100 selection:text-blue-900 flex flex-col relative overflow-hidden font-sans">
      <SEO
        title="VocalScale Blog | AI Receptionist Insights"
        description="Latest news, tips, and insights on AI receptionists, business automation, and customer service trends."
        canonical="https://www.vocalscale.com/blog"
      />

      {/* Background Effects (Restored for 'website design' consistency) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-slate-50 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col w-full">
        <Header />

        <main className="pt-40 pb-24 px-6 md:px-8 max-w-7xl mx-auto w-full">
          {/* Page Title */}
          <div className="mb-16 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              Blog
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl leading-relaxed">
              Thoughts, stories, and ideas about the future of AI in business communication.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Sidebar */}
            <aside className="lg:col-span-3 lg:sticky lg:top-40 self-start space-y-10 order-2 lg:order-1">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                />
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Categories
                </h3>
                <div className="flex flex-col gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeCategory === cat
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Content */}
            <div className="lg:col-span-9 order-1 lg:order-2">
              {/* Grid of Small Cards */}
              {filteredPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPosts.map((post, index) => (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
                    >
                      {/* Image */}
                      <div className="h-48 bg-slate-100 relative overflow-hidden group-hover:opacity-90 transition-opacity">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Filter className="w-8 h-8 text-slate-300 opacity-50" />
                        </div>
                        {/* <img src={post.image} alt={post.title} className="w-full h-full object-cover" /> */}

                        <div className="absolute top-4 left-4">
                          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">
                            {post.tags[0]}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold mb-3">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.date).toLocaleDateString()}
                        </div>

                        <Link to={`/blog/${post.slug}`}>
                          <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                            {post.title}
                          </h3>
                        </Link>

                        <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>

                        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-semibold text-slate-400">
                          <span>{post.readTime}</span>
                          <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-blue-600">
                            Read <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-white rounded-3xl border border-slate-100">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">No articles found</h3>
                  <p className="text-slate-500 text-sm">Try adjusting your search or category filter.</p>
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