import { StatusText } from "./statusText";

export const Colors = {
  RED: 'red',
  ORANGE: 'orange',
  BLACK: 'black',
} as const;

class Cursor {
  constructor(public text: string){}
}

type TokenProcessor = (cursor: Cursor) => Promise<{ color: typeof Colors[keyof typeof Colors], refreshedText?: string }>;

export class ResultDisplay {
  private _inputElement: HTMLInputElement | undefined
  private _displayDivElement: HTMLDivElement | undefined
  private _processor: TokenProcessor | undefined

  constructor(){}

  inputElement(element: HTMLElement | null) {
    if(!(element instanceof HTMLInputElement)) {
      throw 'inputElement must be an instance of HTMLInputElement.'
    }
    this._inputElement = element;
    return this;
  }

  displayDivElement(element: HTMLElement | null) {
    if(!(element instanceof HTMLDivElement)) {
      throw 'displayDivElement must be an instance of HTMLDivElement.'
    }
    this._displayDivElement = element;
    return this;
  }

  processor(lambda: TokenProcessor) {
    this._processor = lambda;
    return this;
  }

  render() {
    if(
      this._inputElement === undefined ||
      this._displayDivElement === undefined ||
      this._processor === undefined
    ) {
      throw 'render must be executed after inputElement, displayDivElement, and processor.'
    }
    new RenderedResultDisplay(this._inputElement, this._displayDivElement, this._processor);
  }

}

const immediate = () => new Promise(resolve => setTimeout(resolve, 0));

interface Token {
  beforeText: string,
  text: string,
  afterText: string,
  color: typeof Colors[keyof typeof Colors],
  elements: HTMLSpanElement[],
}
class RenderedResultDisplay {

  tokenViewer: HTMLDivElement;
  statusText: StatusText;
  startElement: HTMLSpanElement;
  tokens: Token[] = [];


  private static splitText(t: string) {
    const s = t.match(/^([^a-zA-Z-]*)([a-zA-Z-]+)([^a-zA-Z-]*)$/);

    return s === null ? {
      beforeText: '',
      text: t,
      afterText: '',
    } : {
      beforeText: s[1],
      text: s[2],
      afterText: s[3]
    }

  }

  private static colorSpan(text: string, color: typeof Colors[keyof typeof Colors]) {
    const span = document.createElement('span');
    span.textContent = text;
    span.classList.add(color);
    return span;
  }

  constructor(
    private inputElement: HTMLInputElement,
    private displayDivElement: HTMLDivElement,
    private processor: TokenProcessor,
  ){
    const statusTextInstance = document.createElement('p');
    this.statusText = new StatusText(statusTextInstance);
    this.tokenViewer = document.createElement('div');
    this.startElement = document.createElement('span');

    this.tokenViewer.appendChild(this.startElement);

    displayDivElement.appendChild(statusTextInstance);
    displayDivElement.appendChild(this.tokenViewer);

    this.inputElement.addEventListener('input',async () => {
      this.statusText.start();
      const text = this.inputElement.value.split(' ');
      await immediate();

      const textSplitted = text.map(RenderedResultDisplay.splitText);

      let needRefreshStart = 0;
      let needRefreshEnd = 0;

      for(let i = 0; i < Math.min(textSplitted.length, this.tokens.length); i++) {
        const targetSplitted = textSplitted[i];
        const tokenSplitted = this.tokens[i];
        if(
          targetSplitted.text === tokenSplitted.text &&
          targetSplitted.beforeText === tokenSplitted.beforeText &&
          targetSplitted.afterText === tokenSplitted.afterText
        ) {
          needRefreshStart++;
        } else {
          break;
        }
      }

      if(needRefreshStart === textSplitted.length) {
        this.statusText.finish(textSplitted.length);
        return;
      }

      await immediate();

      for(let i = 0; i < Math.min(textSplitted.length, this.tokens.length); i++) {
        const targetSplitted = textSplitted[textSplitted.length - i - 1];
        const tokenSplitted = this.tokens[this.tokens.length - i - 1];

        if(
          targetSplitted.text === tokenSplitted.text &&
          targetSplitted.beforeText === tokenSplitted.beforeText &&
          targetSplitted.afterText === tokenSplitted.afterText
        ) {
          needRefreshEnd++;
        } else {
          break;
        }
      }

      await immediate();

      const beginElement = needRefreshStart === 0 ? this.startElement : this.tokens[needRefreshStart - 1].elements[this.tokens[needRefreshStart - 1].elements.length - 1];

      const fragment = document.createDocumentFragment();
      const generatedTokens: Token[] = [];

      this.statusText.finishScan(textSplitted.length - needRefreshEnd - 1 - needRefreshStart);
      for(let i = needRefreshStart; i <= textSplitted.length - needRefreshEnd - 1; i++) {
        const splitted = textSplitted[i];
        const d = (await this.processor({ text: splitted.text }));
        const elements = [
          RenderedResultDisplay.colorSpan(splitted.beforeText, 'black'),
          RenderedResultDisplay.colorSpan(d.refreshedText ?? splitted.text, d.color),
          RenderedResultDisplay.colorSpan(splitted.afterText + ' ', 'black'),
        ];
        generatedTokens.push({
          ...splitted,
          ...d,
          elements
        });
        elements.forEach(v => fragment.appendChild(v));
        this.statusText.processedWordCountRefresh(i - needRefreshStart + 1);
        await immediate();
      }

      beginElement.parentNode?.insertBefore(fragment, beginElement.nextSibling);

      const toDelete = this.tokens
        .filter((_, i) => needRefreshStart <= i && i <= this.tokens.length - needRefreshEnd - 1)
        .flatMap(v => v.elements);

      console.log(toDelete);

      toDelete.forEach(v => v.remove());

      if (this.tokens.length === 0) {
        this.tokens = generatedTokens;
      } else {
        this.tokens = this.tokens.flatMap((v, i) => {
          if(i === 0 && needRefreshStart === 0) {
            return generatedTokens;
          }
          if (i === needRefreshStart - 1) {
            return [v, ...generatedTokens];
          }
          if (needRefreshStart <= i && i <= this.tokens.length - needRefreshEnd - 1) {
            return [];
          } else {
            return [v];
          }
        });
      }
      this.statusText.finish(this.tokens.length);
      console.log({
        textSplitted,
        tokens: this.tokens,
        needRefreshStart,
        needRefreshEnd,
        beginElement
      });
    });
  }
}
