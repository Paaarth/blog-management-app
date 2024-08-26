const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Load blog posts from JSON file
let blogPosts = [];

const loadBlogPosts = () => {
    try {
        const data = fs.readFileSync('blog-posts.json', 'utf8');
        blogPosts = JSON.parse(data);
    } catch (error) {
        console.error('Error reading blog posts:', error);
    }
};

// Middleware to handle errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { error: 'Internal server error' });
});

// Route to display all blog posts
app.get('/', (req, res) => {
    loadBlogPosts();
    res.render('home', { blogPosts });
});

// Route to display a specific blog post
app.get('/post/:id', (req, res) => {
    loadBlogPosts();
    const post = blogPosts.find(p => p.id === parseInt(req.params.id));
    if (!post) {
        return res.status(404).render('error', { error: 'Post not found' });
    }
    res.render('post', { post });
});

// Route to create a new blog post
app.get('/create', (req, res) => {
    res.render('create');
});

app.post('/create', (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).render('error', { error: 'Please fill in all fields' });
    }
    const newPost = { id: blogPosts.length + 1, title, content };
    blogPosts.push(newPost);
    fs.writeFileSync('blog-posts.json', JSON.stringify(blogPosts, null, 2));
    res.redirect('/');
});

// Route to delete a blog post
app.post('/delete/:id', (req, res) => {
    loadBlogPosts();
    const postIndex = blogPosts.findIndex(p => p.id === parseInt(req.params.id));
    if (postIndex === -1) {
        return res.status(404).render('error', { error: 'Post not found' });
    }
    blogPosts.splice(postIndex, 1);
    fs.writeFileSync('blog-posts.json', JSON.stringify(blogPosts, null, 2));
    res.redirect('/');
});

// Route to edit a blog post
app.get('/edit/:id', (req, res) => {
    loadBlogPosts();
    const post = blogPosts.find(p => p.id === parseInt(req.params.id));
    if (!post) {
        return res.status(404).render('error', { error: 'Post not found' });
    }
    res.render('edit', { post });
});

app.post('/edit/:id', (req, res) => {
    loadBlogPosts();
    const { title, content } = req.body;
    const postIndex = blogPosts.findIndex(p => p.id === parseInt(req.params.id));

    if (postIndex === -1) {
        return res.status(404).render('error', { error: 'Post not found' });
    }

    if (!title || !content) {
        return res.status(400).render('error', { error: 'Please fill in all fields' });
    }

    // Update the post
    blogPosts[postIndex] = { id: parseInt(req.params.id), title, content };
    fs.writeFileSync('blog-posts.json', JSON.stringify(blogPosts, null, 2));
    res.redirect('/');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});