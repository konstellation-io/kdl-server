# Knowledge Galaxy Visualization

![Knowledge Galaxy visualization](../img/kg_viz.png "Knowledge Galaxy visualization")

The visualization has been created using [D3.js](https://d3js.org/) integrated with React.

As there are more than a thousand elements to show and there elements are animated of change frequently,
mixed mode rendering has been used (canvas for the resources and svg for the remaining elements).

## Mixed mode rendering layers

![Knowledge Galaxy mixed mode rendering layers](../img/kg_layers.jpg "Knowledge Galaxy layers")

There are three different layers:

### **Background layer** [svg]

It displays different elements:
- background circles (inner circle and outer circle)
- name of the project (but we are currently using a fixed text "My Project")
- Section separators (lines that splits the outer circle into sections, one for each topic)
- Section labels (boxes around the outer circle indicating the name of the section)

### **Resources layer** [canvas]

Has two main objectives:
- render the resource circles
- capture events (hover, drag, scroll...)

### **Axis layer** [svg]

Displays the radial axis. It is composed by the circles and the labels.

## Visualization lifecycle

When working with static visualizations, we do not have to care about updating it, you can just create and
destroy the visualization. When the visualization is dynamic, it has to be updated and not all the elements
behave the same, as some of them might be destroyed, other could be updated and others can remain the same.

As this visualization is dynamic, we need to introduce an optional step (update) that can handle changes in
the visualization.

> Note: dynamic visualizations can be done by just creating and destroying the visualization with each render,
> but that approach is less performant and animations trends to be rough and laggy.

### Initialization

In this phase the classes are instanciated, then static elements are created and the dynamic ones
are created.

In this phase there is always a clean function that makes sure everything is created from zero.

### Update

In this phase, the dynamic elements change. Some of them can be removed (ex. when hiding a section), 
others can be created (ex. when showing a new section) and others are updated (ex. when dragging).

### Removal

The clean function is called, or the React element containing the visualization is unmounted.

### Examples

An example of a static visualization can be seen at `BG.ts`. In this case there are no elements that
need an update to it just contains an initialization function.

An example of a dynamic visualization can be seen at `Sections.ts`. In this visualization there is an
initialization function (`initialize`) that creates the static wrappers and makes the initial draw (that is,
creates the dynamic elements for the first time) and there is an update function that redraws the sections.

> Note that we do not have separate functions for creating, updating and removing the dynamic elements. We are
> using [d3.selection.join()](https://observablehq.com/@d3/selection-join) so we can to the three actions in one place.

## Components

There is a root component (`KGViz`) that handles the different pieces. Those pieces are:

- `Resources`
- `Sections`
- `radialAxis`

You can learn more about them in their respective documentation files.

### `KGViz`

Main component. Manages how the other components are called and server as an interface to interact with the
visualization.

By itself, it does not draw any element, but it controls the main logic elements. These are some the main
responsibilities:
- format the data and keep updated.
- keep domains and scales updated (score, section...).
- manage lifecycle of children elements (resources, sections, radialAxis...).

More information about this component [here](./KGViz.md).

### `Resources`

This component works with the canvas elements. It has two main missions:
- **Capture events:** hover and click events are captured here. hover events are used to highlight the closest
  resource to the mouse and clicking events to select a specific resource.
- **Render resources:** draw circles that represents resources. Note, that a resource has different representations
  depending on its starred flag, position and highlight status.

#### Quadtree algorithm

When working with small interactive elements it is easy to face usability problems:
- hitbox is too small so that it is hard to select elements.
- hitbox shape is awkward (for instance, if the shape is a circle, the hitbox should be also a circle).
- hitbox overlaps with other hitboxes making it difficult to make accurate selections.

There are to common solutions to this problem:
- **voronoi:** creates a diagram so that each pixel is linked to the closest element, making it easy to detect the area
  (and the linked element).
- **quadtree:** makes a tree representation (quadtree, one node up to 4 children) of the data, reducing search time
  complexity to O(log(N)).
  
As we are not interested on displaying the voronoi diagram, and the QT algorithm is performant and a way more
easy to implement, QT solution has been selected.

More information about the algorithm [here](https://opendsa-server.cs.vt.edu/ODSA/Books/CS3/html/PRquadtree.html).

### `Sections`

This component draws the lines that separate each section and the corresponding labels.

### `radialAxis`

This is an adaptation of the original implementation of d3 axis. This adaptation allows the use of
circles as axis lines, and the dynamic score labels (orientation and position depends on mouse location).
