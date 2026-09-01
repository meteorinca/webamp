import * as Actions from "../../actionCreators";
import PlaylistMenu from "./PlaylistMenu";
import { Node } from "../ContextMenu";
import ContextMenuTarget from "../ContextMenuTarget";
import { useActionCreator } from "../../hooks";

export default function ListMenu() {
  const removeAllTracks = useActionCreator(Actions.removeAllTracks);
  const savePlaylistToFile = useActionCreator(Actions.savePlaylistToFile);
  const savePlaylistToStorage = useActionCreator(Actions.savePlaylistToStorage);
  const loadPlaylistFromFile = useActionCreator(Actions.loadPlaylistFromFile);
  const loadPlaylistFromStorage = useActionCreator(Actions.loadPlaylistFromStorage);

  return (
    <PlaylistMenu id="playlist-list-menu">
      <div className="new-list" onClick={removeAllTracks} />
      <div className="save-list" onClick={(e) => e.stopPropagation()}>
        <ContextMenuTarget
          style={{ width: "100%", height: "100%" }}
          top
          renderMenu={() => (
            <>
              <Node
                label="Save playlist to file (.m3u8)"
                onClick={savePlaylistToFile}
              />
              <Node
                label="Save to browser storage"
                onClick={savePlaylistToStorage}
              />
            </>
          )}
        >
          <div />
        </ContextMenuTarget>
      </div>
      <div className="load-list" onClick={(e) => e.stopPropagation()}>
        <ContextMenuTarget
          style={{ width: "100%", height: "100%" }}
          top
          renderMenu={() => (
            <>
              <Node
                label="Load playlist file... (.m3u, .pls)"
                onClick={loadPlaylistFromFile}
              />
              <Node
                label="Load from browser storage"
                onClick={loadPlaylistFromStorage}
              />
            </>
          )}
        >
          <div />
        </ContextMenuTarget>
      </div>
    </PlaylistMenu>
  );
}
