import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import {
  StdioClientTransport,
  type StdioServerParameters,
} from "@modelcontextprotocol/sdk/client/stdio.js"

type Tool = {
  name: string
  description?: string | undefined
  inputSchema: Record<string, unknown> /* JSONSchema */
}

export class McpFunctionCallingAdapter {
  private tools: Tool[] = []
  private client: Client

  constructor(
    private name: string,
    private parameters: Record<string, StdioServerParameters>
  ) {
    this.client = new Client(
      {
        name: this.name,
        version: "1.0.0",
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
    this.tools = tools
  }

  async clean() {
    await this.client.close()
  }

  getTools() {
    return this.tools
  }

  async executeTool(name: string, args: Record<string, unknown>) {
    return await this.client.callTool({
      name,
      arguments: args,
    })
  }
}
