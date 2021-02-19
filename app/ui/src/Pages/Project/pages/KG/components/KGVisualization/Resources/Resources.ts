import { BaseType, EnterElement, Selection, select } from 'd3-selection';
import { D, ResourceType } from '../KGVisualization';
import { RGBColor, color } from 'd3-color';

import { GroupD } from '../../../KGUtils';
import { scaleLinear } from '@visx/scale';
import styles from './Resources.module.scss';

export const RESOURCE_R = 14;
const RESOURCE_STROKE = 4;
const FONT_SIZE = 20;

const COLOR_SCALE_COLORS = ['#176177', '#D6FFFF'];
const colorScale = scaleLinear({
  domain: [1, 10],
  range: COLOR_SCALE_COLORS,
});

const TEXT_COLOR_THRESHOLD = 120;
const TEXT_COLOR = {
  DARK: '#00252E',
  LIGHT: '#CCF5FF',
};

const PATH = {
  CODE:
    'M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z',
  DOC:
    'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
};

const px = (value: number | string) => `${value}px`;

export default class Resources {
  container: Selection<SVGGElement, unknown, null, undefined>;
  data: GroupD[] = [];
  resourceR: number = 0;
  enableAnimations: boolean = false;
  resourceStroke: number = 0;
  fontSize: number = 0;
  onShowTooltip: (e: MouseEvent, d: GroupD, element: BaseType) => void;
  onHideTooltip: (element: BaseType) => void;
  onResourceSelection: (name: string) => void;

  constructor(
    onShowTooltip: (e: MouseEvent, d: GroupD, element: BaseType) => void,
    onHideTooltip: (element: BaseType) => void,
    container: Selection<SVGGElement, unknown, null, undefined>,
    onResourceSelection: (name: string) => void
  ) {
    this.onShowTooltip = onShowTooltip;
    this.onHideTooltip = onHideTooltip;
    this.onResourceSelection = onResourceSelection;
    this.container = container.select('g');
  }

  updateSizes = (k: number) => {
    const zoomScale = 1 / k;

    this.resourceR = RESOURCE_R * zoomScale;
    this.resourceStroke = RESOURCE_STROKE * zoomScale;
    this.fontSize = FONT_SIZE * zoomScale;
  };

  init = (
    container: Selection<SVGGElement, unknown, null, undefined>,
    data: GroupD[],
    enableAnimations: boolean
  ) => {
    this.enableAnimations = enableAnimations;
    this.data = data;
    this.container = container;

    const { bindData, create } = this;

    container.append('g').classed(styles.resourcesWrapper, true);

    const resourcesSelection = bindData(data);

    create(resourcesSelection.enter());
  };

  performUpdate = (data: GroupD[], enableAnimations: boolean) => {
    this.enableAnimations = enableAnimations;
    const { container, bindData, create, update, remove } = this;
    
    if (!enableAnimations) {      
      container
      .select(`.${styles.resourcesWrapper}`).remove();
      this.init(container, data, enableAnimations);
    } else {
      // When zooming interrupts previous zoom animation, interrupt node removal and rescale elements.
      container.selectAll('.removing').interrupt().transition();

      const resources = container
        .selectAll(`.${styles.resourceG}`);
      
      resources.transition()
        .delay(100)
        .attr('transform', 'scale(1)');
  
      const resourcesSelection = bindData(data);
  
      create(resourcesSelection.enter());
      update(resourcesSelection);
      remove(resourcesSelection.exit());
    }
  };

  bindData = (data: GroupD[]) => {
    const { container } = this;

    return container
      .select(`.${styles.resourcesWrapper}`)
      .selectAll(`.${styles.resourceWrapper}`)
      .data(data, (d) => `${(d as GroupD).x}${(d as GroupD).y}`);
  };

