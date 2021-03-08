import { BaseType, EnterElement, Selection, select } from 'd3-selection';

import { DComplete } from '../../../KGUtils';
import styles from './Resources.module.scss';

export const RESOURCE_R = 4;
const RESOURCE_STROKE = 1;
const FONT_SIZE = 20;

export default class Resources {
  container: Selection<SVGGElement, unknown, null, undefined>;
  data: DComplete[] = [];
  resourceR: number = RESOURCE_R;
  resourceStroke: number = RESOURCE_STROKE;
  fontSize: number = FONT_SIZE;
  onShowTooltip: (e: MouseEvent, d: DComplete, element: BaseType) => void;
  onHideTooltip: (element: BaseType) => void;
  onResourceSelection: (name: string) => void;

  constructor(
    onShowTooltip: (e: MouseEvent, d: DComplete, element: BaseType) => void,
    onHideTooltip: (element: BaseType) => void,
    container: Selection<SVGGElement, unknown, null, undefined>,
    onResourceSelection: (name: string) => void
  ) {
    this.onShowTooltip = onShowTooltip;
    this.onHideTooltip = onHideTooltip;
    this.onResourceSelection = onResourceSelection;
    this.container = container.select('g');
  }

  init = (
    container: Selection<SVGGElement, unknown, null, undefined>,
    data: DComplete[]
  ) => {
    this.data = data;
    this.container = container;

    const { bindData, create } = this;

    container.append('g').classed(styles.resourcesWrapper, true);

    const resourcesSelection = bindData(data);

    create(resourcesSelection.enter());
  };

  performUpdate = (data: DComplete[]) => {
    const { bindData, create, update, remove } = this;

    const resourcesSelection = bindData(data);

    create(resourcesSelection.enter());
    update(resourcesSelection);
    remove(resourcesSelection.exit());
  };

  bindData = (data: DComplete[]) => {
    const { container } = this;

    return container
      .select(`.${styles.resourcesWrapper}`)
      .selectAll(`.${styles.resource}`)
      .data(data);
  };

  create = (
    selection: Selection<EnterElement, DComplete, BaseType, unknown>
  ) => {
    const { onShowTooltip, container } = this;
    selection
      .append('circle')
      .classed(styles.resource, true)
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('r', (d) => (d.outsideMax ? RESOURCE_R * 0.6 : RESOURCE_R))
      .on('mouseenter', function (e, d) {
        onShowTooltip(e, d, this);
        container
          .selectAll(`.${styles.resource}`)
          .classed(styles.highlight, false);
        select(this).classed(styles.highlight, true);
      });
  };

  unhighlightAll = () => {
    const { container } = this;

    container.selectAll(`.${styles.resource}`).classed(styles.highlight, false);
  };

  update = (selection: Selection<BaseType, DComplete, BaseType, unknown>) => {
    selection
      .transition()
      .duration(400)
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('r', (d) => (d.outsideMax ? RESOURCE_R * 0.6 : RESOURCE_R));
  };

  remove = (selection: Selection<BaseType, unknown, BaseType, unknown>) => {
    selection.remove();
  };

  highlightResource = (resourceName: string | null) => {
    const { container } = this;

    const allResources = container.selectAll<BaseType, DComplete>(
      `.${styles.resource}`
    );
    allResources
      .classed(styles.highlight, false)
      .classed(styles.unhighlight, true);

    allResources
      .filter((d) => d.name === resourceName)
      .classed(styles.highlight, true)
      .classed(styles.unhighlight, false);
  };
}
