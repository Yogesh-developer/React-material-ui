import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";

import { DragSource } from "react-dnd";
import { MediaPath } from "@math/common";
import { makeStyles } from "@material-ui/styles";

import SVG from "../../../../svg";
import { ACTIONS, DRAG_AND_DROP_ITEMS } from "../../constants";
import TextParser from "../TextParser";
import { useDragAndDropContext } from "../Utilities/Utils";
import clsx from "clsx";
import Grabbing from "../../../../png/Grabbing.png";

export const useStyles = makeStyles((theme) => ({
  grips: {
    position: "absolute",
    right: "4px",
    top: "50%",
    transform: "translate(0, -50%)",
  },
  dotLine: {
    display: "block",
    height: "22px",
    borderRight: "4px dotted  rgb(20, 146, 200)",
    zIndex: "100",
    position: "absolute",
    opacity: "0.8",
    top: "100%",
    left: "50%",
    color: "white",
    transform: "translate(-50%, 0)",
  },
  dotConnector: {
    width: "10px",
    height: "10px",
    borderRadius: "10px",
    position: "absolute",
    top: "4px",
    left: "-3px",
    background: "rgb(20, 146, 200)",
  },
  tile: ({ isDragging, tileWidth, fontSize }) => ({
    background: theme.colors.blue.medium,
    width: tileWidth,
    height: "auto",
    minHeight: "40px",
    fontFamily: theme.fonts.openSansSemiBold,
    fontSize: fontSize || "26px",
    lineHeight: "27px",
    whiteSpace: tileWidth >= 110 ? "normal" : "nowrap",
    color: theme.colors.white,
    marginRight: "8px",
    display: "block",
    textAlign: "center",
    paddingLeft: "16px",
    paddingRight: "16px",
    borderRadius: "2px",
    position: isDragging ? "absolute" : "relative",
    verticalAlign: "middle",
    cursor: isDragging ? "none" : "pointer",
    opacity: isDragging ? 0.85 : 1,
    transform: "translate3d(0, 0, 0)",
    zIndex: isDragging ? "9999999" : "999",
    userSelect: "none",
    outline: "none",
    "&:hover": {
      background: theme.colors.blue.electric,
    },
    "& p": {
      margin: "0",
    },
    "& .tileFraction span": {
      lineHeight: "10px",
      fontSize: "17px",
    },
    "& .numerator": {
      textAlign: "center",
      display: "block",
      fontSize: "15px",
      lineHeight: "20px",
      fontFamily: theme.fonts.openSansSemiBold,
    },
    "& .denominator": {
      textAlign: "center",
      display: "block",
      verticalAlign: "middle",
      fontSize: "15px",
      lineHeight: "20px",
      fontFamily: theme.fonts.openSansSemiBold,
    },
    "& .fraction": {
      display: "block",
      verticalAlign: "middle",
      margin: "0 auto",
    },
    "& .fractionContent": {
      display: "inline-block",
      verticalAlign: "middle",
    },
    "& .wholeContent": {
      display: "inline-block",
    },
  }),
  tileContent: {
    display: "table-cell",
    verticalAlign: "middle",
    padding: "10% 0",
  },
  tileWarning: {
    position: "absolute",
    right: "0px",
    top: "1px",
    background: "#fff",
    zIndex: 999,
    width: "5px",
    height: "10px",
    userSelect: "none",
    outline: "none",
    border: "none",
  },
  tileWarningImage: {
    top: "-8px",
    color: theme.colors.white,
    left: "-8px",
    position: "relative",
    fontSize: "14px",
    width: "25px",
    height: "25px",
  },
  tilePreview: {
    position: "absolute",
    display: "block",
    zIndex: "-100",
    top: "-1500px",
  },
  tileContentWrapper: {
    display: "table",
    height: "100%",
    minHeight: "40px",
    width: "100%",
  },
  tileImage: {
    pointerEvents: "none",
    maxWidth: "100%",
    display: "block",
    height: "auto",
  },
}));

