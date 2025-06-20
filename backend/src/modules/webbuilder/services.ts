// WebBuilder Module Services and Business Logic
import {
  qwen,
  modelsConfig
} from '../shared'
import { 
  WebsiteGenerationOptions, 
  ChatMessage, 
  CodeChanges, 
  GeneratedWebsite 
} from './types'
import { defaultSuggestions } from './data'

// AI Research function for webbuilder chat
export async function aiResearch(query: string): Promise<string> {
  try {
    const researchPrompt = `Research and provide comprehensive insights about: ${query}

Please provide:
1. Current trends and developments
2. Key statistics and data points
3. Market insights and analysis
4. Best practices and recommendations
5. Relevant hashtags and keywords
6. Strategic considerations

Make this informative and actionable for content creation.`

    const completion = await qwen.chat.completions.create({
      model: modelsConfig.providers.qwen.defaultModel,
      messages: [
        { role: 'system', content: 'You are a research assistant providing comprehensive market insights and content strategy advice.' },
        { role: 'user', content: researchPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.7
    })

    return completion.choices[0]?.message?.content || 'Unable to generate research insights.'
  } catch (error) {
    console.error('AI Research error:', error)
    return 'Research functionality temporarily unavailable. Please try again later.'
  }
}

// Generate AI response for web building chat
export async function generateChatResponse(
  messages: ChatMessage[], 
  context: Record<string, any> = {}
): Promise<{ message: string; suggestions: string[]; codeChanges?: CodeChanges | null }> {
  try {
    const systemPrompt = `You are an expert web developer and designer. Help users build amazing websites by:

1. Generating HTML, CSS, and JavaScript code
2. Providing design suggestions and best practices
3. Explaining web development concepts
4. Helping with responsive design and accessibility
5. Suggesting improvements and optimizations

Current project context: ${JSON.stringify(context)}

Always provide practical, working code examples and clear explanations.`

    const lastMessage = messages[messages.length - 1]
    
    // Check if this is a code generation request
    const isCodeRequest = lastMessage.content.toLowerCase().includes('create') || 
                         lastMessage.content.toLowerCase().includes('generate') ||
                         lastMessage.content.toLowerCase().includes('build') ||
                         lastMessage.content.toLowerCase().includes('add')

    const completion = await qwen.chat.completions.create({
      model: modelsConfig.providers.qwen.defaultModel,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-5) // Last 5 messages for context
      ],
      max_tokens: 1500,
      temperature: 0.7
    })

    const response = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.'
    
    // Generate context-aware suggestions
    const suggestions = defaultSuggestions.slice(0, 3)

    // If it's a code request, try to extract code from the response
    let codeChanges = null
    if (isCodeRequest && response.includes('```')) {
      codeChanges = extractCodeFromResponse(response)
    }

    return {
      message: response,
      suggestions,
      codeChanges
    }
  } catch (error) {
    console.error('Chat response generation error:', error)
    throw new Error('Failed to generate chat response')
  }
}

// Generate complete website based on prompt
export async function generateCompleteWebsite(
  prompt: string, 
  options: WebsiteGenerationOptions = {}
): Promise<GeneratedWebsite> {
  try {
    const generationPrompt = `Generate a complete website based on this description: "${prompt}"

Website type: ${options.type || 'general'}
Style: ${options.style || 'modern'}
Pages needed: ${options.pages || ['home']}
Color scheme: ${options.colorScheme || 'modern blue and white'}

Please provide:
1. Complete HTML structure
2. Beautiful CSS styling with modern design
3. Basic JavaScript for interactivity if needed

Make it responsive, accessible, and visually appealing.`

    const completion = await qwen.chat.completions.create({
      model: modelsConfig.providers.qwen.defaultModel,
      messages: [{ role: 'user', content: generationPrompt }],
      max_tokens: 2000,
      temperature: 0.8
    })

    const response = completion.choices[0]?.message?.content || ''
    
    // Extract code sections
    const htmlMatch = response.match(/```html\n([\s\S]*?)\n```/)
    const cssMatch = response.match(/```css\n([\s\S]*?)\n```/)
    const jsMatch = response.match(/```javascript\n([\s\S]*?)\n```/)

    const html = htmlMatch ? htmlMatch[1] : generateFallbackHTML(prompt, options)
    const css = cssMatch ? cssMatch[1] : generateFallbackCSS(options)
    const js = jsMatch ? jsMatch[1] : undefined

    return {
      html,
      css,
      js,
      metadata: {
        title: extractTitleFromPrompt(prompt),
        description: prompt,
        generatedAt: new Date().toISOString(),
        prompt
      }
    }
  } catch (error) {
    console.error('Website generation error:', error)
    throw new Error('Failed to generate website')
  }
}

