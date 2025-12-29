# Cleanup tasks
from app.core.celery_app import celery_app
from datetime import datetime, timedelta
import os
from app.core.config import settings


@celery_app.task(name="cleanup_old_files")
def cleanup_old_files():
    """Clean up old uploaded files."""
    upload_dir = settings.UPLOAD_DIR
    cutoff_date = datetime.now() - timedelta(days=7)
    
    deleted_count = 0
    for root, dirs, files in os.walk(upload_dir):
        for file in files:
            file_path = os.path.join(root, file)
            file_time = datetime.fromtimestamp(os.path.getmtime(file_path))
            if file_time < cutoff_date:
                os.remove(file_path)
                deleted_count += 1
    
    return {"deleted_files": deleted_count}

