import { logger } from "@papi/backend";
import { VerseRef } from "@sillsdev/scripture";

export type TokenInfo = {
  text: string | null,
  location: string | undefined
};

export abstract class TextInsight {
  type: string;
  created: Date;
  tokenInfos: TokenInfo[];
  description: string;
  source: string;
  result: string;
  resultError?: string

  constructor(tokenInfos: TokenInfo[], description: string, source: string, type: string) {
    this.type = type;
    this.tokenInfos = tokenInfos;
    this.description = description;
    this.source = source;
    this.created = new Date();
    this.result = '';
  }

  abstract retrieveResult(): Promise<boolean>;
}

export class TranslateTextInsight extends TextInsight {
  constructor(tokenInfos: TokenInfo[]) {
    if (tokenInfos.length > 0) {
      super(tokenInfos, "Translated as:", "Deep Translate", "TranslateTextInsight");
    } else {
      throw new Error('tokenInfos length is zero');
    }
  }

  async retrieveResult(): Promise<boolean> {
     const sourceText = this.tokenInfos
       .map(tokenInfo => tokenInfo.text)
       ?.reduce((aggregate, current) => `${aggregate} ${current}`) ?? '';

    const detectUrl = 'https://deep-translate1.p.rapidapi.com/language/translate/v2/detect';
    const translateUrl = 'https://deep-translate1.p.rapidapi.com/language/translate/v2';

    try {
      const detectOptions = {
        method: 'POST',
        headers: {
          'X-RapidAPI-Key': '[SET KEY HERE]',
          'X-RapidAPI-Host': 'deep-translate1.p.rapidapi.com'
        },
        body:  JSON.stringify({
          q: sourceText,
        })
      };
      const detectResponse = await fetch(detectUrl, detectOptions);
      const detectResult = await detectResponse.json() as
        {
          data: {
            detections:[
              {
                confidence: number,
                language: string,
                isReliable: boolean}
            ]
          }
        };
      let bestDetection: {confidence: number, language: string, isReliable: boolean} | undefined;
      detectResult.data.detections.forEach(detection => {
        if (!bestDetection || bestDetection.confidence < detection.confidence)
          bestDetection = detection;
      });

      const translateOptions = {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Key': '[SET KEY HERE]',
          'X-RapidAPI-Host': 'deep-translate1.p.rapidapi.com'
        },
        body:  JSON.stringify({
          q: sourceText,
          source: bestDetection?.language ? bestDetection?.language : 'en',
          target: 'en'
        })
      };
      const translateResponse = await fetch(translateUrl, translateOptions);
      const translateResults = await translateResponse.json() as
       {
        data: {
          translations:{
              translatedText: string
          }
        }
      };
      this.result = translateResults.data.translations.translatedText;
      return true;
    } catch (error) {
      console.error(error);
      this.resultError = JSON.stringify(error);
      return false;
    }
  }
}

export abstract class ChatGptTextInsight extends TextInsight {
  protected chatPrompt: string;
  constructor(tokenInfos: TokenInfo[], description: string, chatPrompt: string, type: string) {
    super(tokenInfos, description, 'ChatGPT', type);
    this.chatPrompt = chatPrompt;
  }

  protected static getVerseRef(BBBCCCVVVWWWSSS: string): VerseRef {
    const bookNumber = parseInt(BBBCCCVVVWWWSSS.substring(0, 3));
    const chapterNumber = parseInt(BBBCCCVVVWWWSSS.substring(3, 6));
    const verseNumber = parseInt(BBBCCCVVVWWWSSS.substring(6, 9));
    return new VerseRef(bookNumber, chapterNumber, verseNumber);
  }

