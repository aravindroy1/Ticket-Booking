from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        return str(v)

class TicketModel(BaseModel):
    id: Optional[PyObjectId] = Field(default_none=True, alias="_id")
    ticket_id: str
    event_id: str
    seat_number: str
    price: float
    status: str = Field(default="AVAILABLE") # AVAILABLE, PENDING, BOOKED, CANCELLED
    user_id: Optional[str] = None
    reserved_until: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}

class EventModel(BaseModel):
    id: Optional[PyObjectId] = Field(default_none=True, alias="_id")
    event_id: str
    name: str
    date: datetime
    location: str
    total_seats: int
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
