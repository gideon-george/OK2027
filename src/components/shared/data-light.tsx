"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Feather, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "nokm.dataLight";

interface DataLightValue {
  /** True when decorative, data-hungry parts of the page should not render. */
  lite: boolean;
  toggle: () => void;
  /** False until the client has read the stored preference. */
  ready: boolean;
}

const DataLightContext = createContext<DataLightValue>({
  lite: false,
  toggle: () => {},
  ready: false,
});

interface SaveDataConnection {
  saveData?: boolean;
}

/**
 * Data-light mode.
 *
 * Members are on metered data over patchy networks. Anything decorative — the
 * officer mosaic, the activity ticker, full-resolution portraits — is skipped
 * when this is on. It defaults to on for anyone whose browser reports Data
 * Saver, because that person has already told us what they want.
 *
 * Never gates information. Every number, name and link stays.
 */
export function DataLightProvider({ children }: { children: ReactNode }) {
  const [lite, setLite] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let initial = false;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        initial = stored === "1";
      } else {
        const connection = (
          navigator as Navigator & { connection?: SaveDataConnection }
        ).connection;
        initial = connection?.saveData === true;
      }
    } catch {
      initial = false;
    }
    setLite(initial);
    setReady(true);
  }, []);

  const toggle = useCallback(() => {
    setLite((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* private browsing — the choice lasts for this visit only */
      }
      return next;
    });
  }, []);

  return (
    <DataLightContext.Provider value={{ lite, toggle, ready }}>
      {children}
    </DataLightContext.Provider>
  );
}

export function useDataLight(): DataLightValue {
  return useContext(DataLightContext);
}

export function DataLightToggle({ className }: { className?: string }) {
  const { lite, toggle, ready } = useDataLight();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={ready ? lite : undefined}
      title={
        lite
          ? "Data-light mode is on — photos and animations are off, saving roughly 300 kB a page. Tap to turn off."
          : "Turn on data-light mode to skip photos and animations and save data."
      }
      className={cn(
        "hover:bg-accent flex size-9 items-center justify-center rounded-md border transition-colors",
        lite && "border-brand-green/50 text-brand-green",
        className
      )}
    >
      {lite ? (
        <Feather className="size-[1.1rem]" />
      ) : (
        <ImageIcon className="size-[1.1rem]" />
      )}
      <span className="sr-only">
        {lite ? "Data-light mode is on" : "Turn on data-light mode"}
      </span>
    </button>
  );
}
