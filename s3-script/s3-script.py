#!/home/ronnoc/workspace/zee-cam/s3-script/venv/bin/python3.13


import boto3
from botocore.exceptions import ClientError
import os
import sys
import subprocess


def upload_s3(folder, path):
    if control_flag == "True":
        try:
            s3.upload_file(
                vid_path,
                BUCKET_NAME,
                f"{folder}/{os.path.basename(path)}",  
                ExtraArgs={"Tagging": "autodelete=true"})
        
            os.remove(path)
        except Exception as e:
            print(f"Upload failed: {e}")

def generate_thumb(vid_path):
    thumb_path = vid_path.replace("video-repo/", "thumb-repo/").replace(".mp4",".jpeg")

    cmd = ["ffmpeg","-i", vid_path, "-ss", "00:00:03" , "-frames:v", "1", thumb_path]

    subprocess.run(cmd, check=True)

    return thumb_path



profile = os.getenv("AWS_PROFILE")

if profile == "dev":
    BUCKET_NAME = "zee-vid-repo-dev"


session = boto3.Session()
s3 = session.client("s3") 
control_flag = s3.get_object(Bucket=BUCKET_NAME, Key ="control/run_flag.txt")['Body'].read().decode('utf-8')
vid_path = sys.argv[1]

upload_s3(generate_thumb(vid_path))
upload_s3(vid_path)





