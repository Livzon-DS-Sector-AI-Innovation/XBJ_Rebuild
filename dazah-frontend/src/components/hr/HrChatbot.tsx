'use client'

import { useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import {
  Drawer,
  FloatButton,
  Input,
  Button,
  Spin,
  Avatar,
  Tag,
} from 'antd'
import {
  RobotOutlined,
  SendOutlined,
  ClearOutlined,
  CommentOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useHrChatStore } from '@/stores/hrChat'

const { TextArea } = Input

function getPageFromPath(path: string): { page: string; name: string } {
  if (path.includes('/hr/roster')) return { page: 'roster', name: '员工花名册' }
  if (path.includes('/hr/profile')) return { page: 'profile', name: '员工档案' }
  if (path.includes('/hr/departments')) return { page: 'departments', name: '部门管理' }
  if (path.includes('/hr/offboarding')) return { page: 'offboarding', name: '离职管理' }
  if (path.includes('/hr/attendance')) return { page: 'attendance', name: '考勤管理' }
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
        style={{ right: 24, bottom: 24 }}
      />

      <Drawer
        placement="right"
        width={440}
        open={isOpen}
        onClose={() => setOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <RobotOutlined className="text-blue-500" />
            <span className="font-semibold">HR 智能助手 · 小智</span>
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
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <Avatar
                icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                className={msg.role === 'user' ? 'bg-blue-500' : 'bg-green-500'}
                size="small"
              />
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100'
                }`}
              >
                {msg.content || (msg.role === 'assistant' && isLoading && idx === messages.length - 1) ? (
                  <span>{msg.content}</span>
                ) : null}
                {msg.role === 'assistant' &&
                  idx === messages.length - 1 &&
                  isLoading &&
                  !msg.content && <Spin size="small" />}
              </div>
            </div>
          ))}
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
          </div>
        </div>
      </Drawer>
    </>
  )
}
