import DescriptionScore from './DescriptionScore';

import React from 'react';
import { mount } from 'enzyme';
import { getScoreLevel, ScoreLevels, scoreText } from './DescriptionScoreUtils';

// We have to use mount function of enzyme because of this https://enzymejs.github.io/enzyme/#react-hooks-support
// In this case it is not a problem use the mount method since DescriptionScore does not render any children
let wrapper;

beforeEach(() => {
  wrapper = mount(<DescriptionScore score={10} />);
});
describe('DescriptionScore component', () => {
  it('should render without crashing', () => {
    expect(wrapper).toMatchSnapshot();
  });

  describe('behavior', () => {
    it('should show medium class if the score is between 25 and 50', () => {
      // Arrange.
      // Act.
      wrapper.setProps({
        score: 40,
      });
      wrapper.update();
      // Assert.
      expect(wrapper.exists(`.${ScoreLevels.MEDIUM}`)).toBe(true);
    });
    it('should show high class if the score is between 50 and 75', () => {
      // Arrange.
      // Act.
      wrapper.setProps({
        score: 55,
      });
      wrapper.update();
      // Assert.
      expect(wrapper.exists(`.${ScoreLevels.HIGH}`)).toBe(true);
    });
    it('should show very high class if the score is greater than 75', () => {
      // Arrange.
      // Act.
      wrapper.setProps({
        score: 80,
      });
      wrapper.update();
      // Assert.
      expect(wrapper.exists(`.${ScoreLevels.VERY_HIGH}`)).toBe(true);
    });
  });
});

describe('DescriptionScore utils', () => {
  describe('getScoreLevel', () => {
    it.each`
      score  | expectedLevel
      ${5}   | ${ScoreLevels.LOW}
      ${10}  | ${ScoreLevels.LOW}
      ${20}  | ${ScoreLevels.LOW}
      ${24}  | ${ScoreLevels.LOW}
      ${25}  | ${ScoreLevels.MEDIUM}
      ${30}  | ${ScoreLevels.MEDIUM}
      ${40}  | ${ScoreLevels.MEDIUM}
      ${45}  | ${ScoreLevels.MEDIUM}
      ${50}  | ${ScoreLevels.HIGH}
      ${55}  | ${ScoreLevels.HIGH}
      ${60}  | ${ScoreLevels.HIGH}
      ${70}  | ${ScoreLevels.HIGH}
      ${75}  | ${ScoreLevels.VERY_HIGH}
      ${80}  | ${ScoreLevels.VERY_HIGH}
      ${90}  | ${ScoreLevels.VERY_HIGH}
      ${100} | ${ScoreLevels.VERY_HIGH}
    `(
      'should return $expectedLevel when score is $score',
      ({ score, expectedLevel }) => {
        // Arrange.
        // Act.
        const result = getScoreLevel(score);
        // Assert.
        expect(result).toBe(expectedLevel);
      }
    );
  });

  describe('scoreText', () => {
    it('should match snapshot', () => {
      // Arrange.
      // Act.
      // Assert.
      expect(scoreText).toMatchSnapshot();
    });
  });
});
