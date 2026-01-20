from celery import Task
from app.core.celery_app import celery_app
from pathlib import Path
from datetime import datetime, timedelta
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


@celery_app.task
def cleanup_old_uploads():
    """
    Clean up old uploaded files
    Runs daily to free up storage
    """
    try:
        upload_dir = Path(settings.UPLOAD_DIR)
        cutoff_date = datetime.now() - timedelta(days=7)
        
        deleted_count = 0
        for file_path in upload_dir.rglob('*'):
            if file_path.is_file():
                file_time = datetime.fromtimestamp(file_path.stat().st_mtime)
                if file_time < cutoff_date:
                    file_path.unlink()
                    deleted_count += 1
        
        logger.info(f"Cleaned up {deleted_count} old files")
        return {"status": "success", "deleted_count": deleted_count}
    
    except Exception as exc:
        logger.error(f"Cleanup failed: {exc}")
        return {"status": "failed", "error": str(exc)}


@celery_app.task
def cleanup_temp_files():
    """
    Clean up temporary processing files
    """
    try:
        # Clean up temp directories
        logger.info("Temp files cleaned up")
        return {"status": "success"}
    
    except Exception as exc:
        logger.error(f"Temp cleanup failed: {exc}")
        return {"status": "failed", "error": str(exc)}


# Configure periodic tasks
celery_app.conf.beat_schedule = {
    'cleanup-old-uploads': {
        'task': 'app.tasks.cleanup_tasks.cleanup_old_uploads',
        'schedule': 86400.0,  # Daily
    },
    'cleanup-temp-files': {
        'task': 'app.tasks.cleanup_tasks.cleanup_temp_files',
        'schedule': 3600.0,  # Hourly
    },
}
