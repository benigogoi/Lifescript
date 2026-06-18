import {
  calculateNumerology,
  reduceToSingleDigit,
  nameNumberOf,
  loShuGrid,
} from "../src/lib/numerology";

let pass = 0;
let fail = 0;

function check(label: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    pass++;
    console.log(`  ✅ ${label}`);
  } else {
    fail++;
    console.log(`  ❌ ${label}\n       expected ${e}\n       got      ${a}`);
  }
}

console.log("\n— Reduction —");
check("28 -> 1 (brief example)", reduceToSingleDigit(28), 1);
check("2026 -> 1", reduceToSingleDigit(2026), 1);
check("2027 -> 2", reduceToSingleDigit(2027), 2);
check("9 -> 9 (no collapse to 0)", reduceToSingleDigit(9), 9);
check("18 -> 9", reduceToSingleDigit(18), 9);

console.log("\n— Name number (Pythagorean) —");
// RAVI: R=9, A=1, V=4, I=9 = 23 -> 5
check("RAVI -> 5", nameNumberOf("Ravi"), 5);
// PRIYA: P=7,R=9,I=9,Y=7,A=1 = 33 -> 6
check("PRIYA -> 6", nameNumberOf("Priya"), 6);

console.log("\n— Lo Shu grid (DOB 28-08-1995) —");
const ls = loShuGrid(28, 8, 1995);
// digits: 2 8 0 8 1 9 9 5 -> drop 0 -> {1:1, 2:1, 5:1, 8:2, 9:2}
check("counts", ls.counts, { 1: 1, 2: 1, 3: 0, 4: 0, 5: 1, 6: 0, 7: 0, 8: 2, 9: 2 });
check("missing", ls.missing, [3, 4, 6, 7]);
check("repeated", ls.repeated, [8, 9]);

console.log("\n— Full profile: 'Ravi Kumar', 28 Aug 1995 —");
const r = calculateNumerology({ fullName: "Ravi Kumar", day: 28, month: 8, year: 1995 });
// Mulank: 28 -> 1 (Sun)
check("mulank", r.mulank, { number: 1, planet: "Sun" });
// Bhagyank: day 28->1, month 8->8, year 1995->24->6 ; 1+8+6=15 -> 6 (Venus)
check("bhagyank", r.bhagyank, { number: 6, planet: "Venus" });
// Name 'Ravi' -> 5 (Mercury)
check("nameNumber", r.nameNumber, { number: 5, planet: "Mercury" });
check("universalYear2026", r.universalYear2026, { number: 1, planet: "Sun" });
check("universalYear2027", r.universalYear2027, { number: 2, planet: "Moon" });

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
