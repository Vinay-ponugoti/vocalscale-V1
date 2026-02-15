import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, Sparkles, Search, Filter } from 'lucide-react';
import { Header } from '../landing/components/Header';
import { Footer } from '../landing/components/Footer';
import { SEO } from '../../components/SEO';
import { blogPosts } from '../../data/blog-posts';

export default function BlogIndex() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(blogPosts.flatMap(post => post.tags)))];

  // Filter posts based on search and category
  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = activeCategory === 'All' || post.tags.includes(activeCategory);
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogPosts.find(p => p.featured) || blogPosts[0];
  const regularPosts = filteredPosts.filter(p => p.id !== featuredPost.id);

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100 selection:text-blue-900 flex flex-col relative overflow-hidden font-sans">
      <SEO
        title="VocalScale Blog | AI Receptionist Insights"
        description="Latest news, tips, and insights on AI receptionists, business automation, and customer service trends."
        canonical="https://www.vocalscale.com/blog"
      />

      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-slate-50 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col w-full">
        <Header />

        {/* Hero Section */}
        <section className="pt-32 pb-12 px-6 md:px-8 relative bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-[-0.03em] text-slate-900 mb-6 leading-tight">
                Insights for the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Modern Practice</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed mb-8">
                Discover strategies, success stories, and the latest in AI technology designed to transform how you handle patient communication.
              </p>
            </motion.div>

            {/* Featured Post Card (Hero) */}
            {activeCategory === 'All' && !searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-12 group relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 mix-blend-overlay z-0" />
                <div className="grid md:grid-cols-2 gap-8 md:gap-12 relative z-10">
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-200 text-xs font-bold uppercase tracking-wider rounded-full border border-blue-500/30 backdrop-blur-md">
                        Featured Article
                      </span>
                      <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        {featuredPost.readTime}
                      </span>
                    </div>
                    <Link to={`/blog/${featuredPost.slug}`} className="block group-hover:text-blue-200 transition-colors duration-300">
                      <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                        {featuredPost.title}
                      </h2>
                    </Link>
                    <p className="text-slate-300 text-lg mb-8 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700" />
                        <div>
                          <p className="text-sm font-bold text-white">{featuredPost.author.name}</p>
                          <p className="text-xs text-slate-400">{new Date(featuredPost.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Link
                        to={`/blog/${featuredPost.slug}`}
                        className="px-6 py-3 bg-white text-slate-900 rounded-full font-bold text-sm hover:bg-blue-50 transition-colors flex items-center gap-2"
                      >
                        Read Article <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                  <div className="min-h-[300px] md:min-h-full bg-slate-800 relative overflow-hidden">
                    {/* Image Placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center text-slate-700 bg-slate-800">
                      <Sparkles className="w-24 h-24 opacity-10" />
                    </div>
                    {/* In production, use standard img tag: <img src={featuredPost.image} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" /> */}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Filters & Grid */}
        <section className="py-12 px-6 md:px-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">

            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              {/* Search */}
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow shadow-sm"
                />
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeCategory === cat
                        ? 'bg-slate-900 text-white shadow-md transform scale-105'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            {regularPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {regularPosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
                  >
                    {/* Image */}
                    <div className="h-56 bg-slate-100 relative overflow-hidden group-hover:opacity-90 transition-opacity">
                      {/* Placeholder */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Filter className="w-12 h-12 text-slate-300" />
                      </div>
                    </div>

                    <div className="p-8 flex flex-col flex-grow">
                      <div className="flex gap-2 mb-4">
                        {post.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <Link to={`/blog/${post.slug}`}>
                        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                          {post.title}
                        </h3>
                      </Link>

                      <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3">
                        {post.excerpt}
                      </p>

                      <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between text-xs font-semibold text-slate-500">
                        <div className="flex items-center gap-2">
                          <span>{post.author.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(post.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.readTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No articles found</h3>
                <p className="text-slate-500">Try adjusting your search or category filter.</p>
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}