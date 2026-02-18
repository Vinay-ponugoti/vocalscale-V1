/**
 * Blog Post Creation Script - TypeScript AST Version
 *
 * Usage:
 *   npx tsx scripts/create-post.ts "Post Title" "post-slug" ["Excerpt"] ["Author Name"]
 *
 * Example:
 *   npx tsx scripts/create-post.ts "AI Trends 2024" "ai-trends-2024" "New AI trends" "John Doe"
 */

import { Project, SyntaxKind, ObjectLiteralExpression } from 'ts-morph';
import * as path from 'path';
import * as fs from 'fs';

// Parse CLI arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: npx tsx scripts/create-post.ts "Post Title" "post-slug" ["Excerpt"] ["Author Name"]');
  process.exit(1);
}

const [title, slug, excerpt = 'New blog post.', authorName = 'VocalScale Team'] = args;

// Validate slug (URL-friendly format)
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
if (!slugRegex.test(slug)) {
  console.error('Error: Slug must be lowercase letters, numbers, and hyphens only (e.g., "my-new-post")');
  process.exit(1);
}

const dataFilePath = path.join(__dirname, '../frontend/src/content/blog/posts.ts');
const absolutePath = path.resolve(dataFilePath);

// Check if file exists
if (!fs.existsSync(absolutePath)) {
  console.error(`Error: File not found at ${absolutePath}`);
  process.exit(1);
}

// Initialize ts-morph project
const project = new Project({
  tsConfigFilePath: path.join(__dirname, '../frontend/tsconfig.node.json'),
});

// Add and parse the posts.ts file
const sourceFile = project.addSourceFileAtPath(absolutePath);

// Find the blogPosts variable declaration
const blogPostsDeclaration = sourceFile.getVariableDeclaration('blogPosts');
if (!blogPostsDeclaration) {
  console.error('Error: blogPosts variable not found in posts.ts');
  process.exit(1);
}

// Get the initializer (the array literal)
const arrayLiteral = blogPostsDeclaration.getInitializerIfKind(SyntaxKind.ArrayLiteralExpression);
if (!arrayLiteral) {
  console.error('Error: blogPosts is not an array literal');
  process.exit(1);
}

// Check for duplicate slug
const existingSlugs = arrayLiteral.getElements()
  .filter((elem): elem is ObjectLiteralExpression => elem.isKind(SyntaxKind.ObjectLiteralExpression))
  .map((obj) => {
    const slugProp = obj.getProperty('slug');
    if (slugProp?.isKind(SyntaxKind.PropertyAssignment)) {
      const init = slugProp.getInitializer();
      if (init?.isKind(SyntaxKind.StringLiteral)) {
        return init.getLiteralValue();
      }
    }
    return null;
  });

if (existingSlugs.includes(slug)) {
  console.error(`Error: Post with slug "${slug}" already exists`);
  process.exit(1);
}

// Create the new post object as a string (for AST insertion)
const today = new Date().toISOString().split('T')[0];
const newPostContent = `{
  id: "${Date.now().toString()}",
  title: "${title.replace(/"/g, '\\"')}",
  slug: "${slug}",
  excerpt: "${excerpt.replace(/"/g, '\\"')}",
  content: \`<p>Write your content here...</p>
<h2>Section Title</h2>
<p>More content...</p>\`,
  author: {
    name: "${authorName}",
    role: "Contributor",
    avatar: "/api/placeholder/100/100"
  },
  date: "${today}",
  readTime: "5 min read",
  tags: ["New", "Update"],
  image: "/api/placeholder/800/400",
  featured: false
}`;

// Parse the new post string into AST nodes
const tempFile = project.createSourceFile('temp.ts', `const x = [${newPostContent}];`, { overwrite: true });
const tempArray = tempFile.getVariableDeclaration('x')?.getInitializerIfKind(SyntaxKind.ArrayLiteralExpression);
const newPostElement = tempArray?.getElements()[0];

if (!newPostElement) {
  console.error('Error: Failed to parse new post object');
  process.exit(1);
}

// Insert at the beginning of the array (or end, based on preference)
// Typically, newest first makes sense
arrayLiteral.insertElement(0, newPostElement.getFullText());

// Save the modified file
sourceFile.saveSync();

console.log(`✅ Successfully added new post: "${title}"`);
console.log(`📁 File updated: ${path.relative(process.cwd(), absolutePath)}`);
console.log(`
📋 Next steps:
   1. Edit the content in ${dataFilePath}
   2. Update tags, image, readTime as needed
   3. Run your dev server: npm run dev
`);
