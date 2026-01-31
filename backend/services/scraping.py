import requests
from bs4 import BeautifulSoup
from newspaper import Article
from datetime import datetime
from typing import Tuple, Optional
import re

import re

def calculate_text_similarity(text1: str, text2: str) -> float:
    """Calculate simple similarity ratio between two texts."""
    # Normalize texts
    t1 = set(text1.lower().split())
    t2 = set(text2.lower().split())
    
    if not t1 or not t2:
        return 0.0
    
    # Jaccard similarity
    intersection = len(t1.intersection(t2))
    union = len(t1.union(t2))
    
    return intersection / union if union > 0 else 0.0

def scrape_news(url: str) -> dict:
    """
    Scrapes news article data from a given URL using newspaper3k and BeautifulSoup.
    Handles multi-page articles (pagination).
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
        
        # Get content from first page
        content = article.text or " ".join([p.get_text() for p in soup.find_all("p")])
        first_page_content = content  # Save for deduplication
        
        # Check for pagination and scrape additional pages
        additional_content = scrape_paginated_content(url, soup, headers, first_page_content)
        if additional_content:
            print(f"✅ Found {len(additional_content)} chars of unique additional content")
            content += "\n\n" + additional_content
        else:
            print("ℹ️ No unique additional content found")
        
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

def scrape_paginated_content(base_url: str, first_page_soup: BeautifulSoup, headers: dict, first_page_content: str) -> str:
    """
    Detects and scrapes content from paginated articles.
    Handles common pagination patterns used by Indonesian news sites.
    Uses similarity detection to avoid duplicating content.
    """
    all_content = []
    
    # Pattern 1: Look for pagination links (common in Sindo, Detik, etc.)
    # Examples: "?page=2", "/2", "-2.html", etc.
    pagination_links = []
    
    # Find all links that might be pagination
    max_page_num = 1
    for link in first_page_soup.find_all("a", href=True):
        href = link["href"]
        link_text = link.get_text().strip()
        
        # Check if link text is a number (page number)
        if re.match(r'^\d+$', link_text):
            page_num = int(link_text)
            if page_num > max_page_num:
                max_page_num = page_num
                
        # Check for "Next", "Selanjutnya" links
        if any(keyword in link_text.lower() for keyword in ['next', 'selanjutnya', 'lanjut', '>']):
            # Make absolute URL
            if href.startswith('http'):
                full_url = href
            elif href.startswith('/'):
                from urllib.parse import urlparse
                parsed = urlparse(base_url)
                full_url = f"{parsed.scheme}://{parsed.netloc}{href}"
            else:
                # Relative URL
                full_url = base_url.rsplit('/', 1)[0] + '/' + href
            
            # Extract page number from URL if possible
            page_match = re.search(r'/(\d+)/?$', full_url)
            if page_match:
                page_num = int(page_match.group(1))
                if page_num > max_page_num:
                    max_page_num = page_num
    
    print(f"🔍 Detected max page number: {max_page_num}")
    
    # Construct URLs for all pages from 2 to max_page_num
    if max_page_num > 1:
        # Try to detect the pagination URL pattern from the base URL
        # Sindo pattern: .../article-slug-timestamp/2, /3, etc.
        for page_num in range(2, max_page_num + 1):
            # Pattern 1: Append /page_num to base URL
            if base_url.endswith('/'):
                potential_url = f"{base_url}{page_num}"
            else:
                potential_url = f"{base_url}/{page_num}"
            
            if potential_url not in pagination_links:
                pagination_links.append(potential_url)
    
    print(f"🔍 Constructed pagination links: {pagination_links}")
    
    # Pattern 2: Check for common pagination URL patterns
    # Sindo often uses: article-url?page=2, article-url/2, etc.
    if not pagination_links:
        # Try constructing pagination URLs
        for page_num in range(2, 6):  # Try up to 5 pages
            potential_urls = [
                f"{base_url}?page={page_num}",
                f"{base_url}&page={page_num}",
                f"{base_url}/{page_num}",
                base_url.replace('.html', f'-{page_num}.html') if '.html' in base_url else None,
            ]
            
            for potential_url in potential_urls:
                if potential_url and potential_url not in pagination_links:
                    # Quick check if this URL exists
                    try:
                        test_response = requests.head(potential_url, headers=headers, timeout=3)
                        if test_response.status_code == 200:
                            pagination_links.append(potential_url)
                            break  # Found valid pattern, use it for remaining pages
                    except:
                        continue
    
    print(f"📄 Total pagination links to scrape: {len(pagination_links)}")
    
    # Scrape content from additional pages
    for idx, page_url in enumerate(pagination_links[:10], start=2):  # Limit to 10 additional pages max
        try:
            print(f"  📖 Scraping page {idx}: {page_url}")
            
            # Try using newspaper3k first for better content extraction
            try:
                page_article = Article(page_url)
                page_article.download()
                page_article.parse()
                page_content = page_article.text
                
                if page_content and len(page_content) > 100:
                    # Check if this content is significantly different from first page
                    similarity = calculate_text_similarity(first_page_content, page_content)
                    print(f"    📊 Similarity with page 1: {similarity:.2%}")
                    
                    if similarity < 0.85:  # Less than 85% similar = different content
                        print(f"    ✅ Got {len(page_content)} chars via newspaper3k (unique)")
                        all_content.append(page_content)
                    else:
                        print(f"    ⚠️ Skipping duplicate content (too similar to page 1)")
                    continue
            except:
                pass  # Fall back to BeautifulSoup
            
            # Fallback: Use BeautifulSoup
            page_response = requests.get(page_url, headers=headers, timeout=10)
            if page_response.status_code == 200:
                page_soup = BeautifulSoup(page_response.text, "html.parser")
                
                # Extract paragraphs from this page
                paragraphs = page_soup.find_all("p")
                page_content = " ".join([p.get_text().strip() for p in paragraphs if p.get_text().strip() and len(p.get_text().strip()) > 50])
                
                if page_content and len(page_content) > 100:  # Only add if substantial content
                    # Check similarity
                    similarity = calculate_text_similarity(first_page_content, page_content)
                    print(f"    📊 Similarity with page 1: {similarity:.2%}")
                    
                    if similarity < 0.85:
                        print(f"    ✅ Got {len(page_content)} chars via BeautifulSoup (unique)")
                        all_content.append(page_content)
                    else:
                        print(f"    ⚠️ Skipping duplicate content")
                else:
                    print(f"    ⚠️ Content too short: {len(page_content)} chars")
            else:
                print(f"    ❌ HTTP {page_response.status_code}")
        except Exception as e:
            print(f"    ❌ Error scraping page {page_url}: {str(e)}")
            continue
    
    print(f"📦 Total additional content collected: {len(all_content)} pages, {sum(len(c) for c in all_content)} chars")
    return "\n\n".join(all_content)
