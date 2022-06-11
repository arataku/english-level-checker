import { Colors, ResultDisplay } from "./resultDisplay";
import { csv2Array, searchWord } from "./dict";
import { convertLevel } from "./convert";
import { rename } from "fs";

new ResultDisplay()
  .inputElement(document.getElementById("input"))
  .levelElement(document.getElementById("level"))
  .displayDivElement(document.getElementById("resultdisplay_main"))

  .processor(async (c, level) => {
    if (dict === undefined) return { color: Colors.BLACK };
    const tmp = searchWord(dict, c.text, level);
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

let file = document.getElementById("import_anki_csv_file") as HTMLInputElement;
file.addEventListener("change", () => {
  let reader = new FileReader();
  reader.onload = () => {
    if (!reader.result) return;
    dict = csv2Array(reader.result?.toString(), 0, 2);
  };
  if (!file.files) return;
  reader.readAsText(file.files[0], "UTF-8");
});
