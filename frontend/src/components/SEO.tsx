import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    canonical?: string;
    name?: string;
    type?: string;
    image?: string;
}

const DEFAULT_OG_IMAGE = 'https://vocalscale.com/logo.png';

export const SEO: React.FC<SEOProps> = ({
    title,
    description,
    canonical,
    name = 'VocalScale',
    type = 'website',
    image = DEFAULT_OG_IMAGE,
}) => {
    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
            {canonical && <link rel="canonical" href={canonical} />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:site_name" content={name} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            {canonical && <meta property="og:url" content={canonical} />}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@vocalscale" />
            <meta name="twitter:creator" content="@vocalscale" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    );
};
