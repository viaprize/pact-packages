import { generateEmbedding } from '@/server/utils/open-ai'
import { questionSchema } from '@/types/prize-form'
import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '../trpc'

export const prizesAiRouter = createTRPCRouter({
  generateInitialQuestion: protectedProcedure
    .input(
      z.object({
        description: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const result = await generateObject({
        model: openai('gpt-4o-mini-2024-07-18', {
          structuredOutputs: true,
        }),
        schemaName: 'questions',
        schemaDescription: 'generate questions and options',
        schema: z.object({
          questions: questionSchema.extend({
            multipleChoice: z.boolean(),
          }),
        }),
        prompt: `You are an AI assistant tasked with generating relevant technical questions
         to help freelancers understand a project's requirements. Based on the following project 
         description, create a set of questions that will help clarify the technical aspects and 
         functionality of the project.
          Project Description: ${input.description}
          Guidelines for generating questions:
          Focus on technical details and functionality requirements.
          Avoid business-related questions about vision, budget, or timelines.
          Ask questions that freelancers or technical employees would need to complete the project.
          give 4 options
          `,
      })
      return result.object.questions
    }),
  generateFollowUpQuestions: protectedProcedure
    .input(
      z.object({
        description: z.string(),
        previousQuestionsAndAnswer: z.array(
          z.object({
            question: z.string(),
            answer: z.string().or(z.array(z.string())),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      const previouslyAnsweredQuestionString = input.previousQuestionsAndAnswer
        .map((question) => `${question.question}: ${question.answer}`)
        .join(', ')
      const result = await generateObject({
        model: openai('gpt-4o-mini-2024-07-18', {
          structuredOutputs: true,
        }),
        schemaName: 'followUpQuestions',
        schemaDescription: 'generate follow up questions',
        schema: z.object({
          questions: questionSchema.extend({
            multipleChoice: z.boolean(),
          }),
        }),
        prompt: `You are an AI assistant tasked with generating a crucial follow-up
         question to further clarify a project's technical requirements. 
         Based on the initial project description and previously answered questions,
          create one final question that will provide the most important information about 
          the project's purpose and technical goals.
          Project Description: ${input.description}
          Previously Answered Questions and Responses:
          <previousQuestionsAndAnswers>${previouslyAnsweredQuestionString}</previousQuestionsAndAnswers>
          Guidelines for generating the follow-up question:
          Focus on the core technical purpose or primary functionality of the project.
          Avoid business-related aspects like vision, budget, or timelines.
          The question should help freelancers or technical employees understand the most critical aspect of the project.
          Provide at least 4 multiple-choice options for the answer.
          `,
      })
      return result.object.questions
    }),
  generateTitleAndDescription: protectedProcedure
    .input(
      z.object({
        userChoices: z.array(
          z.object({
            question: z.string(),
            answer: z.string().or(z.array(z.string())),
          }),
        ),
        description: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userChoicesString = input.userChoices
        .map((choice) => `${choice.question}: ${choice.answer}`)
        .join(', ')
      console.log('userChoicesString', userChoicesString, input)
      const result = await generateObject({
        model: openai(
          'ft:gpt-4o-mini-2024-07-18:aperturs:linked-exp-1:A2tb5FuW',
          {
            structuredOutputs: true,
          },
        ),
        schemaName: 'titleAndDescription',
        schemaDescription: 'generate title and description',
        schema: z.object({
          title: z.string(),
          description: z.string(),
        }),
        prompt: `You are an AI assistant tasked with creating a comprehensive project brief based on 
        user-provided information. Your goal is to generate a title, short description, 
        and detailed description that clearly communicates the project requirements to 
        potential freelancers or team members.
        Given the following information about a project:
        choices: ${userChoicesString}
        \n\nDescription: ${input.description}
        Please generate:
        A concise, attention-grabbing title (max 10 words) that summarizes the core purpose of the project.
        A detailed description (200-300 words) that covers:
        The project's background and context Specific goals and objectives
        Key features or functionalities required
        Technical requirements or preferences, if any
        Any unique challenges or constraints
         Expected deliverables

         some rules
         1. use bullet points to make it much more readable
         2. dont have sentence more than 10 words
         3. dont write in paragraphs instead write in bullet points
        `,
      })
      return result.object
    }),

  generateSkillsCategory: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        fullDescription: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const result = await generateObject({
        model: openai('gpt-4o-mini-2024-07-18', {
          structuredOutputs: true,
        }),
        schemaName: 'skillsCategory',
        schemaDescription: 'generate skills and category',
        schema: z.object({
          skills: z.array(
            z.object({
              icon: z.string(),
              skill: z.string(),
            }),
          ),
          category: z.string(),
        }),
        prompt: `The user is looking to create a bounty or a prize, and here are his basic needs, now we need to
         give him some suggestions about skills and category
        based on the answer he gave to our questions and also he made gave us a short description about what he wants
        few things to remeber before creating
        1. skills should be related to the project
        2. category should be related to the project,
        max 4 skills and 1 category
        \n\nDescription: ${input.fullDescription}`,
      })
      return result.object
    }),
  checkForSimilarPrizes: protectedProcedure
    .input(z.object({ text: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const embeddings = await generateEmbedding(input.text)
      const prizes = await ctx.viaprize.prizes.searchPrizes(embeddings)
      return prizes
    }),
  // generateEmbeddings: adminProcedure.query(async ({ ctx }) => {
  //   const prizes = await ctx.viaprize.database.database.query.prizes.findMany()
  //   for (const prize of prizes) {
  //     const embedded = `
  //     Title: ${prize.title}
  //     Description: ${prize.description}
  //     Start Voting Date: ${prize.startVotingDate}
  //     Start Submission Date: ${prize.startSubmissionDate}
  //     Submission Duration: ${prize.submissionDurationInMinutes} minutes
  //     Voting Duration: ${prize.votingDurationInMinutes} minutes
  //     Author: ${prize.authorUsername}
  //     priority: ${prize.priorities}
  //     skillSets: ${prize.skillSets}
  //   `
  //     const embedding = await generateEmbedding(embedded)
  //     await ctx.viaprize.prizes.putEmbeddingForPrize(prize.id, embedding)
  //   }
  // }),
})
