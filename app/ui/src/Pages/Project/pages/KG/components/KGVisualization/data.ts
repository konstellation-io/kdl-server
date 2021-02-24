import { D } from './KGVisualization';
import { KnowledgeGraphItemCat } from './../../../../../../Graphql/types/globalTypes';
// import randomSentence from 'random-sentence';


const data: D[] = [
  {
    category: 'Topic A',
    name: 'FaceX-Zoo: A PyTorch Toolbox for Face Recognition',
    type: KnowledgeGraphItemCat.Code,
    score: 1,
  },
  {
    category: 'Topic A',
    name: 'RepVGG: Making VGG-style ConvNets Great Again',
    type: KnowledgeGraphItemCat.Paper,
    score: 0.9,
  },
  {
    category: 'Topic A',
    name: 'PP-OCR: A Practical Ultra Lightweight OCR System',
    type: KnowledgeGraphItemCat.Paper,
    score: 0.91,
  },
  {
    category: 'Topic A',
    name: 'ArtEmis: Affective Language for Visual Art',
    type: KnowledgeGraphItemCat.Code,
    score: 0.85,
  },
  {
    category: 'Topic A',
    name: 'Free Lunch for Few-shot Learning: Distribution Calibration',
    type: KnowledgeGraphItemCat.Code,
    score: 0.87,
  },
  {
    category: 'Topic A',
    name: 'Reformer: The Efficient Transformer',
    type: KnowledgeGraphItemCat.Paper,
    score: 0.7,
  },
  {
    category: 'Topic A',
    name: 'Image Matching across Wide Baselines: From Paper to Practice',
    type: KnowledgeGraphItemCat.Code,
    score: 0.65,
  },
  {
    category: 'Topic B',
    name: 'Wasserstein GAN',
    type: KnowledgeGraphItemCat.Code,
    score: 0.9,
  },
  {
    category: 'Topic C',
    name: 'Improved Training of Wasserstein GANs',
    type: KnowledgeGraphItemCat.Code,
    score: 0.52,
  },
  {
    category: 'Topic D',
    name: 'Scikit-learn: Machine Learning in Python',
    type: KnowledgeGraphItemCat.Code,
    score: 0.12,
  },
  {
    category: 'Topic E',
    name: 'Nearest Neighbor Median Shift Clustering for Binary Data',
    type: KnowledgeGraphItemCat.Code,
    score: 0.76,
  },
  {
    category: 'Topic F',
    name: 'Path Aggregation Network for Instance Segmentation',
    type: KnowledgeGraphItemCat.Paper,
    score: 0.86,
  },
  {
    category: 'Topic G',
    name: 'Refining activation downsampling with SoftPool',
    type: KnowledgeGraphItemCat.Paper,
    score: 0.26,
  },
  {
    category: 'Topic G',
    name: 'Scaled-YOLOv4: Scaling Cross Stage Partial Network',
    type: KnowledgeGraphItemCat.Paper,
    score: 0.54,
  },
  {
    category: 'Topic G',
    name: 'Real-Time High-Resolution Background Matting',
    type: KnowledgeGraphItemCat.Code,
    score: 0.95,
  },
  {
    category: 'Topic H',
    name: 'Scale Equivariance Improves Siamese Tracking',
    type: KnowledgeGraphItemCat.Paper,
    score: 0.73,
  },
];

// const categories = [
//   'Topic A',
//   'Topic B',
//   'Topic C',
//   'Topic D',
//   'Topic E',
//   'Topic F',
//   'Topic G',
//   'Topic H',
// ];
// const types = [
//   KnowledgeGraphItemCat.Code,
//   KnowledgeGraphItemCat.Paper
// ];

// const data = Array(100).fill(1).map(_ => ({
//   category: categories[Math.floor(Math.random() * categories.length)],
//   name: randomSentence({words: 5}),
//   type: types[Math.floor(Math.random() * types.length)],
//   score: Math.random()
// }));

export default data;
