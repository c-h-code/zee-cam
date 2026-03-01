#!/home/ronnoc/workspace/zee-cam/s3-script/venv/bin/python3.13


import boto3
from botocore.exceptions import ClientError
import os
import sys
import glob

print("running")
profile = os.getenv("AWS_PROFILE")
print(profile)
if profile == "dev":
    BUCKET_NAME = "zee-vid-repo-dev"


session = boto3.Session()
s3 = session.client("s3") 
control_flag = s3.get_object(Bucket=BUCKET_NAME, Key ="control/run_flag.txt")['Body'].read().decode('utf-8')
file = sys.argv[1]

if control_flag == "True":
    try:
        s3.upload_file(
            file,
            BUCKET_NAME,
            f"videos/{os.path.basename(file)}",  
            ExtraArgs={"Tagging": "autodelete=true"})
    
        os.remove(file)
    except Exception as e:
        print(f"Upload failed: {e}")

    



