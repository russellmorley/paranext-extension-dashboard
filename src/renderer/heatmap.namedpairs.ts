import { NamedPairs, NamedPairsInfo, Pair } from "./namedpairsinfo.context";

export interface  ChartNamedPairs {
  get namedPairsInfo():NamedPairsInfo;
  set namedPairsInfo(namedPairsInfo: NamedPairsInfo);
  getPairFromChartPosition(position: {i: number, j: number}): Pair | undefined;
  getChartPositionFromPair(namedPair: Pair | undefined): {i: Number, j: Number} | undefined;
  getNamedPairsOutsideRange(low: number, high: number): NamedPairs[]
}

export class HeatmapAscendingNamedPairs implements ChartNamedPairs{
  protected _namedPairsInfo?: NamedPairsInfo;

  set namedPairsInfo(namedPairsInfo: NamedPairsInfo) {
    namedPairsInfo.namedPairs = namedPairsInfo.namedPairs
      .map(namedPair => {
        namedPair.data.sort((a,b) => {
          if (a.x < b.x)
            return -1;
          else if (a.x > b.x)
            return 1;
          else
            return 0;
        });
        return namedPair;
      })
      .sort((a, b) => {
        if (a.number < b.number)
          return 1;
        else if (a.number > b.number)
          return -1;
        else
          return 0;
      });
      this._namedPairsInfo = namedPairsInfo;
  }

  get namedPairsInfo():NamedPairsInfo {
    if (!this._namedPairsInfo)
      throw new Error('namedPairsInfo not set');
    return this._namedPairsInfo;
  }

  getNamedPairsOutsideRange(low: number, high: number): NamedPairs[]{
    return this.namedPairsInfo.namedPairs.map(namedPairs => ({
        name: namedPairs.name,
        data: namedPairs.data.map(pair => ({
          x: pair.x,
          y: pair.y >= high || pair.y <= low ? pair.y : this.namedPairsInfo!.min - 1,
          originalDatum: pair.originalDatum
        } as Pair))
      } as NamedPairs));
  }

  getPairFromChartPosition(position: {i: number, j: number}): Pair | undefined{
    const namedPairsLength = this._namedPairsInfo?.namedPairs.length;
    if (namedPairsLength)
      return {x: namedPairsLength - position.i - 1, y:  position.j};
  }

  getChartPositionFromPair(pair: Pair | undefined): {i: number, j: number} | undefined {
    if (pair?.x !== undefined && pair?.y !== undefined) {
      const namedPairsLength = this._namedPairsInfo?.namedPairs.length;
      if (namedPairsLength)
        return {i: namedPairsLength - pair.x - 1, j:  pair.y};
    }
  }
}
