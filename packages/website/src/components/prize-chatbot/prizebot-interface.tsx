'use client'

import { api } from '@/trpc/react'
import { IconMessageChatbot } from '@tabler/icons-react'
import type { selectPrizeType } from '@viaprize/core/database/schema/prizes'
import { Avatar, AvatarFallback, AvatarImage } from '@viaprize/ui/avatar'
import { Badge } from '@viaprize/ui/badge'
import { Button } from '@viaprize/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@viaprize/ui/card'
import { Input } from '@viaprize/ui/input'
import { ScrollArea } from '@viaprize/ui/scroll-area'
import { Bot, ChevronDown, DollarSign, Loader, Search, Trophy, X } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'

type Message = {
  role: 'bot' | 'user'
  content: string
}

export default function PrizeChatbot() {
  const [isMinimized, setIsMinimized] = useState(true)
  const [showArrow, setShowArrow] = useState(true)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content:
        'Hello! How can I assist you today? Are you looking to donate to a prize, build a project for a prize, or do you need help with something else?',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [prizes, setPrizes] = useState<selectPrizeType[]>([])

  const checkPrizes = api.prizes.ai.checkForSimilarPrizes.useMutation()

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowArrow(false)
    }, 10000) // Hide arrow after 10 seconds

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages, prizes]) // Scroll when messages or prizes update

  const handleSend = async () => {
    if (input.trim()) {
      const currentInput = input
      setInput('') // Clear input immediately
      setIsLoading(true)
      setMessages((prev) => [...prev, { role: 'user', content: currentInput }])

      try {
        const results = await checkPrizes.mutateAsync({ text: currentInput })

        if (results && results.length > 0) {
          setPrizes(results)
          setMessages((prev) => [
            ...prev,
            {
              role: 'bot',
              content: `I found ${results.length} prize${results.length > 1 ? 's' : ''} that might interest you. Here's ${results.length > 1 ? 'the first one' : 'it'}:`,
            },
          ])
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: 'bot',
              content:
                "I couldn't find any matching prizes. Could you try rephrasing your question?",
            },
          ])
          setPrizes([])
        }
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'bot',
            content:
              'Sorry, I encountered an error while searching for prizes. Please try again.',
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handlePrizeAction = (action: 'donate' | 'join') => {
    // if (selectedPrize) {
    //   setMessages((prev) => [
    //     ...prev,
    //     {
    //       role: "user",
    //       content:
    //         action === "donate"
    //           ? "I want to donate to this prize"
    //           : "I want to join as a contestant",
    //     },
    //     {
    //       role: "bot",
    //       content: `Great! Here's how you can ${action} for the prize "${selectedPrize.title}":`,
    //     },
    //     {
    //       role: "bot",
    //       content:
    //         action === "donate"
    //           ? "Please visit our secure donation page to proceed with your contribution."
    //           : "To join as a contestant, please submit your proposal through our online application form.",
    //     },
    //     { role: "bot", content: "Is there anything else I can help you with?" },
    //   ]);
    //   setSelectedPrize(null);
    // }
  }

  const PrizeCard = ({ prize }: { prize: selectPrizeType }) => (
    <Card className="mb-4 max-w-[300px]">
      <CardHeader className="p-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-sm">{prize.title}</h3>
        </div>
        <div className="text-xs text-muted-foreground">
          by {prize.authorUsername}
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <p className="text-sm mb-2 line-clamp-2">{prize.description}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {prize.skillSets?.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-3 flex justify-between">
        <Button
          size="sm"
          onClick={() => handlePrizeAction('donate')}
          variant="outline"
        >
          <DollarSign className="mr-1 h-3 w-3" />
          Donate
        </Button>
        <Button size="sm" onClick={() => handlePrizeAction('join')}>
          <Trophy className="mr-1 h-3 w-3" />
          Join
        </Button>
      </CardFooter>
    </Card>
  )

  return (
    <div
      className={`fixed bottom-4 right-4 transition-all duration-300 ${isMinimized ? 'w-16 h-16' : 'w-[400px] h-[600px]'}`}
    >
      {isMinimized ? (
        <Button
          className="w-full h-full rounded-full shadow-lg"
          size="icon"
          onClick={() => setIsMinimized(false)}
        >
          <Bot className="h-6 w-6" />
        </Button>
      ) : (
        <Card className="h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/viaprizeBg.png" alt="Bot" />
                <AvatarFallback>BOT</AvatarFallback>
              </Avatar>
              <h2 className="font-semibold">Prize Chatbot</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(true)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-grow overflow-hidden p-3">
            <ScrollArea className="h-full pr-2" ref={scrollRef}>
              {messages.map((message, index) => (
                <div
                  key={`${message.content}-${index}`}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}
                >
                  {message.role === 'bot' && (
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src="/viaprizeBg.png" alt="Bot" />
                      <AvatarFallback>BOT</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-lg p-2 max-w-[80%] ${message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-2'
                      : 'bg-muted'
                      }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-center">
                  <span className="loading loading-spinner loading-md" />
                </div>
              )}
              {prizes.map((prize) => (
                <PrizeCard key={prize.id} prize={prize} />
              ))}
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-3">
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
                disabled={isLoading}
                onChange={(e) => setInput(e.target.value)}
                className="text-sm"
              />
              <Button type="submit" size="icon" className="h-8 w-8" disabled={isLoading}>
                {isLoading ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
