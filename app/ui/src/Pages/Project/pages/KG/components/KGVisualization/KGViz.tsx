import { BaseType, EnterElement, Local, Selection, local, select } from 'd3-selection';
import { Coord, GroupD, getHash, groupData } from '../../utils';
import { D, ResourceType } from './KGVisualization';
import { MINIMAP_HEIGHT, MINIMAP_WIDTH } from '../Minimap/Minimap';
import { RGBColor, color } from 'd3-color';
import { scaleBand, scaleLinear } from '@visx/scale';

import MinimapViz from '../Minimap/MinimapViz';
import { ZoomValues } from './useZoom';
import { range } from 'd3-array';
import { stringToId } from 'Utils/d3';
import styles from './KGVisualization.module.scss';

const px = (value: number | string) => `${value}px`;

export const PADDING = 0.15;
export const OUTER_R = 370;

const MIN_SCORE = 0.25;
const MAX_SCORE = 1;

const TOOLTIP_WIDTH = 300;
const INNER_R = 53.5;
const RESOURCE_R = 14;
const RESOURCE_STROKE = 4;
const GUIDE_STROKE = 1;
const SECTION_INTERVAL = 4;
const AXIS_PADDING = 8;
const AXIS_FONT_SIZE = 12;
const SECTION_BOX_HEIGHT = 32;

export const N_GUIDES = 2;

const TEXT_COLOR_THRESHOLD = 120;
const TEXT_COLOR = {
  DARK: '#00252E',
  LIGHT: '#CCF5FF'
};

const PATH = {
  CODE: 'M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z',
  DOC: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z'
};

const COLOR_SCALE_COLORS = ['#176177', '#D6FFFF'];
const colorScale = scaleLinear({
  domain: [1, 10],
  range: COLOR_SCALE_COLORS
});

const section = (d: D) => d.category;

export type CoordData = {
  category: string,
  score: number,
  name?: string
};
export type CoordOptions = {
  jittered?: boolean,
  offset?: number,
  bisector?: boolean
};

type Props = {
  width: number;
  parent: SVGSVGElement;
  data: D[];
  height: number;
  showTooltip: (p: any) => void;
  hideTooltip: () => void;
  minimapRef: SVGSVGElement;
  tooltipOpen: boolean;
  x: number;
  y: number;
  k: number;
  initialZoomValues: ZoomValues;
};

class KGViz {
  props: Props;
  wrapper: Selection<SVGGElement, unknown, null, undefined>;
  mainG: Selection<SVGGElement, unknown, null, undefined>;
  center: Coord;
  rScale = scaleLinear<number>();
  sectionScale = scaleBand();
  sectionDomain: string[];
  groupedData: GroupD[];
  minimap: MinimapViz;
  sectionOrientation: Local<string>;
  size: {
    innerWidth: number,
    innerHeight: number,
    sectionInterval: number,
    resourceR: number,
    resourceStroke: number,
    guideStroke: number,
    bubbleCollision: number,
    tooltipWidth: number,
    axisPadding: number,
    axisFontSize: number
  }

  constructor(wrapper: SVGGElement, props: Props) {
    this.wrapper = select(wrapper);
    this.mainG = select(wrapper);
    this.props = props;
    this.groupedData = [];
    this.sectionDomain = [];

    const innerWidth = (1 - 2 * PADDING) * props.width;
    const innerHeight = (1 - 2 * PADDING) * props.height;
    this.center = { x: props.width / 2, y: props.height / 2 };
    this.size = {
      innerWidth,
      innerHeight,
      sectionInterval: SECTION_INTERVAL,
      resourceR: 0,
      resourceStroke: 0,
      guideStroke: 0,
      bubbleCollision: 0,
      tooltipWidth: 0,
      axisPadding: 0,
      axisFontSize: 0
    };
    
    this.rScale = scaleLinear({
      range: [INNER_R + RESOURCE_R, OUTER_R - RESOURCE_R],
      domain: [MAX_SCORE, MIN_SCORE]
    });
    this.sectionScale = scaleBand({
      range: [0, 360],
      padding: 0
    });

    this.minimap = new MinimapViz(props.minimapRef, {
      width: MINIMAP_WIDTH,
      height: MINIMAP_HEIGHT,
      areaWidth: props.width,
      areaHeight: props.height,
      x: props.x,
      y: props.y,
      k: props.k,
      initialZoomValues: props.initialZoomValues
    });

    this.sectionOrientation = local<string>();

    this.updateSizes();
    this.cleanup();
    this.initialize();
  }

