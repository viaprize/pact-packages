import { formatDate, formatUnderscoreString } from '@/lib/utils'
import { auth } from '@/server/auth'
import { IconCalendarDue } from '@tabler/icons-react'
import type { selectPrizeType } from '@viaprize/core/database/schema/prizes'
import type { PrizeStages } from '@viaprize/core/lib/prizes'
import { Avatar, AvatarFallback, AvatarImage } from '@viaprize/ui/avatar'
import { Badge } from '@viaprize/ui/badge'
import { Separator } from '@viaprize/ui/separator'
import { addMinutes } from 'date-fns'
import Image from 'next/image'
import DonateCard from './donate-card'

const DeadlineMessage: React.FC<{
  textColor?: string
  message?: string
}> = ({ textColor, message }) => {
  return (
    <div className={`flex items-center ${textColor}`}>
      <IconCalendarDue className="mr-2" />
      <span>{message}</span>
    </div>
  )
}

interface DetailsProps extends selectPrizeType {
  authorUsername: string
  authorImage: string
  authorName: string
}

export default function Details({
  funds,
  stage,
  title,
  authorUsername,
  skillSets,
  description,
  primaryContractAddress,
  authorImage,
  authorName,
  imageUrl,
  startSubmissionDate,
  startVotingDate,
  submissionDurationInMinutes,
  votingDurationInMinutes,
}: DetailsProps) {
  // Calculate end dates
  const submissionEndDate = startSubmissionDate
    ? addMinutes(
        new Date(startSubmissionDate),
        submissionDurationInMinutes || 0,
      )
    : undefined
  const votingEndDate = startVotingDate
    ? addMinutes(new Date(startVotingDate), votingDurationInMinutes || 0)
    : undefined
  const submissionEndDateString = submissionEndDate
    ? submissionEndDate.toISOString()
    : undefined
  const votingEndDateString = votingEndDate
    ? votingEndDate.toISOString()
    : undefined

  return (
    <>
      <div className="p-3 w-full lg:flex space-x-0 space-y-3 lg:space-y-0 lg:space-x-5">
        <Image
          src={
            imageUrl ||
            'https://placehold.jp/24/3d4070/ffffff/1280x720.png?text=No%20Image'
          }
          width={250}
          height={200}
          className="h-full lg:w-auto rounded-md object-cover aspect-video"
          alt="Image"
        />

        <div className="w-full">
          <h1 className="text-2xl">{title}</h1>

          <div className="text-lg text-primary flex items-center mt-1">
            <Avatar className="mr-2">
              <AvatarImage src={authorImage ?? undefined} alt={authorName} />
              <AvatarFallback>{authorName.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <span>{authorName}</span>
          </div>

          <Badge variant="secondary" className="mt-2 text-sm text-primary">
            {formatUnderscoreString(stage || '')}
          </Badge>

          {/* Conditional Rendering Based on Stage */}
          <div className="mt-4 space-y-2">
            {stage === 'NOT_STARTED' && startSubmissionDate && (
              <DeadlineMessage
                textColor="text-primary"
                message={`Submission starts on: ${formatDate(startSubmissionDate)}`}
              />
            )}

            {stage === 'SUBMISSIONS_OPEN' && (
              <>
                {submissionEndDate && (
                  <DeadlineMessage
                    textColor="text-red-500"
                    message={`Submission ends on: ${formatDate(submissionEndDateString)}`}
                  />
                )}
                {startVotingDate && (
                  <DeadlineMessage
                    textColor="text-primary"
                    message={`Voting starts on: ${formatDate(startVotingDate)}`}
                  />
                )}
              </>
            )}

            {stage === 'VOTING_OPEN' && votingEndDate && (
              <DeadlineMessage
                textColor="text-red-500"
                message={`Voting ends on: ${formatDate(votingEndDateString)}`}
              />
            )}
          </div>
        </div>

        <div className="w-full">
          {stage === 'NOT_STARTED' ||
          stage === 'VOTING_OPEN' ||
          stage === 'SUBMISSIONS_OPEN' ? (
            <DonateCard
              contractAddress={primaryContractAddress ?? ''}
              projectImage={imageUrl ?? ''}
              funds={funds}
              projectName={title}
            />
          ) : null}
        </div>
      </div>
      <Separator className="my-2" />
      <div className="px-3 w-full">
        <div className="w-full lg:flex lg:items-center lg:justify-between  space-y-2 lg:space-y-0">
          <h1 className="text-2xl font-semibold ml-2 text-primary">
            About this Prize
          </h1>
          <div className="space-x-2 ">
            {skillSets?.map((badge) => (
              <Badge key={badge}>{formatUnderscoreString(badge)}</Badge>
            ))}
          </div>
        </div>
        <p className="p-2 mt-3 rounded-md whitespace-pre-wrap">{description}</p>
      </div>
    </>
  )
}
