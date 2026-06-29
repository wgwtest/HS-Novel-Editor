export function parseTime(value) {
  return new Date(value).getTime();
}

export function formatMonthDay(value) {
  const date = new Date(typeof value === "number" ? value : parseTime(value));
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function formatDateTime(value) {
  const date = new Date(typeof value === "number" ? value : parseTime(value));
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hour = `${date.getHours()}`.padStart(2, "0");
  const minute = `${date.getMinutes()}`.padStart(2, "0");
  return `${month}-${day} ${hour}:${minute}`;
}

export function formatFullRange(startAt, endAt) {
  return `${formatDateTime(startAt)} -> ${formatDateTime(endAt)}`;
}

export function weekOfMonth(date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  return Math.ceil((date.getDate() + firstDay) / 7);
}

export function dayStart(value) {
  const date = new Date(typeof value === "number" ? value : parseTime(value));
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function createTimelineGeometry({
  chapters,
  state,
  timeline,
  world,
  worldToScreenX,
  constants
}) {
  const { AXIS_MODE_CHAPTER, AXIS_MODE_REAL, MS_DAY, MS_HOUR } = constants;

  function realTimeWorldWidth() {
    return Math.max(world.dayWidth, ((timeline.end - timeline.start) / MS_DAY) * world.dayWidth);
  }

  function realTimeToWorld(value) {
    return ((parseTime(value) - timeline.start) / MS_DAY) * world.dayWidth;
  }

  function chapterDuration(chapter) {
    return Math.max(MS_HOUR, parseTime(chapter.endAt) - parseTime(chapter.startAt));
  }

  function visibleChaptersForAxis() {
    const visible = chapters.filter((chapter) => {
      const start = parseTime(chapter.startAt);
      const end = parseTime(chapter.endAt);
      return start < timeline.end && end > timeline.start;
    });
    return visible.length > 0 ? visible : chapters;
  }

  function createRealTimeAxisProjection() {
    function timeToWorldForAxis(value) {
      return realTimeToWorld(value);
    }

    function rangeToWorld(startAt, endAt) {
      const startWorld = timeToWorldForAxis(startAt);
      const endWorld = timeToWorldForAxis(endAt);
      return {
        startWorld: Math.min(startWorld, endWorld),
        endWorld: Math.max(startWorld, endWorld)
      };
    }

    return {
      mode: AXIS_MODE_REAL,
      worldStart: 0,
      worldEnd: realTimeWorldWidth(),
      timeToWorld: timeToWorldForAxis,
      rangeToWorld,
      chapterToWorldRange(chapterId) {
        const chapter = chapters.find((item) => item.id === chapterId);
        return chapter ? rangeToWorld(chapter.startAt, chapter.endAt) : null;
      },
      getGridLines() {
        const chapterGrid = chapters.map((chapter) => ({ id: chapter.id, world: timeToWorldForAxis(chapter.startAt) }));
        const lastChapter = chapters[chapters.length - 1];
        if (lastChapter) {
          chapterGrid.push({ id: `${lastChapter.id}-end`, world: timeToWorldForAxis(lastChapter.endAt) });
        }
        const seenGrid = new Set();
        return chapterGrid.filter((line) => {
          const key = `${Math.round(line.world * 1000)}`;
          if (seenGrid.has(key)) return false;
          seenGrid.add(key);
          return true;
        });
      }
    };
  }

  function createChapterEqualAxisProjection() {
    const axisChapters = visibleChaptersForAxis();
    const slot = world.chapterSlotWidth;
    const indexById = new Map(axisChapters.map((chapter, index) => [chapter.id, index]));

    function timeToWorldForAxis(value) {
      const time = typeof value === "number" ? value : parseTime(value);
      if (axisChapters.length === 0) return 0;

      const first = axisChapters[0];
      const firstStart = parseTime(first.startAt);
      if (time < firstStart) {
        return ((time - firstStart) / chapterDuration(first)) * slot;
      }

      for (let index = 0; index < axisChapters.length; index += 1) {
        const chapter = axisChapters[index];
        const start = parseTime(chapter.startAt);
        const end = parseTime(chapter.endAt);
        if (time >= start && time <= end) {
          const ratio = (time - start) / chapterDuration(chapter);
          return index * slot + Math.max(0, Math.min(1, ratio)) * slot;
        }

        const next = axisChapters[index + 1];
        if (next) {
          const nextStart = parseTime(next.startAt);
          if (time > end && time < nextStart) return (index + 1) * slot;
        }
      }

      const last = axisChapters[axisChapters.length - 1];
      const lastEnd = parseTime(last.endAt);
      return axisChapters.length * slot + ((time - lastEnd) / chapterDuration(last)) * slot;
    }

    function rangeToWorld(startAt, endAt) {
      const startWorld = timeToWorldForAxis(startAt);
      const endWorld = timeToWorldForAxis(endAt);
      return {
        startWorld: Math.min(startWorld, endWorld),
        endWorld: Math.max(startWorld, endWorld)
      };
    }

    return {
      mode: AXIS_MODE_CHAPTER,
      worldStart: 0,
      worldEnd: Math.max(slot, axisChapters.length * slot),
      timeToWorld: timeToWorldForAxis,
      rangeToWorld,
      chapterToWorldRange(chapterId) {
        const index = indexById.get(chapterId);
        if (index === undefined) return null;
        return {
          startWorld: index * slot,
          endWorld: (index + 1) * slot
        };
      },
      getGridLines() {
        const lines = axisChapters.map((chapter, index) => ({ id: chapter.id, world: index * slot }));
        if (axisChapters.length > 0) {
          const last = axisChapters[axisChapters.length - 1];
          lines.push({ id: `${last.id}-end`, world: axisChapters.length * slot });
        }
        return lines;
      },
      chapters: axisChapters
    };
  }

  function createAxisProjection(mode = state.axisMode) {
    return mode === AXIS_MODE_CHAPTER ? createChapterEqualAxisProjection() : createRealTimeAxisProjection();
  }

  function activeAxis() {
    return createAxisProjection(state.axisMode);
  }

  function totalWorldWidth() {
    return Math.max(world.dayWidth, activeAxis().worldEnd);
  }

  function timeToWorld(value) {
    return activeAxis().timeToWorld(value);
  }

  function timeToScreen(value) {
    return worldToScreenX(timeToWorld(value));
  }

  function axisRangeToScreen(startAt, endAt) {
    const range = activeAxis().rangeToWorld(startAt, endAt);
    if (!range) return null;
    return {
      x: worldToScreenX(range.startWorld),
      width: (range.endWorld - range.startWorld) * state.scale,
      startWorld: range.startWorld,
      endWorld: range.endWorld
    };
  }

  function axisChapterToScreenRange(chapterId) {
    const range = activeAxis().chapterToWorldRange(chapterId);
    if (!range) return null;
    return {
      x: worldToScreenX(range.startWorld),
      width: (range.endWorld - range.startWorld) * state.scale,
      startWorld: range.startWorld,
      endWorld: range.endWorld
    };
  }

  function axisGridLines() {
    return activeAxis().getGridLines();
  }

  function chapterRefsForRange(startAt, endAt) {
    const start = parseTime(startAt);
    const end = parseTime(endAt);
    return chapters
      .filter((chapter) => parseTime(chapter.startAt) < end && parseTime(chapter.endAt) > start)
      .map((chapter) => chapter.id);
  }

  return {
    activeAxis,
    axisChapterToScreenRange,
    axisGridLines,
    axisRangeToScreen,
    chapterRefsForRange,
    createAxisProjection,
    realTimeWorldWidth,
    realTimeToWorld,
    timeToScreen,
    timeToWorld,
    totalWorldWidth
  };
}
