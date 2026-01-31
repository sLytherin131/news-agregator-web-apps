from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime
from enum import Enum

class NewsSource(str, Enum):
    CNN_INDONESIA = "CNN Indonesia"
    DETIK = "Detik"
    KOMPAS = "Kompas"
    TEMPO = "Tempo"
    SINDO = "Sindo"
    METROTV_NEWS = "MetroTV News"

class NewsBase(BaseModel):
    link_article: HttpUrl
    title: str
    img_url: Optional[str] = None
    content: str
    source: NewsSource
    published_at: datetime
    label: Optional[str] = None

class NewsCreateManual(NewsBase):
    pass

class NewsCreateAuto(BaseModel):
    link_article: HttpUrl
    source: str # Changed from NewsSource to str for flexibility

class NewsInsertManual(BaseModel):
    title: str
    content: str
    source: str
    published_at: datetime
    url: Optional[str] = None
    img_url: Optional[str] = None

class NewsUpdate(BaseModel):
    title: Optional[str] = None
    img_url: Optional[str] = None
    content: Optional[str] = None
    source: Optional[str] = None
    published_at: Optional[datetime] = None
    label: Optional[str] = None

from typing import Optional, Union, List

class NewsResponse(NewsBase):
    id: Union[str, int]
    created_at: datetime
    # Add hidden field for issues if needed, or handle in a separate model
    issues: Optional[List[dict]] = None 

    class Config:
        from_attributes = True

class ClusteringRequest(BaseModel):
    news_ids: List[int]

class ClusteringResponse(BaseModel):
    results: List[dict]
