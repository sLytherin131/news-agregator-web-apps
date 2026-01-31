from fastapi import APIRouter, HTTPException, Depends, status
from db.supabase import supabase
from dependencies.auth import get_current_user

router = APIRouter(prefix="/reading-history", tags=["reading-history"])

@router.post("/{news_id}")
async def track_reading(news_id: int, current_user: dict = Depends(get_current_user)):
    """Track when a user reads a news article."""
    try:
        # Upsert: if record exists, update read_at; otherwise insert new
        supabase.table("reading_history").upsert({
            "user_id": current_user["id"],
            "news_id": news_id,
            "read_at": "now()"
        }).execute()
        
        return {"status": "tracked", "news_id": news_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def get_reading_history(current_user: dict = Depends(get_current_user)):
    """Get reading history for the current user."""
    try:
        res = supabase.table("reading_history") \
            .select("news_id, read_at, news(*)") \
            .eq("user_id", current_user["id"]) \
            .order("read_at", desc=True) \
            .execute()
        
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
