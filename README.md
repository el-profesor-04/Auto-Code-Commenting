# Auto-Code-Commenting

Adding comments to a block of code is an important task that not only helps the reader understand the code in the current and referenced methods, but it also helps to determine whether the code is still needed and how to test it.

![](/static/app_screenshot.png)
It's important to keep in mind that comments should be used wisely, as excessive commenting can make the code more difficult to read and can lead to information overload. A good rule of thumb is to comment only when necessary, and to keep comments concise and relevant to the code.

**Approach:**

An attention-based pre-trained transformer model (like BERT) is tuned with a sequence-to-sequence dataset, with code-comment pairs for Python programming language.
Codet5 is a pretrained transformer based architecture for code understanding and generation. Just like a large language model, it has been trained to model programming languages. The pretrained model is available on huggingface which has been fine tuned on the following dataset which contains Python code and docstring pairs.

The goal of this project was to develop a Machine Learning model to be able to understand a piece of code and describe it precisely.

## Project Structure

```
.
├── README.md
├── app                                       # app.py file consists of flask code and js and html files make up the frontend app.                   
│   ├── app.py
│   ├── templates
│   │   └── index.html
│   └── static
│       ├── script.js
│       ├── style.css
│       ├── img1.png
│       ├── GIF1.gif
│       └── gif2.gif
├── requirements.txt                          # Requirement files
├── scripts                                   # Utility scripts for project and application setup
│   ├── download_data.py
│   ├── install_dependencies.py
│   ├── train_model.py
│   └── launch_app.py
├── src                                       # model files from checkpoint
│   ├── config.json
│   ├── merges.txt
│   ├── pytorch_model.bin
│   ├── special_tokens_map.json
│   ├── tokenizer_config.json
│   └── vocab.json
├── static                                    # image files used 
│   ├── img1.png
│   ├── gif2 copy.gif
│   └── app_screenshot.png
└── .project-metadata.yaml
```

By launching this applied machine learning prototype (AMP) on CML, the following steps will be taken to recreate the project in your workspace:
1. A Python session is run to install all project dependencies and the model from huggingface.
2. A flask app is deployed to the project.


## Launching the Project on CML

This AMP was developed against Python 3.7. To launch the project on CML:

**As an AMP** - In a CML workspace, click "New Project", add a Project Name, select "AMPs" as the Initial Setup option, copy in this repo URL, click "Create Project", click "Configure Project"

**Important Note: If it takes too long for the launch_app.py to run on CML server, please download the pytorch_model.bin file from /src separately and manually upload it. Then modify the line 12 "model_checkpoint='el-profesor/code_t5'" to "model_checkpoint='../src'" in the app.py and then start the application.
This can also be done if running locally.**


## Running the Project Outside of CML

The code and application within were developed against Python 3.7, and are likely also to function with more recent versions of Python.

To setup the project, first create and activate a new virtual environment through your preferred means. Then pip install dependencies and download the required HuggingFace models:

```
python -m venv .venv
source .venv/bin/activate
pip3 install -r requirements.txt
```

Finally, launch the flask application:

```
flask --app app/app.py run --port=5000 --host=127.0.0.1
```

**Note:** Since the app utilizes several large Transformer models, you'll need at least 2vCPU / 4GB RAM.



