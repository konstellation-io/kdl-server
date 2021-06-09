const casual = require('casual');
const data = require('./data0.json');
const starredItems = [0, 1, 4, 6, 12, 34, 35, 65, 120, 144, 365, 456, 754, 942];

const kgData = data.map((d, idx) => ({
  id: d.id,
  category: casual.random_element(['Code', 'Paper']),
  topics: Object.entries(JSON.parse(d.topics.replace(/[']+/g, '"'))).map(
    ([name, relevance]) => ({
      name,
      relevance,
    })
  ),
  title: d.title,
  abstract: d.abstract,
  authors: ['Xingyi Zhou', 'Vladlen Koltun', 'Philipp Krähenbühl'],
  frameworks: ['Pytorch', 'TensorFlow'],
  repoUrls: [casual.url, casual.url, casual.url],
  score: d.score,
  date: new Date().toISOString(),
  starred: starredItems.includes(idx),
  url: 'https://paperswithcode.com/paper/probabilistic-two-stage-detection',
}));

const kgDataLowScores = kgData.map((d) => ({
  ...d,
  score: d.score / (Math.random() * 4 + 9),
}));

module.exports = { kgData, kgDataLowScores };