  create = (selection: Selection<EnterElement, GroupD, BaseType, unknown>) => {
    const {
      resourceR,
      resourceStroke,
      fontSize,
      onShowTooltip,
      onHideTooltip,
      onResourceSelection,
      enableAnimations
    } = this;

    const resourceWrappers = selection
      .append('g')
      .classed(styles.resourceWrapper, true)
      .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
      .on('mouseenter', function () {
        select(this).raise();
      });
    const resourcesG = resourceWrappers
      .append('g')
      .classed(styles.resourceG, true)
      .attr('transform', 'scale(0)');
    
    if (enableAnimations) {
      resourcesG.transition().duration(400).attr('transform', 'scale(1)');
    } else {
      resourcesG.attr('transform', 'scale(1)');
    }

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
      .on('click', (_, d) => onResourceSelection(d.elements[0].name))
      .on('mouseover', function (e, d: GroupD) {
        onShowTooltip(e, d, this);
      })
      .on('mouseleave', function () {
        onHideTooltip(this);
      });

    resourcesG
      .append('circle')
      .classed(styles.resource, true)
      .classed(styles.resourceGroup, (d: GroupD) => d.elements.length > 1)
      .classed(styles.resourceNode, (d: GroupD) => d.elements.length === 1)
      .attr('fill', (d: GroupD) => colorScale(d.elements.length))
      .attr('r', resourceR)
      .attr('stroke-width', resourceStroke);

    resourcesG
      .append('svg')
      .classed(styles.resourceImage, true)
      .attr('x', -resourceR / 2)
      .attr('y', -resourceR / 2)
      .attr('display', (d: GroupD) =>
        d.elements.length === 1 ? 'default' : 'none'
      )
      .attr('width', resourceR)
      .attr('height', resourceR)
      .attr('viewBox', `0 0 24 24`)
      .append('path')
      .attr('d', (d: GroupD) =>
        d.elements[0].type === ResourceType.CODE ? PATH.CODE : PATH.DOC
      );

    resourcesG
      .append('text')
      .classed(styles.resourceLabel, true)
      .attr('vertical-anchor', 'middle')
      .attr('text-anchor', 'middle')
      .style('font-size', px(fontSize))
      .attr('fill', (d: GroupD) => {
        const c: RGBColor = color(
          colorScale(d.elements.length).toString()
        ) as RGBColor;
        return c.r * 0.299 + c.g * 0.587 + c.b * 0.114 > TEXT_COLOR_THRESHOLD
          ? TEXT_COLOR.DARK
          : TEXT_COLOR.LIGHT;
      })
      .text((d: GroupD) => d.elements.length)
      .attr('display', (d: GroupD) =>
        d.elements.length > 1 ? 'default' : 'none'
      );
  };

  update = (selection: Selection<BaseType, GroupD, BaseType, unknown>) => {
    const {
      onShowTooltip,
      onHideTooltip,
      resourceR,
      resourceStroke,
      fontSize,
    } = this;

    selection.attr('transform', (d) => `translate(${d.x}, ${d.y})`);

    selection
      .select(`.${styles.resource}`)
      .attr('r', resourceR)
      .attr('stroke-width', resourceStroke);

    selection
      .select(`.${styles.resourceImage}`)
      .attr('x', -resourceR / 2)
      .attr('y', -resourceR / 2)
      .attr('width', resourceR)
      .attr('height', resourceR);

    selection
      .select(`.${styles.resourceLabel}`)
      .style('font-size', px(fontSize));

    selection
      .select(`.${styles.tooltipRect}`)
      .attr('x', -resourceR - resourceStroke / 4)
      .attr('y', -resourceR - resourceStroke / 4)
      .attr('width', 2 * resourceR + resourceStroke / 2)
      .attr('height', 2 * resourceR + resourceStroke / 2)
      .attr('rx', resourceR + resourceStroke / 4)
      .on('mouseover', function (e, d: GroupD) {
        onShowTooltip(e, d, this);
      })
      .on('mouseleave', function () {
        onHideTooltip(this);
      });
  };

  remove = (selection: Selection<BaseType, unknown, BaseType, unknown>) => {
    const { enableAnimations } = this;

    const resourcesG = selection.selectAll(`.${styles.resourceG}`);
    resourcesG.interrupt().transition();
    selection.interrupt().transition();

    resourcesG.classed('removing', true);
    selection.classed('removing', true);

    if (enableAnimations) {
      resourcesG.transition().duration(400).attr('transform', 'scale(0)');
      selection.transition().duration(400).remove();
    } else {
      resourcesG.attr('transform', 'scale(0)');
      selection.remove();
    }
  };

  highlightResource = (resourceName: string | null) => {
    const { container } = this;

    const allResources = container.selectAll<BaseType, GroupD>(
      `.${styles.resource}`
    );
    allResources
      .classed(styles.highlight, false)
      .classed(styles.unhighlight, true);

    allResources
      .filter((d) => d.elements.some((el: D) => el.name === resourceName))
      .classed(styles.highlight, true)
      .classed(styles.unhighlight, false);
  };
}
