function csv2Array(
  csv: string,
  englishCol: number,
  japaneseCol: number
): Array<[string, string]> {
  return csv.split("\n").map((v) => [v[englishCol], v[japaneseCol]]);
}

function searchWord(
  dictionary: Array<Array<string>>,
  word: string,
  maxLevel: number
): string | undefined {
  let count = 0;
  for (let i = 0; i < 3; i++) {
    const tmp = word.slice(0, -count);
    const result = dictionary
      .slice(0, Math.min(maxLevel, dictionary.length))
      .find((v) => v[0] == tmp);
    if (result !== undefined) {
      return result[1];
    }
  }
  return undefined;
}
