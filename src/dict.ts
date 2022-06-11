export class Search {
  private cache: [string, string, number][] = [];
  dict: [string, string][] | undefined = undefined;
  constructor() {}
  readCSV(csv: string, englishCol: number, japaneseCol: number) {
    this.dict = csv.split("\n").map((v) => {
      let tmp = v.split(",");
      return [tmp[englishCol], tmp[japaneseCol]];
    });
  }
  searchWord(word: string, minLevel: number): string | undefined {
    const tmp = this.cache.findIndex((v) => v[0] === word);
    if (tmp !== -1 && this.cache[tmp][1]) {
      if (minLevel <= this.cache[tmp][2]) {
        return this.cache[tmp][1];
      } else {
        return undefined;
      }
    }
    if (this.dict === undefined) return undefined;
    for (let j = 0; j < 4; j++) {
      for (let i = 0; i < 4; i++) {
        const tmp = word.slice(0, word.length - i).toLowerCase();
        const idx = this.dict.findIndex(
          (v) => v[0].slice(0, v[0].length - j).toLowerCase() == tmp
        );
        if (idx !== -1) {
          if (
            !this.cache.some((v) => {
              if (this.dict === undefined) {
                return false;
              } else {
                return v[0] === this.dict[idx][0];
              }
            })
          )
            this.cache.push([word, this.dict[idx][1], idx]);
          if (idx >= minLevel && this.dict[idx][1]) {
            return this.dict[idx][1];
          } else {
            return undefined;
          }
        }
      }
    }
    return undefined;
  }
}
