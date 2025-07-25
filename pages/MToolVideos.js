import React, { useState } from "react";
import PropTypes from "prop-types";

import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

import { useTranslation } from "@shared/core";

import MediaPath from "../../utilities/MediaPath";
import MathButton from "../MathButton";

import course0MToolsData from "./data/course0MToolsData.json";
import course1MToolsData from "./data/course1MToolsData.json";
import course2MToolsData from "./data/course2MToolsData.json";
import SlideView from "./SlideView";
import VideoView from "./VideoView";

export const useStyles = makeStyles((theme) => ({
  mToolVideos: {
    width: "810px",
    display: "flex",
    flexFlow: "column",
    padding: "24px 24px 32px 24px",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "24px",
    alignSelf: "stretch",
  },
  header: {
    fontFamily: theme.fonts.montserratBold,
    fontSize: "24px",
    lineHeight: "28px",
    letterSpacing: "0.15px",
    color: theme.colors.blue.darkest,
  },
  m180Arrow: {
    verticalAlign: "middle",
    marginLeft: "5px",
    marginRight: "5px",
  },
  mToolsButtonDisplay: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    flex: "1 1 auto",
    margin: "40px 125px 47px",
    rowGap: "80px",
  },
  mToolButtonContainer: {
    display: "flex",
    flexDirection: "column",
    flex: "1 0 26%",
  },
  mToolButton: {
    background: "none",
    cursor: "pointer",
    border: "2px solid transparent",
    "&:focus-visible": {
      outline: "none",
      border: `2px solid ${theme.successZnColors.magenta[60]}`,
    },
  },
  mToolButtonText: {
    fontFamily: theme.fonts.openSansSemiBold,
    fontSize: "16px",
    color: theme.colors.blueGrey[100],
    textAlign: "center",
  },
  viewAllMToolsButtonContainer: {
    width: "100%",
    float: "right",
    marginTop: "10px",
    display: "flex",
    justifyContent: "flex-end",
  },
}));

const MToolVideos = ({ courseNumber }) => {
  const classes = useStyles();
  const [mToolSelected, setMToolSelected] = useState(null);

  const { t } = useTranslation();

  const mToolButtonClicked = (data) => (e) => {
    e.preventDefault();
    setMToolSelected(data);
  };

  const mToolButton = (data, index) => {
    const mToolName = t(`mtools.names.${data.name}`);

    return (
      <div className={classes.mToolButtonContainer} key={`mtool_${index}`}>
        <button
          data-testid={`mtool_${index}`}
          className={classes.mToolButton}
          onClick={mToolButtonClicked(data)}
        >
          <img alt={mToolName} src={`${MediaPath.path}${data.image}`} />
        </button>
        <Typography variant="subtitle1" className={classes.mToolButtonText}>
          {mToolName}
        </Typography>
      </div>
    );
  };

  const renderMToolButtons = (mtools) => (
    <div className={classes.mToolsButtonDisplay}>{mtools.map(mToolButton)}</div>
  );

  const mToolButtonsView = () => {
    let mToolTutorialMenuData;
    switch (courseNumber) {
      case 0:
        mToolTutorialMenuData = course0MToolsData.mtools;
        break;
      case 1:
        mToolTutorialMenuData = course1MToolsData.mtools;
        break;
      case 2:
        mToolTutorialMenuData = course2MToolsData.mtools;
        break;
      //no default
    }
    return renderMToolButtons(mToolTutorialMenuData);
  };

  const onViewAllMToolsClicked = () => setMToolSelected(null);

  const renderContent = () => {
    if (!mToolSelected) {
      return mToolButtonsView();
    }

    return (
      <>
        {courseNumber === 1 ? (
          <VideoView video={mToolSelected.video} />
        ) : (
          <SlideView
            mToolName={t(`mtools.names.${mToolSelected.name}`)}
            slides={mToolSelected.slides}
          />
        )}
        <div className={classes.viewAllMToolsButtonContainer}>
          <MathButton
            data-testid="viewAllMtoolsButton"
            secondary
            onClickHandler={onViewAllMToolsClicked}
          >
            VIEW All MTOOLS
          </MathButton>
        </div>
      </>
    );
  };

  return <div className={classes.mToolVideos}>{renderContent()}</div>;
};

MToolVideos.defaultProps = {
  courseNumber: 1,
};

MToolVideos.propTypes = {
  courseNumber: PropTypes.oneOf([0, 1, 2]),
};

export default MToolVideos;
