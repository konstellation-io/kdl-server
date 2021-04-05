from collections import defaultdict

import pandas as pd

from outputs import Topic


def convert_type_topics(topic_list: list[tuple[str, float]]) -> list[Topic]:
    result_list = list()
    for topic_tuple in topic_list:
        topic = Topic(topic_tuple[0], topic_tuple[1])
        result_list.append(topic)

    return result_list


def get_relevant_topics(topics_summaries: pd.Series, cutoff: int = 100) -> list[Topic]:
    """
    Gets a list of most relevant topics for a papers recommendation
    """
    topics = defaultdict(float)
    for _, topic_list in topics_summaries.head(cutoff).iteritems():
        for topic in topic_list:
            topics[topic.name] += topic.relevance

    topics = [Topic(*topic) for topic in topics.items()]
    topics.sort(reverse=True)

    return topics
