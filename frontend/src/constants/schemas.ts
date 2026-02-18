export const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "VocalScale",
    "url": "https://vocalscale.com",
    "logo": "https://vocalscale.com/logo.png",
    "description": "VocalScale provides AI-powered voice agents for businesses, handling customer calls, appointments, and inquiries 24/7.",
    "sameAs": [
        "https://www.linkedin.com/company/vocalscale",
        "https://twitter.com/vocalscale"
    ],
    "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-800-555-0199",
        "email": "support@vocalscale.com",
        "contactType": "customer service",
        "areaServed": "US",
        "availableLanguage": ["English", "Spanish"]
    },
    "foundingDate": "2024",
    "founder": {
        "@type": "Person",
        "name": "VocalScale Team"
    },
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "123 Business Ave",
        "addressLocality": "San Francisco",
        "addressRegion": "CA",
        "postalCode": "94105",
        "addressCountry": "US"
    }
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
    "description": "Advanced AI-powered voice agent service for businesses. Automate customer calls, appointment scheduling, and inquiries with natural-sounding AI receptionists available 24/7.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web-based",
    "offers": [
        {
            "@type": "Offer",
            "name": "Starter Plan",
            "price": "69",
            "priceCurrency": "USD",
            "priceSpecification": {
                "@type": "UnitPriceSpecification",
                "price": "69",
                "priceCurrency": "USD",
                "billingDuration": "P1M",
                "unitCode": "MON"
            },
            "availability": "https://schema.org/InStock"
        },
        {
            "@type": "Offer",
            "name": "Professional Plan",
            "price": "118",
            "priceCurrency": "USD",
            "priceSpecification": {
                "@type": "UnitPriceSpecification",
                "price": "118",
                "priceCurrency": "USD",
                "billingDuration": "P1M",
                "unitCode": "MON"
            },
            "availability": "https://schema.org/InStock"
        }
    ],
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "1,247",
        "bestRating": "5",
        "worstRating": "1"
    },
    "featureList": [
        "24/7 AI Receptionist",
        "Appointment Scheduling",
        "Call Routing and Transfer",
        "Natural Language Processing",
        "Multi-language Support",
        "CRM Integration",
        "Real-time Analytics",
        "Custom Knowledge Base",
        "Sentiment Analysis",
        "Call Recording and Transcripts"
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
