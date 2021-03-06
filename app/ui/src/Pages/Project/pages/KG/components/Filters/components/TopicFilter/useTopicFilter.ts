import { useEffect, useMemo, useState } from 'react';

import { Topic } from '../../Filters';

function useTopicFilter(
  topics: Topic[],
  onUpdate: (selectedTopics: string[]) => void
) {
  const initialSelectedTopics = useMemo(getInitialSelectedTopics, [topics]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>(topics);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    initialSelectedTopics
  );

  useEffect(() => {
    setFilteredTopics(topics);
    setSelectedTopics(initialSelectedTopics);
    onUpdate(initialSelectedTopics);
  }, [topics, initialSelectedTopics, onUpdate]);

  function getInitialSelectedTopics() {
    return topics.map(({ name }) => name);
  }

  function handleSelectTopic({ name: topicName }: Topic) {
    const alreadySelected = selectedTopics.includes(topicName);
    let newSelectedTopics = [...selectedTopics, topicName];
    if (alreadySelected)
      newSelectedTopics = selectedTopics.filter((name) => name !== topicName);

    setSelectedTopics(newSelectedTopics);
    onUpdate(newSelectedTopics);
  }

  function filterTopics(text: string) {
    const newTopics = topics.filter(({ name }) =>
      name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredTopics(newTopics);
  }

  function resetTopics() {
    setSelectedTopics(initialSelectedTopics);
    onUpdate(initialSelectedTopics);
    filterTopics('');
  }

  function clearAll() {
    setSelectedTopics([]);
    onUpdate([]);
    filterTopics('');
  }

  return {
    filteredTopics,
    handleSelectTopic,
    filterTopics,
    resetTopics,
    clearAll,
    selectedTopics,
  };
}

export default useTopicFilter;
