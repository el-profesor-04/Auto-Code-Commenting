# The Code Search Net dataset is needed to be downloaded and preprocessed.
# Dataset is filtered and partitioned into train, valid and test sets.
# and 2 columns ['code'] and ['docstring'] are stored in each csv file.
# The ['code'] acts as input features and ['docstring'] acts as labels

!wget https://s3.amazonaws.com/code-search-net/CodeSearchNet/v2/python.zip
!unzip python.zip


def main:
	columns_long_list = ['repo', 'path', 'url', 'code', 
	                     'code_tokens', 'docstring', 'docstring_tokens', 
	                     'language', 'partition']

	columns_short_list = ['code_tokens', 'docstring_tokens', 
	                      'language', 'partition']

	def jsonl_list_to_dataframe(file_list, columns=columns_long_list):
	    """Load a list of jsonl.gz files into a pandas DataFrame."""
	    return pd.concat([pd.read_json(f, 
	                                   orient='records', 
	                                   compression='gzip',
	                                   lines=True)[columns] 
	                      for f in file_list], sort=False)

	from pathlib import Path

	python_files = sorted(Path('./python/').glob('**/*.gz'))
	pydf = jsonl_list_to_dataframe(python_files)


	train_df = pd.DataFrame(pydf[pydf['partition']=='train'],columns=['code','docstring'])
	train_df.to_csv('train.csv',index=False)
	valid_df = pd.DataFrame(pydf[pydf['partition']=='valid'],columns=['code','docstring'])
	valid_df.to_csv('valid.csv',index=False)
	test_df = pd.DataFrame(pydf[pydf['partition']=='test'],columns=['code','docstring'])
	test_df.to_csv('test.csv',index=False)

if __name__ == "__main__":
	main()