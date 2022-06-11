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
      return { color: Colors.RED, refreshedText: `${c.text}(${tmp})` };
    } else {
      return { color: Colors.BLACK };
    }
  })

  .render();

const csvInput = document.getElementById("anki_csv");
const csvInputRefresh = document.getElementById("anki_csv_refresh");
let dict: Array<[string, string]> | undefined = undefined;

if (localStorage.anki_csv_dict !== undefined) {
  dict = JSON.parse(localStorage.anki_csv_dict);
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

csvInputRefresh?.addEventListener("click", () => {
  if (
    dict === undefined
      ? true
      : window.confirm(
          "すでに保存されたデータがあります。\r上書きして更新しますか？"
        )
  ) {
    if (!(csvInput instanceof HTMLTextAreaElement)) {
      throw "#anki_csv does not exist or is not an instance of HTMLInputElement!";
    }
    dict = csv2Array(csvInput.value, 0, 2);
    localStorage.anki_csv_dict = JSON.stringify(dict);
    alert("データを更新しました。");
  }
});
