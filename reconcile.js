// Payment reconciliation.
//
// Reads payments.jsonl and works out how much money we actually collected.
// Run:  node reconcile.js

const fs = require("fs");

const latestEvents = new Map();
const lines = fs.readFileSync("payments.jsonl", "utf8").split("\n").filter((l) => l.length > 0);

for (const line of lines) {
  if (!line.trim()) continue;
  let event;

  try{
    event = JSON.parse(line);
  }catch {
    continue;
  }

  if (!event.txn_id) continue;
  const previous = latestEvents.get(event.txn_id);
  if (!previous || event.ts > previous.ts) {
    latestEvents.set(event.txn_id, event);
  }
}

let total = 0;
let count = 0;

for (const event of latestEvents.values()) {
  if (event.status === "success") {
    total += Number(String(event.amount).replaceAll(",", ""));
    count += 1;
  }
}


const expected = parseInt(fs.readFileSync("expected.txt", "utf8").trim(), 10);

if (count !== expected) {
  console.log(`Check failed: counted ${count} successful payments, expected ${expected}.`);
  console.log("Something in the data isn't being handled the way the README describes.");
} else {
  console.log(`Check passed: ${count} successful payments.`);
  console.log(`Your code: KOYA-${Math.round(total)}`);
}
