import AWS from 'aws-sdk';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject, generateText, tool } from 'ai';
import { z } from 'zod';
import Exa from 'exa-js';

export class GenerationUtils {
  private polly: AWS.Polly;
  private googleModel;
  private exa;

  constructor() {
  
    this.polly = new AWS.Polly({
      region: 'eu-central-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    });

    this.googleModel = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_AI_API_KEY 
    });

    this.exa = new Exa(process.env.EXA_API_KEY);
  }

  private webSearch = tool({
    description: 'Search the web for up-to-date information',
    parameters: z.object({
      query: z.string().min(1).max(300).describe('The search query'),
    }),
    execute: async ({ query }) => {
      const { results } = await this.exa.searchAndContents(query, {
        livecrawl: 'always',
        numResults: 3,
      });
      return results.map(result => ({
        image: result.image,
        url: result.url,
        title: result.title
      }));
    },
  });

  async generateAthleteInfo(athleteName: string) {
    const { text } = await generateText({
      model: this.googleModel('gemini-2.0-flash'),
      tools: {
        webSearch: this.webSearch,
      },
      maxSteps: 4,
      system:`
      Your role is sport celebrity image links finder.
      In output get only array of imagesUrls Follow this below example pattern.Not Include categories and other text info
      example.["https://assets.vogue.com/photos/6769d2048b298db99105a819/16:9/w_2580,c_limit/pv-venkata_053.jpg","https://assets.vogue.in/photos/5ce4474ffaece649022350e0/16:9/w_1280,c_limit/P.V-Singhu.jpg"]
      `,
      prompt:`Find 5 images of ${athleteName} which shows as Example. category training, family moments, charity, fitness routines,winning moment etc.`,
    });

    const { object } = await generateObject({
      model: this.googleModel('gemini-2.0-flash'),
      schema: z.object({
        shortDescription:z.string().describe(`20 wrods short description of ${athleteName}`),
      }),
      prompt: `Get information about ${athleteName} `,
    });

    
    try {
      const cleanedText = text.replace(/```json\n|\n```/g, '').trim();  
      return {
        description: object.shortDescription,
        imageUrls: JSON.parse(JSON.stringify(cleanedText)),
      };
    } catch (error) {
      console.log("🚀 ~ GenerationService ~ generateAthleteInfo ~ error:", error)
      throw new Error('Failed to parse generated data');
    }
  }

  async generateVoice(text: string) {
    const pollyResponse = await this.polly.synthesizeSpeech({
      Text: text,
      OutputFormat: 'mp3',
      VoiceId: 'Joanna', // Using a neutral voice
      Engine: 'neural'
    }).promise();

    return pollyResponse.AudioStream;
  }

} 