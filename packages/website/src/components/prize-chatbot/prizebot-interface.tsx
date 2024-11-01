'use client'

import { IconMessageChatbot } from '@tabler/icons-react'
import { Avatar, AvatarFallback, AvatarImage } from '@viaprize/ui/avatar'
import { Badge } from '@viaprize/ui/badge'
import { Button } from '@viaprize/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@viaprize/ui/card'
import { Input } from '@viaprize/ui/input'
import { ScrollArea } from '@viaprize/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@viaprize/ui/sheet'
import { Bot, ChevronDown, DollarSign, Search, Trophy, X } from 'lucide-react'
import { useEffect, useState } from 'react'

type Message = {
  role: 'bot' | 'user'
  content: string
}

type Prize = {
  id: string
  title: string
  description: string
  amount: number
  deadline: string
}

export default function PrizeChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [showArrow, setShowArrow] = useState(true)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content:
        'Hello! How can I assist you today? Are you looking to donate to a prize, build a project for a prize, or do you need help with something else?',
    },
  ])
  const [input, setInput] = useState('')
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowArrow(false)
    }, 10000) // Hide arrow after 10 seconds

    return () => clearTimeout(timer)
  }, [])

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { role: 'user', content: input }])
      setInput('')
      // Simulate a search for prizes
      setTimeout(() => {
        const fakePrize: Prize = {
          id: '1',
          title: 'AI-Powered Sustainable Energy Solution',
          description:
            'Develop an AI system to optimize renewable energy distribution in urban areas.',
          amount: 100000,
          deadline: '2023-12-31',
        }
        setSelectedPrize(fakePrize)
        setMessages((prev) => [
          ...prev,
          {
            role: 'bot',
            content: `I found a prize that might interest you: "${fakePrize.title}". Would you like to see more details?`,
          },
        ])
      }, 1000)
    }
  }

  const handlePrizeAction = (action: 'donate' | 'join') => {
    if (selectedPrize) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'user',
          content:
            action === 'donate'
              ? 'I want to donate to this prize'
              : 'I want to join as a contestant',
        },
        {
          role: 'bot',
          content: `Great! Here's how you can ${action} for the prize "${selectedPrize.title}":`,
        },
        {
          role: 'bot',
          content:
            action === 'donate'
              ? 'Please visit our secure donation page to proceed with your contribution.'
              : 'To join as a contestant, please submit your proposal through our online application form.',
        },
        { role: 'bot', content: 'Is there anything else I can help you with?' },
      ])
      setSelectedPrize(null)
    }
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            className="fixed bottom-4 right-4 rounded-full w-16 h-16 shadow-lg"
            size="icon"
            onClick={() => setShowArrow(false)}
          >
            <Bot className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="fixed top-28 right-4 h-[70vh] max-h-[600px] max-w-[50%] p-0"
        >
          <Card className="h-full flex flex-col rounded-b-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
              <SheetHeader className="flex flex-row items-center gap-4">
                <Avatar>
                  <AvatarImage src="/viaprizeBg.png" alt="Bot" />
                  <AvatarFallback>BOT</AvatarFallback>
                </Avatar>
                <SheetTitle>Prize Chatbot</SheetTitle>
              </SheetHeader>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden p-4">
              <ScrollArea className="h-full pr-4">
                {messages.map((message) => (
                  <div
                    key={message.content}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                  >
                    {message.role === 'bot' && (
                      // <Avatar className="mr-2">
                      //   <AvatarImage src="/viaprizeBg.png" alt="Bot" />
                      //   <AvatarFallback>BOT</AvatarFallback>
                      // </Avatar>

                      <Bot className="h-[80px] w-[80px] mr-2" />
                    )}
                    <div
                      className={`rounded-lg p-3 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {selectedPrize && (
                  <Card className="mb-4">
                    <CardHeader>
                      <SheetTitle>{selectedPrize.title}</SheetTitle>
                      <Badge variant="secondary">
                        ${selectedPrize.amount.toLocaleString()}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <p>{selectedPrize.description}</p>
                      <p className="mt-2">
                        <strong>Deadline:</strong> {selectedPrize.deadline}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        onClick={() => handlePrizeAction('donate')}
                        variant="outline"
                      >
                        <DollarSign className="mr-2 h-4 w-4" />
                        Donate
                      </Button>
                      <Button onClick={() => handlePrizeAction('join')}>
                        <Trophy className="mr-2 h-4 w-4" />
                        Join as Contestant
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </ScrollArea>
            </CardContent>
            <CardFooter className="p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex w-full items-center space-x-2"
              >
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <Button type="submit" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </CardFooter>
          </Card>
        </SheetContent>
      </Sheet>
    </>
  )
}
