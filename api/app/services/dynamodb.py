import boto3
from boto3.dynamodb.conditions import Key

table = boto3.resource("dynamodb").Table("zee-cam-db-dev")

def list_videos(limit=20):
    response = table.query(
        IndexName="zee-cam-db-created_at-index-db",
        KeyConditionExpression=Key("type").eq("VIDEO"),
        ScanIndexForward=False,
        Limit=limit
    )

    return response["Items"]



def delete_video(video_id : str):
    response = table.delete_item(
        Key={"id": video_id},
    )
    return response