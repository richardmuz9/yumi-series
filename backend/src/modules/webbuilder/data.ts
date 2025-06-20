// WebBuilder Module Data and Mock Content
import { Template, Component } from './types'

export const mockTemplates: Template[] = [
  {
    id: 'template-1',
    name: 'Modern Portfolio',
    description: 'Clean, professional portfolio website',
    category: 'portfolio',
    thumbnail: '/templates/portfolio-modern.jpg',
    htmlContent: `<!DOCTYPE html><html><head><title>Portfolio</title></head><body><header><h1>John Doe</h1><p>Web Developer</p></header><main><section><h2>About</h2><p>Passionate developer...</p></section></main></body></html>`,
    cssContent: `* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: Arial, sans-serif; line-height: 1.6; } header { background: #333; color: white; text-align: center; padding: 2rem; }`,
    tags: ['modern', 'clean', 'responsive'],
    isPremium: false,
    author: 'Yumi AI',
    rating: 4.8,
    downloads: 1234
  },
  {
    id: 'template-2',
    name: 'Business Landing',
    description: 'Professional business landing page',
    category: 'business',
    thumbnail: '/templates/business-landing.jpg',
    htmlContent: `<!DOCTYPE html><html><head><title>Business</title></head><body><header><nav><h1>Company</h1></nav></header><main><section class="hero"><h1>Welcome to Our Business</h1><p>We provide excellent services</p><button>Get Started</button></section></main></body></html>`,
    cssContent: `* { margin: 0; padding: 0; box-sizing: border-box; } .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 4rem 2rem; }`,
    tags: ['business', 'professional', 'landing'],
    isPremium: true,
    author: 'Yumi AI',
    rating: 4.9,
    downloads: 856
  },
  {
    id: 'template-3',
    name: 'E-commerce Store',
    description: 'Complete online store template',
    category: 'ecommerce',
    thumbnail: '/templates/ecommerce-store.jpg',
    htmlContent: `<!DOCTYPE html><html><head><title>Shop</title></head><body><header><nav><h1>My Store</h1><div class="cart">Cart (0)</div></nav></header><main><section class="products"><div class="product"><img src="product1.jpg"><h3>Product 1</h3><p>$99.99</p><button>Add to Cart</button></div></section></main></body></html>`,
    cssContent: `* { margin: 0; padding: 0; box-sizing: border-box; } nav { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: #f8f9fa; } .products { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; padding: 2rem; }`,
    tags: ['ecommerce', 'shop', 'store'],
    isPremium: true,
    author: 'Yumi AI',
    rating: 4.7,
    downloads: 2341
  }
];

export const mockComponents: Component[] = [
  {
    id: 'comp-1',
    name: 'Hero Section',
    description: 'Eye-catching hero section with call-to-action',
    category: 'layout',
    icon: '🎯',
    html: `<section class="hero"><div class="container"><h1>Welcome to Our Website</h1><p>Discover amazing possibilities</p><button class="cta-btn">Get Started</button></div></section>`,
    css: `.hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 4rem 2rem; } .cta-btn { background: white; color: #667eea; padding: 1rem 2rem; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }`,
    preview: '/components/hero-preview.jpg',
    tags: ['hero', 'banner', 'cta']
  },
  {
    id: 'comp-2',
    name: 'Contact Form',
    description: 'Professional contact form with validation',
    category: 'forms',
    icon: '📝',
    html: `<form class="contact-form"><div class="form-group"><label>Name</label><input type="text" required></div><div class="form-group"><label>Email</label><input type="email" required></div><div class="form-group"><label>Message</label><textarea required></textarea></div><button type="submit">Send Message</button></form>`,
    css: `.contact-form { max-width: 500px; margin: 0 auto; padding: 2rem; } .form-group { margin-bottom: 1rem; } label { display: block; margin-bottom: 0.5rem; font-weight: bold; } input, textarea { width: 100%; padding: 0.75rem; border: 2px solid #ddd; border-radius: 4px; }`,
    js: `document.querySelector('.contact-form').addEventListener('submit', function(e) { e.preventDefault(); alert('Form submitted!'); });`,
    preview: '/components/form-preview.jpg',
    tags: ['form', 'contact', 'validation']
  },
  {
    id: 'comp-3',
    name: 'Navigation Bar',
    description: 'Responsive navigation with dropdown menus',
    category: 'navigation',
    icon: '🧭',
    html: `<nav class="navbar"><div class="nav-brand"><a href="/">Brand</a></div><ul class="nav-menu"><li><a href="#home">Home</a></li><li><a href="#about">About</a></li><li><a href="#services">Services</a></li><li><a href="#contact">Contact</a></li></ul><div class="hamburger"><span></span><span></span><span></span></div></nav>`,
    css: `.navbar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.1); } .nav-menu { display: flex; list-style: none; gap: 2rem; } .nav-menu a { text-decoration: none; color: #333; font-weight: 500; } .hamburger { display: none; flex-direction: column; cursor: pointer; } .hamburger span { width: 25px; height: 3px; background: #333; margin: 3px 0; transition: 0.3s; }`,
    js: `document.querySelector('.hamburger').addEventListener('click', function() { document.querySelector('.nav-menu').classList.toggle('active'); });`,
    preview: '/components/navbar-preview.jpg',
    tags: ['navigation', 'menu', 'responsive']
  }
];

export const defaultSuggestions = [
  'Add a responsive navigation menu',
  'Create a footer section',
  'Improve the color scheme',
  'Add animations and transitions',
  'Optimize for mobile devices',
  'Include social media links',
  'Add a contact form',
  'Create a photo gallery',
  'Include testimonials section',
  'Add search functionality'
]; 