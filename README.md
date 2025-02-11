# mcp-function-calling-adapter

## OpenAI Example

```typescript
const adapter = new McpFunctionCallingAdapter("example", {
  "sequential-thinking": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-sequential-thinking"],
  },
})

const openai = new OpenAI({
  apiKey: "your api key here",
})

await adapter.ready()

const messages = [
  {
    role: "user",
    content: "What's the weather like in Paris today?",
  },
]
const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages,
  tools: adapter.getTools().map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description ?? "",
      parameters: tool.inputSchema,
    },
  })),
  tool_choice: "auto",
})

// call tool
const toolCall = completion.choices.at(0)?.message.tool_calls?.at(0)
if (toolCall) {
  const args: Record<string, unknown> = JSON.parse(toolCall.function.arguments)
  const response = await adapter.executeTool(toolCall.function.name, args)
  messages.push(completion.choices[0].message)
  messages.push({
    role: "tool",
    tool_call_id: toolCall.id,
    content: response.content.toString(),
  })
}
```
