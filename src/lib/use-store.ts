import { useEffect, useState } from "react";
import type { StoreApi } from "zustand/vanilla";
import { shallow } from "zustand/shallow";

export function useStore<TState, Selected>(
  store: StoreApi<TState>,
  selector: (state: TState) => Selected,
): Selected {
  const [selected, setSelected] = useState(() => selector(store.getState()));

  useEffect(() => {
    const checkForUpdates = () => {
      const next = selector(store.getState());
      setSelected((current) => (shallow(current, next) ? current : next));
    };

    checkForUpdates();
    return store.subscribe(checkForUpdates);
  }, [selector, store]);

  return selected;
}
