function csv2Array(csv: string) {
  return csv.split("\n").map((v) => v.split(","));
}
