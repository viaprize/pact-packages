'use client'

import { getImageUploadUrl } from '@/actions/image-get'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/trpc/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@viaprize/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@viaprize/ui/card'
import { Form } from '@viaprize/ui/form'
import { Skeleton } from '@viaprize/ui/skeleton'
import { differenceInMinutes } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { DescriptionStep } from './description-step'
import { type FormValues, type Question, formSchema } from './form-schema'
import { QuestionsStep } from './questions-step'
import { SkillsCategoryStep } from './skills-catagories-step'
import { TimingStep } from './times-step'
import { TitleDescriptionStep } from './title-description-step'

export default function BountyCreationForm() {
  const [step, setStep] = useState(1)
  const [initialQuestion, setInitialQuestion] = useState<Question | null>(null)
  const { session } = useAuth()
  const submitting = useRef(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      aiQuestions: [],
      title: '',
      fullDescription: '',
      skills: [],
      category: '',
    },
  })

  const { mutateAsync: generateQuestion, isPending: generatingQuestions } =
    api.prizes.ai.generateInitialQuestion.useMutation()
  const {
    mutateAsync: generateTitleAndDescription,
    isPending: generatingTitleAndDescription,
  } = api.prizes.ai.generateTitleAndDescription.useMutation()

  const {
    mutateAsync: generateSkillsAndCatagories,
    isPending: generatingSkills,
  } = api.prizes.ai.generateSkillsCategory.useMutation()

  const { mutateAsync: createPrize, isPending: creatingPrize } =
    api.prizes.createPrize.useMutation()

  const router = useRouter()

  console.log({ values: form.getValues() })

  const onSubmit = async (values: FormValues) => {
    submitting.current = true
    const ImageToUpload = await convertBlobUrlToFile(
      values.imageLocalUrl,
      'image',
    )
    const imageUploadUrl = await getImageUploadUrl()
    toast.promise(
      async () => {
        const image = await fetch(imageUploadUrl, {
          body: ImageToUpload,
          method: 'PUT',
          headers: {
            'Content-Type': ImageToUpload.type,
            'Content-Disposition': `attachment; filename="${encodeURIComponent(
              ImageToUpload.name,
            )}"`,
            'Access-Control-Allow-Origin': '*',
          },
        })

        if (!image.ok) {
          form.setError('imageLocalUrl', { message: 'Failed to upload image' })
          throw new Error('Failed to upload image')
        }
        console.log(imageUploadUrl, 'imageUploadUrl')

        return extractedUrl
      },
      {
        loading: 'Uploading Image...',
        success: 'Image Uploaded',
        error: 'Failed to upload Image',
      },
    )
    const extractedUrl = `${new URL(imageUploadUrl).origin}${
      new URL(imageUploadUrl).pathname
    }`
    console.log({ values })
    toast.promise(
      createPrize({
        title: values.title,
        description: values.fullDescription,
        skillSets: values.skills.map((s) => s.value),
        // priorities: values.category ? [values.category] : [],
        startSubmissionDate: values.submissionStartDate.toISOString(),
        submissionDurationInMinutes: differenceInMinutes(
          values.submissionEndDate,
          values.submissionStartDate,
        ),
        imageUrl: extractedUrl,
        startVotingDate: values.submissionEndDate.toISOString(),
        votingDurationInMinutes: differenceInMinutes(
          values.votingEndDate,
          values.submissionEndDate,
        ),
      }).then(() => {
        router.push(`/profile/${session?.user.username}`)
      }),
      {
        loading: 'Creating Bounty...',
        success: 'Bounty Created',
        error: 'Failed to create Bounty',
      },
    )
    submitting.current = false
  }

  const handleNextStep = async () => {
    if (step === 1) {
      const description = form.getValues('description')
      setStep(2)
      const questions = await generateQuestion({ description })
      setInitialQuestion(questions)
    } else if (step === 2) {
      const answers = form.getValues('aiQuestions')
      console.log(answers, 'answers')
      setStep(3)
      const suggestions = await generateTitleAndDescription({
        userChoices: answers,
        description: form.getValues('description'),
      })
      form.setValue('title', suggestions.title)
      form.setValue('fullDescription', suggestions.description)
    } else if (step === 3) {
      setStep(4)
      const skillsAndCatagories = await generateSkillsAndCatagories({
        title: form.getValues('title'),
        fullDescription: form.getValues('fullDescription'),
      })
      form.setValue(
        'skills',
        skillsAndCatagories.skills.map((s) => {
          return {
            label: s.skill,
            value: s.skill.toLowerCase().replace(' ', '_'),
          }
        }),
      )
      form.setValue('category', skillsAndCatagories.category)
    } else {
      setStep(step + 1)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return <DescriptionStep form={form} />
      case 2:
        return generatingQuestions ? (
          <QuestionsStepSkeleton />
        ) : (
          initialQuestion && (
            <QuestionsStep form={form} initialQuestion={initialQuestion} />
          )
        )
      case 3:
        return generatingTitleAndDescription ? (
          <TitleDescriptionStepSkeleton />
        ) : (
          <TitleDescriptionStep form={form} />
        )
      case 4:
        return generatingSkills ? (
          <SkillsStepSkeleton />
        ) : (
          <SkillsCategoryStep form={form} />
        )
      case 5:
        return <TimingStep form={form} />
      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Create Prize</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              (data) => {
                submitting.current = true
                console.log('Form submitted successfully', data)
                onSubmit(data)
              },
              (errors) => {
                submitting.current = true
                console.error('Form validation failed', errors)
                if (submitting && step === 5) {
                  toast.error('Please fill all the fields')
                }
              },
            )}
            className="space-y-6"
          >
            {renderStep()}
            <div className="flex justify-between">
              {step > 1 && (
                <Button type="button" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              )}
              {step < 5 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  disabled={
                    generatingQuestions ||
                    generatingTitleAndDescription ||
                    generatingSkills ||
                    creatingPrize ||
                    (form.getValues('aiQuestions').length < 3 && step === 2)
                  }
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={creatingPrize}
                  loading={creatingPrize}
                >
                  Create Bounty
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

function QuestionsStepSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

function TitleDescriptionStepSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}

function SkillsStepSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}

function convertBlobUrlToFile(
  blobUrl: string,
  fileName: string,
): Promise<File> {
  return fetch(blobUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.blob()
    })
    .then((blob) => {
      // Create a File from the Blob
      return new File([blob], fileName, { type: blob.type })
    })
    .catch((error) => {
      console.error('Error fetching the Blob:', error)
      throw error // Re-throw the error for further handling if needed
    })
}
