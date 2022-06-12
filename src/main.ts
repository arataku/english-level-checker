import { Colors, ResultDisplay } from "./resultDisplay";
import { Search } from "./dict";

new ResultDisplay()
  .textElement(document.getElementById("input"))
  .levelElement(document.getElementById("level"))
  .displayDivElement(document.getElementById("resultdisplay_main"))
  .processor((c, level) => {
    if (search.dict === undefined) return { color: Colors.BLACK };
    const tmp = search.searchWord(c.text, level);
    //const tmp = "hoge";
    if (tmp !== undefined) {
      return { color: Colors.RED, refreshedText: `${c.text}(${tmp})` };
    } else {
      return { color: Colors.BLACK };
    }
  })

  .render();

const search = new Search();
const txtInput = document.getElementById("anki_txt");
const txtInputRefresh = document.getElementById("anki_txt_refresh");
const level = document.getElementById("level") as HTMLInputElement;
const englishCol = document.getElementById(
  "anki_setting_english_col"
) as HTMLInputElement;
const japaneseCol = document.getElementById(
  "anki_setting_japanese_col"
) as HTMLInputElement;

if (localStorage.anki_txt_dict !== undefined) {
  search.dict = JSON.parse(localStorage.anki_txt_dict);
  if (search.dict) level.max = search.dict.japanese.length.toString();
}

let file = document.getElementById("import_anki_txt_file") as HTMLInputElement;
file.addEventListener("change", () => {
  let reader = new FileReader();
  reader.onload = () => {
    if (!reader.result) return;
    search.readtxt(
      reader.result?.toString(),
      Number(englishCol.value),
      Number(japaneseCol.value)
    );
    localStorage.anki_txt_dict = JSON.stringify(search.dict);
    if (search?.dict) {
      level.max = search.dict.japanese.length.toString();
    } else {
      level.max = "1";
    }
  };

  if (!file.files) return;
  reader.readAsText(file.files[0], "UTF-8");
});

txtInputRefresh?.addEventListener("click", () => {
  if (
    search.dict === undefined
      ? true
      : window.confirm(
          "すでに保存されたデータがあります。\r上書きして更新しますか？"
        )
  ) {
    if (!(txtInput instanceof HTMLTextAreaElement)) {
      throw "#anki_txt does not exist or is not an instance of HTMLInputElement!";
    }
    search.readtxt(txtInput.value, 2, 4);
    if (search?.dict) {
      level.max = search.dict.japanese.length.toString();
    } else {
      level.max = "1";
    }
    localStorage.anki_txt_dict = JSON.stringify(search.dict);
    alert("データを更新しました。");
  }
});
