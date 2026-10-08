import { createContext, useContext, useState, type ReactNode } from "react";
import type { EventRecord, Store } from "../types";
import { initialStore, readStore, writeStore } from "../lib/storage";
type Context = {
  store: Store;
  blocked: boolean;
  update: (fn: (s: Store) => Store) => void;
  editEvent: (id: string, fn: (e: EventRecord) => EventRecord) => void;
  reload: () => void;
  reset: () => void;
  notice: (title: string, message?: string) => void;
  message: { title: string; text: string } | null;
  closeNotice: () => void;
};
const DemoContext = createContext<Context>(null!);
export function DemoProvider({ children }: { children: ReactNode }) {
  const [loaded] = useState(readStore);
  const [store, setStore] = useState(loaded.store);
  const [blocked, setBlocked] = useState(loaded.blocked);
  const [message, setMessage] = useState<Context["message"]>(null);
  const update = (fn: (s: Store) => Store) =>
    setStore((s) => {
      const next = fn(s);
      if (!writeStore(next)) setBlocked(true);
      return next;
    });
  const reload = () => {
    if (!blocked) setStore(readStore().store);
  };
  return (
    <DemoContext.Provider
      value={{
        store,
        blocked,
        update,
        editEvent: (id, fn) =>
          update((s) => ({
            ...s,
            events: s.events.map((e) => (e.id === id ? fn(e) : e)),
          })),
        reload,
        reset: () => update(() => initialStore()),
        message,
        closeNotice: () => setMessage(null),
        notice: (
          title,
          text = "Original workflow not inspected; unavailable in this demo.",
        ) => setMessage({ title, text }),
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}
export const useDemo = () => useContext(DemoContext);
