from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NewsBase(BaseModel):
    link_article: str
    title: str
    img_url: str
    content: str
    source: str
    published_at: datetime


class NewsCreate(NewsBase):
    pass


class NewsUpdate(BaseModel):
    title: Optional[str]
    img_url: Optional[str]
    content: Optional[str]
    source: Optional[str]
    published_at: Optional[datetime]
    label: Optional[str]


class NewsResponse(NewsBase):
    id: int
    label: Optional[str]
    is_classified: bool
    created_at: datetime
