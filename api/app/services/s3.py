import boto3

s3 = boto3.client("s3")

def generate_url(key : str):
    return s3.generate_presigned_url(
        "get_object",
        Params={
            "Bucket": "zee-vid-repo-dev",
            "Key": key
        },
        ExpiresIn=3600
    )