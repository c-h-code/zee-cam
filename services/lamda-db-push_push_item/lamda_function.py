import json
import boto3
import urllib.parse
import os

db_name = os.environ['DYNAMODB']
db = boto3.resource("dynamodb")
table = db.Table(db_name)


def lambda_handler(event, context):

    
    record = event["Records"][0]
    video_key = urllib.parse.unquote_plus(record["s3"]["object"]["key"])
    thumb_key = video_key.replace("videos/","thumbnails/").replace('.mp4', '.jpg')
    id = video_key.replace("videos/", "").replace(".mp4", "")
    
    table.put_item(Item={
        "id" : id,
        "video_key": video_key,
        "thumbnail_key": thumb_key,
        "status": "active",
        "auto_delete": "true"
    })

