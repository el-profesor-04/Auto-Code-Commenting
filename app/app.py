from flask import Flask, render_template
from flask import jsonify,request
from flask_cors import CORS, cross_origin


import numpy as np
from transformers import PreTrainedTokenizerFast
from transformers import RobertaTokenizer, T5ForConditionalGeneration

model_checkpoint = "home/cdsw/src"
tokenizer = RobertaTokenizer.from_pretrained(model_checkpoint)
model = T5ForConditionalGeneration.from_pretrained(model_checkpoint)


app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


@app.route('/')
def home():
   return render_template('/index.html')

@app.route('/result',methods=["POST"])
def result():
	text = request.json

	input_ids = tokenizer(text['code'], return_tensors="pt").input_ids
	generated_ids = model.generate(input_ids, max_length=30)
	result = tokenizer.decode(generated_ids[0], skip_special_tokens=True)
	result = '# '+result+'\n'
	print(result)

	return jsonify({"res":result+text['code']})

if __name__ == '__main__':
   app.run()
