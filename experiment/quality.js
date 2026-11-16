const killed = Number(process.argv[2]);
const total = Number(process.argv[3]);
const coverage = Number(process.argv[4]) / 100;
const lambda = Number(process.argv[5] ?? 0.5);

if (
  !Number.isInteger(killed) ||
  !Number.isInteger(total) ||
  total <= 0 ||
  killed < 0 ||
  killed > total ||
  !(coverage >= 0 && coverage <= 1) ||
  !(lambda >= 0 && lambda <= 1)
) {
  console.error(
    "Usage: node quality.js <killed> <total> <coverage%> [lambda]"
  );
  process.exit(1);
}

const D = killed / total;
const C = coverage;
const Q = lambda * D + (1 - lambda) * C;

console.log(`Quality:   ${Q.toFixed(4)}`);
