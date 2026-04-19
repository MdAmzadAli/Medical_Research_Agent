from pydantic import BaseModel
from typing import List, Optional


class Item(BaseModel):
    id: Optional[str]
    title: str
    abstract: Optional[str] = ""
    source: str
    type: str
    year: Optional[int] = None


class RankRequest(BaseModel):
    query: str
    items: List[Item]


class RankResponse(BaseModel):
    answer: str
    sources: List[Item]