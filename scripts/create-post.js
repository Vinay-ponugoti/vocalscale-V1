const fs = require('fs');
const path = require('path');

// This script helps automate adding new blog posts to the data file.
// Usage: node scripts/create-post.js "Post Title" "Slug" "Excerpt" "Author Name"

const args = process.argv.slice(2);

if (args.length < 2) {
    console.error('Usage: node scripts/create-post.js "Post Title" "Slug" [Excerpt] [Author Name]');
    process.exit(1);
}

const [title, slug, excerpt = "New blog post.", authorName = "VocalScale Team"] = args;
const dataFilePath = path.join(__dirname, '../frontend/src/content/blog/posts.ts');

const newPost = {
    id: Date.now().toString(),
    title,
    slug,
    excerpt,
    content: `
    <p>Write your content here...</p>
    <h2>Section Title</h2>
    <p>More content...</p>
  `,
    author: {
        name: authorName,
        role: "Contributor",
        avatar: "/api/placeholder/100/100"
    },
    date: new Date().toISOString().split('T')[0],
    readTime: "5 min read",
    tags: ["New", "Update"],
    image: "/api/placeholder/800/400",
    featured: false
};

// Read existing file
fs.readFile(dataFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading data file:', err);
        return;
    }

    // Find the array closing bracket
    const insertIndex = data.lastIndexOf('];');

    if (insertIndex === -1) {
        console.error('Could not find end of array in data file.');
        return;
    }

    // format the new object
    const newPostString = JSON.stringify(newPost, null, 2);

    // Prepare definition string to insert
    // We need to be careful about simply appending JSON. The file is TS/JS.
    // A robust way would be to parse the AST, but for this script, we'll append to the array.

    // Actually, parsing TS file as JSON won't work. 
    // Let's just create a helper that appends to the array textually.

    const contentToInsert = `  ,\n  ${newPostString.replace(/^/gm, '  ')} \n`;

    const newData = data.slice(0, insertIndex) + contentToInsert + data.slice(insertIndex);

    fs.writeFile(dataFilePath, newData, 'utf8', (err) => {
        if (err) {
            console.error('Error writing to data file:', err);
        } else {
            console.log(`Successfully added new post: ${title}`);
        }
    });
});
