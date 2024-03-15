import { Canon, VerseRef } from "@sillsdev/scripture";
import { Pair } from "./namedpairsinfo.context";
import { isNullOrUndefined } from "util";
import { error } from "console";

interface StateManager {
  get currentState(): {} | undefined;
  setNextState(input: {}): void;
  setPriorState(): void
}

export abstract class BaseStateManager implements StateManager {
  private _currentState: {};
  protected _setState: (state: {}) => void;

  constructor(currentState: {}, setState: (state: {}) => void) {
    this._currentState = currentState;
    this._setState = setState
  }

  get currentState(): {}{
    return this._currentState;
  }

  abstract setNextState(input: {}): void;
  abstract setPriorState(): void
}



export enum AquaMode {
  ChapterResultsForBooks = 1,
  VerseResultsForBookChapters,
  VerseDetails,
}

export type AquaState = {
  mode: AquaMode,
  position: {
    bookNum?: number,
    chapterNum?: number,
    verseNum?: number
  },
  verseRef: string
};

export class AquaStateManager extends BaseStateManager {
  protected _verseRef: string;

  /**
   * Change state if current state matched
   * @param aquaState
   * @param setState
   * @param verseRef
   * @returns
   */
  private static setStateIfPositionChanged(
    aquaState: AquaState,
    setState: (state: AquaState) => void,
    verseRef: string): void {

    if (verseRef === aquaState.verseRef)
      return;

    const stateBookAndVerserefDifferent =
      aquaState.position.bookNum !== undefined &&
      AquaStateManager.bookNumFromVerseRef(aquaState.verseRef) !== undefined &&
      aquaState.position.bookNum !== AquaStateManager.bookNumFromVerseRef(aquaState.verseRef);

    const stateChapterAndVerserefDifferent =
      aquaState.position.chapterNum !== undefined &&
      AquaStateManager.chapterNumFromVerseRef(aquaState.verseRef) !== undefined &&
      aquaState.position.chapterNum !== AquaStateManager.chapterNumFromVerseRef(aquaState.verseRef);

    const stateVerseAndVerserefDifferent =
      aquaState.position.verseNum !== undefined &&
      AquaStateManager.verseNumFromVerseRef(aquaState.verseRef) !== undefined &&
      aquaState.position.verseNum !== AquaStateManager.verseNumFromVerseRef(aquaState.verseRef);

    // if state position and verseref were the same, and the new verseref is different, change the state position and state
    // verse to match.
    if (!stateBookAndVerserefDifferent && !stateChapterAndVerserefDifferent && !stateVerseAndVerserefDifferent) {
      // change the state members including position properties that were set.
      const newState = {
        ...aquaState,
        verseRef: verseRef,
        position: {
          ...aquaState.position,
          bookNum: aquaState.position.bookNum ? // set only if set before
            AquaStateManager.bookNumFromVerseRef(verseRef) :
            aquaState.position.bookNum,
          chapterNum: aquaState.position.chapterNum  ?
            AquaStateManager.chapterNumFromVerseRef(verseRef) :
            aquaState.position.chapterNum,
          verseNum: aquaState.position.verseNum ?
            AquaStateManager.verseNumFromVerseRef(verseRef) :
            aquaState.position.verseNum,
        }
      };
      setState(newState);
    } else {
      return;
    }
  }

  constructor(currentState: AquaState, setState: (state: {}) => void, verseRef: string)  {
    super(currentState, setState);
    AquaStateManager.setStateIfPositionChanged(currentState, setState, verseRef);
    this._verseRef = verseRef;
  }

  get currentState(): AquaState {
    return super.currentState as AquaState;
  }

  setNextState(info: Pair) {
    if (this.currentState.mode === AquaMode.ChapterResultsForBooks) {
      // interpret x as book, y as chapter
      this._setState({...this.currentState, mode: AquaMode.VerseResultsForBookChapters, position:{...this.currentState.position, bookNum: info.x + 1}});
    } else if (this.currentState.mode === AquaMode.VerseResultsForBookChapters) {
      // interpret x as chapter, y as verse
      this._setState({...this.currentState, mode: AquaMode.VerseDetails, position:{...this.currentState.position, chapterNum: info.x + 1, verseNum: info.y + 1}});
    } else if (this.currentState.mode === AquaMode.VerseDetails) {
      throw Error('not implemented');
    } else {
      throw Error(`invalid state, can't determine mode: ${JSON.stringify(this.currentState)}`);
    }
  }

