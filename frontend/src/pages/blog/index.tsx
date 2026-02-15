import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, Sparkles, Search, Filter } from 'lucide-react';
import { Header } from '../landing/components/Header';
import { Footer } from '../landing/components/Footer';
import { SEO } from '../../components/SEO';
import { blogPosts } from '../../content/blog/posts';

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
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900 flex flex-col font-sans">
      <SEO
        title="VocalScale Blog | AI Receptionist Insights"
        description="Latest news, tips, and insights on AI receptionists, business automation, and customer service trends."
        canonical="https://www.vocalscale.com/blog"
      />

      <Header />

      <main className="pt-32 pb-24 px-6 md:px-8 max-w-7xl mx-auto w-full">
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
          <aside className="lg:col-span-3 lg:sticky lg:top-32 self-start space-y-10 order-2 lg:order-1">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Newsletter (Optional Placeholder) */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-2">Subscribe</h3>
              <p className="text-sm text-slate-500 mb-4">Get the latest updates delivered to your inbox.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="Email" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-9 order-1 lg:order-2 space-y-16">

            {/* Featured Post */}
            {activeCategory === 'All' && !searchQuery && (
              <section className="group cursor-pointer">
                <Link to={`/blog/${featuredPost.slug}`}>
                  <div className="relative overflow-hidden rounded-2xl bg-slate-100 mb-6 aspect-[2/1]">
                    {/* Image Placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-200 text-slate-400">
                      <Sparkles className="w-16 h-16 opacity-20" />
                    </div>
                    {/* <img src={featuredPost.image} alt={featuredPost.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> */}
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <span className="text-blue-600">{featuredPost.tags[0]}</span>
                      <span>•</span>
                      <span>{featuredPost.readTime}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                      {featuredPost.title}
                    </h2>
                    <p className="text-lg text-slate-600 line-clamp-2 leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200" />
                      <div className="text-sm font-medium text-slate-900">
                        {featuredPost.author.name}
                      </div>
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* Divider */}
            <div className="w-full h-px bg-slate-100" />

            {/* Recent Posts List */}
            <div className="space-y-12">
              {regularPosts.length > 0 ? (
                regularPosts.map((post) => (
                  <Link key={post.id} to={`/blog/${post.slug}`} className="group block">
                    <article className="grid md:grid-cols-12 gap-6 md:gap-8 items-start">
                      {/* Image (Right on desktop for list view, or Left? Chatwoot usually is Image Right or Left. Let's do Image Right for variety or keep standard Image Left) */}
                      {/* Let's go with Image RIGHT for a clean text-first reading experience, or Image LEFT for standard. Chatwoot analysis said "Vertical list... image-left, text-right" */}

                      <div className="md:col-span-4 order-1 md:order-1">
                        <div className="aspect-[4/3] rounded-xl bg-slate-100 overflow-hidden relative">
                          <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                            <Filter className="w-8 h-8 opacity-20" />
                          </div>
                          {/* <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> */}
                        </div>
                      </div>

                      <div className="md:col-span-8 order-2 md:order-2 flex flex-col justify-center h-full">
                        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                          <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{post.tags[0]}</span>
                          <span>{new Date(post.date).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-slate-600 leading-relaxed line-clamp-2 mb-4">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                          <span>Read more</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </article>
                  </Link>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-500">No articles found matching your criteria.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}