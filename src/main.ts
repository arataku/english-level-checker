function csv2Array(csv: string): Array<Array<string>> {
  return csv.split("\n").map((v) => v.split(","));
}
