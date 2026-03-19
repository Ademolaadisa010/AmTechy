import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Mock responses as fallback
const getMockResponse = (
  userMessage: string,
  courseTitle: string,
  lessonTitle: string
): string => {
  const message = userMessage.toLowerCase();

  if (message.includes("what") || message.includes("explain")) {
    return `Great question about "${lessonTitle}"! 

In "${courseTitle}", this concept is essential. Let me break it down:

1. **The Foundation**: This is the core principle you need to understand
2. **How It Works**: It applies practical techniques we've covered
3. **Why It Matters**: Understanding this helps you solve real problems

Based on our lesson objectives, this is crucial knowledge. Would you like me to explain any specific part in more detail?`;
  }

  if (message.includes("example") || message.includes("code")) {
    return `Absolutely! Here's a practical example related to "${lessonTitle}":

\`\`\`javascript
// Example from ${courseTitle}
function concept() {
  // This demonstrates the key principle
  const result = applyLearning();
  return result;
}

// How to use it
concept();
\`\`\`

This pattern shows the approach we're studying. Try applying it to your own code!`;
  }

  if (message.includes("how")) {
    return `Excellent question about "${lessonTitle}"!

Here's the process step-by-step:

**Step 1**: Start with the foundational concept
**Step 2**: Apply the practical techniques  
**Step 3**: Build on each layer of understanding
**Step 4**: Practice and refine

Each learning objective in this module builds on the previous one. Make sure you're comfortable with each step before moving forward!`;
  }

  if (message.includes("help") || message.includes("stuck")) {
    return `Don't worry, I'm here to help with "${lessonTitle}"!

Try these strategies:
1. **Review the objectives** - Make sure you understand what we're aiming for
2. **Break it down** - Look at each concept separately  
3. **Practice** - Work through the code examples provided
4. **Ask specifically** - Tell me which part is confusing

What specific part of "${lessonTitle}" would you like help with?`;
  }

  // Default helpful response
  return `That's a great question about "${lessonTitle}" in ${courseTitle}!

I'm here to help you understand the material better. Feel free to ask me:
- To explain specific concepts
- For code examples
- How topics relate to the course
- For help with the learning objectives

What would you like to know more about?`;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, courseTitle, lessonTitle, category } = body;

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid messages format" }),
        { status: 400 }
      );
    }

    // Get the latest user message
    const latestUserMessage =
      messages.length > 0 ? messages[messages.length - 1]?.content || "" : "";

    const encoder = new TextEncoder();

    // Try to use real API first
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const systemPrompt = `You are a friendly and knowledgeable AI Tutor for an online learning platform.

Course: ${courseTitle || "General Course"}
Category: ${category || "General"}
Current Lesson: ${lessonTitle || "this lesson"}

Instructions:
- Be encouraging, clear, and patient.
- Explain concepts simply first, then go deeper if needed.
- Relate your answers to the current lesson and course when possible.
- If the user asks for code, give clean, correct examples with proper formatting.
- Keep responses educational and helpful (under 300 words).
- Use markdown formatting for better readability.
- If asked about topics outside the course, politely redirect to course material.
- Provide step-by-step explanations when teaching complex concepts.
- Always be concise and direct - don't repeat information.`;

        // Convert messages to Anthropic format
        const anthropicMessages = messages.map(
          (msg: { role: string; content: string }) => ({
            role: msg.role === "user" ? ("user" as const) : ("assistant" as const),
            content: msg.content,
          })
        );

        // Create stream
        const stream = client.messages.stream({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 500,
          system: systemPrompt,
          messages: anthropicMessages,
        });

        // Create a readable stream that pipes the response
        const readable = new ReadableStream<Uint8Array>({
          async start(controller) {
            try {
              // Use event listeners for streaming
              stream.on("text", (text) => {
                controller.enqueue(encoder.encode(text));
              });

              stream.on("error", (error) => {
                console.error("Stream error:", error);
                if (
                  error instanceof Error &&
                  (error.message.includes("credit") ||
                    error.message.includes("billing") ||
                    error.message.includes("401") ||
                    error.message.includes("400"))
                ) {
                  // Fall back to mock response
                  const mockResponse = getMockResponse(
                    latestUserMessage,
                    courseTitle || "your course",
                    lessonTitle || "this lesson"
                  );
                  controller.enqueue(encoder.encode(mockResponse));
                  controller.close();
                } else {
                  controller.error(error);
                }
              });

              stream.on("end", () => {
                controller.close();
              });
            } catch (error) {
              console.error("Stream setup error:", error);
              const mockResponse = getMockResponse(
                latestUserMessage,
                courseTitle || "your course",
                lessonTitle || "this lesson"
              );
              controller.enqueue(encoder.encode(mockResponse));
              controller.close();
            }
          },
        });

        return new Response(readable, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "X-Content-Type-Options": "nosniff",
          },
        });
      } catch (apiError) {
        console.error("API Error:", apiError);

        // If real API fails, use mock response
        const mockResponse = getMockResponse(
          latestUserMessage,
          courseTitle || "your course",
          lessonTitle || "this lesson"
        );

        const readable = new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(encoder.encode(mockResponse));
            controller.close();
          },
        });

        return new Response(readable, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      }
    } else {
      console.warn("Using mock AI responses (no API key configured)");
      const mockResponse = getMockResponse(
        latestUserMessage,
        courseTitle || "your course",
        lessonTitle || "this lesson"
      );

      const readable = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(encoder.encode(mockResponse));
          controller.close();
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }
  } catch (error) {
    console.error("AI Tutor error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to get response from AI tutor",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export const maxDuration = 60;