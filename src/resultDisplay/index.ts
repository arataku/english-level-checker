import { StatusText } from "./statusText";

export const Colors = {
  RED: "red",
  ORANGE: "orange",
  BLACK: "black",
} as const;

class Cursor {
  constructor(public text: string) {}
}

interface ProccessorResult {
  color: typeof Colors[keyof typeof Colors];
  refreshedText?: string;
}
type TokenProcessor = (
  cursor: Cursor,
  level: number
) => ProccessorResult;

export class ResultDisplay {
  private _textElement: HTMLTextAreaElement | undefined;
  private _levelElement: HTMLInputElement | undefined;
  private _displayDivElement: HTMLDivElement | undefined;
  private _processor: TokenProcessor | undefined;

  constructor() {}

  textElement(element: HTMLElement | null) {
    if (!(element instanceof HTMLTextAreaElement)) {
      throw "inputElement must be an instance of HTMLTextAreaElement.";
    }
    this._textElement = element;
    return this;
  }

  levelElement(element: HTMLElement | null) {
    if (!(element instanceof HTMLInputElement)) {
      throw "levelElement must be an instance of HTMLInputElement.";
    }
    this._levelElement = element;
    return this;
  }

  displayDivElement(element: HTMLElement | null) {
    if (!(element instanceof HTMLDivElement)) {
      throw "displayDivElement must be an instance of HTMLDivElement.";
    }
    this._displayDivElement = element;
    return this;
  }

  processor(lambda: TokenProcessor) {
    this._processor = lambda;
    return this;
  }

  render() {
    if (
      this._textElement === undefined ||
      this._levelElement === undefined ||
      this._displayDivElement === undefined ||
      this._processor === undefined
    ) {
      throw "render must be executed after inputElement, displayDivElement, and processor.";
    }
    new RenderedResultDisplay(
      this._textElement,
      this._levelElement,
      this._displayDivElement,
      this._processor
    );
  }
}

const immediate = () => new Promise((resolve) => setTimeout(resolve, 0));

interface Token {
  beforeText: string;
  text: string;
  afterText: string;
  color: typeof Colors[keyof typeof Colors];
  refreshedText?: string | undefined,
  elements: HTMLSpanElement[];
}
class RenderedResultDisplay {
  tokenViewer: HTMLDivElement;
  statusText: StatusText;
  startElement: HTMLSpanElement;
  tokens: Token[] = [];

  rendering: boolean = false;

