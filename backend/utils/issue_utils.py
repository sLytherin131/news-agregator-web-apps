from typing import List

def inject_representative_image(issues_list: List[dict]):
    """Helper to inject representative_image and label counts into a list of issues."""
    for issue in issues_list:
        image_url = None
        label_counts = {"opposition": 0, "neutral": 0, "pro_government": 0}
        total_news = 0
        
        if issue.get("news_issues"):
            for ni in issue["news_issues"]:
                news = ni.get("news")
                if not news:
                    continue
                
                total_news += 1
                # Extract image if not already set
                if not image_url and news.get("img_url"):
                    image_url = news["img_url"]
                
                # Count labels
                label = news.get("label")
                if label == "oposisi":
                    label_counts["opposition"] += 1
                elif label == "netral":
                    label_counts["neutral"] += 1
                elif label == "pro_pemerintah":
                    label_counts["pro_government"] += 1
                    
        issue["representative_image"] = image_url
        issue["label_counts"] = label_counts
        issue["news_count"] = total_news
        
        if "news_issues" in issue:
            del issue["news_issues"]
    return issues_list
