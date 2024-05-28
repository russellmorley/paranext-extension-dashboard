//import { DetectResult, Translate } from "@google-cloud/translate/build/src/v2";
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
    // try {
    //   const text: string = '¿Cómo estás?';
    //   const target = 'en';

    //   const translate = new Translate({key: "123"});
    //   let [detectResult] = await translate.detect(text);
    //   let detections: DetectResult[] = Array.isArray(detectResult) ? detectResult : [detectResult];
    //   console.debug('Detections:');
    //   let highestDetection: DetectResult;
    //   detections.forEach(detection => {
    //     console.debug(`${detection.input} => ${detection.language}, ${detection.confidence}`);
    //     if ((highestDetection && highestDetection.confidence < detection.confidence) || !highestDetection)
    //       highestDetection = detection;
    //     console.debug(`highest detection ${highestDetection.language} ${highestDetection.confidence}`)
    //   });

    //   let [translationString] = await translate.translate(text, target);
    //   let translations: string[] = Array.isArray(translationString) ? translationString : [translationString];
    //   console.debug('Translations:');
    //   translations.forEach((translation, i) => {
    //     console.debug(`${text} => (${target}): ${translation}`);
    //   });
    //   if (translations.length > 1) {
    //     console.debug(`More than one translation ${JSON.stringify(translations)}`)
    //     this.resultError = `More than one translation ${JSON.stringify(translations)}`
    //     return false;
    //   } else if (translations.length === 1) {
    //     this.result = translations[0]
    //     return true;
    //   } else {
    //     console.debug('no translations')
    //     this.resultError = 'no translations'
    //     return false;
    //   }
    // } catch (e) {
    //   this.resultError = JSON.stringify(e);
    //   return false;
    // }







     const sourceText = this.tokenInfos
       .map(tokenInfo => tokenInfo.text)
       ?.reduce((aggregate, current) => `${aggregate} ${current}`) ?? '';


    // const detectUrl = 'https://google-translate1.p.rapidapi.com/language/translate/v2/detect';
    // const translateUrl = 'https://google-translate1.p.rapidapi.com/language/translate/v2';
    // try {
    //   const detectOptions = {
    //     method: 'POST',
    //     headers: {
    //       'content-type': 'application/x-www-form-urlencoded',
    //       'Accept-Encoding': 'application/gzip',
    //       'X-RapidAPI-Key': 'a6f84ec510msh8a31a754a06bcd5p1562ccjsna1fc96b3f41f',
    //       'X-RapidAPI-Host': 'google-translate1.p.rapidapi.com'
    //     },
    //     body: new URLSearchParams({
    //       q: sourceText
    //     })
    //   };
    //   const detectResponse = await fetch(detectUrl, detectOptions);
    //   const detectResultString = await detectResponse.text();
    //   console.log(detectResultString);
    //   const detectResult = JSON.parse(detectResultString) as {data: {detections:[[{confidence: number, language: string, isReliable: boolean}]]}}
    //   let bestDetection: {confidence: number, language: string, isReliable: boolean} | undefined;
    //   detectResult.data.detections.forEach(arrayOfDetections => arrayOfDetections.forEach(detection => {
    //     if (!bestDetection || bestDetection.confidence < detection.confidence)
    //       bestDetection = detection;
    //   }));

    //   const translateOptions = {
    //     method: 'POST',
    //     headers: {
    //       'content-type': 'application/x-www-form-urlencoded',
    //       'Accept-Encoding': 'application/gzip',
    //       'X-RapidAPI-Key': 'a6f84ec510msh8a31a754a06bcd5p1562ccjsna1fc96b3f41f',
    //       'X-RapidAPI-Host': 'google-translate1.p.rapidapi.com'
    //     },
    //     body: new URLSearchParams({
    //       source: bestDetection?.language? bestDetection.language : 'es',
    //       target: 'en',
    //       q: sourceText
    //     })
    //   };
    //   const translateResponse = await fetch(translateUrl, translateOptions);
    //   const translateResultString = await translateResponse.text();
    //   console.debug(translateResultString);

    //   const translateResults = JSON.parse(translateResultString) as {data: {translations: [{translatedText: string}]}};
    //   this.result = translateResults.data.translations
    //     .map(translation => translation.translatedText)
    //     .reduce((accumulation, current) => `${accumulation}; ${current}`)
    //   return true;
    // } catch (error) {
    //   console.error(error);
    //   this.resultError = JSON.stringify(error);
    //   return false;
    // }


    const detectUrl = 'https://deep-translate1.p.rapidapi.com/language/translate/v2/detect';
    const translateUrl = 'https://deep-translate1.p.rapidapi.com/language/translate/v2';
    try {
      const detectOptions = {
        method: 'POST',
        headers: {
          'X-RapidAPI-Key': 'a6f84ec510msh8a31a754a06bcd5p1562ccjsna1fc96b3f41f',
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
          'X-RapidAPI-Key': 'a6f84ec510msh8a31a754a06bcd5p1562ccjsna1fc96b3f41f',
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














    // try {
    //   const res = await fetch("https://libretranslate.com/translate", {
    //     method: "POST",
    //     body: JSON.stringify({
    //       q: sourceText,
    //       source: "auto",
    //       target: "en",
    //       format: "text",
    //       api_key: ""
    //     }),
    //     headers: { "Content-Type": "application/json" }
    //   });
    //   const resultJson = await res.json();
    //   console.debug(resultJson)
    //   const result = JSON.parse(resultJson) as {detectedLanguage: {confidence: number, language: string}, translatedText: string}
    //   this.result = `${result.translatedText} (language detected: ${result.detectedLanguage.language}, confidence: ${result.detectedLanguage.confidence}`;
    //   return true;
    // } catch (error) {
    //   console.error(error);
    //   this.resultError = JSON.stringify(error);
    //   return false;
    // }

    // return new Promise<boolean>(resolve => {
    //   setTimeout(() => {
    //     this.result = "translation results";
    //     resolve(true);
    //   }, 2000);
    // });
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
    // const url = 'https://chatgpt-best-price.p.rapidapi.com/v1/chat/completions';
    // const options = {
    //   method: 'POST',
    //   headers: {
    //     'content-type': 'application/json',
    //     'X-RapidAPI-Key': 'a6f84ec510msh8a31a754a06bcd5p1562ccjsna1fc96b3f41f',
    //     'X-RapidAPI-Host': 'chatgpt-best-price.p.rapidapi.com'
    //   },
    //   body: JSON.stringify({
    //     model: 'gpt-3.5-turbo',
    //     messages: [
    //       {
    //         role: 'user',
    //         content: this.chatPrompt
    //       }
    //     ]
    //   })
    // };
    const url = 'https://api.openai.com/v1/chat/completions';
    const options = {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'Authorization': 'Bearer [TOKEN]'
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


    // return new Promise<boolean>(resolve => {
    //   setTimeout(() => {
    //     this.result = "grammar results";
    //     resolve(true);
    //   }, 3000);
    // });
  }
}

export class TestPrompt extends ChatGptTextInsight {
  constructor(tokenInfos: TokenInfo[]) {
    if (tokenInfos.length > 0) {
      super(
        tokenInfos,
        "Pronominal references:",
        `say hello`,
        'PronominalReferencesChatGptTextInsight');
    } else {
      throw new Error('tokenInfos length is zero');
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

        //new VerseReferencesChatGptTextInsight(tokenInfos),
        //new PronominalReferencesChatGptTextInsight(tokenInfos),
        new VerseInterpretationsChatGptTextInsight(tokenInfos),
        //new VerseSummaryInChapterChatGptTextInsight(tokenInfos)
        //new TestPrompt(tokenInfos)
      ];
      return textInsights;
    } else {
      logger.error('tokenInfos length is zero')
    }
    return [];
  }
}
