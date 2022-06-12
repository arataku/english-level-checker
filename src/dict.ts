export class Search {
  private cache: { english: string[]; japanese: string[]; idx: number[] } = {
    english: [],
    japanese: [],
    idx: [],
  };
  dict:
    | { english: [string[], string[], string[], string[]]; japanese: string[] }
    | undefined = undefined;
  constructor() {}
  readtxt(txt: string, englishCol: number, japaneseCol: number) {
    this.cacheClear();
    let tmpDict: {
      english: [string[], string[], string[], string[]];
      japanese: string[];
    } = {
      english: [[], [], [], []],
      japanese: [],
    };
    for (const value of txt.split("\n")) {
      let tmp = value.split("\t");
      if (tmp.length < englishCol || tmp.length < japaneseCol) {
        break;
      }
      tmpDict.english.map((v, idx) =>
        v.push(
          tmp[englishCol].toLowerCase().slice(0, tmp[englishCol].length - idx)
        )
      );
      tmpDict.japanese.push(tmp[japaneseCol]);
    }
    this.dict = tmpDict;
  }
  searchWord(word: string, minLevel: number): string | undefined {
    const tmp = this.cache.english.indexOf(word);
    if (tmp !== -1 && this.cache.japanese[tmp]) {
      if (minLevel <= this.cache.idx[tmp]) {
        return this.cache.japanese[tmp];
      } else {
        return undefined;
      }
    }
    if (this.dict === undefined) return undefined;
    const safeDict = this.dict;
    for (let j = 0; j < 4; j++) {
      for (let i = 0; i < 4; i++) {
        const tmp = word.slice(0, word.length - i).toLowerCase();
        const idx = this.dict.english[j].indexOf(tmp);
        if (idx !== -1) {
          if (!this.cache.english.includes(word))
            this.addCache(word, this.dict.japanese[idx], idx);
          if (idx >= minLevel && this.dict.japanese[idx]) {
            return this.dict.japanese[idx];
          } else {
            return undefined;
          }
        }
      }
    }
    return undefined;
  }
  private addCache(english: string, japanese: string, idx: number) {
    this.cache.english.push(english);
    this.cache.japanese.push(japanese);
    this.cache.idx.push(idx);
    if (this.cache.english.length > 3000) {
      this.cache.english.shift();
      this.cache.japanese.shift();
      this.cache.idx.shift();
    }
  }
  private cacheClear() {
    this.cache = {
      english: [],
      japanese: [],
      idx: [],
    };
  }
}
