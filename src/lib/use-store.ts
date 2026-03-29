import { useSyncExternalStore } from "react";
import type { StoreApi } from "zustand/vanilla";

export function useStore<TState, Selected>(
  store: StoreApi<TState>,
  selector: (state: TState) => Selected,
): Selected {
  const getSnapshot = () => selector(store.getState());
  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}
