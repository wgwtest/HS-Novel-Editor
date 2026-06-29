import vm from "node:vm";
import { readAppSource } from "./app-validation-helpers.mjs";

const html = readAppSource(import.meta.url);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(
  /const MIN_EVENT_BLOCK_WIDTH\s*=\s*72;/.test(html),
  "Missing 72px minimum event block width."
);

assert(
  html.includes("function eventDisplayRect("),
  "Missing shared event display rectangle calculator."
);

assert(
  /const display = eventDisplayRect\(x,\s*width,\s*w\);/.test(html),
  "drawEvents does not use eventDisplayRect."
);

assert(
  !html.includes("const x = timeToScreen(item.startAt) + 10;"),
  "Event geometry must use the true start coordinate; text padding cannot move the time axis."
);

assert(
  !/const width\s*=\s*\(timeToWorld\(item\.endAt\) - timeToWorld\(item\.startAt\)\) \* state\.scale - 20;/.test(html),
  "Event geometry must use the true duration; text padding cannot shorten the time axis."
);

assert(
  !html.includes("if (width < 22 || clipped.width < 22) return;"),
  "drawEvents still drops short event blocks."
);

assert(
  /hitRegions\.push\(\{\s*type:\s*"event",\s*id:\s*item\.id,\s*x:\s*drawX,\s*y:\s*hitY,\s*w:\s*drawWidth,\s*h:\s*hitHeight\s*\}\)/s.test(html),
  "Event hit region must use drawX/drawWidth after min-width calculation and clipped vertical bounds."
);

function extractFunction(source, name) {
  const signature = `function ${name}(`;
  const start = source.indexOf(signature);
  if (start < 0) return null;
  const bodyStart = source.indexOf("{", start);
  let depth = 0;
  for (let index = bodyStart; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  return null;
}

const clippedMatch = extractFunction(html, "clippedEventRect");
const displayMatch = extractFunction(html, "eventDisplayRect");

assert(clippedMatch, "clippedEventRect not found.");
assert(displayMatch, "eventDisplayRect not found.");

const context = {
  world: { labelWidth: 180 },
};
vm.createContext(context);
vm.runInContext(
  [
    "const MIN_EVENT_BLOCK_WIDTH = 72;",
    clippedMatch,
    displayMatch,
    "globalThis.__eventDisplayRect = eventDisplayRect;",
  ].join("\n"),
  context
);

const longLeftClipped = context.__eventDisplayRect(100, 700, 1000);
assert(
  longLeftClipped.x === 180 && longLeftClipped.width === 620,
  `Long left-clipped event should end at its real right edge, got ${JSON.stringify(longLeftClipped)}`
);

const shortInView = context.__eventDisplayRect(500, 10, 1000);
assert(
  shortInView.x === 438 && shortInView.width === 72,
  `Short event should expand leftward from its real right edge, got ${JSON.stringify(shortInView)}`
);

const viewportClippedShort = context.__eventDisplayRect(970, 20, 1000);
assert(
  viewportClippedShort.x === 918 && viewportClippedShort.width === 72,
  `Short event near viewport edge should preserve its real right edge, got ${JSON.stringify(viewportClippedShort)}`
);

console.log("Event min width validation passed.");
