# mcp-function-calling-adapter

[English](./README.md) | 日本語

Model Context Protocol (MCP) の function calling 用のアダプタを提供するライブラリです。

このライブラリを使用することで、標準化されて提供される MCP Server 実装をそのまま function calling で利用できます。

## インストール

```bash
pnpm add mcp-function-calling-adapter
```

## 使用例

以下は OpenAI API と組み合わせて使用する例です：

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

// ツールの呼び出し
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

## API

### `startServers()`

MCP サーバーを起動し、利用可能なツールを読み込みます。

### `clean()`

MCP サーバーとの接続を切断します。

### `getTools()`

利用可能なツールの一覧を取得します。
レスポンスにはツールの名前、説明、input の JSONSchema が含まれておりそのまま function calling 用のスキーマ定義に渡すことができます。

### `executeTool(name: string, args: Record<string, unknown>)`

指定された名前のツールを実行して、戻り値として MCPServer のレスポンスを返します。
