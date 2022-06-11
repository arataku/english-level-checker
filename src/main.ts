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
const csvInput = document.getElementById("anki_csv");
const csvInputRefresh = document.getElementById("anki_csv_refresh");
const level = document.getElementById("level") as HTMLInputElement;

if (localStorage.anki_csv_dict !== undefined) {
  search.dict = JSON.parse(localStorage.anki_csv_dict);
  if (search.dict) level.max = search.dict.japanese.length.toString();
}

let file = document.getElementById("import_anki_csv_file") as HTMLInputElement;
file.addEventListener("change", () => {
  let reader = new FileReader();
  reader.onload = () => {
    if (!reader.result) return;
    search.readCSV(reader.result?.toString(), 0, 2);
    localStorage.anki_csv_dict = JSON.stringify(search.dict);
    if (search?.dict) {
      level.max = search.dict.japanese.length.toString();
    } else {
      level.max = "1";
    }
  };

  if (!file.files) return;
  reader.readAsText(file.files[0], "UTF-8");
});

csvInputRefresh?.addEventListener("click", () => {
  if (
    search.dict === undefined
      ? true
      : window.confirm(
          "すでに保存されたデータがあります。\r上書きして更新しますか？"
        )
  ) {
    if (!(csvInput instanceof HTMLTextAreaElement)) {
      throw "#anki_csv does not exist or is not an instance of HTMLInputElement!";
    }
    search.readCSV(csvInput.value, 0, 2);
    if (search?.dict) {
      level.max = search.dict.japanese.length.toString();
    } else {
      level.max = "1";
    }
    localStorage.anki_csv_dict = JSON.stringify(search.dict);
    alert("データを更新しました。");
  }
});
