import os
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.environ["JWT_SECRET"]
CORS_ORIGIN = os.environ.get("CORS_ORIGIN", "http://127.0.0.1:5173")
S3_BUCKET = os.environ["S3_BUCKET"]
DYNAMO_TABLE = os.environ["DYNAMO_TABLE"]
DYNAMO_INDEX = os.environ["DYNAMO_INDEX"]