// Exporting for testing
export const tileSource = {
  /**
   * Function is called when the tile starts it's drag.
   * returns object with tileId to keep track of the tile that is dragged.
   * It is retrieved by using 'monitor.getItem()' function.
   *
   * @param {object} props passed in data from drag
   * @returns {{tileId: *}} tileId from drag
   */
  beginDrag(props) {
    const { children: tileText, tileId } = props;
    return { tileText, tileId };
  },
  /**
   * Function is called when the drag is finished.
   * If it did not drop yet, function returns.
   * When it does drop it uses the callback function
   * from props `onDrop` with param `titleId` and `targetId`
   * from the monitor.
   *
   * @param {object} props passed in data from dragging
   * @param {object} monitor functions that has data from drag
   */
  endDrag(props, monitor) {
    if (!monitor.didDrop()) {
      return;
    }

    const { onDrop } = props;
    const { tileId } = monitor.getItem();
    const { targetId } = monitor.getDropResult();

    onDrop(tileId, targetId);
  },
};

// Exporting for testing
export const collect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
  connectDragPreview: connect.dragPreview(),
  targetIds: monitor.getTargetIds(),
});

export const CreateTileBase = ({
  children,
  isDragging,
  showConnector,
  connectDragPreview,
  connectDragSource,
  top,
  left,
  targetIds,
}) => {
  const { dispatch, tileWidth } = useDragAndDropContext();
  const [fontSize, setFontSize] = useState("26px");
  const classes = useStyles({ isDragging, tileWidth, fontSize });
  useEffect(() => {
    document.body.style.cursor = isDragging
      ? `url(${Grabbing}),auto`
      : "default";
    return () => (document.body.style.cursor = "default");
  }, [isDragging]);

  const tileRef = useCallback(
    (node) => {
      if (node) {
        let actualWidth = node.getBoundingClientRect().width - 32;
        if (
          (typeof children === "string" && children.length > 100) ||
          (actualWidth > 68 && actualWidth <= 100)
        ) {
          actualWidth = 100;
        } else {
          actualWidth =
            actualWidth < 68 ? 68 : actualWidth > 150 ? 110 : actualWidth;
        }
        if (tileWidth === "auto" || actualWidth > tileWidth) {
          dispatch({
            type: ACTIONS.updateTileWidth,
            tileWidth: actualWidth,
          });
        }
        setFontSize("20px");
      }
    },
    [dispatch, tileWidth, children]
  );

  return connectDragSource(
    <span
      ref={tileRef}
      tabIndex="0"
      style={{ top, left }}
      className={classes.tile}
    >
      {isDragging && targetIds && targetIds.length < 2 && (
        <span
          className={clsx(classes.tileWarning, "tileWarningTarget")}
          data-tile="tileSpan"
        >
          <span className={classes.tileWarningImage}>
            <SVG.TileWarning />
          </span>
        </span>
      )}
      {connectDragPreview(<div className={classes.tilePreview} />)}
      <div className={classes.tileContentWrapper}>
        <div className={classes.tileContent}>
          {typeof children !== "object" ? (
            <TextParser>{children}</TextParser>
          ) : (
            <div>
              <img
                src={`${MediaPath.path}${children.image}`}
                width={children.width}
                height={children.height}
                alt={children.altText}
                className={classes.tileImage}
              />
            </div>
          )}
        </div>
      </div>
      <SVG.Grips className={classes.grips} />
      {showConnector && (
        <div className={classes.dotLine}>
          <p className={classes.dotConnector} />
        </div>
      )}
    </span>
  );
};

// Exporting for testing
export const Tile = ({
  children,
  connectDragSource,
  isDragging,
  showConnector,
  connectDragPreview,
  top,
  left,
  targetIds,
}) =>
  connectDragSource(
    CreateTileBase({
      children,
      isDragging,
      showConnector,
      connectDragPreview,
      connectDragSource,
      top,
      left,
      targetIds,
    })
  );

Tile.defaultProps = {
  isDragging: false,
  showConnector: false,
};

Tile.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.object]).isRequired,
  connectDragSource: PropTypes.func.isRequired,
  connectDragPreview: PropTypes.func.isRequired,
  tileId: PropTypes.string.isRequired,
  onDrop: PropTypes.func.isRequired,
  isDragging: PropTypes.bool,
  showConnector: PropTypes.bool,
};

export default DragSource(DRAG_AND_DROP_ITEMS.tile, tileSource, collect)(Tile);
