from fastapi import APIRouter, HTTPException, Body
from db.supabase import supabase
from typing import List, Optional
from services.summarization import process_issue_summarization
from utils.issue_utils import inject_representative_image
import traceback

router = APIRouter(prefix="/issues", tags=["issues"])

# Helper removed - now using utils.issue_utils.inject_representative_image

@router.get("/")
async def list_issues():
    try:
        res = supabase.table("issues") \
            .select("*, news_issues(news(img_url, label))") \
            .order("timemodified", desc=True) \
            .execute()
        return inject_representative_image(res.data)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/hot")
async def get_hot_issues(limit: int = 5):
    try:
        res = supabase.table("issues") \
            .select("*, news_issues(news(img_url, label))") \
            .order("view_count", desc=True) \
            .limit(limit) \
            .execute()
        return inject_representative_image(res.data)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/latest")
async def get_latest_issues(limit: int = 10):
    try:
        res = supabase.table("issues") \
            .select("*, news_issues(news(img_url, label))") \
            .order("created_at", desc=True) \
            .limit(limit) \
            .execute()
        return inject_representative_image(res.data)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/random")
async def get_random_issues(limit: int = 5):
    try:
        import random
        res = supabase.table("issues") \
            .select("*, news_issues(news(img_url, label))") \
            .limit(50) \
            .execute()
        
        data = res.data
        if len(data) > limit:
            data = random.sample(data, limit)
        
        return inject_representative_image(data)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{issue_id}")
async def get_issue(issue_id: int, increment_view: bool = False):
    try:
        res = supabase.table("issues").select("*").eq("id", issue_id).single().execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Issue not found")
        
        issue = res.data
        
        # Increment view_count if requested
        if increment_view:
            # We don't check for admin here because the frontend will decide 
            # whether to pass increment_view=true based on user role
            try:
                supabase.rpc("increment_view_count", {"row_id": issue_id}).execute()
            except:
                # Fallback if RPC fails, database trigger will now handle timestamp preservation
                new_count = (issue.get("view_count") or 0) + 1
                supabase.table("issues").update({"view_count": new_count}).eq("id", issue_id).execute()
        
        return issue
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{issue_id}/news")
async def get_issue_news(issue_id: int):
    try:
        # Join news_issues with news
        res = supabase.table("news_issues") \
            .select("news(*)") \
            .eq("issue_id", issue_id) \
            .execute()
        
        if not res.data:
            return []
            
        # Flatten the result structure from Supabase join
        news_list = []
        for item in res.data:
            if item.get("news"):
                news_list.append(item["news"])
        return news_list
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{issue_id}/summarize")
async def summarize_issue(issue_id: int):
    """Trigger AI summarization for an issue."""
    try:
        result = await process_issue_summarization(issue_id)
        if not result:
            raise HTTPException(status_code=404, detail="Issue not found or has no news")
        return {"status": "success", "data": result}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Summarization Error: {str(e)}")

@router.put("/{issue_id}")
async def update_issue(issue_id: int, title: str = Body(..., embed=True)):
    try:
        res = supabase.table("issues").update({
            "title": title, 
            "timemodified": "now()"
        }).eq("id", issue_id).execute()
        
        if not res.data:
            raise HTTPException(status_code=404, detail="Issue not found")
        return res.data[0]
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{issue_id}")
async def delete_issue(issue_id: int):
    try:
        # Delete associations first
        supabase.table("news_issues").delete().eq("issue_id", issue_id).execute()
        # Delete issue
        res = supabase.table("issues").delete().eq("id", issue_id).execute()
        return {"status": "success", "message": "Issue deleted"}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
