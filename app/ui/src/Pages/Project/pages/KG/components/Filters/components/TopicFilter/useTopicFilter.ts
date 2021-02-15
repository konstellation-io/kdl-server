import { Topic } from '../../Filters';
import { useState } from 'react';

const initialSelectedTopics: string[] = [];

function useTopicFilter(topics: Topic[]) {
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>(topics);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    initialSelectedTopics
  );

  function handleSelectTopic(topic: Topic) {
    const alreadySelected = selectedTopics.includes(topic.id);
    let newSelectedTopics = [...selectedTopics, topic.id];
    if (alreadySelected)
      newSelectedTopics = selectedTopics.filter((id) => id !== topic.id);

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
