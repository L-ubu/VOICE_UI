// stores/conversation.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Type definitions
export type MessageSender = 'user' | 'assistant'
export type MessageType = 'question' | 'suggestion' | 'warning'

export interface Message {
  id: string
  sender: MessageSender
  message: string
  suggestions?: string[]
  timestamp: Date
  type: MessageType
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  currentStep: number
  createdAt: Date
  updatedAt: Date
}

export interface HistoryObject {
  role: MessageSender;
  content: string;
}

export const useConversationStore = defineStore('conversation', () => {
  // State
  const conversations = ref<Conversation[]>([])
  const activeConversationId = ref<string | null>(null)
  const isLoading = ref(false)

  // Getters
  const activeConversation = computed(() => {
    if (!activeConversationId.value) return null
    return conversations.value.find(conv => conv.id === activeConversationId.value) || null
  })

  const activeMessages = computed(() => {
    return activeConversation.value?.messages || []
  })

  const messagesByType = computed(() => {
    if (!activeConversation.value) return { question: [], suggestion: [], warning: [] }
    
    return activeConversation.value.messages.reduce((acc, message) => {
      acc[message.type].push(message)
      return acc
    }, { question: [] as Message[], suggestion: [] as Message[], warning: [] as Message[] })
  })

  const messagesBySender = computed(() => {
    if (!activeConversation.value) return { user: [], assistant: [] }
    
    return activeConversation.value.messages.reduce((acc, message) => {
      acc[message.sender].push(message)
      return acc
    }, { user: [] as Message[], assistant: [] as Message[] })
  })

  const lastMessage = computed(() => {
    const messages = activeMessages.value
    return messages.length > 0 ? messages[messages.length - 1] : null
  })


  // Actions
  const createConversation = (title?: string): string => {
    const newConversation: Conversation = {
      id: generateId(),
      title: title || `Conversation ${conversations.value.length + 1}`,
      currentStep: 1,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    conversations.value.push(newConversation)
    activeConversationId.value = newConversation.id
    
    return newConversation.id
  }

  const setActiveConversation = (conversationId: string) => {
    const conversation = conversations.value.find(conv => conv.id === conversationId)
    if (conversation) {
      activeConversationId.value = conversationId
    }
  }

  const addMessage = (
    sender: MessageSender,
    message: string,
    type: MessageType = 'question',
    conversationId?: string
  ): HistoryObject[] => {
    const targetConversationId = conversationId || activeConversationId.value
    
    if (!targetConversationId) {
      throw new Error('No active conversation. Create or select a conversation first.')
    }

    const conversation = conversations.value.find(conv => conv.id === targetConversationId)
    if (!conversation) {
      throw new Error('Conversation not found')
    }

    const newMessage: Message = {
      id: generateId(),
      sender,
      message,
      type,
      timestamp: new Date()
    }

    conversation.messages.push(newMessage)
    conversation.updatedAt = new Date()

    return conversation.messages.map((m) => {
      return {
        role: m.sender,
        content: m.message
      }
    });
  }

  const addUserMessage = (message: string, type: MessageType = 'question') => {
    return addMessage('user', message, type)
  }

  const addGooseMessage = (message: string, suggestions: Suggestion[] = [], type: MessageType = 'suggestion') => {
    return addMessage('assistant', message, type)
  }

  const updateMessage = (messageId: string, updates: Partial<Pick<Message, 'message' | 'type'>>) => {
    if (!activeConversation.value) return false

    const messageIndex = activeConversation.value.messages.findIndex(msg => msg.id === messageId)
    if (messageIndex === -1) return false

    const message = activeConversation.value.messages[messageIndex]
    Object.assign(message, updates)
    activeConversation.value.updatedAt = new Date()

    return true
  }

  const deleteMessage = (messageId: string): boolean => {
    if (!activeConversation.value) return false

    const messageIndex = activeConversation.value.messages.findIndex(msg => msg.id === messageId)
    if (messageIndex === -1) return false

    activeConversation.value.messages.splice(messageIndex, 1)
    activeConversation.value.updatedAt = new Date()

    return true
  }

  const deleteConversation = (conversationId: string): boolean => {
    const index = conversations.value.findIndex(conv => conv.id === conversationId)
    if (index === -1) return false

    conversations.value.splice(index, 1)
    
    // If we deleted the active conversation, clear the active ID
    if (activeConversationId.value === conversationId) {
      activeConversationId.value = null
    }

    return true
  }

  const clearActiveConversation = () => {
    if (!activeConversation.value) return

    activeConversation.value.messages = []
    activeConversation.value.updatedAt = new Date()
  }

  const updateConversationTitle = (conversationId: string, title: string): boolean => {
    const conversation = conversations.value.find(conv => conv.id === conversationId)
    if (!conversation) return false

    conversation.title = title
    conversation.updatedAt = new Date()
    return true
  }

  const getConversationById = (conversationId: string): Conversation | null => {
    return conversations.value.find(conv => conv.id === conversationId) || null
  }

  const searchMessages = (query: string, conversationId?: string): Message[] => {
    const targetConversations = conversationId 
      ? [getConversationById(conversationId)].filter(Boolean) as Conversation[]
      : conversations.value

    return targetConversations
      .flatMap(conv => conv.messages)
      .filter(message => 
        message.message.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  // Utility function to generate unique IDs
  const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  return {
    // State
    conversations,
    activeConversationId,
    isLoading,
    
    // Getters
    activeConversation,
    activeMessages,
    messagesByType,
    messagesBySender,
    lastMessage,
    
    // Actions
    createConversation,
    setActiveConversation,
    addMessage,
    addUserMessage,
    addGooseMessage,
    updateMessage,
    deleteMessage,
    deleteConversation,
    clearActiveConversation,
    updateConversationTitle,
    getConversationById,
    searchMessages
  }
})