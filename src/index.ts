import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import {
  StdioClientTransport,
  type StdioServerParameters,
} from "@modelcontextprotocol/sdk/client/stdio.js"
import { jsonSchemaToZod, type JsonSchema } from "json-schema-to-zod"

type Tool = {
  name: string
  description?: string | undefined
  inputSchema: {
    type: "object"
    properties?: Record<string, JsonSchema>
    required?: string[]
  }
}

export class McpFunctionCallingAdapter {
  private tools: Tool[] = []
  private client: Client

  constructor(
    name: string,
    version: string,
    private parameters: Record<string, StdioServerParameters>
  ) {
    this.client = new Client(
      {
        name,
        version,
      },
      {
        capabilities: {
          prompts: {},
          resources: {},
          tools: {},
        },
      }
    )
  }

  async startServers() {
    for (const [name, serverParameter] of Object.entries(this.parameters)) {
      const transport = new StdioClientTransport(serverParameter)
      await this.client.connect(transport)
      console.log(`${name} is successfully started!`)
    }

    const { tools } = await this.client.listTools()
    // @ts-expect-error -- valid
    this.tools = tools
  }

  async clean() {
    await this.client.close()
  }

  getTools() {
    return this.tools.map(({ name, description, inputSchema }) => ({
      name,
      description,
      jsonSchema: inputSchema,
      zodSchema: jsonSchemaToZod(inputSchema),
    }))
  }

  isRegisteredTool(name: string) {
    return this.tools.map(({ name }) => name).includes(name)
  }

  async executeTool(
    name: string,
    args: Record<string, unknown>
  ): Promise<{
    _meta: unknown
    content: unknown
    isError: unknown
    toolResult: unknown
  }> {
    const toolResult = await this.client.callTool({
      name,
      arguments: args,
    })

    return {
      _meta: toolResult._meta,
      content: toolResult.content,
      isError: toolResult.isError,
      toolResult: toolResult.toolResult,
    }
  }
}
