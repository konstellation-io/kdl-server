import {
  BaseType,
  EnterElement,
  Local,
  Selection,
  local,
  select,
} from 'd3-selection';
import { CoordData, CoordOptions, CoordOut } from '../KGViz';
import { px, stringToId } from 'Utils/d3';

import { RESOURCE_R } from '../Resources/Resources';
import styles from '../KGVisualization.module.scss';

const SECTION_STROKE = 1;
const SECTION_INTERVAL = 4;
const OFFSET_SECTION_GUIDES = 50;
const SECTION_BOX_HEIGHT = 32;

export default class Sections {
  container: Selection<SVGGElement, unknown, null, undefined>;
  data: string[] = [];
  sectionStroke: number = 0;
  sectionInterval: number = 0;
  sectionOrientation: Local<string>;
  coord: (
    { category, score, name }: CoordData,
    options: CoordOptions
  ) => CoordOut = () => ({ x: 0, y: 0, angle: 0 });
  scoreDomain: [number, number] = [0, 0];

  constructor(container: Selection<SVGGElement, unknown, null, undefined>) {
    this.container = container.select('g');

    this.sectionOrientation = local<string>();
  }

  updateSizes = (k: number) => {
    const zoomScale = 1 / k;

    this.sectionStroke = SECTION_STROKE * zoomScale;
    this.sectionInterval = SECTION_INTERVAL * zoomScale;
  };

  init = (
    container: Selection<SVGGElement, unknown, null, undefined>,
    data: string[],
    coord: (
      { category, score, name }: CoordData,
      options: CoordOptions
    ) => CoordOut,
    scoreDomain: [number, number]
  ) => {
    this.data = data;
    this.container = container;
    this.coord = coord;
    this.scoreDomain = scoreDomain;

    const { bindData, create, createGuides } = this;

    container.append('g').classed(styles.sectionsWrapper, true);

    const sectionsSelection = bindData(data);

    create(sectionsSelection.enter());

    createGuides();
  };

  performUpdate = (
    data: string[],
    coord: (
      { category, score, name }: CoordData,
      options: CoordOptions
    ) => CoordOut,
    scoreDomain: [number, number]
  ) => {
    this.coord = coord;
    this.data = data;
    this.scoreDomain = scoreDomain;

    const {
      bindData,
      create,
      update,
      remove,
      removeGuides,
      createGuides,
    } = this;

    const resourcesSelection = bindData(data);

    create(resourcesSelection.enter());
    update(resourcesSelection);
    remove(resourcesSelection.exit());

    removeGuides();
    createGuides();
  };

  bindData = (data: string[]) => {
    const { container } = this;

    return container
      .select(`.${styles.sectionsWrapper}`)
      .selectAll(`.${styles.grid}`)
      .data(data);
  };

  create = (container: Selection<EnterElement, string, BaseType, unknown>) => {
    const { coord, scoreDomain, sectionStroke, sectionInterval } = this;

    const [maxR, minR] = scoreDomain;

    container
      .append('line')
      .classed(styles.grid, true)
      .attr('stroke-width', sectionStroke)
      .attr('stroke-dasharray', `${sectionInterval} ${sectionInterval}`)
      .attr(
        'x1',
        (category) =>
          coord({ category, score: maxR }, { offset: -RESOURCE_R }).x
      )
      .attr(
        'y1',
        (category) =>
          coord({ category, score: maxR }, { offset: -RESOURCE_R }).y
      )
      .attr(
        'x2',
        (category) => coord({ category, score: minR }, { offset: RESOURCE_R }).x
      )
      .attr(
        'y2',
        (category) => coord({ category, score: minR }, { offset: RESOURCE_R }).y
      );
  };

  createGuides = () => {
    const {
      container,
      data,
      sectionOrientation,
      coord,
      scoreDomain,
      positionSectionBoxes,
    } = this;
    const minR = scoreDomain[1];

    const sectionAndNames = container
      .append('g')
      .classed(styles.sectionAndNamesG, true);
    sectionAndNames
      .selectAll(`.${styles.sectionAndNamesGuide}`)
      .data(data)
      .enter()
      .append('g')
      .classed(styles.sectionAndNamesGuide, true)
      .attr('transform', function (d: string) {
        const { x, y, angle } = coord(
          { category: d, score: minR },
          { bisector: true, offset: OFFSET_SECTION_GUIDES }
        );
        sectionOrientation.set(
          this,
          angle > 90 && angle < 270 ? 'left' : 'right'
        );
        return `translate(${x}, ${y})`;
      });

    positionSectionBoxes();
  };

  update = (container: Selection<BaseType, string, BaseType, unknown>) => {
    const { coord, sectionInterval, scoreDomain, sectionStroke } = this;

    const [maxR, minR] = scoreDomain;

    container
      .attr('stroke-dasharray', `${sectionInterval} ${sectionInterval}`)
      .attr('stroke-width', sectionStroke)
      .attr(
        'x1',
        (category) =>
          coord({ category, score: maxR }, { offset: -RESOURCE_R }).x
      )
      .attr(
        'y1',
        (category) =>
          coord({ category, score: maxR }, { offset: -RESOURCE_R }).y
      )
      .attr(
        'x2',
        (category) => coord({ category, score: minR }, { offset: RESOURCE_R }).x
      )
      .attr(
        'y2',
        (category) => coord({ category, score: minR }, { offset: RESOURCE_R }).y
      );
  };

  remove = (container: Selection<BaseType, unknown, BaseType, unknown>) => {
    container.interrupt().transition();
    container.transition().duration(400).attr('stroke-opacity', 0).remove();
  };

  removeGuides = () => {
    this.container.select(`.${styles.sectionAndNamesG}`).remove();
  };

  positionSectionBoxes = () => {
    const { container, sectionOrientation } = this;

    container
      .selectAll<SVGGElement, string>(`.${styles.sectionAndNamesGuide}`)
      .each(function (sectionName: string) {
        // FIXME: make sure the next this is properly typed
        // @ts-ignore
        const { left, top } = this.getBoundingClientRect();
        const orientation = sectionOrientation.get(this);
        select(`#kg_${stringToId(sectionName)}`)
          .style('left', orientation === 'right' ? px(left) : 'auto')
          .style(
            'right',
            orientation === 'left' ? px(window.innerWidth - left) : 'auto'
          )
          .style('top', px(top - SECTION_BOX_HEIGHT / 2));
      });
  };
}
