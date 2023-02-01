!export PATH="$/home/cdsw/.local/lib/python3.7/site-packages:$PATH"

!which python
!flask --app app/app.py run --port $CDSW_APP_PORT --host 127.0.0.1
 
