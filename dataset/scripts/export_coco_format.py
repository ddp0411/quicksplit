# Export dataset to COCO format
import json
import os
from pathlib import Path


def export_to_coco_format(annotations_path: str, output_path: str):
    """Export annotations to COCO format."""
    with open(annotations_path, 'r') as f:
        annotations = json.load(f)
    
    coco_format = {
        "info": {
            "description": "QuickSplit Receipt Dataset",
            "version": "1.0",
        },
        "images": [],
        "annotations": [],
        "categories": [
            {"id": 1, "name": "item_name"},
            {"id": 2, "name": "item_price"},
            {"id": 3, "name": "total_amount"},
        ],
    }
    
    # Convert annotations to COCO format
    for idx, ann in enumerate(annotations):
        coco_format["images"].append({
            "id": idx + 1,
            "file_name": ann["image_path"],
        })
    
    with open(output_path, 'w') as f:
        json.dump(coco_format, f, indent=2)
    
    print(f"Exported COCO format to {output_path}")


if __name__ == "__main__":
    annotations_path = "../annotations/labels.json"
    output_path = "../annotations/coco_format.json"
    export_to_coco_format(annotations_path, output_path)

