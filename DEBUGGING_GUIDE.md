# Debugging Guide

## Common Issues and Solutions

### API Authentication

When making API requests, ensure proper authentication headers:

```javascript
[API][Request] Headers: { 
  "Authorization": "Bearer <your-jwt-token>", 
  "Has-Cookie-Credentials": "include" 
}
```

// ... rest of the guide content ... 