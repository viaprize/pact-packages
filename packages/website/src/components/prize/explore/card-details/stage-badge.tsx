import type { PrizeStages } from '@viaprize/core/lib/prizes'
import { cn } from '@viaprize/ui'
import { AlertCircle, CheckCircle, Circle, Clock, XCircle } from 'lucide-react'

interface StageButtonProps {
  stage: PrizeStages
}

export default function StageButton({ stage }: StageButtonProps) {
  const getStageInfo = (stage: PrizeStages) => {
    switch (stage) {
      case 'NOT_STARTED':
        return {
          text: 'Not Started',
          color: 'bg-gray-100 text-gray-800',
          emoji: '⏳',
        }
      case 'SUBMISSIONS_OPEN':
        return {
          text: 'Submissions Open',
          color: 'bg-green-100 text-green-800',
          emoji: '📝',
          indicator: (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
            </span>
          ),
        }
      case 'VOTING_OPEN':
        return {
          text: 'Voting Open',
          color: 'bg-blue-100 text-blue-800',
          emoji: '🗳️',
        }
      case 'DISPUTE_AVAILABLE':
        return {
          text: 'Dispute Available',
          color: 'bg-yellow-100 text-yellow-800',
          emoji: '⚖️',
        }
      case 'DISPUTE_ACTIVE':
        return {
          text: 'Dispute Active',
          color: 'bg-orange-100 text-orange-800',
          emoji: '🔥',
          //   indicator: (
          //     <span className="relative flex h-3 w-3">
          //       <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
          //       <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500" />
          //     </span>
          //   ),
        }
      case 'WON':
        return {
          text: 'Won',
          color: 'bg-purple-100 text-purple-800',
          emoji: '🏆',
          //   indicator: <CheckCircle className="w-4 h-4 text-purple-500" />,
        }
      case 'REFUNDED':
        return {
          text: 'Refunded',
          color: 'bg-red-100 text-red-800',
          emoji: '⛔',
          //   indicator: <XCircle className="w-4 h-4 text-red-500" />,
        }
      default:
        return {
          text: 'Unknown',
          color: 'bg-gray-100 text-gray-800',
          emoji: '❓',
          indicator: <Circle className="w-4 h-4 text-gray-500" />,
        }
    }
  }

  const { text, color, emoji, indicator } = getStageInfo(stage)

  return (
    <div
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
        color,
        'relative',
      )}
    >
      <div className="flex items-center space-x-2">
        <span>{emoji}</span>
        <span>{text}</span>
        {indicator}
      </div>
    </div>
  )
}
