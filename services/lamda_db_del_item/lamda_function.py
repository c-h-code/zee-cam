import os
import boto3
from botocore.exceptions import ClientError


bucket = os.environ["BUCKET"]
s3 = boto3.client("s3")

def extract_key(image, field):
    value = image.get(field)
    if not value:
        return None
    return value.get("S")

def delete_object(key):
    try:
        s3.delete_object(Bucket=bucket, Key=key)
        print(f"Deleted s3://{bucket}/{key}")
    except ClientError as e:
        code = e.response.get("Error", {}).get("Code")
        if code in ("NoSuchKey", "404", "NotFound"):
            print(f"Already missing: s3://{bucket}/{key}")
            return
        raise
    
def lambda_handler(event, context):
    for record in event.get("Records", []):
        if record.get("eventName") != "REMOVE":
            continue
        image = record.get("dynamodb", {}).get("OldImage", {})
        video_key = extract_key(image, "video_key")
        thumb_key = extract_key(image, "thumbnail_key")

        for key in (video_key, thumb_key):
            if key:
                delete_object(key)

    
