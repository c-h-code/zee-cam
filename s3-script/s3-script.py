#!/home/ronnoc/workspace/zee-cam/s3-script/venv/bin/python3.13
import time

import boto3
from botocore.exceptions import ClientError
import os
import glob
from dotenv import load_dotenv
load_dotenv()

AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION")
BUCKET_NAME = os.getenv("S3_BUCKET_NAME")


s3 = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    region_name=AWS_REGION             
)

control_flag = s3.get_object(Bucket=BUCKET_NAME, Key ="control/run_flag.txt")['Body'].read().decode('utf-8')

bucket = "zee-vid-repo"
dir_path = "/home/ronnoc/workspace/zee-cam/s3-script/video-repo/"
files = glob.glob(dir_path + "*")
file = max(files, key=os.path.getmtime)

if control_flag:
    try:
        s3.upload_file(
            file,
            BUCKET_NAME,
            os.path.basename(file),  
            ExtraArgs={"Tagging": "autodelete=true"})
    except Exception as e:
        print(f"Upload failed: {e}")

os.remove(file)