  setPriorState() {
    if (this.currentState.mode === AquaMode.VerseResultsForBookChapters) {
      this._setState({...this.currentState, mode: AquaMode.ChapterResultsForBooks, position: {...this.currentState.position, bookNum: undefined, chapterNum: undefined, verseNum: undefined}});
    } else if (this.currentState.mode === AquaMode.VerseDetails) {
      this._setState({...this.currentState, mode: AquaMode.VerseResultsForBookChapters, position: {...this.currentState.position, chapterNum: undefined, verseNum: undefined}});
    }
  }

  getHighlight(): Pair {
    if (this.currentState.mode === AquaMode.VerseResultsForBookChapters) {
      return {x: new VerseRef(this._verseRef).chapterNum-1, y: new VerseRef(this._verseRef).verseNum-1};
    } else if (this.currentState.mode === AquaMode.ChapterResultsForBooks) {
      return {x: new VerseRef(this._verseRef).bookNum-1, y: new VerseRef(this._verseRef).chapterNum-1};
    } else {
      throw Error(`invalid state, can't determine mode: ${JSON.stringify(this.currentState)}`);
    }
  }

  get currentStateBook(): string {
    let book;
    if (this.currentState.position.bookNum)
      book = Canon.bookNumberToId(this.currentState.position.bookNum);
    else
      throw new Error('current state bookNum is undefined');
    if (!book || book.length === 0)
      throw new Error(`'${this.currentState.position.bookNum}' not a valid book`);
    else
        return book;
  }

  public static bookFromVerseRef (verseRef: string | undefined): string | undefined {
    try {
      return (verseRef === undefined) ? undefined : new VerseRef(verseRef).book;
    } catch (e) {
      console.debug(`Could not extract book using VerseRef from ${verseRef}: ${JSON.stringify(e)}. Trying split...`);
      const parts = verseRef!.split(" ");
      if (parts.length === 2)
        return parts[0];
      else {
        const errorMessage =`Could not extract book using spit from ${verseRef}: ${JSON.stringify(e)}`;
        console.error(`${errorMessage}. Throwing error.`);
        throw new Error(errorMessage);
      }
    }
  }

  public static bookNumFromVerseRef (verseRef: string | undefined): number | undefined {
    try {
      return (verseRef === undefined) ? undefined : new VerseRef(verseRef).bookNum;
    } catch (e) {
      console.debug(`Could not extract book using VerseRef from ${verseRef}: ${JSON.stringify(e)}. Trying split...`);
      const parts = verseRef!.split(" ");
      if (parts.length === 2)
        return parseInt(parts[0]);
      else {
        const errorMessage =`Could not extract book using spit from ${verseRef}: ${JSON.stringify(e)}`;
        console.error(`${errorMessage}. Throwing error.`);
        throw new Error(errorMessage);
      }
    }
  }

  public static chapterFromVerseRef (verseRef: string | undefined): string | undefined {
    try {
      return (verseRef === undefined) ? undefined : new VerseRef(verseRef).chapter;
    } catch (e) {
      console.debug(`Could not extract chapter using VerseRef from ${verseRef}: ${JSON.stringify(e)}. Trying split...`);
      const parts = verseRef!.split(" ");
      if (parts.length === 2)
        return parts[1];
      else {
        const errorMessage =`Could not extract chapter using spit from ${verseRef}: ${JSON.stringify(e)}`;
        console.error(`${errorMessage}. Throwing error.`);
        throw new Error(errorMessage);
      }
    }
  }

  public static chapterNumFromVerseRef (verseRef: string | undefined): number | undefined {
    try {
      return (verseRef === undefined) ? undefined : new VerseRef(verseRef).chapterNum;
    } catch (e) {
      console.debug(`Could not extract chapter using VerseRef from ${verseRef}: ${JSON.stringify(e)}. Trying split...`);
      const parts = verseRef!.split(" ");
      if (parts.length === 2)
        return parseInt(parts[1]);
      else {
        const errorMessage =`Could not extract chapter using spit from ${verseRef}: ${JSON.stringify(e)}`;
        console.error(`${errorMessage}. Throwing error.`);
        throw new Error(errorMessage);
      }
    }
  }

  public static verseNumFromVerseRef (verseRef: string | undefined): number | undefined {
    try {
      return (verseRef === undefined) ? undefined : new VerseRef(verseRef).verseNum;
    } catch (e) {
      const errorMessage = `Could not extract verse using VerseRef from ${verseRef}: ${JSON.stringify(e)}`;
      console.debug(`${errorMessage}. Throwing error.`);
      throw new Error(errorMessage);
    }
  }
}
