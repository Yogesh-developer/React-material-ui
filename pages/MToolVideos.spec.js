import React from "react";
import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";

import MToolVideos, { useStyles } from "../MToolVideos";

describe("<MToolVideos />", () => {
  let wrapper = null;

  let mockEvent = null;

  const mToolButtonSelector = '[data-testid="mtool_0"]';

  beforeEach(() => {
    mockEvent = {
      preventDefault: jest.fn(),
    };

    wrapper = shallow(<MToolVideos />);
  });

  it("should render correctly", () => {
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });

  describe("go to video view", () => {
    beforeEach(() => {
      wrapper.find(mToolButtonSelector).simulate("click", mockEvent);
    });

    it("should render correctly", () => {
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(shallowToJson(wrapper)).toMatchSnapshot();
    });

    it("clicking on View All mTools should load buttons again", () => {
      wrapper
        .find('[data-testid="viewAllMtoolsButton"]')
        .props()
        .onClickHandler();

      expect(shallowToJson(wrapper)).toMatchSnapshot();
    });
  });

  describe("course 2", () => {
    beforeEach(() => {
      wrapper.setProps({ courseNumber: 2 });
    });

    it("should render correctly", () => {
      expect(shallowToJson(wrapper)).toMatchSnapshot();
    });

    describe("go to slide view", () => {
      beforeEach(() => {
        wrapper.find(mToolButtonSelector).simulate("click", mockEvent);
      });

      it("should render correctly", () => {
        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(shallowToJson(wrapper)).toMatchSnapshot();
      });

      it("clicking on View All mTools should load buttons again", () => {
        wrapper
          .find('[data-testid="viewAllMtoolsButton"]')
          .props()
          .onClickHandler();

        expect(shallowToJson(wrapper)).toMatchSnapshot();
      });
    });
  });

  it("useStyles", () => {
    expect(useStyles()).toMatchSnapshot();
  });
});
