import requests
from bs4 import BeautifulSoup
from newspaper import Article
from datetime import datetime
from typing import Tuple, Optional

def scrape_news(url: str) -> dict:
    """
    Scrapes news article data from a given URL using newspaper3k and BeautifulSoup.
    """
    try:
        # Use newspaper3k for high-level extraction
        article = Article(url)
        article.download()
        article.parse()
        
        # Use BeautifulSoup for more granular control if needed (e.g., meta tags)
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
        }
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, "html.parser")
        
        title = article.title or (soup.find("title").get_text() if soup.find("title") else "")
        content = article.text or " ".join([p.get_text() for p in soup.find_all("p")])
        img_url = article.top_image
        
        # Format date
        published_at = article.publish_date
        if not published_at:
            # Try to find date in meta tags
            date_meta = soup.find("meta", property="article:published_time") or soup.find("meta", attrs={"name": "pubdate"})
            if date_meta:
                try:
                    published_at = datetime.fromisoformat(date_meta["content"].replace("Z", "+00:00"))
                except:
                    published_at = None

        return {
            "title": title,
            "content": content,
            "img_url": img_url,
            "published_at": published_at.isoformat() if published_at else None
        }
    except Exception as e:
        # Log error or handle specific ones like requests.exceptions.RequestException
        raise RuntimeError(f"Failed to scrape article: {str(e)}") from e
