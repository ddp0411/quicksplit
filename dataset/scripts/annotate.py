# Annotation script for dataset
import json
import os
from pathlib import Path


def create_annotation(image_path: str, items: list, total: float):
    """Create annotation for an image."""
    return {
        "image_path": image_path,
        "items": items,
        "total": total,
    }


def save_annotations(annotations: list, output_path: str):
    """Save annotations to JSON file."""
    with open(output_path, 'w') as f:
        json.dump(annotations, f, indent=2)
    
    print(f"Saved {len(annotations)} annotations to {output_path}")


if __name__ == "__main__":
    # Example usage
    annotations = []
    # Add your annotation logic here
    save_annotations(annotations, "../annotations/labels.json")

