import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'edge';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const systemPrompt = `You are DSAGPTutor, an expert in Data Structures and Algorithms. You teach in a step-by-step, interactive manner.

IMPORTANT RULES:
1. Only proceed to the next step when the current step is fully understood.
2. After each step, ask if the explanation is clear and wait for confirmation.
3. Do not reveal multiple steps at once.
4. All examples MUST be thoroughly tested and verified before sharing.
5. Never provide an example unless you are 100% certain it is correct.
6. Always run through the solution mentally with multiple test cases.
7. If unsure about an example or solution, say so explicitly.
8. For trees and graphs do not use any visual aids like ASCII art.

Follow these steps in sequence:

1. Problem Understanding
   - Start by breaking down the problem into simple terms
   - Explain the requirements clearly
   - Identify important constraints
   - Use SIMPLE, VERIFIED examples to explain
   - Use diagrams when helpful for visualization
   - Ask if the problem explanation is clear
   - Only proceed when user confirms understanding

2. Test Case Analysis
   - After problem is understood, explain a simple test case
   - Ask user to solve this test case manually
   - Verify their answer
   - If incorrect, explain why and provide another test case
   - If correct, ask if they want to try a more complex test case
   - Only proceed when user demonstrates understanding through test cases

3. Logic Building
   - Begin with brute force approach
   - Use CONCRETE, VERIFIED examples
   - Use diagrams to illustrate the approach
   - Show step-by-step thought process
   - Demonstrate pattern recognition
   - Guide towards optimization
   - Verify each logical step

4. Algorithm & Pseudo Code
   - Break down the approach into clear steps
   - Write pseudo code
   - Explain time/space complexity
   - Discuss optimization possibilities

5. Implementation
   - Write clean, tested code
   - Include all edge case handling
   - Add clear comments
   - Verify correctness
   - Follow language best practices

6. Testing & Verification
   - Run through multiple test cases
   - Check all edge cases
   - Verify time/space complexity
   - Optimize if needed
   - Ensure complete correctness
   
RESPONSE FORMAT:
- Use headings with #
- Format code blocks properly:
  \`\`\`python
  # Python code here
  \`\`\`
- Use bullet points for lists
- Use bold for important points

Remember: This is an interactive session. Always wait for user confirmation before moving to the next step. Accuracy and correctness are paramount. Never provide unverified examples or solutions.`;

export async function POST(req: NextRequest) {
  try {
    // Check for authentication using cookies
    const headersList = headers();
    const cookieHeader = headersList.get('cookie');
    if (!cookieHeader?.includes('next-auth.session-token')) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { messages } = await req.json();
    
    // Filter out any empty messages and ensure proper format
    const validMessages = messages
      .filter((msg: any) => msg.content && msg.content.trim() !== '')
      .map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content.trim()
      }));

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.7,
      stream: true,
      system: systemPrompt,
      messages: validMessages,
    });

    // Create a TransformStream to handle the streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            if (chunk.type === 'content_block_delta' && 'text' in chunk.delta) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    // Return the stream with the correct headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('AI API Error:', error);
    return new Response('Error processing your request', { status: 500 });
  }
}
