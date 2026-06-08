'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  Drawer,
  FloatButton,
  Input,
  Button,
  Spin,
  Avatar,
  Tag,
  Tooltip,
} from 'antd'
import {
  RobotOutlined,
  SendOutlined,
  ClearOutlined,
  CommentOutlined,
  UserOutlined,
  BulbOutlined,
  AudioOutlined,
  AudioMutedOutlined,
} from '@ant-design/icons'
import { useHrChatStore } from '@/stores/hrChat'

const { TextArea } = Input

function getPageFromPath(path: string): { page: string; name: string } {
  if (path.includes('/hr/roster')) return { page: 'roster', name: '员工花名册' }
  if (path.includes('/hr/profile')) return { page: 'profile', name: '员工档案' }
  if (path.includes('/hr/departments')) return { page: 'departments', name: '部门管理' }
  if (path.includes('/hr/offboarding')) return { page: 'offboarding', name: '离职管理' }
  if (path.includes('/hr/onboarding')) return { page: 'onboarding', name: '入职管理' }
  if (path.includes('/hr/training')) return { page: 'training', name: '培训管理' }
  if (path.includes('/hr/teams')) return { page: 'teams', name: '班组管理' }
  return { page: 'hr', name: '人事管理' }
}

const QUICK_QUESTIONS = [
  '统计各部门人数',
  '分析在职员工学历分布',
  '本月有哪些合同即将到期？',
  '整理一份离职原因汇总',
]


export default function HrChatbot() {
  const pathname = usePathname()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<any>(null)
  const recognitionRef = useRef<any>(null)

  const {
    messages,
    isOpen,
    isLoading,
    inputValue,
    toggleOpen,
    setOpen,
    setInputValue,
    setPageContext,
    sendMessage,
    clearMessages,
  } = useHrChatStore()

  const [isRecording, setIsRecording] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)

  // Check browser support for SpeechRecognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setSpeechSupported(!!SpeechRecognition)
  }, [])

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = 'zh-CN'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsRecording(true)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInputValue((prev: string) => {
        const separator = prev && !prev.endsWith(' ') ? ' ' : ''
        return prev + separator + transcript
      })
      setTimeout(() => inputRef.current?.focus(), 100)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsRecording(false)
    }

    recognitionRef.current = recognition

    return () => {
      recognition.abort()
    }
  }, [setInputValue])

  const toggleRecording = useCallback(() => {
    if (!recognitionRef.current) return
    if (isRecording) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
    }
  }, [isRecording])

  // Update page context when pathname changes
  useEffect(() => {
    const { page, name } = getPageFromPath(pathname || '')
    setPageContext({ page: `${page}（${name}）` })
  }, [pathname, setPageContext])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return
    await sendMessage(inputValue.trim())
  }, [inputValue, isLoading, sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      <FloatButton
        icon={<RobotOutlined />}
        tooltip="HR 智能助手"
        onClick={toggleOpen}
        style={{ right: 24, bottom: 24, zIndex: 9999 }}
        className="shadow-lg"
      />

      <Drawer
        placement="right"
        width={460}
        open={isOpen}
        onClose={() => setOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <RobotOutlined className="text-blue-500" />
            <span className="font-semibold">HR 智能助手 · 小H</span>
          </div>
        }
        extra={
          <Button
            size="small"
            icon={<ClearOutlined />}
            onClick={clearMessages}
            disabled={isLoading}
          >
            清空
          </Button>
        }
        styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' } }}
      >
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg, idx) => {
            const isLastAssistant =
              msg.role === 'assistant' && idx === messages.length - 1
            const isThinking =
              isLastAssistant && isLoading && !!msg.reasoning_content && !msg.content

            return (
              <div
                key={idx}
                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <Avatar
                  icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                  className={msg.role === 'user' ? 'bg-blue-500' : 'bg-green-500'}
                  size="small"
                />
                <div className="max-w-[85%] space-y-1">
                  {msg.role === 'assistant' && (msg.reasoning_content || isThinking) && (
                    <div className="rounded-md bg-amber-50 border border-amber-100 px-2 py-1.5">
                      <div className="flex items-center gap-1 text-amber-600 text-xs font-medium mb-0.5">
                        <BulbOutlined />
                        {isThinking ? '正在思考...' : '思考过程'}
                      </div>
                      <div className="text-xs text-amber-700 whitespace-pre-wrap leading-relaxed">
                        {msg.reasoning_content}
                      </div>
                    </div>
                  )}

                  <div
                    className={`rounded-lg px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-800 shadow-sm border border-gray-100'
                    }`}
                  >
                    {msg.role === 'assistant' && msg.content ? (
                      <span>{msg.content}</span>
                    ) : msg.role === 'user' ? (
                      <span>{msg.content}</span>
                    ) : isLastAssistant && isLoading && !msg.content ? (
                      <Spin size="small" />
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick questions */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 bg-white border-t border-gray-100">
            <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
              <CommentOutlined />
              快捷提问
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((q) => (
                <Tag
                  key={q}
                  className="cursor-pointer hover:text-blue-500 hover:border-blue-300 transition-colors"
                  onClick={() => {
                    if (!isLoading) sendMessage(q)
                  }}
                >
                  {q}
                </Tag>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="p-3 bg-white border-t border-gray-200">
          <div className="flex gap-2">
            <TextArea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入问题，按 Enter 发送，Shift+Enter 换行"
              autoSize={{ minRows: 1, maxRows: 4 }}
              disabled={isLoading}
              className="flex-1"
            />
            {speechSupported && (
              <Tooltip title={isRecording ? '点击停止录音' : '点击语音输入'}>
                <Button
                  icon={isRecording ? <AudioMutedOutlined /> : <AudioOutlined />}
                  onClick={toggleRecording}
                  danger={isRecording}
                  className="self-end"
                />
              </Tooltip>
            )}
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={isLoading}
              disabled={!inputValue.trim()}
              className="self-end"
            />
          </div>
          <div className="text-xs text-gray-400 mt-1 text-right">
            由 Moonshot AI 提供支持
            {speechSupported && ' · 支持语音输入'}
          </div>
        </div>
      </Drawer>
    </>
  )
}