  cleanup = () => {
    this.wrapper.selectAll('*').remove();
  };

  updateScalesAndData = (data: D[]) => {
    this.sectionDomain = Array.from(new Set(data.map(section)));
    this.sectionScale.domain(this.sectionDomain);

    this.groupedData = groupData(data, this.coord, this.elementsCollide);
  }

  initialize = () => {
    this.updateScalesAndData(this.props.data);

    this.minimap.initialize(this.groupedData);

    const {
      resources,
      sections,
      sectionGuides,
      wrapper,
      center,
      groupedData,
      positionSectionBoxes,
      sectionDomain,
      size: {
        guideStroke,
        axisPadding,
        axisFontSize
      }
    } = this;

    // Add structural elements
    // center wrapper
    this.mainG = wrapper.append('g')
      .attr('transform', `translate(${center.x}, ${center.y})`);
    
    const { mainG } = this;

    // Guides
    const guides = mainG.append('g');
    range(1, N_GUIDES + 1).forEach(guide =>
      guides.append('circle')
        .classed(styles.guide, true)
        .attr('r', INNER_R + (OUTER_R - INNER_R) * guide / 3)
        .attr('stroke-width', guideStroke)
    );

    // Sections
    const newSections = mainG.append('g')
      .classed(styles.sectionsWrapper, true)
      .selectAll(`.${styles.grid}`).data(sectionDomain).enter();
    sections.create(newSections);

    sectionGuides.create();
    positionSectionBoxes();

    // InnerCircle
    const innerCircle = mainG.append('g');
    innerCircle.append('circle')
      .classed(styles.innerCircle, true)
      .attr('r', INNER_R);
    
    innerCircle.append('foreignObject')
      .attr('x', - INNER_R)
      .attr('y', - INNER_R)
      .attr('width', 2 * INNER_R)
      .attr('height', 2 * INNER_R)
      .append('xhtml:div')
        .classed(styles.innerCircleText, true)
        .html('Project Name 1');

    // OuterCircle
    mainG.append('circle')
      .classed(styles.outerCircle, true)
      .attr('r', OUTER_R);
    
    // Radius axis
    const axis = mainG.append('g')
      .classed(styles.axis, true)
      .attr('transform', `translate(${INNER_R + 1}, 0)`);
    axis.append('text')
      .text('100%');
    axis.append('text')
      .attr('x', (OUTER_R - INNER_R) / 3)
      .text('75%');
    axis.append('text')
      .attr('x', (OUTER_R - INNER_R) * 2 / 3)
      .text('50%');
    axis.append('text')
      .attr('x', OUTER_R - INNER_R)
      .text('25%');
    axis.selectAll('text')
      .attr('dx', axisPadding)
      .attr('dy', -axisPadding)
      .style('font-size', px(axisFontSize));

    // Data elements
    const resourcesWrapper = mainG
      .append('g')
      .classed(styles.resourcesWrapper, true);
    
    const newResources = resourcesWrapper
      .selectAll(`.${styles.resourceWrapper}`)
      .data(groupedData)
      .enter();
    
    resources.create(newResources);
  };

  highlightResource = (resourceName: string | null) => {
    const { mainG } = this;

    const allResources = mainG.selectAll<BaseType, GroupD>(`.${styles.resource}`);
    allResources
      .classed(styles.highlight, false)
      .classed(styles.unhighlight, true);
    
    allResources.filter(d => d.elements.some((el: D) => el.name === resourceName))
      .classed(styles.highlight, true)
      .classed(styles.unhighlight, false);
  };

  updateZoomArea = (zoomValues: ZoomValues) => {
    const {
      minimap,
      groupedData,
      resetTooltip,
      positionSectionBoxes
    } = this;
    
    minimap.update(groupedData, zoomValues);

    resetTooltip();
    positionSectionBoxes();
  };