  async retrieveResult(): Promise<boolean> {
    const url = 'https://api.openai.com/v1/chat/completions';
    const options = {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'Authorization': 'Bearer [SET BEARER TOKEN HERE]'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: this.chatPrompt
          }
        ]
      })
    };
    try {
      const response = await fetch(url, options);
      const result = await response.json() as
        {
          id: string,
          object: string,
          created: number,
          model: string,
          choices: [{
            index: number,
            message: {
              role: string,
              content: string
            },
            logprobs: string,
            finish_reason: string
          }],
          usage: {
            prompt_tokens: number,
            completion_tokens: number,
            total_tokens: number
          },
          system_fingerprint: string
        };
        this.source = result.model;
        if (result.choices.length > 0) {
          if (result.choices[0].message.content.length > 0) {
            this.result = result.choices[0].message.content;
            return true;
          } else if (result.choices[0].logprobs.length > 0) {
            this.resultError = result.choices[0].logprobs;
            return false;
          } else {
            this.resultError = 'choices returned, but no messages or problems';
            return false;
          }
        } else {
          this.resultError = ' No messages or problems returned';
          return false;
        }
    } catch (error) {
      this.resultError = JSON.stringify(error);
      return false;
    }
  }
}

export class PronominalReferencesChatGptTextInsight extends ChatGptTextInsight {
    constructor(tokenInfos: TokenInfo[]) {
    if (tokenInfos.length > 0) {
      super(
        tokenInfos,
        "Pronominal references:",
        `Identify the pronouns in ${ChatGptTextInsight.getVerseRef(tokenInfos[0].location!).toString()} and tell me who or what they refer to, or say 'verse ${ChatGptTextInsight.getVerseRef(tokenInfos[0].location!).toString()} contains no pronouns' if there aren't any.`,
        'PronominalReferencesChatGptTextInsight');
    } else {
      throw new Error('tokenInfos length is zero');
    }
  }
}

export class VerseReferencesChatGptTextInsight extends ChatGptTextInsight {
  constructor(tokenInfos: TokenInfo[]) {
    if (tokenInfos.length > 0) {
      super(
        tokenInfos,
        "Verse references:",
        `If ${ChatGptTextInsight.getVerseRef(tokenInfos[0].location!).toString()} makes reference to other verses in the bible please tell me what they are and what they make reference to, otherwise say: no other verses are referenced in verse ${ChatGptTextInsight.getVerseRef(tokenInfos[0].location!).toString()}.`,
        "VerseReferencesChatGptTextInsight");
    } else {
      throw new Error('tokenInfos length is zero');
    }
  }
}

export class VerseInterpretationsChatGptTextInsight extends ChatGptTextInsight {
  constructor(tokenInfos: TokenInfo[]) {
    if (tokenInfos.length > 0) {
      super(
        tokenInfos,
        "Verse interpretations:",
        `Tell me the various interpretations of ${ChatGptTextInsight.getVerseRef(tokenInfos[0].location!).toString()} and tell me who made them.`,
        "VerseInterpretationsChatGptTextInsight");
    } else {
      throw new Error('tokenInfos length is zero');
    }
  }
}

export class VerseSummaryInChapterChatGptTextInsight extends ChatGptTextInsight {
  constructor(tokenInfos: TokenInfo[]) {
    if (tokenInfos.length > 0) {
      super(
        tokenInfos,
        "Summary of verse:",
        `Summarize ${ChatGptTextInsight.getVerseRef(tokenInfos[0].location!).toString()} in terms of the rest of its containing chapter`,
        "VerseSummaryInChapterChatGptTextInsight");
    } else {
      throw new Error('tokenInfos length is zero');
    }
  }
}

export interface ITextInsightsService {
  get(tokenInfos: TokenInfo[]): TextInsight[];
}

export class TextInsightsService implements ITextInsightsService {
  get(tokenInfos: TokenInfo[]): TextInsight[] {
    if (tokenInfos.length > 0) {
      const textInsights = [
        new TranslateTextInsight(tokenInfos),

        new VerseReferencesChatGptTextInsight(tokenInfos),
        new PronominalReferencesChatGptTextInsight(tokenInfos),
        new VerseInterpretationsChatGptTextInsight(tokenInfos),
        new VerseSummaryInChapterChatGptTextInsight(tokenInfos)
      ];
      return textInsights;
    } else {
      logger.error('tokenInfos length is zero')
    }
    return [];
  }
}
