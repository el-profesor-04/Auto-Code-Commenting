import json
import pandas as pd
from tokenizers import Tokenizer
from tokenizers.models import BPE
from tokenizers.trainers import BpeTrainer
from tokenizers.pre_tokenizers import Whitespace
from tokenizers.processors import TemplateProcessing
from transformers import PreTrainedTokenizerFast
import datasets
from datasets import load_dataset
from transformers import Seq2SeqTrainer,Seq2SeqTrainingArguments

from transformers import RobertaTokenizer, T5ForConditionalGeneration

# remove docstring from code
def clean_code_column(examples):
    list_ = []
    for e in examples['code']:
        eg = e
        triple_double = eg.split('"""')
        if len(triple_double)==3:
            eg = triple_double[0]+triple_double[-1]
        triple_single = eg.split("'''")
        if len(triple_single)==3:
            eg = triple_single[0]+triple_single[-1]
        single_double = eg.split('"')
        if len(single_double)==3:
            eg = single_double[0]+single_double[-1]
        single_single = eg.split("'")
        if len(single_single)==3:
            eg = single_single[0]+single_single[-1]
        list_.append(eg)
    examples['code']=list_
    return examples


# tokenize the inputs and labels
def process_data_to_model_inputs(batch):
  inputs = tokenizer(batch["code"], padding="max_length", truncation=True, max_length=encoder_max_length)
  outputs = tokenizer(batch["docstring"], padding="max_length", truncation=True, max_length=decoder_max_length)

  batch["input_ids"] = inputs.input_ids
  batch["attention_mask"] = inputs.attention_mask
  batch["decoder_input_ids"] = outputs.input_ids
  batch["decoder_attention_mask"] = outputs.attention_mask
  batch["labels"] = outputs.input_ids.copy()

  # because BERT automatically shifts the labels, the labels correspond exactly to `decoder_input_ids`. 
  # We have to make sure that the PAD token is ignored
  batch["labels"] = [[-100 if token == tokenizer.pad_token_id else token for token in labels] for labels in batch["labels"]]

  return batch


# metrics (rouge score) for validation
def compute_metrics(pred):
    labels_ids = pred.label_ids
    pred_ids = pred.predictions

    pred_str = tokenizer.batch_decode(pred_ids, skip_special_tokens=True)
    labels_ids[labels_ids == -100] = tokenizer.pad_token_id
    label_str = tokenizer.batch_decode(labels_ids, skip_special_tokens=True)

    rouge_output = rouge.compute(predictions=pred_str, references=label_str, rouge_types=["rouge2"])["rouge2"].mid

    return {
        "rouge2_precision": round(rouge_output.precision, 4),
        "rouge2_recall": round(rouge_output.recall, 4),
        "rouge2_fmeasure": round(rouge_output.fmeasure, 4),
    }

def main:

	# Loading from model checkpoint on huggingface

	model_checkpoint = "el-profesor/code_t5"
	tokenizer = RobertaTokenizer.from_pretrained(model_checkpoint)
	model = T5ForConditionalGeneration.from_pretrained(model_checkpoint)

	data_files = {"train": "train.csv","valid":"valid.csv", "test": "test.csv"}
	dataset = load_dataset(path = '/kaggle/working',data_files=data_files)


	dataset = dataset.map(clean_code_column, batched=True)


	encoder_max_length=512
	decoder_max_length=128

	batch_size=1000

	train_data = dataset['train'].map(
	    process_data_to_model_inputs, 
	    batched=True, 
	    batch_size=batch_size, 
	    remove_columns=["code", "docstring"]
	)
	val_data = dataset['valid'].map(
	    process_data_to_model_inputs, 
	    batched=True, 
	    batch_size=batch_size, 
	    remove_columns=["code", "docstring"]
	)

	batch_size=64
	training_args = Seq2SeqTrainingArguments(
	    predict_with_generate=True,
	    evaluation_strategy="steps",
	    per_device_train_batch_size=batch_size,
	    per_device_eval_batch_size=batch_size,
	    fp16=True, 
	    output_dir="./",
	    logging_steps=200,
	    save_steps=200,
	    eval_steps=10000,
	    warmup_steps=2000,
	    weight_decay=0.01,
	    save_total_limit=3,
	    num_train_epochs = 1,#50,
	    #resume_from_checkpoint = "/kaggle/input/code-search-net-0/kaggle/working/checkpoint-23800",
	)

	rouge = datasets.load_metric("rouge")

	trainer = Seq2SeqTrainer(
    model=model,
    args=training_args,
    compute_metrics=compute_metrics,
    train_dataset=train_data,
    eval_dataset=val_data,
	)
	trainer.train()

	model.save_pretrained("./model/", from_pt=True)

	