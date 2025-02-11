# mcp-function-calling-adapter

English | [日本語](./README.ja.md)

[![npm version](https://badge.fury.io/js/mcp-function-calling-adapter.svg)](https://badge.fury.io/js/mcp-function-calling-adapter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Check](https://github.com/d-kimuson/mcp-function-calling-adapter/workflows/Check/badge.svg)](https://github.com/d-kimuson/mcp-function-calling-adapter/actions)

This library provides a function calling adapter for the Model Context Protocol (MCP).

You can use standardized MCP Server implementations directly with function calling through this library.

## Installation

```bash
pnpm add mcp-function-calling-adapter
```

## Usage

Here's an example using it with the OpenAI API:

```typescript
import { McpFunctionCallingAdapter } from "mcp-function-calling-adapter"

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

// Call tool
const toolCall = completion.choices.at(0)?.message.tool_calls?.at(0)
if (toolCall && adapter.isRegisteredTool(toolCall.function.name)) {
  const response = await adapter.executeTool(
    toolCall.function.name,
    JSON.parse(toolCall.function.arguments)
  )
  messages.push(completion.choices[0].message)
  messages.push({
    role: "tool",
    tool_call_id: toolCall.id,
    content: response.content.toString(),
  })
}
```

## API

### `startServers()`

Starts the MCP servers and loads available tools.

### `clean()`

Disconnects from the MCP servers.

### `getTools()`

Returns a list of available tools.
The response includes the tool name, description, and input JSONSchema, which can be directly used for function calling schema definitions.

### `isRegisteredTool(name: string)`

Checks if a tool with the specified name is registered and available for use.

- `name`: The name of the tool to check
- Returns: `boolean` - `true` if the tool is registered, `false` otherwise

### `executeTool(name: string, args: Record<string, unknown>)`

Executes a tool with the specified name and returns the response from the MCP Server.

- `name`: The name of the tool to execute
- `args`: Arguments to pass to the tool

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and contribute to the project.

### Development

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Run tests: `pnpm test`
4. Build: `pnpm build`

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
