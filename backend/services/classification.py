import torch
import re
from transformers import AutoTokenizer, AutoModelForSequenceClassification

repo_id = "Ricky131/indobert-bias-news-augmented"

# Load model and tokenizer once
tokenizer = AutoTokenizer.from_pretrained(repo_id)
model = AutoModelForSequenceClassification.from_pretrained(repo_id)
model.eval()

# Label mapping
label_mapping = {'netral': 0, 'oposisi': 1, 'pro_pemerintah': 2}
id2label = {v: k for k, v in label_mapping.items()}

def clean_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"[^a-zA-Z0-9\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def classify_content(content: str) -> str:
    """
    Classifies news content into 'netral', 'oposisi', or 'pro_pemerintah'.
    Uses max_length=256 as specified in user's colab.
    """
    text = clean_text(content)
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=256)
    
    with torch.no_grad():
        logits = model(**inputs).logits
        predicted_id = torch.argmax(logits, dim=1).item()
    
    return id2label[predicted_id]
