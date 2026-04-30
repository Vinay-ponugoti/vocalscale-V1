export const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "VocalScale",
    "alternateName": "VocalScale AI Receptionist",
    "url": "https://vocalscale.com",
    "logo": "https://vocalscale.com/logo.png",
    "description": "VocalScale provides AI-powered voice agents and 24/7 AI receptionists for small businesses, handling customer calls, appointment scheduling, and inquiries in 50+ languages.",
    "sameAs": [
        "https://www.linkedin.com/company/vocalscale",
        "https://twitter.com/vocalscale"
    ],
    "contactPoint": {
        "@type": "ContactPoint",
        "email": "support@vocalscale.com",
        "contactType": "customer service",
        "areaServed": ["US", "CA", "GB", "AU"],
        "availableLanguage": ["English", "Spanish", "French", "German", "Portuguese"]
    },
    "foundingDate": "2024"
};

export const webPageSchema = (title: string, description: string, url: string) => ({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": title,
    "description": description,
    "url": `https://vocalscale.com${url}`,
    "publisher": {
        "@type": "Organization",
        "name": "VocalScale",
        "url": "https://vocalscale.com",
        "logo": "https://vocalscale.com/logo.png"
    },
    "datePublished": new Date().toISOString(),
    "dateModified": new Date().toISOString(),
    "inLanguage": "en-US",
    "mainEntity": {
        "@type": "Organization",
        "name": "VocalScale"
    }
});

export const articleSchema = (title: string, description: string, author: string, publishDate: string, url: string) => ({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "author": {
        "@type": "Person",
        "name": author,
        "url": "https://vocalscale.com"
    },
    "publisher": {
        "@type": "Organization",
        "name": "VocalScale",
        "url": "https://vocalscale.com",
        "logo": "https://vocalscale.com/logo.png"
    },
    "datePublished": publishDate,
    "dateModified": new Date().toISOString(),
    "url": `https://vocalscale.com${url}`,
    "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://vocalscale.com${url}`
    },
    "articleSection": "Blog",
    "wordCount": 1500,
    "inLanguage": "en-US"
});

export const productSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "VocalScale AI Receptionist",
    "description": "AI receptionist and 24/7 AI voice agent for small businesses. Answers calls, books appointments, qualifies leads, and integrates with your CRM and calendar in 50+ languages.",
    "url": "https://vocalscale.com/",
    "image": "https://vocalscale.com/logo.png",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "AI Receptionist & Virtual Answering Service",
    "operatingSystem": "Web-based",
    "softwareVersion": "3.0",
    "datePublished": "2024-01-01",
    "dateModified": "2026-04-30",
    "offers": [
        {
            "@type": "Offer",
            "name": "Starter Plan",
            "price": "79",
            "priceCurrency": "USD",
            "priceSpecification": {
                "@type": "UnitPriceSpecification",
                "price": "79",
                "priceCurrency": "USD",
                "billingDuration": "P1M",
                "unitCode": "MON"
            },
            "availability": "https://schema.org/InStock",
            "url": "https://vocalscale.com/pricing"
        },
        {
            "@type": "Offer",
            "name": "Professional Plan",
            "price": "135",
            "priceCurrency": "USD",
            "priceSpecification": {
                "@type": "UnitPriceSpecification",
                "price": "135",
                "priceCurrency": "USD",
                "billingDuration": "P1M",
                "unitCode": "MON"
            },
            "availability": "https://schema.org/InStock",
            "url": "https://vocalscale.com/pricing"
        }
    ],
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "1247",
        "bestRating": "5",
        "worstRating": "1"
    },
    "featureList": [
        "24/7 AI Receptionist & Live Call Answering",
        "AI Appointment Scheduling with Google Calendar & Outlook",
        "Smart Call Routing and Warm Transfer",
        "Natural Language Conversations (Deepgram Aura-2)",
        "50+ Languages & Multi-Accent Support",
        "CRM Integration (HubSpot, Salesforce, Pipedrive)",
        "Real-time Analytics & Sentiment Analysis",
        "Custom Knowledge Base Training",
        "HIPAA-aware Configurations for Healthcare",
        "Live Call Transcripts, Recordings & SMS Follow-up"
    ]
};

export const faqSchema = (faqs: Array<{ question: string, answer: string }>) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
        }
    }))
});

export const reviewSchema = (review: {
    rating: number;
    title: string;
    author: string;
    body: string;
    date: string;
    jobTitle?: string;
}) => ({
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
        "@type": "SoftwareApplication",
        "name": "VocalScale AI Receptionist",
        "url": "https://vocalscale.com"
    },
    "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating.toString(),
        "bestRating": "5",
        "worstRating": "1"
    },
    "name": review.title,
    "author": {
        "@type": "Person",
        "name": review.author,
        "jobTitle": review.jobTitle || "Business Owner"
    },
    "reviewBody": review.body,
    "datePublished": review.date,
    "publisher": {
        "@type": "Organization",
        "name": "VocalScale"
    }
});
