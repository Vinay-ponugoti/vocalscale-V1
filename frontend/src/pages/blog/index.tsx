import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, Tag, Sparkles } from 'lucide-react';
import { Header } from '../landing/components/Header';
import { Footer } from '../landing/components/Footer';

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
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100 selection:text-blue-900 flex flex-col relative overflow-hidden">
      {/* Background Effects - "Luminous Enterprise" */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Soft Modern Gradients */}
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-blue-200/40 blur-[120px] rounded-full mix-blend-multiply"
        />
        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
            scale: [1.1, 1, 1.1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-200/40 blur-[120px] rounded-full mix-blend-multiply"
        />

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        {/* White fade at bottom to blend content */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-slate-50 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col">
        <Header />

        {/* Hero Section */}
        <section className="pt-32 pb-16 px-6 md:px-8 relative">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 backdrop-blur-sm mb-6 md:mb-8 shadow-sm"
            >
              <Sparkles className="h-4 w-4 text-blue-600 fill-blue-600/20" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Insights & Updates</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-7xl font-black tracking-[-0.03em] text-slate-900 mb-6 md:mb-8 leading-[1.1] md:leading-[1.05]"
            >
              VocalScale <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 italic tracking-tight">Blog</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base md:text-xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed mb-8"
            >
              Discover insights, strategies, and success stories about AI receptionist technology
              and how it's transforming businesses across industries.
            </motion.p>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="pb-24 px-6 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white/60 backdrop-blur-sm rounded-[2rem] border border-slate-200 overflow-hidden hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group flex flex-col h-full"
                >
                  {/* Image Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border-b border-slate-100 relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-slate-900/[0.05] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
                    <div className="text-center relative z-10 p-6">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform duration-500 text-blue-600">
                        <Tag className="w-8 h-8" />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 flex flex-col flex-grow">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider rounded-full border border-blue-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                      <Link to={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h2>

                    {/* Excerpt */}
                    <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="mt-auto pt-6 border-t border-slate-100/50">
                      {/* Meta */}
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1.5" />
                          {new Date(post.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1.5" />
                          {post.readTime}
                        </div>
                      </div>

                      {/* Author */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">
                          By {post.author}
                        </span>
                        <Link
                          to={`/blog/${post.slug}`}
                          className="inline-flex items-center text-blue-600 hover:text-blue-700 text-xs font-black uppercase tracking-wider group/link"
                        >
                          Read Article
                          <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover/link:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-slate-900 text-white z-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
          </div>

          <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-black tracking-tight text-white mb-6"
            >
              Ready to Transform Your Business?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Join thousands of businesses already using AI receptionists to handle calls 24/7 with zero missed opportunities.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link
                to="/signup"
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-full hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 active:scale-95"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}