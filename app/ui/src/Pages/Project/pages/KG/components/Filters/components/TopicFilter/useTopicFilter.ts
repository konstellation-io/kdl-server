import { Topic } from '../../Filters';
import { useEffect, useMemo, useState } from 'react';

function useTopicFilter(topics: Topic[]) {
  const initialSelectedTopics = useMemo(getInitialSelectedTopics, [topics]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>(topics);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    initialSelectedTopics
  );

  useEffect(() => {
    setFilteredTopics(topics);
    setSelectedTopics(initialSelectedTopics);
  }, [topics]);

  function getInitialSelectedTopics() {
    return topics.map(({ name }) => name);
  }

  function handleSelectTopic({ name: topicName }: Topic) {
    const alreadySelected = selectedTopics.includes(topicName);
    let newSelectedTopics = [...selectedTopics, topicName];
    if (alreadySelected)
      newSelectedTopics = selectedTopics.filter((name) => name !== topicName);

    setSelectedTopics(newSelectedTopics);
  }

  function filterTopics(text: string) {
    const newTopics = topics.filter(({ name }) =>
      name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredTopics(newTopics);
  }

  function resetTopics() {
    setSelectedTopics(initialSelectedTopics);
    filterTopics('');
  }

  return {
    filteredTopics,
    handleSelectTopic,
    filterTopics,
    resetTopics,
    selectedTopics,
  };
}

export default useTopicFilter;
