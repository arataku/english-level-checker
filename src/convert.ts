import { searchWord } from "./dict";
export function convertLevel(
  dict: Array<[string, string]>,
  text: string,
  level: number
): string {
  return text
    .split("\n")
    .map((v) => {
      return v
        .split(" ")
        .map((v2) => {
          const tmp = searchWord(dict, v2, level);
          if (tmp === undefined) {
            return v2;
          } else {
            return `(${tmp})`;
          }
        })
        .join(" ");
    })
    .join("\n");
}
