class StatusText {
  constructor(public text: HTMLParagraphElement) {}

  startTime: number | null = null;
  wordCount: number = 0;

  private set content(v: string) {
    this.text.textContent = v;
  }

  start() {
    this.content = 'Scanning...';
    this.startTime = new Date().getTime();
  }

  finishScan(wordCount: number) {
    this.wordCount = wordCount;
    this.content = `0/${this.wordCount} Words...`;
  }

  processedWordCountRefresh(processed: number) {
    this.content = `${processed}/${this.wordCount} Words...`;
  }

  finish() {
    if(this.startTime !== null) {
      this.content = `Ready! ${this.wordCount} Words (${new Date().getTime() - this.startTime}ms)`;
    } else {
      this.content = `Ready! ${this.wordCount} Words`;
    }
  }
}
