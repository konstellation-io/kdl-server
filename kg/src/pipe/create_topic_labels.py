import pandas as pd
from sklearn.model_selection import train_test_split

#
DUPLICATED_TOPICS = {
    'Knowledge Graph Embeddings': 'Knowledge Graph Embedding',
    'Hand-Gesture Recognition': 'Hand Gesture Recognition',
    'Action Recognition In Videos ': 'Action Recognition In Videos',
    'Machine Reading Comprehension': 'Reading Comprehension',
    'Learning Word Embeddings': 'Word Embeddings',
    'Action Classification ': 'Action Classification',
    'Lipreading': 'Lip Reading',
    'Super Resolution': 'Super-Resolution'
}

BASE_PATH_INPUT = "inputs/"
INPUT_FILEPATH = "papers-with-abstracts.json"
OUTPUT_FILEPATH = "paperswithcode_task-tags_{}_{}_dupl-removed.csv"
OUTPUT_FILEPATH_TAG_COUNTS = "paperswithcode_tag-counts_{}_dupl-removed.csv"
RANDOM_STATE = 42

N_TAGS = [500]


def load_paperswithcode_task_tags(filepath_papers, verbose=True):
    """
    Loads task tags and associated papers as a data frame, unpacking multiple tags per paper
    into one row per task tag (i.e. repeating a paper across multiple rows if it has multiple tags).

    Args:
        filepath_papers: (str or Path) filepath to "papers with abstracts" .json file from paperswithcode
        verbose: (bool)

    Returns:
        (DataFrame) containing columns "paper_url", "task_tag", "text"
    """

    df_papers = pd.read_json(filepath_papers, dtype={'arxiv_id': str})
    df_papers['text'] = [f"{title}. {abstract}" for title, abstract in
                         list(zip(df_papers['title'], df_papers['abstract']))]

    # Allocate empty df to hold results
    df_task_tags = pd.DataFrame([],
                                columns=['idx', 'paper_url', 'task_tag'],
                                index=range(0, sum(df_papers['tasks'].apply(len))))

    # Unpack multiple task tags (['Task1', 'Task2', 'Task3']) into one per row
    k = 0
    for idx, row in df_papers.iterrows():

        if idx % 25000 == 0:
            if verbose:
                print(f"Processing paper {idx} / {len(df_papers)}")

        task_tags = row['tasks']

        for task_tag in task_tags:
            df_task_tags.iloc[k, :] = pd.Series({'idx': idx, 'paper_url': row['paper_url'], 'task_tag': task_tag})
            k += 1

    # Merge with relevant paper info
    df_merge = pd.merge(left=df_task_tags, right=df_papers[['paper_url', 'text']],
                        right_on='paper_url', left_on='paper_url', how='left')

    return df_merge


def create_topic_labels(number_of_tags: list[int], input_path: str):
    """
    Creates the list of topic labels to train the topic model.
    Args:
          number_of_tags: Number of tags to select
    """
    for n_tags in number_of_tags:
        # Load the dataset
        df_task_tags = load_paperswithcode_task_tags(input_path, verbose=False)

        # Clean up duplicated topics
        df_task_tags['task_tag'] = df_task_tags['task_tag'].replace(
            DUPLICATED_TOPICS)
        df_task_tags = df_task_tags.drop_duplicates(subset=['paper_url',
                                                            'task_tag'])

        # Extract top tags
        task_counts = df_task_tags['task_tag'].value_counts()
        min_papers = task_counts.iloc[n_tags]

        # Keep papers with those tags
        mask_common_tag = df_task_tags['task_tag'].map(task_counts) > min_papers
        df_subset = df_task_tags[mask_common_tag]

        # Convert the tag column to n one-hot feature columns
        one_hots = pd.get_dummies(df_subset['task_tag'], prefix="tag")
        merge = pd.merge(left=df_subset, right=one_hots, right_index=True, left_index=True)
        tag_cols = [c for c in merge.columns if 'tag_' in c]
        df_ready = pd.merge(left=df_subset[['text', 'idx']].drop_duplicates(keep='first'),
                            right=merge.groupby('idx')[tag_cols].sum(),
                            left_on='idx',
                            right_on='idx')

        # Split into train/val/test before saving (70/15/15)
        # Minor dataset leakage (proportion of tags).
        # For a more rigorous approach, we can extract top tags from the train set only instead.
        texts = df_ready['text']
        Y = df_ready[tag_cols]

        # ... train-val / test
        texts_trainval, texts_test, Y_trainval, Y_test = train_test_split(texts, Y, test_size=0.15,
                                                                          random_state=RANDOM_STATE)
        # ... train / val
        texts_train, texts_val, Y_train, Y_val = train_test_split(texts_trainval, Y_trainval,
                                                                  test_size=0.176,
                                                                  random_state=RANDOM_STATE)

        df_train = pd.merge(left=texts_train, right=Y_train, left_index=True, right_index=True)
        df_val = pd.merge(left=texts_val, right=Y_val, left_index=True, right_index=True)
        df_test = pd.merge(left=texts_test, right=Y_test, left_index=True, right_index=True)

        output_filepath_train = OUTPUT_FILEPATH.format(n_tags, "train")
        output_filepath_val = OUTPUT_FILEPATH.format(n_tags, "val")
        output_filepath_test = OUTPUT_FILEPATH.format(n_tags, "test")

        df_train.to_csv(output_filepath_train)
        df_val.to_csv(output_filepath_val)
        df_test.to_csv(output_filepath_test)

        task_counts.to_csv(OUTPUT_FILEPATH_TAG_COUNTS.format(n_tags))


if __name__ == "__main__":
    print("Creating topic labels")
    create_topic_labels(N_TAGS, INPUT_FILEPATH)
