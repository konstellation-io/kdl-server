import styles from './BG.module.scss';
import { Selection } from 'd3-selection';
import { INNER_R } from '../KGViz';

const CENTER_TEXT = 'My Project';

class BG {
  initialize(
    wrapper: Selection<SVGGElement, unknown, null, undefined>,
    outerR: number
  ) {
    // InnerCircle
    const innerCircle = wrapper.append('g');
    innerCircle
      .append('circle')
      .classed(styles.innerCircle, true)
      .attr('r', INNER_R);

    innerCircle
      .append('foreignObject')
      .attr('x', -INNER_R)
      .attr('y', -INNER_R)
      .attr('width', 2 * INNER_R)
      .attr('height', 2 * INNER_R)
      .append('xhtml:div')
      .classed(styles.innerCircleText, true)
      .html(CENTER_TEXT);

    // OuterCircle
    wrapper
      .append('circle')
      .classed(styles.outerCircle, true)
      .attr('r', outerR);
  }
}

export default BG;