  update = (zoomValues: ZoomValues, data: D[]) => {
    this.props.k = zoomValues.k;
    this.updateSizes();
    
    this.updateScalesAndData(data);

    this.minimap.update(this.groupedData, zoomValues);

    const {
      resources,
      sections,
      sectionGuides,
      mainG,
      groupedData,
      resetTooltip,
      positionSectionBoxes,
      sectionDomain,
      size: {
        guideStroke,
        axisPadding,
        axisFontSize
      }
    } = this;

    resetTooltip();
    
    // Guides
    mainG.selectAll(`.${styles.guide}`)
      .attr('stroke-width', guideStroke);
    
    // Sections
    const allSections = mainG
      .selectAll(`.${styles.sectionsWrapper}`)
      .selectAll(`.${styles.grid}`)
      .data(sectionDomain);
    const newSections = allSections.enter();
    const oldSections = allSections.exit();
    sections.create(newSections);
    sections.update(allSections);
    sections.remove(oldSections);
    
    // Regenerate section boxes
    sectionGuides.destroy();
    sectionGuides.create();
    positionSectionBoxes();
    
    // Axis
    mainG.select(`.${styles.axis}`).selectAll('text')
      .attr('dx', axisPadding)
      .attr('dy', -axisPadding)
      .style('font-size', px(axisFontSize));

    // Data
    const allResources = mainG
      .select(`.${styles.resourcesWrapper}`)
      .selectAll(`.${styles.resourceWrapper}`)
      .data(groupedData, d => `${(d as GroupD).x}${(d as GroupD).y}`);
    const newResources = allResources
      .enter();
    const oldResources = allResources
      .exit();

    // When zooming interrupts previous zoom animation, interrupt node removal and rescale elements.
    mainG.selectAll('.removing')
      .interrupt().transition();
    mainG.selectAll(`.${styles.resourceG}`).transition()
      .delay(100)
      .attr('transform', 'scale(1)');      
    
    resources.create(newResources);
    resources.remove(oldResources);
    resources.update(allResources);
  }

  resources = {
    create: (container: Selection<EnterElement, GroupD, BaseType, unknown>) => {
      const {
        onShowTooltip,
        onHideTooltip,
        size: {
          resourceR,
          resourceStroke
        },
        props: {
          k
        }
      } = this;
      
      const resourceWrappers = container
        .append('g')
          .classed(styles.resourceWrapper, true)
          .attr('transform', d => `translate(${d.x}, ${d.y})`)
          .on('mouseenter', function(){
            // Move to front
            select(this).each(function(){
              this.parentNode && this.parentNode.appendChild(this);
            });
          });
      const resourcesG = resourceWrappers
        .append('g')
          .classed(styles.resourceG, true)
          .attr('transform', 'scale(0)');
      resourcesG
          .transition()
            .duration(400)
            .attr('transform', 'scale(1)');
      
      // Tooltip
      resourcesG
        .append('rect')
        .classed(styles.tooltipRect, true)
        .classed(styles.resourceGroup, (d: GroupD) => d.elements.length > 1)
        .attr('x', -resourceR - resourceStroke / 3)
        .attr('y', -resourceR - resourceStroke / 3)
        .attr('width', 2 * resourceR + resourceStroke / 1.5)
        .attr('height', 2 * resourceR + resourceStroke / 1.5)
        .attr('rx', resourceR + resourceStroke / 4)
        .attr('fill-opacity', 0)
        .on('click', () => alert('Open Panel'))
        .on('mouseover', function(e, d: GroupD) {
          onShowTooltip(e, d, this);
        })
        .on('mouseleave', function() {
          onHideTooltip(this);
        });
        
      resourcesG.append('circle')
        .classed(styles.resource, true)
        .classed(styles.resourceGroup, (d: GroupD) => d.elements.length > 1)
        .classed(styles.resourceNode, (d: GroupD) => d.elements.length === 1)
        .attr('fill', (d: GroupD) => colorScale(d.elements.length))
        .attr('r', resourceR)
        .attr('stroke-width', resourceStroke);
      
      resourcesG.append('svg')
        .classed(styles.resourceImage, true)
        .attr('x', - resourceR / 2)
        .attr('y', - resourceR / 2)
        .attr('display', (d: GroupD) => d.elements.length === 1 ? 'default' : 'none')
        .attr('width', resourceR)
        .attr('height', resourceR)
        .attr('viewBox', `0 0 24 24`)
        .append('path')
          .attr('d', (d: GroupD) => d.elements[0].type === ResourceType.CODE ? PATH.CODE : PATH.DOC);
        
      resourcesG.append('text')
        .classed(styles.resourceLabel, true)
        .attr('vertical-anchor', "middle")
        .attr('text-anchor', "middle")
        .style('font-size', px(20 * (1 / k)))
        .attr('fill', (d: GroupD) => {
          const c: RGBColor = color(colorScale(d.elements.length).toString()) as RGBColor;
          return c.r * 0.299 + c.g * 0.587 + c.b * 0.114 > TEXT_COLOR_THRESHOLD
            ? TEXT_COLOR.DARK
            : TEXT_COLOR.LIGHT;
        })
        .text((d: GroupD) => d.elements.length)
        .attr('display', (d: GroupD) => d.elements.length > 1 ? 'default' : 'none');
    },
    update: (container: Selection<BaseType, GroupD, BaseType, unknown>) => {
      const {
        onShowTooltip,
        onHideTooltip,
        size: {
          resourceR,
          resourceStroke,
        },
        props: { k }
      } = this;
  
      const zoomScale = 1 / k;

      container.attr('transform', d => `translate(${d.x}, ${d.y})`);
  
      container.select(`.${styles.resource}`)
        .attr('r', resourceR)
        .attr('stroke-width', resourceStroke);
    
      container.select(`.${styles.resourceImage}`)
        .attr('x', - resourceR / 2)
        .attr('y', - resourceR / 2)
        .attr('width', resourceR)
        .attr('height', resourceR);
      
      container.select(`.${styles.resourceLabel}`)
        .style('font-size', px(20 * zoomScale));
    
      container.select(`.${styles.tooltipRect}`)
        .attr('x', - resourceR - resourceStroke / 4)
        .attr('y', - resourceR - resourceStroke / 4)
        .attr('width', 2 * resourceR + resourceStroke / 2)
        .attr('height', 2 * resourceR + resourceStroke / 2)
        .attr('rx', resourceR + resourceStroke / 4)
        .on('mouseover', function(e, d: GroupD) {
          onShowTooltip(e, d, this);
        })
        .on('mouseleave', function() {
          onHideTooltip(this);
        });
    },
    remove: (container: Selection<BaseType, unknown, BaseType, unknown>) => {
      const resourcesG = container.selectAll(`.${styles.resourceG}`);
      resourcesG.interrupt().transition();
      resourcesG
        .classed('removing', true)
        .transition()
          .duration(400)
          .attr('transform', 'scale(0)');
      container.interrupt().transition();
      container
        .classed('removing', true)
        .transition()
          .delay(400)
          .remove();
    }
  };

