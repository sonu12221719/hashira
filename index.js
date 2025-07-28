import fs from "fs";

function baseToBigInt(str, base) {
  const digits = "0123456789abcdef";
  base = BigInt(base);
  str = str.toLowerCase();

  let result = 0n;
  for (const ch of str) {
    const digit = digits.indexOf(ch);
    if (digit === -1 || BigInt(digit) >= base) {
      throw new Error(`Invalid digit '${ch}' for base ${base}`);
    }
    result = result * base + BigInt(digit);
  }
  return result;
}

function lagrangeInterpolationAtZero(points) {
  let secret = 0n;
  const k = points.length;

  for (let j = 0; j < k; j++) {
    let numerator = 1n;
    let denominator = 1n;

    for (let m = 0; m < k; m++) {
      if (m !== j) {
        numerator *= -points[m].x;
        denominator *= points[j].x - points[m].x;
      }
    }
    secret += points[j].y * (numerator / denominator);
  }

  return secret;
}

function getCombinations(arr, k) {
  const results = [];
  const combination = [];

  function backtrack(start) {
    if (combination.length === k) {
      results.push(combination.slice());
      return;
    }
    for (let i = start; i < arr.length; i++) {
      combination.push(arr[i]);
      backtrack(i + 1);
      combination.pop();
    }
  }

  backtrack(0);
  return results;
}

function solveWithWrongShares(input) {
  const n = input.keys.n;
  const k = input.keys.k;

  const points = [];
  for (const key in input) {
    if (key === "keys") continue;
    const x = BigInt(key);
    const { base, value } = input[key];
    const y = baseToBigInt(value, Number(base));
    points.push({ x, y });
  }

  if (points.length < k) {
    throw new Error(`Not enough points: have ${points.length}, need ${k}`);
  }

  const combos = getCombinations(points, k);
  const secretMap = new Map();

  for (const combo of combos) {
    try {
      const secret = lagrangeInterpolationAtZero(combo);
      const s = secret.toString();
      if (!secretMap.has(s)) secretMap.set(s, []);
      secretMap.get(s).push(combo);
    } catch {
        continue;
    }
  }

  let maxCount = 0;
  let correctSecret = null;

  for (const [secret, combos] of secretMap.entries()) {
    if (combos.length > maxCount) {
      maxCount = combos.length;
      correctSecret = secret;
    }
  }

  const validShares = new Set();
  for (const combo of secretMap.get(correctSecret)) {
    combo.forEach(s => validShares.add(s));
  }

  const invalidShares = points.filter(p => !validShares.has(p));

  console.log("Reconstructed Secret:", correctSecret);
  if (invalidShares.length === 0) {
    console.log("No invalid shares detected.");
  } else {
    console.log("\nInvalid shares:");
    invalidShares.forEach(s =>
      console.log(`x=${s.x.toString()}, y=${s.y.toString()}`)
    );
  }

  return correctSecret;
}


const input1 = JSON.parse(fs.readFileSync("input1.json", "utf-8"));
const input2 = JSON.parse(fs.readFileSync("input2.json", "utf-8"));

console.log("=== Test Case 1 ===");
solveWithWrongShares(input1);

console.log("\n=== Test Case 2 ===");
solveWithWrongShares(input2);
