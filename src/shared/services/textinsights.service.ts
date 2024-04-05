//import { DetectResult, Translate } from "@google-cloud/translate/build/src/v2";
import { logger } from "@papi/backend";

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
    super(tokenInfos, "Translated as:", "Google Translate", "TranslateTextInsight");
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
        body:  {
          q: sourceText,
        }
      };
      const detectResponse = await fetch(detectUrl, detectOptions);
      const detectResultString = await detectResponse.text();
      console.log(detectResultString);
      const detectResult = JSON.parse(detectResultString) as {data: {detections:[[{confidence: number, language: string, isReliable: boolean}]]}}
      let bestDetection: {confidence: number, language: string, isReliable: boolean} | undefined;
      detectResult.data.detections.forEach(arrayOfDetections => arrayOfDetections.forEach(detection => {
        if (!bestDetection || bestDetection.confidence < detection.confidence)
          bestDetection = detection;
      }));

      logger.error(sourceText)
      logger.error(JSON.stringify(bestDetection))
      const translateOptions = {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Key': 'a6f84ec510msh8a31a754a06bcd5p1562ccjsna1fc96b3f41f',
          'X-RapidAPI-Host': 'deep-translate1.p.rapidapi.com'
        },
        body:  {
          q: sourceText,
          source: bestDetection?.language ? bestDetection?.language : 'en',
          target: 'en'
        }
      };
      const translateResponse = await fetch(translateUrl, translateOptions);
      const translateResultString = await translateResponse.text();
      console.debug(translateResultString);

      const translateResults = JSON.parse(translateResultString) as {data: {translations: [{translatedText: string}]}};
      this.result = translateResults.data.translations
        .map(translation => translation.translatedText)
        .reduce((accumulation, current) => `${accumulation}; ${current}`)
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
  protected _prompt: string;
  constructor(tokenInfos: TokenInfo[], description: string, prompt: string) {
    super(tokenInfos, description, 'ChatGPT', 'ChatGptTextInsight');
    this._prompt = prompt;
  }

  get prompt(): string {
    return this._prompt;
  }

  retrieveResult(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      setTimeout(() => {
        this.result = "grammar results";
        resolve(true);
      }, 3000);
    });
  }
}

export class GrammarChatGptTextInsight extends ChatGptTextInsight {
  constructor(tokenInfos: TokenInfo[]) {
    super(tokenInfos, "Has grammar:", "");
  }
}

export interface ITextInsightsService {
  get(tokenInfos: TokenInfo[]): TextInsight[];
}

export class TextInsightsService implements ITextInsightsService {
  get(tokenInfos: TokenInfo[]): TextInsight[] {
    logger.debug(JSON.stringify(tokenInfos));

    const textInsights = [
      new TranslateTextInsight(tokenInfos),
      new GrammarChatGptTextInsight(tokenInfos)
    ];
    return textInsights;
  }
}
