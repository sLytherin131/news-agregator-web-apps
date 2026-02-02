from sentence_transformers import SentenceTransformer
import numpy as np
from db.supabase import supabase
from typing import List, Optional
import torch

# Load model once at module level
model = SentenceTransformer("sentence-transformers/paraphrase-multilingual-mpnet-base-v2")

SIMILARITY_THRESHOLD = 0.65

def get_embedding(text: str) -> List[float]:
    """Generates embedding for a given text."""
    embedding = model.encode(text)
    return embedding.tolist()

def generate_issue_title(news_title: str, news_content: str) -> str:
    """Generate a generic issue title from news content."""
    # Extract first 3-5 important words from title (skip common words)
    stop_words = {'yang', 'dan', 'di', 'ke', 'dari', 'untuk', 'pada', 'dengan', 'oleh', 'akan', 'telah', 'ini', 'itu', 'adalah', 'sebagai'}
    
    words = news_title.lower().split()
    keywords = [w for w in words if w not in stop_words and len(w) > 3][:4]
    
    if keywords:
        # Capitalize first letter of each word
        title = ' '.join([w.capitalize() for w in keywords])
        return f"Isu: {title}"
    else:
        # Fallback to first 50 chars of title
        return f"Isu: {news_title[:50]}"

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Calculates cosine similarity between two vectors."""
    # Ensure both are numpy arrays with float type
    n1 = np.array(v1, dtype=np.float32)
    n2 = np.array(v2, dtype=np.float32)
    return float(np.dot(n1, n2) / (np.linalg.norm(n1) * np.linalg.norm(n2)))

def _get_best_matching_issue(embedding: List[float], existing_issues: List[dict]):
    best_match = None
    max_sim = -1.0
    for issue in existing_issues:
        centroid = issue.get("centroid_embedding")
        if not centroid:
            continue
            
        # Convert centroid to list if it's a string
        if isinstance(centroid, str):
            import json
            try:
                centroid = json.loads(centroid)
            except:
                continue
        
        # Ensure it's a list (some DB configs return it differently)
        if not isinstance(centroid, list):
            continue
            
        # Dimension check
        if len(centroid) != len(embedding):
            # Try to log mismatch once to avoid spam but help debugging
            # print(f"⚠️ Dimension mismatch: issue {len(centroid)} vs news {len(embedding)}")
            continue
            
        try:
            sim = cosine_similarity(embedding, centroid)
            if sim > max_sim:
                max_sim = sim
                best_match = issue
        except Exception as e:
            print(f"⚠️ Error calculating similarity for issue {issue.get('id')}: {e}")
            continue
            
    return best_match, max_sim

def _process_single_item(item: dict, existing_issues: List[dict]):
    # Get or generate embedding
    embedding = item.get("embedding")
    
    # Handle string format from database
    if isinstance(embedding, str) and embedding:
        import json
        try:
            embedding = json.loads(embedding)
        except Exception as e:
            print(f"⚠️ Failed to parse cached embedding for news {item['id']}, regenerating...")
            embedding = None
            
    if not embedding:
        text_to_embed = f"{item['title']} {item['content'][:450]}"
        embedding = get_embedding(text_to_embed)
        supabase.table("news").update({"embedding": embedding}).eq("id", item["id"]).execute()
    
    # After potential re-generation or parsing, ensure it's a list
    if not isinstance(embedding, list):
        print(f"⚠️ Invalid embedding for news {item['id']}")
        return None
        
    best_match, max_sim = _get_best_matching_issue(embedding, existing_issues)
    
    print(f"🔍 News '{item['title'][:50]}...'")
    print(f"   Best match: Issue #{best_match['id'] if best_match else 'None'} - Similarity: {max_sim:.2%}")
    
    if max_sim >= SIMILARITY_THRESHOLD and best_match:
        print(f"   ✅ Matched to existing issue: '{best_match['title'][:50]}...'")
        link_news_to_issue(item["id"], best_match["id"], float(max_sim))
        # Update centroid agar isu tetap relevan dengan berita-berita terbaru yang masuk
        update_issue_centroid(best_match, embedding)
        return {"news_id": item["id"], "issue_id": best_match["id"], "mode": "matched", "similarity": max_sim}
    else:
        print(f"   🆕 Creating new issue (similarity {max_sim:.2%} < threshold {SIMILARITY_THRESHOLD:.2%})")
        # Create new issue with generic title
        issue_title = generate_issue_title(item["title"], item.get("content", ""))
        new_issue = supabase.table("issues").insert({
            "title": issue_title,
            "centroid_embedding": embedding,
            "news_count": 1
        }).execute()
        
        if new_issue.data:
            issue_id = new_issue.data[0]["id"]
            link_news_to_issue(item["id"], issue_id, 1.0, update_count=False) # Already set to 1
            existing_issues.append(new_issue.data[0])
            return {"news_id": item["id"], "issue_id": issue_id, "mode": "created", "similarity": 1.0}
    return None

def cluster_news_items(news_ids: List[int]):
    news_res = supabase.table("news").select("*").in_("id", news_ids).execute()
    news_items = news_res.data
    issues_res = supabase.table("issues").select("*").execute()
    existing_issues = issues_res.data
    
    results = []
    for item in news_items:
        res = _process_single_item(item, existing_issues)
        if res:
            results.append(res)
    return results

def link_news_to_issue(news_id: int, issue_id: int, similarity: float, update_count: bool = True):
    exists = supabase.table("news_issues").select("*").eq("news_id", news_id).eq("issue_id", issue_id).execute()
    if not exists.data:
        supabase.table("news_issues").insert({
            "news_id": news_id,
            "issue_id": issue_id,
            "similarity": similarity
        }).execute()
        
        if update_count:
            # Manual update instead of RPC for better portability
            res = supabase.table("issues").select("news_count").eq("id", issue_id).single().execute()
            if res.data:
                count = (res.data.get("news_count") or 0) + 1
                supabase.table("issues").update({"news_count": count, "timemodified": "now()"}).eq("id", issue_id).execute()

def update_issue_centroid(issue: dict, new_embedding: List[float]):
    """Updates the centroid of an issue using a simple weighted average."""
    centroid_data = issue.get("centroid_embedding")
    
    # Handle string format from database if necessary
    if isinstance(centroid_data, str):
        import json
        try:
            centroid_data = json.loads(centroid_data)
        except Exception as e:
            print(f"Error parsing centroid for issue {issue.get('id')}: {e}")
            return # Cannot update if centroid is invalid
            
    current_centroid = np.array(centroid_data, dtype=np.float32)
    new_v = np.array(new_embedding, dtype=np.float32)
    count = issue.get("news_count", 1)
    
    # New centroid = (old_centroid * count + new_embedding) / (count + 1)
    updated_centroid = (current_centroid * count + new_v) / (count + 1)
    
    supabase.table("issues").update({
        "centroid_embedding": updated_centroid.tolist(),
        "timemodified": "now()"
    }).eq("id", issue["id"]).execute()
