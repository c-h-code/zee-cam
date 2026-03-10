import boto3
from boto3.dynamodb.conditions import Key
from app.config import DYNAMO_TABLE, DYNAMO_INDEX

table = boto3.resource("dynamodb").Table(DYNAMO_TABLE)

def list_videos(limit=20):
    response = table.query(
        IndexName=DYNAMO_INDEX,
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


def get_user(username: str):
    response = table.get_item(Key={"id": f"user#{username}"})
    return response.get("Item")