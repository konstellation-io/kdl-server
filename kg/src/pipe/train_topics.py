from pathlib import Path

from pipe.topics_model import DNNTopicPredictor

INPUT_PATH = "inputs/"
FILEPATH_MODEL_COMPONENTS = Path(INPUT_PATH, "")

N_TOPICS = 500

CONFIG_TOPIC_TRAINER = dict(

    # Input data filepath
    PATH_DATA_TRAIN=Path(INPUT_PATH, "paperswithcode_task-tags_500_train_dupl-removed.csv"),
    PATH_DATA_VAL=Path("paperswithcode_task-tags_500_val_dupl-removed.csv"),

    # Vectorizer args
    MIN_DF=25,
    MAX_DF=0.5,
    TOKEN_PATTERN=r'\b\S{3,}\b',
    NGRAM_RANGE=(1, 3),

    # DNN params
    BATCH_SIZE=32,
    LEARNING_RATE=0.0001,

    N_EPOCHS=70,
    WEIGHT_DECAY=0,

    # Topic quality filter
    THRESHOLD=0.4,
    METRIC_TO_THRESHOLD="f1-score",
)


def train_topics_model(config: dict):
    print("Training topics model")

    model = DNNTopicPredictor(config=config)
    report_df, metrics = model.train_once()
    print(metrics)

    model.identify_topics_to_exclude(report_df)

    # Alternatively, save in compressed format (less stable but manageable size)
    DNNTopicPredictor(load_for_inference=True,
                      filepath_saved_model=FILEPATH_MODEL_COMPONENTS)


if __name__ == "__main__":
    train_topics_model(config=CONFIG_TOPIC_TRAINER)
