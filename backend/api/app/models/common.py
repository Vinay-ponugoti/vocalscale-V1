from typing import Generic, List, TypeVar, Optional
from pydantic import BaseModel

T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    size: int
    pages: int
    next_page: Optional[int] = None
    prev_page: Optional[int] = None