// Extract code blocks from AI response
function extractCodeFromResponse(response: string): CodeChanges | null {
  const htmlMatch = response.match(/```html\n([\s\S]*?)\n```/)
  const cssMatch = response.match(/```css\n([\s\S]*?)\n```/)
  const jsMatch = response.match(/```javascript\n([\s\S]*?)\n```/)
  
  if (htmlMatch || cssMatch || jsMatch) {
    return {
      html: htmlMatch ? htmlMatch[1] : undefined,
      css: cssMatch ? cssMatch[1] : undefined,
      js: jsMatch ? jsMatch[1] : undefined
    }
  }
  
  return null
}

// Generate fallback HTML when AI generation fails
function generateFallbackHTML(prompt: string, options: WebsiteGenerationOptions): string {
  const title = extractTitleFromPrompt(prompt)
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body>
    <header>
        <h1>Welcome to ${title}</h1>
        <p>Generated by AI based on: ${prompt}</p>
    </header>
    <main>
        <section>
            <h2>About Us</h2>
            <p>This website was created to meet your needs. We're here to provide excellent service and value.</p>
        </section>
        <section>
            <h2>Our Services</h2>
            <div class="services-grid">
                <div class="service-item">
                    <h3>Service 1</h3>
                    <p>Professional service description</p>
                </div>
                <div class="service-item">
                    <h3>Service 2</h3>
                    <p>Quality service with attention to detail</p>
                </div>
            </div>
        </section>
    </main>
    <footer>
        <p>&copy; 2024 ${title}. All rights reserved.</p>
    </footer>
</body>
</html>`
}

// Generate fallback CSS
function generateFallbackCSS(options: WebsiteGenerationOptions): string {
  const colorScheme = options.colorScheme || 'blue'
  const primaryColor = colorScheme.includes('blue') ? '#3498db' : '#e74c3c'
  
  return `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: #333;
}

header {
    background: linear-gradient(135deg, ${primaryColor}, #2c3e50);
    color: white;
    text-align: center;
    padding: 4rem 2rem;
}

header h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
}

main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

section {
    margin-bottom: 3rem;
}

h2 {
    color: ${primaryColor};
    margin-bottom: 1rem;
    font-size: 2rem;
}

.services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.service-item {
    background: #f8f9fa;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

footer {
    background: #2c3e50;
    color: white;
    text-align: center;
    padding: 2rem;
}

@media (max-width: 768px) {
    header h1 {
        font-size: 2rem;
    }
    
    main {
        padding: 1rem;
    }
}`
}

// Extract title from prompt
function extractTitleFromPrompt(prompt: string): string {
  // Simple title extraction logic
  const words = prompt.split(' ')
  if (words.length > 0) {
    return words.slice(0, 3).map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  }
  return 'My Website'
}

// Validate website content
export function validateWebsiteContent(html: string, css: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Basic HTML validation
  if (!html.includes('<!DOCTYPE html>')) {
    errors.push('Missing DOCTYPE declaration')
  }
  if (!html.includes('<title>')) {
    errors.push('Missing title tag')
  }
  if (!html.includes('<meta charset=')) {
    errors.push('Missing charset meta tag')
  }
  
  // Basic CSS validation
  if (css && css.includes('undefined')) {
    errors.push('CSS contains undefined values')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
} 