import { create } from 'zustand'
import { ChatMessage, HrPageContext, streamChat } from '@/lib/api/ai'

interface HrChatState {
  messages: ChatMessage[]
  isOpen: boolean
  isLoading: boolean
  inputValue: string
  pageContext: HrPageContext | null

  toggleOpen: () => void
  setOpen: (open: boolean) => void
  setInputValue: (value: string) => void
  setPageContext: (ctx: HrPageContext | null) => void
  sendMessage: (content: string) => Promise<void>
  clearMessages: () => void
}

export const useHrChatStore = create<HrChatState>((set, get) => ({
  messages: [
    {
      role: 'assistant',
      content:
        '你好！我是 HR 智能助手「小智」。\n你可以问我关于员工数据查询、整理分析或人事管理建议的问题。',
    },
  ],
  isOpen: false,
  isLoading: false,
  inputValue: '',
  pageContext: null,

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
  setInputValue: (value) => set({ inputValue: value }),
  setPageContext: (ctx) => set({ pageContext: ctx }),

  sendMessage: async (content: string) => {
    if (!content.trim()) return

    const { messages, pageContext } = get()
    const userMsg: ChatMessage = { role: 'user', content: content.trim() }
    const assistantMsg: ChatMessage = { role: 'assistant', content: '' }

    set({
      messages: [...messages, userMsg, assistantMsg],
      isLoading: true,
      inputValue: '',
    })

    const allMessages = [...messages, userMsg]

    await streamChat(
      allMessages,
      pageContext,
      (chunk) => {
        set((state) => {
          const msgs = [...state.messages]
          const last = msgs[msgs.length - 1]
          if (last && last.role === 'assistant') {
            last.content += chunk
          }
          return { messages: msgs }
        })
      },
      () => {
        set({ isLoading: false })
      },
      (err) => {
        set((state) => {
          const msgs = [...state.messages]
          const last = msgs[msgs.length - 1]
          if (last && last.role === 'assistant') {
            last.content += `\n\n[错误] ${err.message}`
          }
          return { messages: msgs, isLoading: false }
        })
      },
    )
  },

  clearMessages: () =>
    set({
      messages: [
        {
          role: 'assistant',
          content:
            '对话已清空。我是 HR 智能助手「小智」，有什么可以帮你的？',
        },
      ],
    }),
}))
