
import boto3
from botocore.exceptions import NoCredentialsError
from fastapi import HTTPException, status
from app.core.config import settings

def get_s3_client():
    return boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION
    )

def upload_file_to_s3(file_obj, object_name):
    """
    Upload a file to an S3 bucket
    :param file_obj: File to upload
    :param object_name: S3 object name
    :return: True if file was uploaded, else False
    """
    s3_client = get_s3_client()
    try:
        s3_client.upload_fileobj(
            file_obj,
            settings.AWS_BUCKET_NAME,
            object_name
            # ExtraArgs={'ACL': 'public-read'} # Optional: if you want public access
        )
        url = f"https://{settings.AWS_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{object_name}"
        return url
    except NoCredentialsError:
         raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AWS credentials not available"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"S3 Upload failed: {str(e)}"
        )
