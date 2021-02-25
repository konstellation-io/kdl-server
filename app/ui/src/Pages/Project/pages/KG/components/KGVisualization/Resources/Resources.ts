import { BaseType, EnterElement, Selection, select } from 'd3-selection';
import { RGBColor, color } from 'd3-color';
import { SymbolType, symbol } from 'd3-shape';

import { D } from '../KGVisualization';
import { GroupD } from '../../../KGUtils';
import { KnowledgeGraphItemCat } from 'Graphql/types/globalTypes';
import SYMBOL from './symbols';
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

const px = (value: number | string) => `${value}px`;

export default class Resources {
  container: Selection<SVGGElement, unknown, null, undefined>;
  data: GroupD[] = [];
  resourceR: number = 0;
  resourceStroke: number = 0;
  fontSize: number = 0;
  onShowTooltip: (e: MouseEvent, d: GroupD, element: BaseType) => void;
  onHideTooltip: (element: BaseType) => void;
  onResourceSelection: (name: string) => void;
  symbols = new Map<KnowledgeGraphItemCat, string | null>([
    [KnowledgeGraphItemCat.Code, null],
    [KnowledgeGraphItemCat.Paper, null],
  ]);

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

    this.symbols.set(
      KnowledgeGraphItemCat.Code,
      this.generateSymbol(SYMBOL.CODE)
    );
    this.symbols.set(
      KnowledgeGraphItemCat.Paper,
      this.generateSymbol(SYMBOL.DOC)
    );
  };

  generateSymbol = (symbolType: SymbolType) =>
    symbol().type(symbolType).size(this.resourceR)();

  init = (
    container: Selection<SVGGElement, unknown, null, undefined>,
    data: GroupD[]
  ) => {
    this.data = data;
    this.container = container;

    const { bindData, create } = this;

    container.append('g').classed(styles.resourcesWrapper, true);

    const resourcesSelection = bindData(data);

    create(resourcesSelection.enter());
  };

  performUpdate = (data: GroupD[]) => {
    const { container, bindData, create, update, remove } = this;

    // When zooming interrupts previous zoom animation, interrupt node removal and rescale elements.
    container.selectAll('.removing').interrupt().transition();
    container
      .selectAll(`.${styles.resourceG}`)
      .transition()
      .delay(100)
      .attr('transform', 'scale(1)');

    const resourcesSelection = bindData(data);

    create(resourcesSelection.enter());
    update(resourcesSelection);
    remove(resourcesSelection.exit());
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
      symbols,
      onHideTooltip,
      onResourceSelection,
    } = this;

    const resourceWrappers = selection
      .append('g')
      .classed(styles.resourceWrapper, true)
      .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
      .on('mouseenter', function () {
        // Move to front
        select(this).each(function () {
          this.parentNode && this.parentNode.appendChild(this);
        });
      });
    const resourcesG = resourceWrappers
      .append('g')
      .classed(styles.resourceG, true)
      .attr('transform', 'scale(0)');
    resourcesG.transition().duration(400).attr('transform', 'scale(1)');

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
      .append('path')
      .classed(styles.resourceImage, true)
      .attr('transform', `translate(${-resourceR / 2},${-resourceR / 2})`)
      .attr('display', (d: GroupD) =>
        d.elements.length === 1 ? 'default' : 'none'
      )
      .attr('d', (d: GroupD) => symbols.get(d.elements[0].type) || '');

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
      symbols,
    } = this;

    selection.attr('transform', (d) => `translate(${d.x}, ${d.y})`);

    selection
      .select(`.${styles.resource}`)
      .attr('r', resourceR)
      .attr('stroke-width', resourceStroke);

    selection
      .select(`.${styles.resourceImage}`)
      .attr('transform', `translate(${-resourceR / 2},${-resourceR / 2})`)
      .attr('d', (d: GroupD) => symbols.get(d.elements[0].type) || '');

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
    const resourcesG = selection.selectAll(`.${styles.resourceG}`);
    resourcesG.interrupt().transition();
    resourcesG
      .classed('removing', true)
      .transition()
      .duration(400)
      .attr('transform', 'scale(0)');
    selection.interrupt().transition();
    selection.classed('removing', true).transition().delay(400).remove();
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
