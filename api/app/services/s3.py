import boto3
from app.config import S3_BUCKET

BUCKET = S3_BUCKET
CONTROL_FLAG_KEY = "control/run_flag.txt"

s3 = boto3.client("s3")

def generate_url(key : str):
    return s3.generate_presigned_url(
        "get_object",
        Params={
            "Bucket": BUCKET,
            "Key": key
        },
        ExpiresIn=3600
    )

def get_uploads_enabled() -> bool:
    response = s3.get_object(Bucket=BUCKET, Key=CONTROL_FLAG_KEY)
    content = response["Body"].read().decode("utf-8").strip()
    return content != "False"

def set_uploads_enabled(enabled: bool):
    s3.put_object(Bucket=BUCKET, Key=CONTROL_FLAG_KEY, Body=str(enabled).encode("utf-8"))