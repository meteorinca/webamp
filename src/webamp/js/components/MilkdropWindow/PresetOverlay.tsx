import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { promptForFileReferences } from "../../fileUtils";
import * as Selectors from "../../selectors";
import * as Actions from "../../actionCreators";
import { TransitionType } from "../../types";
import {
  useUnmountedRef,
  useActionCreator,
  useTypedSelector,
} from "../../hooks";

interface Props {
  height: number;
  width: number;
}

const LOADING_STYLE: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#00ff00",
  background: "rgba(0, 0, 0, 0.85)",
  fontSize: "12px",
  fontFamily: "Tahoma, Geneva, sans-serif",
  fontWeight: "bold",
  zIndex: 99999,
};

function PresetOverlay({ height, width }: Props) {
  const presetKeys = useTypedSelector(Selectors.getPresetNames);
  const currentPresetIndex = useTypedSelector(Selectors.getCurrentPresetIndex);
  const presetsAreCycling = useTypedSelector(Selectors.getPresetsAreCycling);
  const randomizePresets = useTypedSelector(Selectors.getRandomizePresets);

  const requestPresetAtIndex = useActionCreator(Actions.requestPresetAtIndex);
  const togglePresetOverlay = useActionCreator(Actions.togglePresetOverlay);
  const appendPresetFileList = useActionCreator(Actions.appendPresetFileList);
  const togglePresetCycling = useActionCreator(Actions.togglePresetCycling);
  const toggleRandomizePresets = useActionCreator(Actions.toggleRandomizePresets);
  const selectNextPreset = useActionCreator(Actions.selectNextPreset);
  const selectPreviousPreset = useActionCreator(Actions.selectPreviousPreset);

  const unmountedRef = useUnmountedRef();
  const [filterText, setFilterText] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);

  const listContainerRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<{ [key: number]: HTMLLIElement | null }>({});

  const loadLocalDir = useCallback(async () => {
    const fileReferences = await promptForFileReferences({ directory: true });
    if (unmountedRef.current) {
      return;
    }
    appendPresetFileList(fileReferences);
  }, [appendPresetFileList, unmountedRef]);

  // Filter presets based on user search input
  const filteredItems = useMemo(() => {
    if (!presetKeys) return [];
    if (!filterText.trim()) {
      return presetKeys.map((name, originalIndex) => ({
        name,
        originalIndex,
      }));
    }
    const lower = filterText.toLowerCase();
    const result = [];
    for (let i = 0; i < presetKeys.length; i++) {
      if (presetKeys[i].toLowerCase().includes(lower)) {
        result.push({ name: presetKeys[i], originalIndex: i });
      }
    }
    return result;
  }, [filterText, presetKeys]);

  // Reset focus index when filter changes
  useEffect(() => {
    setFocusedIndex(0);
  }, [filterText]);

  // Auto-scroll focused item into view when navigating via keyboard
  const scrollToFocusedItem = useCallback((index: number) => {
    const el = itemRefs.current[index];
    if (el) {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, []);

  const handleSelectPreset = useCallback(
    (originalIndex: number) => {
      requestPresetAtIndex(originalIndex, TransitionType.DEFAULT, true);
    },
    [requestPresetAtIndex]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.ctrlKey) {
        if (e.key === "ArrowRight" || e.keyCode === 39) {
          e.preventDefault();
          e.stopPropagation();
          selectNextPreset();
          return;
        } else if (e.key === "ArrowLeft" || e.keyCode === 37) {
          e.preventDefault();
          e.stopPropagation();
          selectPreviousPreset();
          return;
        }
      }
      const maxIndex = filteredItems.length; // 0 is Load Dir, 1..N are presets
      switch (e.key) {
        case "ArrowUp": {
          e.preventDefault();
          e.stopPropagation();
          setFocusedIndex((prev) => {
            const next = Math.max(0, prev - 1);
            scrollToFocusedItem(next);
            return next;
          });
          break;
        }
        case "ArrowDown": {
          e.preventDefault();
          e.stopPropagation();
          setFocusedIndex((prev) => {
            const next = Math.min(maxIndex, prev + 1);
            scrollToFocusedItem(next);
            return next;
          });
          break;
        }
        case "Enter": {
          e.preventDefault();
          e.stopPropagation();
          if (focusedIndex === 0) {
            loadLocalDir();
          } else if (filteredItems[focusedIndex - 1]) {
            handleSelectPreset(filteredItems[focusedIndex - 1].originalIndex);
          }
          break;
        }
        case "Escape": {
          e.preventDefault();
          e.stopPropagation();
          togglePresetOverlay();
          break;
        }
      }
    },
    [
      filteredItems,
      focusedIndex,
      handleSelectPreset,
      loadLocalDir,
      scrollToFocusedItem,
      selectNextPreset,
      selectPreviousPreset,
      togglePresetOverlay,
    ]
  );

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  if (presetKeys == null) {
    return (
      <div style={LOADING_STYLE}>
        <span>LOADING PRESETS...</span>
      </div>
    );
  }

  // Calculate overlay dimensions (responsive)
  const overlayWidth = Math.min(540, Math.max(300, width - 24));
  const overlayMaxHeight = Math.min(620, Math.max(280, height - 24));
  const listHeight = overlayMaxHeight - 165;

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.65)",
        zIndex: 99999,
        outline: "none",
      }}
      onClick={togglePresetOverlay}
      onKeyDown={handleKeyDown}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: overlayWidth,
          maxHeight: overlayMaxHeight,
          background: "#17171a",
          border: "2px solid #3c3c44",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.95), inset 0 0 0 1px #101014",
          display: "flex",
          flexDirection: "column",
          padding: "10px 12px",
          color: "#c0c0c0",
          fontFamily: "Tahoma, Geneva, Verdana, sans-serif",
          fontSize: "11px",
          boxSizing: "border-box",
          userSelect: "none",
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "8px",
            padding: "4px 8px",
            background: "linear-gradient(90deg, #1f222a 0%, #121418 100%)",
            border: "1px solid #2b2b32",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: "bold", color: "#00ff00", letterSpacing: "0.5px" }}>
              MILKDROP PRESET SELECTOR
            </span>
            <span style={{ fontSize: "10px", color: "#808080", fontWeight: "bold" }}>
              ({presetKeys.length} TOTAL)
            </span>
          </div>
          <button
            onClick={togglePresetOverlay}
            title="Close (Esc)"
            style={{
              background: "#26262a",
              border: "1px solid #4a4a52",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: "10px",
              fontWeight: "bold",
              padding: "1px 6px",
              lineHeight: "12px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#800000";
              e.currentTarget.style.borderColor = "#ff0000";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#26262a";
              e.currentTarget.style.borderColor = "#4a4a52";
            }}
          >
            X
          </button>
        </div>

        {/* Quick Action Toolbar */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            marginBottom: "8px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => selectNextPreset()}
            style={{
              flex: 1,
              minWidth: "80px",
              padding: "4px 8px",
              background: "#26262a",
              border: "1px solid #4a4a52",
              color: "#00ff00",
              fontSize: "10px",
              fontWeight: "bold",
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#33333a")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#26262a")}
          >
            RANDOM
          </button>

          <button
            onClick={loadLocalDir}
            style={{
              flex: 1,
              minWidth: "90px",
              padding: "4px 8px",
              background: "#26262a",
              border: "1px solid #4a4a52",
              color: "#c0c0c0",
              fontSize: "10px",
              fontWeight: "bold",
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#33333a")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#26262a")}
          >
            LOAD FOLDER...
          </button>

          <button
            onClick={togglePresetCycling}
            title="Auto-cycle presets"
            style={{
              padding: "4px 8px",
              background: presetsAreCycling ? "#003300" : "#26262a",
              border: presetsAreCycling ? "1px solid #00ff00" : "1px solid #4a4a52",
              color: presetsAreCycling ? "#00ff00" : "#808080",
              fontSize: "10px",
              fontWeight: "bold",
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            CYCLE: {presetsAreCycling ? "ON" : "OFF"}
          </button>

          <button
            onClick={toggleRandomizePresets}
            title="Randomize transition order"
            style={{
              padding: "4px 8px",
              background: randomizePresets ? "#332200" : "#26262a",
              border: randomizePresets ? "1px solid #ffaa00" : "1px solid #4a4a52",
              color: randomizePresets ? "#ffaa00" : "#808080",
              fontSize: "10px",
              fontWeight: "bold",
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            SHUFFLE: {randomizePresets ? "ON" : "OFF"}
          </button>
        </div>

        {/* Search Input Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
          <span style={{ fontSize: "10px", fontWeight: "bold", color: "#00ff00", letterSpacing: "0.5px" }}>
            SEARCH:
          </span>
          <input
            type="text"
            placeholder="Type to filter visualizers..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{
              flex: 1,
              boxSizing: "border-box",
              background: "#000000",
              color: "#00ff00",
              border: "1px solid #4a4a52",
              padding: "4px 8px",
              fontSize: "11px",
              fontFamily: "monospace, Tahoma, sans-serif",
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#00ff00")}
            onBlur={(e) => (e.target.style.borderColor = "#4a4a52")}
          />
          {filterText && (
            <button
              onClick={() => setFilterText("")}
              style={{
                background: "#26262a",
                border: "1px solid #4a4a52",
                color: "#c0c0c0",
                cursor: "pointer",
                fontSize: "9px",
                fontWeight: "bold",
                padding: "3px 6px",
              }}
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Scrollable Preset List */}
        <ul
          ref={listContainerRef}
          style={{
            listStyleType: "none",
            padding: "2px",
            margin: 0,
            overflowY: "auto",
            maxHeight: `${Math.max(160, listHeight)}px`,
            background: "#000000",
            border: "1px solid #33333a",
            boxShadow: "inset 0 0 4px rgba(0, 0, 0, 0.9)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Index 0: Load Local Directory option */}
          <li
            ref={(el) => { itemRefs.current[0] = el; }}
            onClick={(e) => {
              e.stopPropagation();
              setFocusedIndex(0);
              loadLocalDir();
            }}
            style={{
              padding: "4px 6px",
              fontSize: "11px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: focusedIndex === 0 ? "#ffffff" : "#808080",
              backgroundColor: focusedIndex === 0 ? "#000080" : "transparent",
            }}
            onMouseEnter={() => setFocusedIndex(0)}
          >
            <span>[+] LOAD LOCAL DIRECTORY...</span>
          </li>

          {/* Preset list items */}
          {filteredItems.length === 0 ? (
            <li style={{ padding: "12px", textAlign: "center", color: "#666666", fontSize: "11px" }}>
              No visualizers match "{filterText}"
            </li>
          ) : (
            filteredItems.map((item, idx) => {
              const listIdx = idx + 1;
              const isCurrent = item.originalIndex === currentPresetIndex;
              const isFocused = listIdx === focusedIndex;
              const numStr = String(item.originalIndex + 1).padStart(3, "0");

              return (
                <li
                  key={item.originalIndex}
                  ref={(el) => { itemRefs.current[listIdx] = el; }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFocusedIndex(listIdx);
                    handleSelectPreset(item.originalIndex);
                  }}
                  onMouseEnter={() => setFocusedIndex(listIdx)}
                  style={{
                    padding: "3px 6px",
                    fontSize: "11px",
                    fontWeight: isCurrent ? "bold" : "normal",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    color: isCurrent
                      ? "#ffffff"
                      : isFocused
                      ? "#ffffff"
                      : "#00ff00",
                    backgroundColor: isCurrent
                      ? "#0000c6"
                      : isFocused
                      ? "#000080"
                      : "transparent",
                    userSelect: "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", overflow: "hidden" }}>
                    <span style={{ color: isCurrent ? "#ffffff" : isFocused ? "#a0a0a0" : "#008800", fontSize: "10px", fontFamily: "monospace" }}>
                      {numStr}.
                    </span>
                    <span
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={item.name}
                    >
                      {item.name}
                    </span>
                  </div>

                  {isCurrent && (
                    <span
                      style={{
                        fontSize: "9px",
                        fontWeight: "bold",
                        padding: "1px 4px",
                        background: "#000080",
                        color: "#00ff00",
                        border: "1px solid #00ff00",
                        letterSpacing: "0.5px",
                        whiteSpace: "nowrap",
                        marginLeft: "6px",
                      }}
                    >
                      ACTIVE
                    </span>
                  )}
                </li>
              );
            })
          )}
        </ul>

        {/* Footer Hint */}
        <div
          style={{
            marginTop: "8px",
            paddingTop: "6px",
            borderTop: "1px solid #26262a",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "10px",
            color: "#666666",
            fontWeight: "bold",
            letterSpacing: "0.5px",
          }}
        >
          <span>NAV: UP/DOWN | SELECT: ENTER | CTRL+LEFT/RIGHT: PREV/NEXT</span>
          <span>CLOSE: ESC</span>
        </div>
      </div>
    </div>
  );
}

export default PresetOverlay;
