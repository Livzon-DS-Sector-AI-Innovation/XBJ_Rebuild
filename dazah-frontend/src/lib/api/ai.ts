const API_BASE = 'http://localhost:8001'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface HrPageContext {
  page: string
  filters?: Record<string, string | null | undefined>
  selected_ids?: string[]
  data_summary?: Record<string, string | number | null | undefined>
}

export async function streamChat(
  messages: ChatMessage[],
  pageContext: HrPageContext | null,
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (err: Error) => void,
) {
  try {
    const res = await fetch(`${API_BASE}/api/v1/ai/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        page_context: pageContext,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`请求失败: ${res.status} ${text}`)
    }

    const reader = res.body?.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    if (!reader) {
      throw new Error('无法读取响应流')
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.content) onChunk(data.content)
            if (data.done) onDone()
          } catch {
            // ignore malformed lines
          }
        }
      }
    }

    onDone()
  } catch (err: any) {
    onError(err instanceof Error ? err : new Error(String(err)))
  }
}
