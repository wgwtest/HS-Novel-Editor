export function createTimelineRenderer({
  activeAxis,
  axisChapterToScreenRange,
  axisGridLines,
  axisRangeToScreen,
  canvas,
  chapters,
  characterById,
  colors,
  constants,
  ctx,
  dayStart,
  events,
  formatDateTime,
  formatMonthDay,
  hitRegions,
  normalizeVisualState,
  state,
  timeline,
  trackById,
  tracks,
  updateStateLabels,
  weekOfMonth,
  world,
  worldToScreenX
}) {
  const {
    AXIS_MODE_CHAPTER,
    MIN_EVENT_BLOCK_WIDTH,
    MS_DAY
  } = constants;

  let rowLayout = [];

  function rowScreenY(y) {
    return y - state.offsetY;
  }

  function stateColor(visualState) {
    if (visualState === "warn") return colors.amber;
    if (visualState === "risk") return colors.red;
    if (visualState === "key") return colors.ink;
    if (visualState === "continuing") return colors.blue;
    return null;
  }

  function trackVisual(track) {
    return {
      fill: track?.soft || colors.tealSoft,
      stroke: track?.color || colors.teal
    };
  }

  function eventVisual(item) {
    const track = trackById(item.track);
    const visualState = normalizeVisualState(item);
    const character = item.kind === "character" ? characterById(item.character) : null;
    if (character) {
      return {
        fill: visualState === "background" ? "#fff" : character.soft,
        stroke: character.color,
        marker: stateColor(visualState),
        visualState
      };
    }
    const base = trackVisual(track);
    return {
      fill: base.fill,
      stroke: base.stroke,
      marker: stateColor(visualState),
      visualState
    };
  }

  function buildRowLayout() {
    const rows = [];
    let y = world.headerHeight;
    tracks.forEach((track) => {
      rows.push({
        type: "track",
        id: track.id,
        trackId: track.id,
        y,
        height: world.trackHeight
      });
      y += world.trackHeight;
      if (track.expanded) {
        track.characters.forEach((characterId) => {
          rows.push({
            type: "character",
            id: `${track.id}:${characterId}`,
            trackId: track.id,
            characterId,
            y,
            height: world.characterHeight
          });
          y += world.characterHeight;
        });
      }
    });
    return rows;
  }

  function rowForEvent(item) {
    if (item.kind === "character") {
      return rowLayout.find((row) => row.type === "character" && row.trackId === item.track && row.characterId === item.character);
    }
    return rowLayout.find((row) => row.type === "track" && row.trackId === item.track);
  }

  function draw() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    hitRegions.length = 0;
    rowLayout = buildRowLayout();

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    drawHeader(w);
    drawTracks(w, h);
    drawSelectedChapterColumn(w, h);
    drawEvents(w);
    updateStateLabels();
  }

  function drawHeader(w) {
    const axis = activeAxis();
    ctx.fillStyle = colors.panelSoft;
    ctx.fillRect(0, 0, w, world.headerHeight);
    ctx.fillStyle = "#f7f9f8";
    ctx.fillRect(world.labelWidth, 0, w - world.labelWidth, 48);
    ctx.fillStyle = "#fbfdfc";
    ctx.fillRect(world.labelWidth, 48, w - world.labelWidth, world.headerHeight - 48);
    ctx.strokeStyle = colors.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, world.headerHeight);
    ctx.lineTo(w, world.headerHeight);
    ctx.stroke();

    ctx.fillStyle = "#eef3f1";
    ctx.fillRect(0, 0, world.labelWidth, 48);
    ctx.fillStyle = "#e4ece9";
    ctx.fillRect(0, 48, world.labelWidth, world.headerHeight - 48);
    ctx.strokeStyle = colors.line;
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, world.labelWidth, world.headerHeight);

    ctx.fillStyle = "#465552";
    ctx.font = "700 13px Microsoft YaHei UI";
    ctx.fillText(axis.mode === AXIS_MODE_CHAPTER ? "章节等宽轴" : "真实时间轴", 14, 25);
    ctx.fillStyle = "#71807c";
    ctx.font = "11px Microsoft YaHei UI";
    ctx.fillText(`${formatDateTime(timeline.start)}`, 14, 46);
    ctx.fillText(`${formatDateTime(timeline.end)}`, 14, 63);
    ctx.fillStyle = colors.ink;
    ctx.font = "800 12px Microsoft YaHei UI";
    ctx.fillText("章节覆盖层", 14, 89);

    ctx.save();
    ctx.beginPath();
    ctx.rect(world.labelWidth, 0, w - world.labelWidth, world.headerHeight);
    ctx.clip();

    if (axis.mode === AXIS_MODE_CHAPTER) {
      (axis.chapters || []).forEach((chapter) => {
        const range = axisChapterToScreenRange(chapter.id);
        if (!range) return;
        const x = range.x;
        const cw = range.width;
        if (x + cw < world.labelWidth - 80 || x > w + 80) return;
        ctx.strokeStyle = "#d8e2df";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 48);
        ctx.stroke();
        ctx.fillStyle = "#53625f";
        ctx.font = "700 12px Microsoft YaHei UI";
        clipText(`${formatMonthDay(chapter.startAt)}-${formatMonthDay(chapter.endAt)}`, x + 6, 20, Math.max(28, cw - 12));
        ctx.fillStyle = "#798884";
        ctx.font = "10px Microsoft YaHei UI";
        clipText(`${formatDateTime(chapter.startAt)} / ${formatDateTime(chapter.endAt)}`, x + 6, 39, Math.max(28, cw - 12));
      });
    } else {
      const weekStart = dayStart(timeline.start);
      for (let tick = weekStart; tick <= timeline.end + MS_DAY; tick += MS_DAY) {
        const x = worldToScreenX(axis.timeToWorld(tick));
        if (x < world.labelWidth - 80 || x > w + 80) continue;
        const date = new Date(tick);
        const day = date.getDay();
        ctx.strokeStyle = day === 1 ? "#cfd9d5" : "#e8eeee";
        ctx.lineWidth = day === 1 ? 1.1 : 1;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 48);
        ctx.stroke();
        if (day === 1 || date.getDate() === 1 || tick === weekStart) {
          const weekLabel = `${date.getMonth() + 1}月第${weekOfMonth(date)}周`;
          ctx.fillStyle = "#53625f";
          ctx.font = "700 12px Microsoft YaHei UI";
          ctx.fillText(weekLabel, x + 6, 20);
        }
        ctx.fillStyle = "#798884";
        ctx.font = "10px Microsoft YaHei UI";
        ctx.fillText(`${date.getMonth() + 1}/${date.getDate()}`, x + 6, 39);
      }
    }

    ctx.strokeStyle = "#b9c6c2";
    ctx.beginPath();
    ctx.moveTo(world.labelWidth, 48);
    ctx.lineTo(w, 48);
    ctx.stroke();

    chapters.forEach((chapter) => {
      const range = axisChapterToScreenRange(chapter.id);
      if (!range) return;
      const x = range.x;
      const cw = range.width;
      const visibleX = Math.max(x, world.labelWidth);
      const visibleRight = Math.min(x + cw, w);
      const visibleWidth = visibleRight - visibleX;
      if (visibleWidth <= 0) return;
      const selected = state.selected?.type === "chapter" && state.selected.id === chapter.id;
      ctx.fillStyle = selected ? colors.tealSoft : "#ffffff";
      ctx.fillRect(x, 52, cw, world.headerHeight - 56);
      ctx.strokeStyle = "#b8c8c4";
      ctx.strokeRect(x, 52, cw, world.headerHeight - 56);
      if (selected) {
        ctx.strokeStyle = colors.ink;
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 2, 54, cw - 4, world.headerHeight - 60);
        ctx.lineWidth = 1;
      }
      ctx.fillStyle = colors.ink;
      ctx.font = "700 14px Microsoft YaHei UI";
      ctx.fillText(chapter.id, x + 8, 71);
      ctx.fillStyle = colors.muted;
      ctx.font = "11px Microsoft YaHei UI";
      clipText(chapter.title, x + 8, 91, Math.max(24, cw - 16));
      hitRegions.push({ type: "chapter", id: chapter.id, x: visibleX, y: 52, w: visibleWidth, h: world.headerHeight - 52 });
    });
    ctx.restore();
    ctx.lineWidth = 1;
  }

  function drawTracks(w, h) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, world.headerHeight, w, Math.max(0, h - world.headerHeight));
    ctx.clip();
    rowLayout.forEach((row, index) => {
      const selectedTrack = state.selected?.type === "track" && state.selected.id === row.trackId;
      const selectedCharacter = state.selected?.type === "character" && state.selected.id === row.id;
      const track = trackById(row.trackId);
      const character = row.type === "character" ? characterById(row.characterId) : null;
      const isTrack = row.type === "track";
      const y = rowScreenY(row.y);
      const rh = row.height;
      const visibleY = Math.max(y, world.headerHeight);
      const visibleBottom = Math.min(y + rh, h);
      const visibleH = visibleBottom - visibleY;
      if (visibleH <= 0) return;

      ctx.fillStyle = isTrack ? (index % 2 === 0 ? "#ffffff" : "#fcfdfc") : "#fbfdfc";
      ctx.fillRect(world.labelWidth, y, w - world.labelWidth, rh);
      ctx.fillStyle = isTrack ? (selectedTrack ? colors.tealSoft : "#f3f6f5") : (selectedCharacter ? character.soft : "#f8faf9");
      ctx.fillRect(0, y, world.labelWidth, rh);
      ctx.strokeStyle = isTrack ? colors.lineSoft : "#e5ece9";
      ctx.beginPath();
      ctx.moveTo(0, y + rh);
      ctx.lineTo(w, y + rh);
      ctx.stroke();
      ctx.strokeStyle = colors.line;
      ctx.beginPath();
      ctx.moveTo(world.labelWidth, y);
      ctx.lineTo(world.labelWidth, y + rh);
      ctx.stroke();

      if (isTrack) {
        const canExpand = track.characters.length > 0;
        ctx.fillStyle = colors.ink;
        ctx.font = "700 13px Microsoft YaHei UI";
        ctx.fillText(canExpand ? (track.expanded ? "▾" : "▸") : "•", 12, y + 31);
        ctx.fillText(track.name, 34, y + 31);
        if (canExpand) {
          ctx.fillStyle = colors.muted;
          ctx.font = "11px Microsoft YaHei UI";
          ctx.textAlign = "right";
          ctx.fillText(`${track.characters.length} 人`, world.labelWidth - 14, y + 31);
          ctx.textAlign = "left";
        }
        hitRegions.push({ type: "track", id: track.id, x: 0, y: visibleY, w: world.labelWidth, h: visibleH });
      } else {
        ctx.strokeStyle = character.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(28, y + 4);
        ctx.lineTo(28, y + rh - 4);
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.fillStyle = character.color;
        ctx.fillRect(38, y + 7, 7, 7);
        ctx.fillStyle = colors.ink;
        ctx.font = "700 11px Microsoft YaHei UI";
        ctx.fillText(character.name, 52, y + 14);
        hitRegions.push({ type: "character", id: row.id, track: row.trackId, character: row.characterId, x: 0, y: visibleY, w: world.labelWidth, h: visibleH });
      }
    });
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.rect(world.labelWidth, world.headerHeight, w - world.labelWidth, h - world.headerHeight);
    ctx.clip();
    axisGridLines().forEach((line) => {
      const x = worldToScreenX(line.world);
      if (x < world.labelWidth - 10 || x > w + 10) return;
      ctx.strokeStyle = "#aebfba";
      ctx.lineWidth = 1.45;
      ctx.beginPath();
      ctx.moveTo(x, world.headerHeight);
      ctx.lineTo(x, h);
      ctx.stroke();
    });
    ctx.restore();
    ctx.lineWidth = 1;
  }

  function drawEvents(w) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(world.labelWidth, world.headerHeight, w - world.labelWidth, canvas.clientHeight - world.headerHeight);
    ctx.clip();

    events.forEach((item) => {
      const row = rowForEvent(item);
      if (!row) return;
      const isCharacter = item.kind === "character";
      const isBackground = isCharacter && item.visibility === "background";
      const character = isCharacter ? characterById(item.character) : null;
      const range = axisRangeToScreen(item.startAt, item.endAt);
      if (!range) return;
      const x = range.x;
      const height = isCharacter ? 20 : 38;
      const y = rowScreenY(row.y) + (isCharacter ? Math.round((row.height - height) / 2) : Math.max(4, (row.height - height) / 2));
      const width = range.width;
      const display = eventDisplayRect(x, width, w);
      if (!display) return;
      const hitY = Math.max(y - 3, world.headerHeight);
      const hitBottom = Math.min(y + height + 3, canvas.clientHeight);
      const hitHeight = hitBottom - hitY;
      if (hitHeight <= 0) return;
      const drawX = display.x;
      const drawWidth = display.width;
      const visual = eventVisual(item);
      const fill = visual.fill;
      const stroke = visual.stroke;
      const visualState = visual.visualState;
      const selected = state.selected?.type === "event" && state.selected.id === item.id;

      ctx.save();
      ctx.fillStyle = fill;
      if (isBackground) ctx.globalAlpha = 0.72;
      ctx.fillRect(drawX, y, drawWidth, height);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = selected ? colors.ink : stroke;
      ctx.lineWidth = selected ? (isCharacter ? 3 : 4) : (isBackground ? 1.5 : 1);
      if (isBackground) ctx.setLineDash([7, 5]);
      ctx.strokeRect(drawX, y, drawWidth, height);
      ctx.setLineDash([]);
      ctx.lineWidth = 1;
      if (!isBackground) {
        if (!isCharacter && visualState === "warn") {
          ctx.fillStyle = visual.marker;
          ctx.fillRect(drawX, y, 7, height);
        } else if (!isCharacter && visualState === "risk") {
          ctx.fillStyle = visual.marker;
          ctx.fillRect(drawX, y + height - 5, drawWidth, 5);
        } else if (!isCharacter && visualState === "key") {
          ctx.strokeStyle = colors.ink;
          ctx.lineWidth = 2;
          ctx.strokeRect(drawX + 3, y + 3, drawWidth - 6, height - 6);
        } else {
          ctx.fillStyle = stroke;
          ctx.fillRect(drawX, y + height - (isCharacter ? 3 : 4), drawWidth, isCharacter ? 3 : 4);
        }
      }
      if (!isCharacter && visual.marker && visualState !== "key" && drawWidth > 76) {
        const tag = visualState.toUpperCase();
        const tagWidth = visualState === "warn" ? 34 : 30;
        const tagX = drawX + drawWidth - tagWidth - 8;
        const tagY = y + 7;
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = visual.marker;
        ctx.lineWidth = 1;
        ctx.strokeRect(tagX, tagY, tagWidth, 14);
        ctx.fillStyle = visual.marker;
        ctx.font = "700 8px Consolas";
        ctx.fillText(tag, tagX + 4, tagY + 10);
      }

      ctx.fillStyle = colors.ink;
      ctx.font = isCharacter ? "700 9px Microsoft YaHei UI" : "700 12px Microsoft YaHei UI";
      if (isBackground) ctx.fillStyle = "#34413f";
      const label = isCharacter ? `${character.short} ${item.title}` : item.title;
      clipText(label, drawX + 8, y + (isCharacter ? 13 : 18), Math.max(20, drawWidth - 16));
      if (!isCharacter) {
        ctx.fillStyle = "#3c4b48";
        ctx.font = "10px Consolas";
        clipText(item.code, drawX + 10, y + 31, Math.max(20, drawWidth - 20));
      }
      ctx.restore();

      hitRegions.push({ type: "event", id: item.id, x: drawX, y: hitY, w: drawWidth, h: hitHeight });
    });

    ctx.restore();
  }

  function drawSelectedChapterColumn(w, h) {
    if (state.selected?.type !== "chapter") return;
    const chapter = chapters.find((item) => item.id === state.selected.id);
    if (!chapter) return;
    const range = axisChapterToScreenRange(chapter.id);
    if (!range) return;
    const x = range.x;
    const cw = range.width;
    if (x + cw < world.labelWidth || x > w) return;

    ctx.save();
    ctx.beginPath();
    ctx.rect(world.labelWidth, world.headerHeight, w - world.labelWidth, h - world.headerHeight);
    ctx.clip();
    ctx.fillStyle = colors.selectionFill;
    ctx.fillRect(x, world.headerHeight, cw, h - world.headerHeight);
    ctx.strokeStyle = colors.selectionBorder;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, world.headerHeight + 1, Math.max(0, cw - 2), Math.max(0, h - world.headerHeight - 2));
    ctx.restore();
    ctx.lineWidth = 1;
  }

  function clipText(text, x, y, maxWidth) {
    let output = text;
    while (ctx.measureText(output).width > maxWidth && output.length > 1) {
      output = output.slice(0, -1);
    }
    if (output !== text && output.length > 1) output = output.slice(0, -1) + "...";
    ctx.fillText(output, x, y);
  }

  function clippedEventRect(x, width, viewportWidth) {
    const left = Math.max(x, world.labelWidth);
    const right = Math.min(x + width, viewportWidth);
    return { x: left, width: Math.max(0, right - left) };
  }

  function eventDisplayRect(x, width, viewportWidth) {
    const actualWidth = Math.max(0, width);
    const actualRight = x + actualWidth;
    if (actualRight < world.labelWidth || x > viewportWidth) return null;

    if (actualWidth >= MIN_EVENT_BLOCK_WIDTH) {
      const clipped = clippedEventRect(x, actualWidth, viewportWidth);
      return clipped.width > 0 ? clipped : null;
    }

    let displayRight = Math.min(actualRight, viewportWidth);
    let displayLeft = displayRight - MIN_EVENT_BLOCK_WIDTH;
    if (displayLeft < world.labelWidth) {
      displayLeft = world.labelWidth;
      displayRight = Math.min(viewportWidth, displayLeft + MIN_EVENT_BLOCK_WIDTH);
    }

    const displayWidth = displayRight - displayLeft;
    return displayWidth > 0 ? { x: displayLeft, width: displayWidth } : null;
  }

  return {
    draw
  };
}
