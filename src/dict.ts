export function csv2Array(
  csv: string,
  englishCol: number,
  japaneseCol: number
): Array<[string, string]> {
  return csv.split("\n").map((v) => {
    let tmp = v.split(",");
    return [tmp[englishCol], tmp[japaneseCol]];
  });
}

export function searchWord(
  dictionary: Array<Array<string>>,
  word: string,
  maxLevel: number
): string | undefined {
  for (let j = 0; j < 4; j++) {
    for (let i = 0; i < 4; i++) {
      const tmp = word.slice(0, word.length - i);
      const result = dictionary
        .slice(Math.min(maxLevel, dictionary.length))
        .find((v) => v[0].slice(0, v[0].length - j) == tmp);
      if (result !== undefined) {
        return result[1];
      }
    }
  }
  return undefined;
}
