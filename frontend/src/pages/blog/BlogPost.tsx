import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowLeft, Share2, Tag } from 'lucide-react';
import { Header } from '../landing/components/Header';
import { Footer } from '../landing/components/Footer';
import { SEO } from '../../components/SEO';
import { blogPosts } from '../../content/blog/posts';

export default function BlogPost() {
    const { slug } = useParams<{ slug: string }>();
    const post = blogPosts.find((p) => p.slug === slug);

    if (!post) {
        return <Navigate to="/blog" replace />;
    }

    return (
        <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900 flex flex-col relative overflow-hidden font-sans">
            <SEO
                title={`${post.title} | VocalScale Blog`}
                description={post.excerpt}
                canonical={`https://www.vocalscale.com/blog/${post.slug}`}
            />

            <div className="relative z-10 flex flex-col">
                <Header />

                <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
                    {/* Back Link */}
                    <div className="mb-8">
                        <Link
                            to="/blog"
                            className="inline-flex items-center text-slate-500 hover:text-blue-600 transition-colors font-medium text-sm group"
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
                                <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-full">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
                            {post.title}
                        </h1>

                        <div className="flex items-center space-x-6 text-sm text-slate-500 border-b border-slate-200 pb-8 font-medium">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-slate-200 mr-3 overflow-hidden">
                                    {/* Avatar Placeholder */}
                                    <User className="w-full h-full p-1 text-slate-400" />
                                </div>
                                <div>
                                    <span className="block text-slate-900 font-bold">{post.author.name}</span>
                                    <span className="text-xs text-slate-500">{post.author.role}</span>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                                {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-slate-400" />
                                {post.readTime}
                            </div>
                        </div>
                    </motion.header>

                    {/* Article Content */}
                    <div
                        className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-600 prose-img:rounded-xl"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Share Section */}
                    <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-center">
                        <div className="text-slate-500 text-sm font-medium">
                            Share this article
                        </div>
                        <div className="flex gap-4">
                            {/* Placeholders for social share */}
                            <button className="p-2 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors">
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </article>

                <Footer />
            </div>
        </div>
    );
}
