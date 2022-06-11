import { Colors, ResultDisplay } from "./resultDisplay";
import { csv2Array, searchWord } from "./dict";
import { convertLevel } from "./convert";

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

const csvInput = document.getElementById("anki_csv");
const csvInputRefresh = document.getElementById("anki_csv_refresh");
let dict: Array<[string, string]> | undefined = undefined;

if (localStorage.anki_csv_dict !== undefined) {
  dict = JSON.parse(localStorage.anki_csv_dict);

}

csvInputRefresh?.addEventListener('click', () => {
  if(dict === undefined ? true : window.confirm('すでに保存されたデータがあります。\r上書きして更新しますか？')) {
    if(!(csvInput instanceof HTMLTextAreaElement)) {
      throw '#anki_csv does not exist or is not an instance of HTMLInputElement!';
    }
    dict = csv2Array(csvInput.value, 0, 2);
    localStorage.anki_csv_dict = JSON.stringify(dict);
    alert('データを更新しました。');
  }
});
