import { Colors, ResultDisplay } from "./resultDisplay";
import { csv2Array, searchWord } from "./dict";
import { convertLevel } from "./convert";

new ResultDisplay()
  .inputElement(document.getElementById("input"))
  .displayDivElement(document.getElementById("resultdisplay_main"))

  .processor(async (c) => {
    if (dict === undefined) return { color: Colors.BLACK };
    const tmp = searchWord(dict, c.text, 100000);
    if (tmp !== undefined) {
      return { color: Colors.RED, refreshedText: `(${tmp})` };
    } else {
      return { color: Colors.BLACK };
    }
  })

  .render();

let csvInput = document.getElementById("anki_csv") as HTMLInputElement;
let dict: Array<[string, string]> | undefined = undefined;
if (csvInput) {
  csvInput.oninput = (event) => {
    dict = csv2Array(csvInput.value, 0, 2);
  };
}
