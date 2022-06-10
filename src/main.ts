import { Colors, ResultDisplay } from "./resultDisplay";

new ResultDisplay()
  .inputElement(document.getElementById('input'))
  .displayDivElement(document.getElementById('resultdisplay_main'))

  .processor(async c => {
    if(c.text === 'apple') {
      return { color: Colors.RED };
    } else {
      return { color: Colors.BLACK };
    }
  })

  .render();
