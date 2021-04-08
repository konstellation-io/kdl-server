import styles from './Sections.module.scss';
import { INNER_R } from '../KGViz';
import { CoordData, CoordOptions, CoordOut } from '../KGViz';
import { select, Selection } from 'd3-selection';
import { ScaleBand } from 'd3-scale';

const OFFSET_SECTION_GUIDES = 50;

class Sections {
  data: string[] = [];
  scores: [number, number] = [1, 0];
  coord: (data: CoordData, options?: CoordOptions) => CoordOut = () => ({
    x: 0,
    y: 0,
    angle: 0,
  });
  sectionsWrapper: Selection<SVGGElement, unknown, null, undefined> = select(
    {} as SVGGElement
  );
  sectionLabelsWrapper: Selection<
    SVGGElement,
    unknown,
    null,
    undefined
  > = select({} as SVGGElement);

  constructor(coord: (data: CoordData, options?: CoordOptions) => CoordOut) {
    this.coord = coord;
  }

  initialize(
    mainG: Selection<SVGGElement, unknown, null, undefined>,
    scale: ScaleBand<string>,
    scores: [number, number]
  ) {
    this.data = scale.domain();
    this.scores = scores;

    this.sectionsWrapper = mainG
      .append('g')
      .classed(styles.sectionsWrapper, true);

    this.sectionLabelsWrapper = mainG
      .append('g')
      .classed(styles.sectionAndNamesG, true);

    this.draw();
  }

  update = (scale: ScaleBand<string>, scores: [number, number]) => {
    this.data = scale.domain();
    this.scores = scores;

    this.draw();
  };

  draw() {
    const {
      data,
      scores: [maxR, minR],
      sectionsWrapper,
      sectionLabelsWrapper,
      coord,
      getLabelX,
      getLabelY,
    } = this;

    sectionsWrapper
      .selectAll(`line.${styles.grid}`)
      .data(data)
      .join('line')
      .classed(styles.grid, true)
      .attr('x1', (category) => coord({ category, score: maxR }).x)
      .attr('y1', (category) => coord({ category, score: maxR }).y)
      .attr('x2', (category) => coord({ category, score: minR }).x)
      .attr('y2', (category) => coord({ category, score: minR }).y);

    sectionLabelsWrapper
      .selectAll(`foreignObject.${styles.sectionAndNamesGuide}`)
      .data(data)
      .join(
        (enter) =>
          enter
            .append('foreignObject')
            .classed(styles.sectionAndNamesGuide, true)
            .attr('x', getLabelX)
            .attr('y', getLabelY)
            .attr('width', 2 * INNER_R)
            .attr('height', 2 * INNER_R)
            .append('xhtml:div')
            .classed(styles.sectionLabel, true)
            .html((d) => d),
        (update) =>
          update
            .attr('x', getLabelX)
            .attr('y', getLabelY)
            .select(`.${styles.sectionLabel}`)
            .html((d) => d)
      );
  }

  getLabelX = (d: string) => {
    const {
      coord,
      scores: [, minR],
    } = this;

    const { x: dx, angle } = coord(
      { category: d, score: minR },
      { bisector: true, offset: OFFSET_SECTION_GUIDES }
    );
    const isLeftSide = angle > 90 && angle < 270;

    return isLeftSide ? dx - 2 * INNER_R : dx;
  };
  getLabelY = (d: string) => {
    const {
      coord,
      scores: [, minR],
    } = this;

    return coord(
      { category: d, score: minR },
      { bisector: true, offset: OFFSET_SECTION_GUIDES }
    ).y;
  };
}

export default Sections;
