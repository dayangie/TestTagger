import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_TOKEN = os.getenv("HF_API_TOKEN")
API_URL = "https://api-inference.huggingface.co/models/valhalla/distilbart-mnli-12-1"  # smaller, faster model
headers = {"Authorization": f"Bearer {API_TOKEN}"}

def classify_test_case(text, labels):
    payload = {
        "inputs": text,
        "parameters": {"candidate_labels": labels}
    }
    try:
        response = requests.post(
            API_URL,
            headers=headers,
            json=payload,
            timeout=10  
        )
        response.raise_for_status()  
        result = response.json()

        if "labels" in result and result["labels"]:
            return {
                "label": result["labels"][0],
                "scores": result.get("scores", []),
                "all_labels": result["labels"]
            }
        else:
            return {"error": "No prediction returned by model"}

    except requests.exceptions.Timeout:
        print("Error: Hugging Face API timed out")
        return {"error": "Hugging Face API timed out"}

    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return {"error": str(e)}
