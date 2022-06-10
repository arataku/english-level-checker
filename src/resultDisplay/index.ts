
export const Colors = {
  RED: 'red',
  ORANGE: 'orange',
  BLACK: 'black',
} as const;

class Cursor {
  constructor(public text: string){}
}

type TokenProcessor = (cursor: Cursor) => Promise<{ color: typeof Colors[keyof typeof Colors] }>;

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

class RenderedResultDisplay {
  constructor(
    private inputElement: HTMLInputElement,
    private displayDivElement: HTMLDivElement,
    private processor: TokenProcessor,
  ){}
}
