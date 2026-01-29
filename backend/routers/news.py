from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query
from typing import List, Optional, Union
from models.news import NewsCreateManual, NewsCreateAuto, NewsInsertManual, NewsUpdate, NewsResponse
from db.supabase import supabase
from services.scraping import scrape_news
from services.classification import classify_content
from datetime import datetime, timezone
import uuid
import traceback

router = APIRouter(prefix="/news", tags=["news"])

@router.post("/manual", response_model=NewsResponse)
async def create_news_manual(
    link_article: str = Form(...),
    title: str = Form(...),
    content: str = Form(...),
    source: str = Form(...),
    published_at: str = Form(...),
    image: UploadFile = File(...)
):
    try:
        # 1. Upload image to Supabase Storage
        file_ext = image.filename.split(".")[-1]
        file_path = f"news/{uuid.uuid4()}.{file_ext}"
        
        contents = await image.read()
        supabase.storage.from_("news-images").upload(file_path, contents)
        
        # Get public URL
        img_url = supabase.storage.from_("news-images").get_public_url(file_path)

        # 2. Save to database
        news_data = {
            "link_article": link_article,
            "title": title,
            "content": content,
            "source": source,
            "img_url": img_url,
            "published_at": published_at,
            "label": None
        }
        
        res = supabase.table("news").insert(news_data).execute()
        return res.data[0]
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Manual Error: {str(e)}")

@router.post("/auto", response_model=NewsResponse)
async def create_news_auto(data: NewsCreateAuto):
    try:
        # 1. Scrape metadata
        scraped_data = scrape_news(str(data.link_article))
        
        # 2. Save to database
        news_data = {
            "link_article": str(data.link_article),
            "source": data.source,
            "title": scraped_data["title"],
            "content": scraped_data["content"],
            "img_url": scraped_data["img_url"],
            "published_at": scraped_data["published_at"] if scraped_data["published_at"] else datetime.now(timezone.utc).isoformat(),
            "label": None
        }
        
        res = supabase.table("news").insert(news_data).execute()
        return res.data[0]
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Auto Error: {str(e)}")

@router.get("/", response_model=List[NewsResponse])
async def list_news(
    source: Optional[str] = None,
    label: Optional[str] = None,
    classified: Optional[bool] = None
):
    query = supabase.table("news").select("*")
    
    if source:
        query = query.eq("source", source)
    if label:
        query = query.eq("label", label)
    if classified is not None:
        if classified:
            query = query.is_not("label", "null")
        else:
            query = query.is_("label", "null")
            
    res = query.order("created_at", desc=True).execute()
    return res.data

@router.get("/{news_id}", response_model=NewsResponse)
async def get_news(news_id: Union[str, int]):
    res = supabase.table("news").select("*").eq("id", news_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail=NEWS_NOT_FOUND)
    return res.data

@router.put("/{news_id}", response_model=NewsResponse)
async def update_news(news_id: Union[str, int], data: NewsUpdate):
    import json
    # Use Pydantic's JSON serialization then parse back to dict to ensure all types (datetime, etc) are strings
    update_data = json.loads(data.model_dump_json(exclude_unset=True))
    res = supabase.table("news").update(update_data).eq("id", news_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail=NEWS_NOT_FOUND)
    return res.data[0]

@router.post("/{news_id}/classify", response_model=NewsResponse)
async def classify_news(news_id: Union[str, int]):
    # 1. Get news content
    res = supabase.table("news").select("content").eq("id", news_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="News article not found")
    
    content = res.data["content"]
    
    # 2. Run IndoBERT classification
    label = classify_content(content)
    
    # 3. Update label and is_classified in database
    update_res = supabase.table("news").update({
        "label": label
    }).eq("id", news_id).execute()
    return update_res.data[0]

@router.post("/manual-insert", response_model=NewsResponse)
async def create_news_manual_json(data: NewsInsertManual):
    try:
        news_data = {
            "title": data.title,
            "content": data.content,
            "source": data.source,
            "link_article": data.url if data.url else "",
            "img_url": data.img_url if data.img_url else "https://via.placeholder.com/400x200",
            "published_at": data.published_at.isoformat(),
            "label": None
        }
        res = supabase.table("news").insert(news_data).execute()
        return res.data[0]
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Manual Insert Error: {str(e)}")

@router.delete("/{news_id}")
async def delete_news(news_id: Union[str, int]):
    try:
        supabase.table("news").delete().eq("id", news_id).execute()
        return {"status": "success", "message": "News article deleted"}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Delete Error: {str(e)}")
