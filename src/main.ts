
import { Colors, ResultDisplay } from "./resultDisplay";
import { csv2Array } from "./dict";
import { convertLevel } from "./convert";

new ResultDisplay()
  .inputElement(document.getElementById('input'))
  .displayDivElement(document.getElementById('resultdisplay_main'))

  .processor(async c => {
    if(c.text === 'apple') {
      return { color: Colors.RED, refreshedText: 'りんご' };
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

let EngInput = document.getElementById("input") as HTMLInputElement;
if (EngInput) {
  EngInput.oninput = (event) => {
    const result = document.getElementById("result");
    if (!result) return;
    if (dict === undefined) {
      console.log("undefined");
      return;
    }
    result.innerText = convertLevel(dict, EngInput.value, 100000);
  };
}

