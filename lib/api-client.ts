interface ApiProvider {
  id: string
  name: string
  apiKey: string
  baseUrl?: string
}

interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

interface ChatResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  model: string
  responseTime: number
}

class ApiClient {
  private providers: Map<string, ApiProvider> = new Map()

  addProvider(provider: ApiProvider) {
    this.providers.set(provider.id, provider)
  }

  removeProvider(providerId: string) {
    this.providers.delete(providerId)
  }

  async testConnection(providerId: string): Promise<boolean> {
    const provider = this.providers.get(providerId)
    if (!provider) throw new Error("Provider not found")

    try {
      const response = await fetch(`${provider.baseUrl || this.getDefaultBaseUrl(providerId)}/models`, {
        headers: {
          Authorization: `Bearer ${provider.apiKey}`,
          "Content-Type": "application/json",
        },
      })

      return response.ok
    } catch (error) {
      console.error(`Connection test failed for ${providerId}:`, error)
      return false
    }
  }

  async sendMessage(
    providerId: string,
    model: string,
    messages: ChatMessage[],
    options?: {
      temperature?: number
      maxTokens?: number
      stream?: boolean
    },
  ): Promise<ChatResponse> {
    const provider = this.providers.get(providerId)
    if (!provider) throw new Error("Provider not found")

    const startTime = Date.now()

    try {
      const response = await fetch(`${provider.baseUrl || this.getDefaultBaseUrl(providerId)}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${provider.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options?.temperature || 0.7,
          max_tokens: options?.maxTokens || 2000,
          stream: options?.stream || false,
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
      }

      const data = await response.json()
      const responseTime = (Date.now() - startTime) / 1000

      return {
        content: data.choices[0]?.message?.content || "",
        usage: data.usage,
        model: data.model,
        responseTime,
      }
    } catch (error) {
      console.error(`API request failed for ${providerId}:`, error)
      throw error
    }
  }

  async streamMessage(
    providerId: string,
    model: string,
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    options?: {
      temperature?: number
      maxTokens?: number
    },
  ): Promise<void> {
    const provider = this.providers.get(providerId)
    if (!provider) throw new Error("Provider not found")

    try {
      const response = await fetch(`${provider.baseUrl || this.getDefaultBaseUrl(providerId)}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${provider.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options?.temperature || 0.7,
          max_tokens: options?.maxTokens || 2000,
          stream: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") return

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices[0]?.delta?.content
              if (content) {
                onChunk(content)
              }
            } catch (e) {
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      console.error(`Streaming request failed for ${providerId}:`, error)
      throw error
    }
  }

  private getDefaultBaseUrl(providerId: string): string {
    const baseUrls: Record<string, string> = {
      cerebras: "https://api.cerebras.ai/v1",
      openai: "https://api.openai.com/v1",
      anthropic: "https://api.anthropic.com/v1",
      groq: "https://api.groq.com/openai/v1",
      together: "https://api.together.xyz/v1",
    }

    return baseUrls[providerId] || ""
  }

  getAvailableModels(providerId: string): string[] {
    const models: Record<string, string[]> = {
      cerebras: ["GPT-OSS-120B", "GPT-OSS-70B", "GPT-OSS-13B"],
      openai: ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"],
      anthropic: ["claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"],
      groq: ["llama3-70b-8192", "llama3-8b-8192", "mixtral-8x7b-32768"],
      together: [
        "meta-llama/Llama-2-70b-chat-hf",
        "codellama/CodeLlama-34b-Instruct-hf",
        "mistralai/Mistral-7B-Instruct-v0.1",
      ],
    }

    return models[providerId] || []
  }
}

export const apiClient = new ApiClient()
export type { ApiProvider, ChatMessage, ChatResponse }
