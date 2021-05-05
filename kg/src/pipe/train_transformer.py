import pathlib

import sklearn
import torch
from sklearn.model_selection import train_test_split
from torch.utils.data import DataLoader, Dataset
from transformers import AutoModelForMaskedLM, AutoTokenizer, PreTrainedTokenizer
from transformers import DataCollatorForLanguageModeling
from transformers import DistilBertModel
from transformers import Trainer, TrainingArguments

import utils

ASSET_PATH = "assets/"
MODEL_PATH = ASSET_PATH + "model/"
DATASET_PATH = ASSET_PATH + "dataset.pkl.gz"

# Transformer info
MODEL_NAME = "distilbert-base-uncased"
MASKING_PROBABILITY = 0.15

# Training args:
EPOCHS = 10
BATCH_SIZE = 4
LEARNING_RATE = 1e-4

# Other constants:
RANDOM_SEED = 42


class KGDataset(Dataset):

    def __init__(self, encodings: dict[str, list]):
        self.encodings = encodings

    def __getitem__(self, idx: int) -> torch.Tensor:
        item = {
            'input_ids': self.encodings['input_ids'][idx].detach().clone(),
            'attention_mask': self.encodings['attention_mask'][idx].detach().clone()
        }
        item['labels'] = item['input_ids'].detach().clone()

        return item

    def __len__(self):
        return len(self.encodings['input_ids'])


def tokenize(inputs: str, pretrained_tokenizer: PreTrainedTokenizer, kwargs: dict):
    """
    Utility function to tokenize inputs
    """
    return pretrained_tokenizer(list(inputs), **kwargs)


def train_trainer(trainer: Trainer) -> float:
    train_output = trainer.train()
    loss = train_output.training_loss

    return loss


def evaluate_trainer(trainer: Trainer, eval_dataset: KGDataset) -> float:
    evaluation = trainer.evaluate(eval_dataset=eval_dataset)
    loss = evaluation['eval_loss']

    return loss


def get_accuracy_on_batch(batch_outputs, batch_labels: torch.Tensor) -> (float, tuple):
    """
    Given masked language language predictions for a batch of sequences containing masked tokens,
    computes the accuracy of the predicted tokens (batch_outputs),
    provided the labels of true masked token values (batch_labels).

    Args:
        batch_outputs: (MaskedLMOutput) containing:
            .logits attribute (torch Tensor) of shape (batch_size, max_token_number, vocabulary_size)
        batch_labels: (torch Tensor) of shape (batch_size, max_token_number)

    Returns:
        tuple:
            batch_accuracy: (float)
            (y_trues, y_preds): (tuple of list)
    """
    assert batch_labels.shape[0] == batch_outputs.logits.shape[
        0], "Batch size must match between batch_outputs and batch_labels"
    assert batch_labels.shape[1] == batch_outputs.logits.shape[
        1], "Token number must match between batch_outputs and batch_labels"

    MASK_TOKEN = -100

    # get masked_indices for batch
    seq_ids, token_ids = torch.where(batch_labels != MASK_TOKEN)
    mask_idx = list(zip(seq_ids.cpu().numpy(), token_ids.cpu().numpy()))

    y_trues = []
    y_preds = []

    for mask_id in mask_idx:
        y_true = batch_labels[mask_id].item()

        # Define the predicted masked token as the token with highest logit value of all 30500 in vocabulary
        y_pred = torch.argmax(batch_outputs.logits[mask_id]).item()

        y_trues.append(y_true)
        y_preds.append(y_pred)

    del y_true, y_pred, mask_idx, seq_ids, token_ids  # Free up memory

    batch_accuracy = sklearn.metrics.accuracy_score(y_true=y_trues, y_pred=y_preds)

    assert MASK_TOKEN not in y_trues

    return batch_accuracy, (y_trues, y_preds)