  sections = {
    create: (container: Selection<EnterElement, string, BaseType, unknown>) => {
      const {
        coord,
        size: {
          guideStroke,
          sectionInterval,
        }
      } = this;

      container.append('line')
        .classed(styles.grid, true)
        .attr('stroke-width', guideStroke)
        .attr('stroke-dasharray', `${sectionInterval} ${sectionInterval}`)
        .attr('x1', category => coord({ category, score: MAX_SCORE }, {offset: -RESOURCE_R}).x)
        .attr('y1', category => coord({ category, score: MAX_SCORE }, {offset: -RESOURCE_R}).y)
        .attr('x2', category => coord({ category, score: MIN_SCORE }, {offset: RESOURCE_R}).x)
        .attr('y2', category => coord({ category, score: MIN_SCORE }, {offset: RESOURCE_R}).y);
    },
    update: (container: Selection<BaseType, string, BaseType, unknown>) => {
      const {
        coord,
        size: {
          sectionInterval,
          guideStroke
        }
      } = this;

      container
        .attr('stroke-dasharray', `${sectionInterval} ${sectionInterval}`)
        .attr('stroke-width', guideStroke)
        .attr('x1', category => coord({ category, score: MAX_SCORE }, {offset: -RESOURCE_R}).x)
        .attr('y1', category => coord({ category, score: MAX_SCORE }, {offset: -RESOURCE_R}).y)
        .attr('x2', category => coord({ category, score: MIN_SCORE }, {offset: RESOURCE_R}).x)
        .attr('y2', category => coord({ category, score: MIN_SCORE }, {offset: RESOURCE_R}).y);
    },
    remove: (container: Selection<BaseType, unknown, BaseType, unknown>) => {
      container.interrupt().transition();
      container
        .transition()
          .duration(400)
          .attr('stroke-opacity', 0)
          .remove();
    }
  };

  sectionGuides = {
    create: () => {
      const {
        mainG,
        sectionDomain,
        sectionOrientation,
        coord
      } = this;

      const sectionAndNames = mainG.append('g').classed(styles.sectionAndNamesG, true);
      sectionAndNames.selectAll(`.${styles.sectionAndNamesGuide}`)
        .data(sectionDomain)
        .enter()
        .append('g')
          .classed(styles.sectionAndNamesGuide, true)
          .attr('transform', function(d) {
            const { x, y, angle } = coord(
              { category: d, score: 0 },
              { bisector: true }
            );
            sectionOrientation.set(this, angle > 90 && angle < 270 ? 'left' : 'right');
            return `translate(${x}, ${y})`;
          });
    },
    destroy: () => {
      this.mainG.select(`.${styles.sectionAndNamesG}`).remove();
    }
  };

