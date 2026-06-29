export function createHitTester({ hitRegions, world }) {
  function labelColumnHitTest(x, y) {
    if (x > world.labelWidth) return null;
    for (let i = hitRegions.length - 1; i >= 0; i -= 1) {
      const region = hitRegions[i];
      if (region.type !== "track" && region.type !== "character") continue;
      if (x >= region.x && x <= region.x + region.w && y >= region.y && y <= region.y + region.h) return region;
    }
    return null;
  }

  function hitTest(x, y) {
    const labelHit = labelColumnHitTest(x, y);
    if (labelHit) return labelHit;
    for (let i = hitRegions.length - 1; i >= 0; i -= 1) {
      const region = hitRegions[i];
      if (x >= region.x && x <= region.x + region.w && y >= region.y && y <= region.y + region.h) return region;
    }
    return null;
  }

  return {
    hitTest,
    labelColumnHitTest
  };
}
