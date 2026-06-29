export const VIEW_STATE_STORAGE_KEY = "hs-novel-editor:timeline-view-state:v1";
export const VIEW_STATE_VERSION = 1;

export function normalizePersistedState(value = {}) {
  const datasets = value.datasets && typeof value.datasets === "object" && !Array.isArray(value.datasets)
    ? value.datasets
    : {};
  return {
    version: VIEW_STATE_VERSION,
    activeStoryId: typeof value.activeStoryId === "string" ? value.activeStoryId : "",
    datasets
  };
}

export function loadPersistedState(storage = localStorage) {
  try {
    const raw = storage.getItem(VIEW_STATE_STORAGE_KEY);
    if (!raw) return normalizePersistedState();
    const parsed = JSON.parse(raw);
    return normalizePersistedState(parsed);
  } catch (error) {
    return normalizePersistedState();
  }
}

export function savePersistedState(nextState, storage = localStorage) {
  const persistedViewState = normalizePersistedState(nextState);
  try {
    storage.setItem(VIEW_STATE_STORAGE_KEY, JSON.stringify(persistedViewState));
  } catch (error) {
    // localStorage can fail in private or quota-limited browser contexts.
  }
  return persistedViewState;
}

export function getDatasetViewState(persistedViewState, storyId) {
  if (!storyId) return null;
  const datasetState = normalizePersistedState(persistedViewState).datasets[storyId];
  return datasetState && typeof datasetState === "object" ? datasetState : null;
}

export function setDatasetViewState(persistedViewState, storyId, viewState) {
  if (!storyId) return normalizePersistedState(persistedViewState);
  const current = normalizePersistedState(persistedViewState);
  return {
    ...current,
    activeStoryId: storyId,
    datasets: {
      ...current.datasets,
      [storyId]: viewState
    }
  };
}

export function clearDatasetViewState(persistedViewState, storyId) {
  if (!storyId) return normalizePersistedState(persistedViewState);
  const current = normalizePersistedState(persistedViewState);
  const datasets = { ...current.datasets };
  delete datasets[storyId];
  return {
    ...current,
    activeStoryId: storyId,
    datasets
  };
}
