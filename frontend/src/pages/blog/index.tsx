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
  const topics = allTags.filter(t => t !== 'Product Updates').slice(0, 8);

  // Filter posts
  let filteredPosts = blogPosts.filter(post => {
    const matchesCategory = activeCategory === 'All'
      ? !post.tags.includes('Product Updates') // Exclude product updates from "All" (assumed standard behavior) or keep them? User said "remove all blogs keep only one", likely referring to the Blog tab.
      : post.tags.includes(activeCategory);

    // For 'All' or generic 'Blog' category, we might want to exclude Product Updates if they are treated separately
    // But for now, let's just stick to the category filter.

    // Specific constraint: "in blog page remove all blogs keeps only one"
    // This implies for the main list view, we show only 1.
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort by date desc
  filteredPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // APPLY LIMIT CONSTRAINT
  // Show more posts in standard blog view (not Product Updates), limit to 10 posts
  if (activeCategory !== 'Product Updates') {
    filteredPosts = filteredPosts.slice(0, 10);
  }

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
      <SEO
        title="VocalScale Blog | AI Receptionist Insights"
        description="Latest news, tips, and insights on AI receptionists, business automation, and customer service trends."
        canonical="https://www.vocalscale.com/blog"
      />

      {/* Dot Background Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 flex flex-col w-full">
        <Header />

        <main className="pt-48 pb-24 px-6 md:px-8 max-w-7xl mx-auto w-full">
          {/* Page Title */}
          <div className="mb-20 text-center">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
              {activeCategory === 'Product Updates' ? 'Product Updates' : 'VocalScale Blog'}
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              {activeCategory === 'Product Updates'
                ? 'New features, improvements, and fixes.'
                : 'Insights on customer service, product updates, engineering, and tips to deliver exceptional support experiences.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Sidebar */}
            <aside className="lg:col-span-3 space-y-12 order-2 lg:order-1 lg:sticky lg:top-32 self-start">

              {/* Categories */}
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
                  <button
                    onClick={() => setActiveCategory('Product Updates')}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-colors flex items-center gap-3 ${activeCategory === 'Product Updates' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                  >
                    <span className="text-lg">🚀</span> Product Updates
                  </button>
                </div>
              </div>

              {/* Topics */}
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

            {/* Content Area */}
            <div className="lg:col-span-9 order-1 lg:order-2 space-y-16">

              {/* LAYOUT: TIMELINE (For Product Updates) */}
              {activeCategory === 'Product Updates' ? (
                <div className="space-y-20 border-l border-slate-100 ml-4 md:ml-0 pl-8 md:pl-0 md:border-l-0">
                  {filteredPosts.map((post) => (
                    <article key={post.id} className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 relative">

                      {/* Timeline Date (Left) */}
                      <div className="md:col-span-3 text-left md:text-right">
                        <div className="sticky top-40">
                          <span className="text-sm font-bold text-slate-500 block mb-1">
                            {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                          </span>
                          {/* Optional dot for timeline effect on mobile if desired, but sticking to screenshot cleanliness */}
                        </div>
                      </div>

                      {/* Content (Right) */}
                      <div className="md:col-span-9">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">
                          {post.title}
                        </h2>

                        {/* Render HTML Content safely */}
                        <div
                          className="prose prose-slate prose-sm max-w-none 
                                prose-headings:font-bold prose-headings:text-slate-900 prose-headings:text-sm prose-headings:uppercase prose-headings:tracking-wider prose-headings:mb-3
                                prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-4
                                prose-ul:list-disc prose-ul:pl-4 prose-ul:space-y-2 prose-li:text-slate-600
                                prose-a:text-blue-600 prose-strong:text-slate-800"
                          dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-slate-50">
                          {/* Small Avatar */}
                          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                            {/* <img src={post.author.avatar} ... /> */}
                          </div>
                          <span className="text-sm font-bold text-slate-700">
                            {post.author.name}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                /* LAYOUT: STANDARD LIST (For Blog/All - Limited to 1) */
                filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="flex flex-col md:flex-row gap-6 items-start group"
                    >
                      {/* Image - Smaller */}
                      <div className="w-full md:w-4/12 aspect-[3/2] bg-slate-100 rounded-xl overflow-hidden relative shadow-sm border border-slate-100/50">
                        <Link to={`/blog/${post.slug}`} className="block h-full w-full">
                          <div className="absolute inset-0 flex items-center justify-center text-slate-300 bg-slate-50">
                            <Filter className="w-8 h-8 opacity-20" />
                          </div>
                        </Link>
                      </div>

                      {/* Content - Compact */}
                      <div className="w-full md:w-8/12 py-1">
                        <div className="flex items-center gap-3 text-xs font-semibold mb-2">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] uppercase tracking-wider">
                            {post.tags[0] || 'Featured'}
                          </span>
                          <span className="text-slate-400">
                            {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>

                        <Link to={`/blog/${post.slug}`}>
                          <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors leading-tight">
                            {post.title}
                          </h2>
                        </Link>

                        <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>

                        <div className="flex items-center gap-2">
                          {/* <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden"></div> */}
                          <span className="text-xs font-bold text-slate-700">
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
                )
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
