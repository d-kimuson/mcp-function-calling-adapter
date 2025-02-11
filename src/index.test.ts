import { describe, it, expect, beforeEach } from "vitest"
import { McpFunctionCallingAdapter } from "./index.js"

describe("McpFunctionCallingAdapter", () => {
  let adapter: McpFunctionCallingAdapter

  beforeEach(() => {
    adapter = new McpFunctionCallingAdapter("test_adapter", {
      "sequential-thinking": {
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-sequential-thinking"],
      },
    })
  })

  describe("getTools", () => {
    it("ツールの一覧の name と jsonSchema が取得できるべき", async () => {
      await adapter.ready()
      const tools = adapter.getTools()
      expect(tools.length).toBeGreaterThan(0)
      // sequential-thinking サーバーが提供する tools の基本的な検証
      expect(tools[0]?.name).toStrictEqual("sequentialthinking")
      expect(tools[0]?.inputSchema).toHaveProperty("type")
    })
  })

  describe("executeTool", () => {
    it("正常な引数を渡した時、実行してレスポンスを返せるべき", async () => {
      await adapter.ready()
      const tools = adapter.getTools()
      const firstTool = tools[0]
      if (!firstTool) {
        throw new Error("No tools available")
      }

      // sequential-thinking サーバーの最初のツールを実行
      const { content } = await adapter.executeTool(firstTool.name, {
        // ツールのスキーマに基づいて適切な引数を提供
        thought: "my thinking ...",
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
      })

      /* eslint-disable */
      // @ts-expect-error -- for test
      const response = JSON.parse(content.at(0)?.text)
      expect(response).toStrictEqual({
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        branches: [],
        thoughtHistoryLength: 1,
      })
      /* eslint-enable */
    })

    it("異常な引数を渡した時、エラーレスポンスが返せるべき", async () => {
      await adapter.ready()
      const tools = adapter.getTools()
      const firstTool = tools[0]
      if (!firstTool) {
        throw new Error("No tools available")
      }

      // sequential-thinking サーバーの最初のツールを実行
      const { content } = await adapter.executeTool(firstTool.name, {
        // ツールのスキーマに基づいて適切な引数を提供
        invalidArgument: "invalid argument",
      })

      /* eslint-disable */
      // @ts-expect-error -- for test
      const response = JSON.parse(content.at(0)?.text)
      expect(response).toBeDefined()
      expect(response.status).toBe("failed")
      expect(response.error).toBeDefined()
      /* eslint-enable */
    })
  })
})
