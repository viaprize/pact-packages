'use client'

import * as chrono from 'chrono-node'
import { CalendarDays } from 'lucide-react'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import { cn } from '@viaprize/ui'
import { Button } from '@viaprize/ui/button'
import { Input } from '@viaprize/ui/input'

import {
  generateDate,
  generateDateString,
  isValidDateFormat,
} from './date-utils'
import { DateTimePickerPopover } from './picker-popover'

const defaultSuggestions = [
  'Tomorrow',
  'Tomorrow morning',
  'Tomorrow night',
  'Next Monday',
  'Next Sunday',
]

function generateSuggestions(
  inputValue: string,
  suggestion: Suggestion | null,
): Suggestion[] {
  if (!inputValue.length) {
    return defaultSuggestions.map((suggestion) => ({
      date: generateDate(suggestion),
      inputString: suggestion,
    })) as Suggestion[]
  }

  const filteredDefaultSuggestions = defaultSuggestions.filter((suggestion) =>
    suggestion.toLowerCase().includes(inputValue.toLowerCase()),
  )
  if (filteredDefaultSuggestions.length) {
    return filteredDefaultSuggestions.map((suggestion) => ({
      date: generateDate(suggestion),
      inputString: suggestion,
    })) as Suggestion[]
  }

  return [suggestion].filter((suggestion) => suggestion !== null)
}

interface Suggestion {
  date: Date
  inputString: string
}

interface DateTimePickerProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  dateTime: Date | undefined
  setDateTime: React.Dispatch<React.SetStateAction<Date | undefined>>
  minDate?: Date
}

export const DateTimePicker = forwardRef<HTMLInputElement, DateTimePickerProps>(
  ({ dateTime, setDateTime, minDate, ...props }, ref) => {
    const [suggestion, setSuggestion] = useState<Suggestion | null>(null)
    const [inputValue, setInputValue] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [isClosing, setClosing] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(0)

    const inputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    useImperativeHandle(ref, () => inputRef.current!)

    const suggestions = generateSuggestions(inputValue, suggestion)

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
      setInputValue(e.target.value)
      setIsOpen(true)
      setSelectedIndex(0)
      const result = chrono.parseDate(e.target.value)
      if (result) {
        setSuggestion({ date: result, inputString: e.target.value })
      } else {
        setSuggestion(null)
      }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prevIndex) =>
          prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex,
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0))
      } else if (e.key === 'Enter' && isOpen && suggestions.length > 0) {
        e.preventDefault()
        const dateStr = generateDateString(
          suggestions[selectedIndex]?.date ?? new Date(),
        )
        setInputValue(dateStr)
        setDateTime(suggestions[selectedIndex]?.date)
        closeDropdown()
      } else if (e.key === 'Escape') {
        closeDropdown()
      }
    }

    function closeDropdown() {
      setClosing(true)
      setSelectedIndex(0)
      setTimeout(() => {
        setIsOpen(false)
        setClosing(false)
      }, 200)
    }

    useEffect(() => {
      if (!inputValue) setDateTime(undefined)
      if (!isValidDateFormat(inputValue)) setDateTime(undefined)
    }, [inputValue, setDateTime])

    useEffect(() => {
      function handleClickOutside(e: MouseEvent) {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current &&
          !inputRef.current.contains(e.target as Node)
        ) {
          closeDropdown()
        }
      }

      document.addEventListener('mousedown', handleClickOutside)

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [])

    return (
      <div className="relative">
        <div className="relative">
          <Input
            placeholder="Tomorrow morning"
            {...props}
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            onClick={() => setIsOpen(true)}
          />
          <DateTimePickerPopover
            onOpen={() => setSuggestion(null)}
            dateTime={dateTime}
            setDateTime={setDateTime}
            setInputValue={setInputValue}
            disabled={(date) => date < new Date(minDate ?? new Date())}
          >
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-3 top-1/2 size-4 -translate-y-1/2 rounded-sm text-muted-foreground"
            >
              <span className="sr-only">Open normal date time picker</span>
              <CalendarDays />
            </Button>
          </DateTimePickerPopover>
        </div>

        {isOpen && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            role="dialog"
            className={cn(
              'absolute z-10 mt-2 w-full rounded-md border bg-popover p-0 shadow-md transition-all animate-in fade-in-0 zoom-in-95 slide-in-from-top-2',
              isClosing && 'duration-300 animate-out fade-out-0 zoom-out-95',
            )}
          >
            <ul className="max-h-56 overflow-auto p-1">
              {suggestions.map((suggestion, index) => (
                // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
                <li
                  key={suggestion.inputString}
                  // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: <explanation>
                  role="option"
                  aria-selected={selectedIndex === index}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-1 rounded px-2.5 py-2 text-sm',
                    index === selectedIndex &&
                      'bg-accent text-accent-foreground',
                  )}
                  onClick={() => {
                    const dateStr = generateDateString(suggestion.date)
                    setInputValue(dateStr)
                    setDateTime(suggestion.date)
                    closeDropdown()
                    inputRef.current?.focus()
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <span className="w-[110px] truncate xs:w-auto">
                    {suggestion.inputString}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {generateDateString(suggestion.date)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  },
)

DateTimePicker.displayName = 'DateTimePicker'
