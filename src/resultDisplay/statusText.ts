export class StatusText {
  constructor(public text: HTMLParagraphElement) {}

  startTime: number | null = null;
  wordCount: number = 0;
  timeout: number[] = [];

  private set content(v: string) {
    this.text.textContent = v;
  }

  start() {
    this.startTime = new Date().getTime();
    const t = window.setTimeout(() => {
      this.content = "Scanning...";
      this.timeout = this.timeout.filter((v) => v !== t);
    }, 300);
    this.timeout.push(t);
  }

  finishScan(wordCount: number) {
    const t = window.setTimeout(() => {
      this.wordCount = wordCount;
      this.content = `0/${this.wordCount} Words...`;
      this.timeout = this.timeout.filter((v) => v !== t);
    }, 300);
    this.timeout.push(t);
  }

  processedWordCountRefresh(processed: number) {
    if (this.startTime === null) return;
    if (new Date().getTime() - this.startTime < 300) return;
    this.content = `${processed}/${this.wordCount} Words...`;
  }

  finish(wordCount: number) {
    this.timeout = this.timeout.filter((v) => {
      clearInterval(v);
      return false;
    });
    if (this.startTime !== null) {
      this.content = `Ready! ${wordCount} Words (${
        new Date().getTime() - this.startTime
      }ms)`;
    } else {
      this.content = `Ready! ${wordCount} Words`;
    }
  }
}