  resetTooltip = () => {
    const {
      mainG,
      size: {
        resourceR,
        resourceStroke
      },
      props: {
        hideTooltip,
        tooltipOpen
      }
    } = this;

    // Resets tooltip
    if (tooltipOpen) hideTooltip();

    mainG.selectAll(`.${styles.tooltipRect}`)
      .attr('width', 2 * resourceR + resourceStroke / 2)
      .attr('fill-opacity', 0)
    // TODO: does the next line make performance wrost?
    //   .interrupt().transition();
  }

  updateSizes = () => {
    const zoomScale = 1 / this.props.k;

    this.size = {
      ...this.size,
      sectionInterval: SECTION_INTERVAL * zoomScale,
      resourceR: RESOURCE_R * zoomScale,
      resourceStroke: RESOURCE_STROKE * zoomScale,
      guideStroke: GUIDE_STROKE * zoomScale,
      bubbleCollision: (RESOURCE_R + 2) * zoomScale,
      tooltipWidth: TOOLTIP_WIDTH * zoomScale,
      axisPadding: AXIS_PADDING * zoomScale,
      axisFontSize: AXIS_FONT_SIZE * zoomScale
    };
  }

  coord = (
    { category, score, name }: CoordData,
    { jittered = false, offset = 0, bisector = false }: CoordOptions
  ) => {
    const { rScale, sectionScale } = this;

    const distance = rScale(score) + (offset || 0);
    let angle = sectionScale(category) || 0;

    if (jittered && !bisector) {
      const randomNumber = Math.abs(getHash(name || '') % 1000 / 1000);
      angle += sectionScale.bandwidth() * randomNumber
    }

    if (bisector) {
      angle += sectionScale.bandwidth() / 2;
    }

    const x = Math.cos(angle * Math.PI / 180) * distance;
    const y = Math.sin(angle * Math.PI / 180) * distance;

    return { x, y, angle };
  }

  elementsCollide = (a: Coord, b: Coord) => (
    (
      (b.x+this.size.bubbleCollision > a.x-this.size.bubbleCollision) &&
      (b.x-this.size.bubbleCollision < a.x+this.size.bubbleCollision)
    ) &&
    (
      (b.y+this.size.bubbleCollision > a.y-this.size.bubbleCollision) &&
      (b.y-this.size.bubbleCollision < a.y+this.size.bubbleCollision)
    )
  );

  onShowTooltip = (e: MouseEvent, d: GroupD, element: BaseType) => {
    const {
      handleTooltip,
      size: {
        tooltipWidth
      }
    } = this;

    handleTooltip(e, d.elements[0]);
        
    select(element)
      .attr('fill-opacity', 1)
      .transition()
        .duration(400)
        .attr('width', tooltipWidth);
  }

  onHideTooltip = (element: BaseType) => {
    const {
      size: {
        resourceR,
        resourceStroke
      },
      props: {
        hideTooltip
      }
    } = this;

    const rect = select(element);

    hideTooltip();

    rect
      .transition()
        .duration(400)
        .attr('width', 2 * resourceR + resourceStroke / 2)
        .transition()
          .duration(0)
          .attr('fill-opacity', 0);
  }

  handleTooltip = (event: MouseEvent, d: D) => {
    const {
      props: {
        showTooltip,
        parent
      }
    } = this;
    const wrapperNode = select(parent).node();

    if (wrapperNode) {
      const { x: dx, y: dy } = wrapperNode.getBoundingClientRect();
      const { x: circleLeft, y: circleTop } = (event.target as HTMLElement).getBoundingClientRect();
      
      showTooltip({
        tooltipData: d,
        tooltipLeft: circleLeft - dx,
        tooltipTop: circleTop - dy,
      });
    }
  };

  positionSectionBoxes = () => {
    const {
      wrapper,
      sectionOrientation
    } = this;

    wrapper.selectAll<SVGGElement, string>(`.${styles.sectionAndNamesGuide}`)
      .each(function(sectionName) {
        // FIXME: make sure the next this is properly typed
        // @ts-ignore
        const { left, top } = this.getBoundingClientRect();
        const orientation = sectionOrientation.get(this);
        
        select(`#kg_${stringToId(sectionName)}`)
          .style('left', orientation === 'right' ? px(left) : 'auto')
          .style('right', orientation === 'left' ? px(window.innerWidth - left) : 'auto')
          .style('top', px(top - SECTION_BOX_HEIGHT / 2));
      });
  }
}

export default KGViz;
