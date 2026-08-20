import { ReactNode } from "react";
import { Hr, Node } from "../ContextMenu";
import { WINDOWS } from "../../constants";
import * as Selectors from "../../selectors";
import * as Actions from "../../actionCreators";
import ContextMenuWrapper from "../ContextMenuWrapper";
import { useTypedSelector, useActionCreator } from "../../hooks";

interface Props {
  children: ReactNode;
}

const MilkdropContextMenu = (props: Props) => {
  const desktop = useTypedSelector(Selectors.getMilkdropDesktopEnabled);
  const overlayOpen = useTypedSelector(Selectors.getPresetOverlayOpen);
  const cycling = useTypedSelector(Selectors.getPresetsAreCycling);
  const randomize = useTypedSelector(Selectors.getRandomizePresets);
  const currentPresetIndex = useTypedSelector(Selectors.getCurrentPresetIndex);
  const presetNames = useTypedSelector(Selectors.getPresetNames);

  const closeWindow = useActionCreator(Actions.closeWindow);
  const toggleDesktop = useActionCreator(Actions.toggleMilkdropDesktop);
  const toggleFullscreen = useActionCreator(Actions.toggleMilkdropFullscreen);
  const togglePresetOverlay = useActionCreator(Actions.togglePresetOverlay);
  const togglePresetCycling = useActionCreator(Actions.togglePresetCycling);
  const toggleRandomizePresets = useActionCreator(Actions.toggleRandomizePresets);
  const selectNextPreset = useActionCreator(Actions.selectNextPreset);
  const selectPreviousPreset = useActionCreator(Actions.selectPreviousPreset);

  const activePresetName =
    currentPresetIndex != null && presetNames && presetNames[currentPresetIndex]
      ? presetNames[currentPresetIndex]
      : null;

  return (
    <ContextMenuWrapper
      renderContents={() => {
        return (
          <>
            {activePresetName && (
              <>
                <Node
                  label={`🎨 ${activePresetName}`}
                  onClick={() => {}}
                />
                <Hr />
              </>
            )}
            <Node
              onClick={togglePresetOverlay}
              checked={overlayOpen}
              label="Preset Selector..."
              hotkey="L"
            />
            <Node
              onClick={togglePresetCycling}
              checked={cycling}
              label="Auto-Cycle Presets"
              hotkey="ScrollLock"
            />
            <Node
              onClick={toggleRandomizePresets}
              checked={randomize}
              label="Randomize Presets"
              hotkey="R"
            />
            <Hr />
            <Node
              onClick={() => selectNextPreset()}
              label="Next Preset"
              hotkey="Space"
            />
            <Node
              onClick={() => selectPreviousPreset()}
              label="Previous Preset"
              hotkey="Backspace"
            />
            <Hr />
            {document.fullscreenEnabled && (
              <Node
                onClick={toggleFullscreen}
                label="Fullscreen"
                hotkey="Alt+Enter"
              />
            )}
            <Node
              onClick={toggleDesktop}
              checked={desktop}
              label="Desktop Mode"
              hotkey="Alt+D"
            />
            <Hr />
            <Node onClick={() => closeWindow(WINDOWS.MILKDROP)} label="Quit" />
          </>
        );
      }}
    >
      {props.children}
    </ContextMenuWrapper>
  );
};

export default MilkdropContextMenu;
