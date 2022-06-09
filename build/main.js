"use strict";
function csv2Array(csv, englishCol, japaneseCol) {
    return csv.split("\n").map(function (v) { return [v[englishCol], v[japaneseCol]]; });
}
function searchWord(dictionary, word, maxLevel) {
    var count = 0;
    var _loop_1 = function (i) {
        var tmp = word.slice(0, -count);
        var result = dictionary
            .slice(0, Math.max(maxLevel, dictionary.length))
            .find(function (v) { return v[0] == tmp; });
        if (result !== undefined) {
            return { value: result[1] };
        }
    };
    for (var i = 0; i < 3; i++) {
        var state_1 = _loop_1(i);
        if (typeof state_1 === "object")
            return state_1.value;
    }
    return undefined;
}
//# sourceMappingURL=main.js.map