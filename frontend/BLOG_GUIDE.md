# Blog Publishing Guide

This guide explains how to add new blog posts to the VocalScale website.

---

## Quick Start

To add a new blog post, edit this file:
```
frontend-V1/frontend/src/content/blog/posts.ts
```

Add your new blog post to the `blogPosts` array following the template below.

---

## Blog Post Template

Copy and paste this template to add a new blog:

```typescript
{
  id: "YOUR_UNIQUE_ID_HERE",           // Use timestamp like: "1740161600003"
  title: "Your Blog Title Here",        // The headline of your blog
  slug: "your-blog-slug-here",          // URL-friendly (use-hyphens, lowercase)
  excerpt: "A short summary of your blog post (1-2 sentences max).",
  content: `<p>Your HTML content here...</p>

<h2>Section Heading</h2>
<p>More content...</p>`,
  author: { 
    name: "Author Name",                // e.g., "VocalScale Team"
    role: "Their Role",                  // e.g., "Industry Analysis"
    avatar: "/api/placeholder/100/100"   // Leave as placeholder or add real avatar
  },
  date: "2026-02-20",                  // Publication date (YYYY-MM-DD)
  readTime: "5 min read",              // Estimated reading time
  tags: ["Tag1", "Tag2", "Tag3"],      // Array of relevant tags
  image: "/images/blog/YOUR_IMAGE.jpg", // Path to featured image (see below)
  featured: false                       // true = show on homepage
},
```

---

## Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique ID (use timestamp) | `"1740161600003"` |
| `title` | string | Blog headline | `"How to Save Money"` |
| `slug` | string | URL path (lowercase, hyphens) | `"how-to-save-money"` |
| `excerpt` | short summary | Short description for previews | `"Learn how to save 50%"` |
| `content` | HTML string | Full blog content | `<p>HTML content...</p>` |
| `author.name` | string | Author's name | `"John Smith"` |
| `author.role` | string | Author's role | `"Marketing Lead"` |
| `author.avatar` | string | Avatar image path | `"/api/placeholder/100/100"` |
| `date` | string | Publication date | `"2026-02-20"` |
| `readTime` | string | Reading time | `"5 min read"` |
| `tags` | string[] | Categories/tags | `["AI", "Business"]` |
| `image` | string | Featured image path | `"/images/blog/your-image.jpg"` |
| `featured` | boolean | Show on homepage | `true` or `false` |

---

## Images

### Where to Put Images
Place images in this folder:
```
frontend-V1/frontend/public/images/blog/
```

### Currently Available Images
- `/images/blog/ai-receptionist-roi-2026.png`
- `/images/blog/ai-receptionist-trends-2025.jpg`
- `/images/blog/founder-workflow-2025.jpg`
- `/images/blog/hipaa-compliant-ai-medical.jpg`
- `/images/blog/small-business-ai-receptionist-signs.jpg`

### Image Requirements
- **Format**: JPG, PNG, or WebP
- **Recommended size**: 800x400 pixels (2:1 ratio)
- **Path format**: `/images/blog/your-image-name.jpg`

---

## How to Generate ID

Use a timestamp as the ID. You can generate one at: https://www.epochconverter.com

Or use this JavaScript in browser console:
```javascript
Date.now()
```

Example: `1740161600003`

---

## Tips for Writing Blog Content

### Content Format
- Use HTML tags for formatting: `<h2>`, `<p>`, `<strong>`, `<ul>`, `<li>`
- Keep paragraphs short and readable
- Use headings (`<h2>`) to break up content

### Example Content Structure
```html
<p>Opening paragraph that hooks the reader...</p>

<h2>Main Point 1</h2>
<p>Explanation of first point...</p>

<h2>Main Point 2</h2>
<p>Explanation of second point...</p>

<h2>Conclusion</h2>
<p>Summary and call to action...</p>
```

---

## Common Mistakes to Avoid

1. **Missing comma** - Don't forget commas between fields and between posts
2. **Unclosed braces** - Every `{` needs a `}`
3. **Unclosed strings** - Every string needs closing `"` or `'`
4. **Wrong image path** - Use `/images/blog/` not `/image/blog/`
5. **Invalid HTML in content** - Always close your tags

---

## Testing Your Changes

1. Run the development server:
```bash
cd frontend-V1/frontend
npm run dev
```

2. Visit the blog page to verify your post appears

3. Build to check for errors:
```bash
npm run build
```

---

## AI Prompt Template

If you want an AI to generate blog code for you, use this prompt:

```
Generate a blog post for VocalScale website in TypeScript format.

Requirements:
- Topic: [YOUR TOPIC]
- Tone: [PROFESSIONAL/FRIENDLY/TECHNICAL]
- Length: [SHORT/MEDIUM/LONG]

Use this exact format (copy-paste the template from above) and generate unique ID and slug.
```

---

## Example Complete Blog Post

```typescript
{
  id: "1740161600003",
  title: "10 Ways AI Receptionists Improve Customer Service",
  slug: "10-ways-ai-receptionists-improve-customer-service",
  excerpt: "Discover how AI receptionists are transforming small business customer service with 24/7 availability and instant responses.",
  content: `<p>Customer service can make or break a small business. Here's how AI is changing the game.</p>

<h2>1. 24/7 Availability</h2>
<p>Never miss a customer call again. AI Receptionists work around the clock.</p>

<h2>2. Instant Responses</h2>
<p>Answer calls in under 1 second. No more waiting on hold.</p>

<h2>3. Cost Savings</h2>
<p>Save up to 70% compared to hiring a traditional receptionist.</p>

<h2>Conclusion</h2>
<p>Ready to transform your customer service? Start your free trial today.</p>`,
  author: { 
    name: "VocalScale Research Team", 
    role: "Industry Analysis", 
    avatar: "/api/placeholder/100/100" 
  },
  date: "2026-02-20",
  readTime: "5 min read",
  tags: ["AI", "Customer Service", "Small Business"],
  image: "/images/blog/ai-receptionist-trends-2025.jpg",
  featured: true
},
```

---

## Need Help?

- Check the `posts.ts` file for more examples
- Ensure all strings are properly quoted
- Run `npm run build` to check for errors
- Images must exist in `public/images/blog/` folder
