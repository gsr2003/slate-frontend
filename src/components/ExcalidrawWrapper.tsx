import { useEffect, useState, useRef, useCallback } from "react";
import { Excalidraw, exportToBlob, exportToSvg } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import "@excalidraw/excalidraw/index.css";
import API from "../api";

interface Props {
  mode: "diary" | "notes";
  selectedId: string | null;
  selectedDate: string | null;
  onAPIReady?: (api: ExcalidrawImperativeAPI | null) => void;
}

const ExcalidrawWrapper = ({ mode, selectedId, selectedDate, onAPIReady }: Props) => {
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const saveTimeout = useRef<any>(null);
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);

  // API ready hone pe parent ko batao
  useEffect(() => {
    if (onAPIReady) {
      onAPIReady(excalidrawAPI);
    }
  }, [excalidrawAPI, onAPIReady]);

  // ========== LOAD DATA ==========
  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);

    if (mode === "notes" && selectedId) {
      loadNote(selectedId);
    } else if (mode === "diary" && selectedId && selectedDate) {
      loadDiaryEntry(selectedId, selectedDate);
    } else {
      setInitialData(null);
    }
  }, [mode, selectedId, selectedDate]);

  const loadNote = async (id: string) => {
    setLoading(true);
    try {
      const { data } = await API.get(`/notes/${id}`);
      setInitialData({
        elements: data.scene?.elements || [],
        appState: data.scene?.appState || {},
        files: data.scene?.files || {},
      });
    } catch (error) {
      setInitialData({ elements: [], appState: {}, files: {} });
    } finally {
      setLoading(false);
    }
  };

  const loadDiaryEntry = async (diaryId: string, date: string) => {
    setLoading(true);
    try {
      const { data } = await API.get(`/diaries/entry/${diaryId}/${date}`);
      setInitialData({
        elements: data.scene?.elements || [],
        appState: data.scene?.appState || {},
        files: data.scene?.files || {},
      });
    } catch (error) {
      setInitialData({ elements: [], appState: {}, files: {} });
    } finally {
      setLoading(false);
    }
  };

  // ========== AUTO SAVE ==========
  const handleChange = useCallback(
    (elements: any, appState: any, files: any) => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);

      saveTimeout.current = setTimeout(async () => {
        try {
          if (mode === "notes" && selectedId) {
            await API.put(`/notes/${selectedId}`, {
              scene: { elements, appState, files },
            });
          } else if (mode === "diary" && selectedId && selectedDate) {
            await API.post(`/diaries/entry`, {
              diaryId: selectedId,
              date: selectedDate,
              scene: { elements, appState, files },
            });
          }
        } catch (error) {
          console.error("Auto-save failed", error);
        }
      }, 1500);
    },
    [mode, selectedId, selectedDate]
  );

  // ========== UI STATES ==========
  if (mode === "notes" && !selectedId) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
        Select a note or create a new one
      </div>
    );
  }

  if (mode === "diary" && !selectedId) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
        Select or create a diary
      </div>
    );
  }

  if (mode === "diary" && selectedId && !selectedDate) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
        Please select a date
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Excalidraw
        key={`${mode}-${selectedId}-${selectedDate}`}
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        initialData={initialData}
        onChange={handleChange}
      />
    </div>
  );
};

export default ExcalidrawWrapper;