def run_accuracy_loop(model: DistilBertModel, dataset_loader: DataLoader,
                      collator: DataCollatorForLanguageModeling):
    """Runs a loop across entire dataset, masking tokens using data collator,
    and computing prediction accuracy for all masked tokens.

    Args:
        model: (DistilBertForMaskedLM)
        dataset_loader: (torch.utils.data.DataLoader)
        data_collator: (DataCollatorForLanguageModeling)

    Returns:
        (tuple):
            accuracy: (float) total accuracy of masked token prediction on provided dataset
            y_true: (list), y_pred: (list) true and predicted IDs of masked tokens
    """
    torch.cuda.empty_cache()  # To avoid CUDA crashing. Revise whether necessary
    device = torch.device('cuda') if torch.cuda.is_available() else torch.device('cpu')

    model.eval()

    y_true = []
    y_pred = []

    for i, batch in enumerate(dataset_loader):
        if i % 1000 == 0:
            print(f"Processing dataset batch {i}/{len(dataset_loader)}")

        # With explicit device specification: (works in jupyter)
        masked_input_ids, labels = collator.mask_tokens(batch['input_ids'])
        masked_on_device = masked_input_ids.to(device)
        labels_on_device = labels.to(device)
        attention_mask = batch['attention_mask'].to(device)
        outputs = model(masked_on_device, attention_mask=attention_mask, labels=labels_on_device)

        _, (y_true_i, y_preds_i) = get_accuracy_on_batch(batch_outputs=outputs, batch_labels=labels_on_device)

        y_true.append(y_true_i)
        y_pred.append(y_preds_i)

    del outputs, attention_mask, masked_on_device, labels_on_device, y_true_i, y_preds_i

    y_true = [elem for y in y_true for elem in y]
    y_pred = [elem for y in y_pred for elem in y]
    accuracy = sklearn.metrics.accuracy_score(y_true=y_true, y_pred=y_pred)

    return accuracy, (y_true, y_pred)


if __name__ == "__main__":
    # Check or create model path
    pathlib.Path(MODEL_PATH).mkdir(parents=True, exist_ok=True)

    # Reading dataset data
    texts = utils.get_inputs(DATASET_PATH)

    # Split 60-20-20 into Train-Val-Test sets
    trainval_texts, test_texts = train_test_split(texts, test_size=.2,
                                                  random_state=RANDOM_SEED)
    train_texts, val_texts = train_test_split(trainval_texts, test_size=.25,
                                              random_state=RANDOM_SEED)

    print(f"Train data: {len(train_texts)} abstracts")
    print(f"Val data: {len(val_texts)} abstracts")
    print(f"Test data: {len(test_texts)} abstracts")

    # Tokenize texts with DistilBERT tokenizer
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    tokenizer_args = dict(truncation=True, padding=True, return_tensors='pt',
                          max_length=tokenizer.model_max_length)

    # GPU benchmarking
    train_encodings = tokenize(train_texts, tokenizer, tokenizer_args)
    val_encodings = tokenize(val_texts, tokenizer, tokenizer_args)

    # Convert data to torch Dataset classes
    train_dataset = KGDataset(train_encodings)
    val_dataset = KGDataset(val_encodings)
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE,
                              shuffle=True)  # For accuracy loop only, not used by Trainer
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE,
                            shuffle=True)  # For accuracy loop only, not used by Trainer

    # Load DistilBERT model
    model = AutoModelForMaskedLM.from_pretrained(MODEL_NAME)
    data_collator = DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm_probability=MASKING_PROBABILITY)

    # Define training arguments
    training_args = TrainingArguments(
        output_dir='./results',  # output directory
        num_train_epochs=EPOCHS,  # total number of training epochs
        per_device_train_batch_size=BATCH_SIZE,
        per_device_eval_batch_size=BATCH_SIZE,
        warmup_steps=500,  # number of warmup steps for learning rate scheduler
        weight_decay=0.01,  # strength of weight decay
        logging_dir='./logs',  # directory for storing logs
        logging_steps=100,
        save_steps=10000000,
        learning_rate=LEARNING_RATE,
        evaluation_strategy='steps'
    )

    trainer = Trainer(
        model=model,  # the instantiated 🤗 Transformers model to be trained
        args=training_args,  # training arguments, defined above
        train_dataset=train_dataset,  # training dataset
        eval_dataset=val_dataset,  # evaluation dataset
        data_collator=data_collator,
    )

    # Compute accuracy (train/val) before training
    val_acc_before, (_, _) = run_accuracy_loop(model, val_loader, data_collator)
    print(f"Val accuracy before training: {val_acc_before:.3f}")
    train_acc_before, (_, _) = run_accuracy_loop(model, train_loader, data_collator)
    print(f"Train accuracy before training: {train_acc_before:.3f}")

    # Run training
    train_loss = train_trainer(trainer=trainer)
    val_loss = evaluate_trainer(trainer=trainer, eval_dataset=val_dataset)

    # Compute accuracy (train/val) after training
    val_acc_after, (_, _) = run_accuracy_loop(model, val_loader, data_collator)
    train_acc_after, (_, _) = run_accuracy_loop(model, train_loader, data_collator)

    # Save and log the model
    model.save_pretrained(MODEL_PATH)
    tokenizer.save_pretrained(MODEL_PATH)