  private static splitText(t: string) {
    const s = t.match(/^([^a-zA-Z-\']*)([a-zA-Z-\']+)([^a-zA-Z-\']*)$/);

    return s === null
      ? {
          beforeText: "",
          text: t,
          afterText: "",
        }
      : {
          beforeText: s[1],
          text: s[2],
          afterText: s[3],
        };
  }

  private static colorSpan(
    text: string,
    color: typeof Colors[keyof typeof Colors],
    linebreak: boolean = false
  ) {
    const span = document.createElement("span");
    span.textContent = text;
    span.classList.add(color);
    if (linebreak) span.classList.add("linebreak");
    return span;
  }

  constructor(
    private textElement: HTMLTextAreaElement,
    private levelElement: HTMLInputElement,
    private displayDivElement: HTMLDivElement,
    private processor: TokenProcessor
  ) {
    const statusTextInstance = document.createElement("p");
    this.statusText = new StatusText(statusTextInstance);
    this.tokenViewer = document.createElement("div");
    this.startElement = document.createElement("span");

    this.tokenViewer.appendChild(this.startElement);

    displayDivElement.appendChild(statusTextInstance);
    displayDivElement.appendChild(this.tokenViewer);

    const changeDifficulty = async (parsedLevel: number) => {

      if (this.rendering) {
        console.warn("It is skipped because render during render.");
        return;
      }
      this.rendering = true;

      this.statusText.start();
      this.statusText.finishScan(this.tokens.length);

      const needToRefreshes: {
        index: number,
        newToken: ProccessorResult,
      }[] = [];
      for(let i = 0; i < this.tokens.length; i++) {
        const token = this.tokens[i];
        const d = processor({ text: token.text }, parsedLevel);
        if(d.color !== token.color || d.refreshedText !== token.refreshedText) {
          needToRefreshes.push({
            index: i,
            newToken: d
          });
        }
        if(i % 20 === 0) {
          this.statusText.processedWordCountRefresh(i);
          await immediate();
        }
      }

      this.statusText.processedWordCountRefresh(this.tokens.length);
      await immediate();

      const toBeRemove: HTMLElement[] = [];
      this.tokens = this.tokens.map((v, i) => {
        const a = needToRefreshes.find(v => v.index === i)?.newToken;
        if(a === undefined) return v;

        const changeStart = i === 0 ? this.startElement : this.tokens[i - 1].elements[
          this.tokens[i - 1].elements.length - 1
        ];

        const elements = v.text === "\n"
        ? [RenderedResultDisplay.colorSpan("", "black", true)]
        : [
            RenderedResultDisplay.colorSpan(v.beforeText, "black"),
            RenderedResultDisplay.colorSpan(
              a.refreshedText ?? v.text,
              a.color
            ),
            RenderedResultDisplay.colorSpan(
              v.afterText + " ",
              "black"
            ),
          ];

        toBeRemove.push(...v.elements);

        const fragment = document.createDocumentFragment();
        elements.forEach(v => fragment.appendChild(v));
        changeStart.parentNode?.insertBefore(fragment, changeStart.nextSibling);
        return {
          beforeText: v.beforeText,
          text: v.text,
          afterText: v.afterText,
          ...a,
          elements
        }
      });
      toBeRemove.forEach(v => v.remove())
      this.statusText.finish(this.tokens.length);

      await immediate();
      const parsedLevelNewer = Math.floor(Number(this.levelElement.value));
      if(parsedLevel !== parsedLevelNewer) {
        this.rendering = false;
        console.log(`Playback: ${parsedLevelNewer}`)
        changeDifficulty(parsedLevelNewer);
        return;
      }
      this.rendering = false;
    };

    const render = async () => {
      if (this.rendering) {
        console.warn("It is skipped because render during render.");
        return;
      }
      this.rendering = true;
      this.statusText.start();
      const value = this.textElement.value;
      const text =
        value === ""
          ? []
          : (value.endsWith(" ") ? value.slice(0, -1) : value)
              .split(/\n/)
              .map((v) => v.split(" "))
              .flatMap((v) => [...v, "\n"]);

      await immediate();

      const textSplitted = text.map(RenderedResultDisplay.splitText);

      let needRefreshStart = 0;
      let needRefreshEnd = 0;

      for (
        let i = 0;
        i < Math.min(textSplitted.length, this.tokens.length);
        i++
      ) {
        const targetSplitted = textSplitted[i];
        const tokenSplitted = this.tokens[i];
        if (
          targetSplitted.text === tokenSplitted.text &&
          targetSplitted.beforeText === tokenSplitted.beforeText &&
          targetSplitted.afterText === tokenSplitted.afterText
        ) {
          needRefreshStart++;
        } else {
          break;
        }
      }

      await immediate();

      for (
        let i = 0;
        i < Math.min(textSplitted.length, this.tokens.length);
        i++
      ) {
        const targetSplitted = textSplitted[textSplitted.length - i - 1];
        const tokenSplitted = this.tokens[this.tokens.length - i - 1];

        if (
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

      const beginElement =
        needRefreshStart === 0
          ? this.startElement
          : this.tokens[needRefreshStart - 1].elements[
              this.tokens[needRefreshStart - 1].elements.length - 1
            ];

      const fragment = document.createDocumentFragment();
      const generatedTokens: Token[] = [];

      this.statusText.finishScan(
        textSplitted.length - needRefreshEnd - 1 - needRefreshStart
      );

      const parsedLevel = Math.floor(Number(this.levelElement.value));
      for (
        let i = needRefreshStart;
        i <= textSplitted.length - needRefreshEnd - 1;
        i++
      ) {
        const splitted = textSplitted[i];
        const d = processor(
          { text: splitted.text },
          parsedLevel,
        );
        const elements =
          splitted.text === "\n"
            ? [RenderedResultDisplay.colorSpan("", "black", true)]
            : [
                RenderedResultDisplay.colorSpan(splitted.beforeText, "black"),
                RenderedResultDisplay.colorSpan(
                  d.refreshedText ?? splitted.text,
                  d.color
                ),
                RenderedResultDisplay.colorSpan(
                  splitted.afterText + " ",
                  "black"
                ),
              ];
        generatedTokens.push({
          ...splitted,
          ...d,
          elements,
        });
        elements.forEach((v) => fragment.appendChild(v));
        if((i - needRefreshStart + 1) % 20 === 0) {
          this.statusText.processedWordCountRefresh(i - needRefreshStart + 1);
          await immediate();
        }
      }

      beginElement.parentNode?.insertBefore(fragment, beginElement.nextSibling);

      const toDelete = this.tokens
        .filter(
          (_, i) =>
            needRefreshStart <= i &&
            i <= this.tokens.length - needRefreshEnd - 1
        )
        .flatMap((v) => v.elements);

      console.log(toDelete);

      toDelete.forEach((v) => v.remove());

      if (this.tokens.length === 0) {
        this.tokens = generatedTokens;
      } else {
        this.tokens = this.tokens.flatMap((v, i) => {
          if (i === 0 && needRefreshStart === 0) {
            return generatedTokens;
          }
          if (i === needRefreshStart - 1) {
            return [v, ...generatedTokens];
          }
          if (
            needRefreshStart <= i &&
            i <= this.tokens.length - needRefreshEnd - 1
          ) {
            return [];
          } else {
            return [v];
          }
        });
      }
      this.statusText.finish(this.tokens.length);
      /*
      console.log({
        textSplitted,
        tokens: this.tokens,
        needRefreshStart,
        needRefreshEnd,
        beginElement
      });
      */
      this.rendering = false;
    };

    this.textElement.addEventListener("input", () => render());

    const levelRefresh = () => {
      const parsedLevel = Math.floor(Number(this.levelElement.value));
      let valueElement = document.getElementById(
        "range_value"
      ) as HTMLSpanElement;
      valueElement.textContent = parsedLevel.toString();

      changeDifficulty(parsedLevel);
    }

    this.levelElement.addEventListener("input", () => levelRefresh());
    this.levelElement.addEventListener("change", () => levelRefresh());
  }
}
