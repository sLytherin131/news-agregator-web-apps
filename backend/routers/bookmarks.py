from fastapi import APIRouter, HTTPException, Depends, status
from db.supabase import supabase
from dependencies.auth import get_current_user
from typing import List

router = APIRouter(prefix="/bookmarks", tags=["bookmarks"])

@router.get("/check/{issue_id}")
async def check_bookmark(issue_id: int, current_user: dict = Depends(get_current_user)):
    """Check if the current user has bookmarked a specific issue."""
    try:
        res = supabase.table("issue_bookmarks") \
            .select("*") \
            .eq("user_id", current_user["id"]) \
            .eq("issue_id", issue_id) \
            .execute()
        
        return {"is_bookmarked": len(res.data) > 0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/toggle/{issue_id}")
async def toggle_bookmark(issue_id: int, current_user: dict = Depends(get_current_user)):
    """Toggle bookmark for an issue (add if not exists, remove if exists)."""
    try:
        # Check if exists
        check = supabase.table("issue_bookmarks") \
            .select("*") \
            .eq("user_id", current_user["id"]) \
            .eq("issue_id", issue_id) \
            .execute()
        
        if check.data:
            # Remove
            supabase.table("issue_bookmarks") \
                .delete() \
                .eq("user_id", current_user["id"]) \
                .eq("issue_id", issue_id) \
                .execute()
            return {"status": "removed", "is_bookmarked": False}
        else:
            # Add
            supabase.table("issue_bookmarks").insert({
                "user_id": current_user["id"],
                "issue_id": issue_id
            }).execute()
            return {"status": "added", "is_bookmarked": True}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from dependencies.auth import get_current_user
from utils.issue_utils import inject_representative_image
from typing import List

@router.get("/")
async def list_bookmarks(current_user: dict = Depends(get_current_user)):
    """List all bookmarked issues for the current user."""
    try:
        # Join with issues AND their news_issues to get stats
        res = supabase.table("issue_bookmarks") \
            .select("issue_id, issues(*, news_issues(news(img_url, label)))") \
            .eq("user_id", current_user["id"]) \
            .execute()
        
        issues = []
        for item in res.data:
            if item.get("issues"):
                issues.append(item["issues"])
        
        return inject_representative_image(issues)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
