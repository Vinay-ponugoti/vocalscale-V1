import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowLeft, Share2, Tag } from 'lucide-react';
import { Header } from '../landing/components/Header';
import { Footer } from '../landing/components/Footer';
import { SEO } from '../../components/SEO';
import { blogPosts } from '../../content/blog/posts';
import { sanitizeHtml } from '../../lib/sanitize';

export default function BlogPost() {
    const { slug } = useParams<{ slug: string }>();
    const post = blogPosts.find((p) => p.slug === slug);

    if (!post) {
        return <Navigate to="/blog" replace />;
    }

    // Get related posts (exclude current, take 3)
    const relatedPosts = blogPosts
        .filter(p => p.id !== post.id)
        .slice(0, 3);

    return (
        <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900 flex flex-col font-sans">
            <SEO
                title={`${post.title} | VocalScale Blog`}
                description={post.excerpt}
                canonical={`https://www.vocalscale.com/blog/${post.slug}`}
            />

            <Header />

            <div className="flex-grow">
                <article className="max-w-3xl mx-auto px-6 md:px-8 py-24 md:py-32">
                    {/* Back Link */}
                    <div className="mb-10">
                        <Link
                            to="/blog"
                            className="inline-flex items-center text-slate-500 hover:text-blue-600 transition-colors font-semibold text-sm group tracking-wide"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Blog
                        </Link>
                    </div>

                    {/* Article Header */}
                    <motion.header
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <div className="flex flex-wrap gap-2 mb-6">
                            {post.tags.map((tag) => (
                                <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-md">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-8 leading-tight tracking-tight">
                            {post.title}
                        </h1>

                        <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="block text-slate-900 font-bold text-sm">{post.author.name}</span>
                                    <span className="text-xs text-slate-500 font-medium">{post.author.role}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 text-sm font-semibold text-slate-400">
                                <span className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(post.date).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {post.readTime}
                                </span>
                            </div>
                        </div>
                    </motion.header>

                    {/* Article Content */}
                    {/* SECURITY NOTE: dangerouslySetInnerHTML is used here for blog content rendering.
                        All HTML is sanitized using DOMPurify (sanitizeHtml) to prevent XSS attacks.
                        Blog post content is currently from hardcoded posts.ts data (safe source).
                        If migrating to a CMS in the future, ensure server-side validation and
                        additional sanitization are implemented.
                    */}
                    <div
                        className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-600 prose-img:rounded-2xl prose-strong:text-slate-900 prose-p:leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
                    />

                    {/* Share Section */}
                    <div className="mt-16 pt-8 border-t border-slate-100 flex justify-between items-center">
                        <div className="text-slate-500 text-sm font-bold uppercase tracking-wider">
                            Share this article
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2.5 rounded-full bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors">
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </article>

                {/* Related Articles */}
                {relatedPosts.length > 0 && (
                    <section className="bg-slate-50 py-20 px-6 md:px-8">
                        <div className="max-w-7xl mx-auto">
                            <h2 className="text-2xl font-black text-slate-900 mb-10 tracking-tight">Read Next</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {relatedPosts.map((related) => (
                                    <Link key={related.id} to={`/blog/${related.slug}`} className="group block">
                                        <div className="aspect-[3/2] bg-white rounded-2xl overflow-hidden mb-4 relative shadow-sm group-hover:shadow-md transition-shadow">
                                            <div className="absolute inset-0 flex items-center justify-center text-slate-200">
                                                <Tag className="w-8 h-8" />
                                            </div>
                                            {/* <img src={related.image} alt={related.title} className="w-full h-full object-cover" /> */}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">{related.tags[0]}</div>
                                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                                                {related.title}
                                            </h3>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </div>

            <Footer />
        </div>
    );
}
