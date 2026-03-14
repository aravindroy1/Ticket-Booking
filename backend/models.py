from pydantic import BaseModel, Field, ConfigDict
from pydantic.functional_validators import BeforeValidator
from typing import Optional, List, Annotated
from datetime import datetime

# Represents an ObjectId field in the database.
# It will be represented as a `str` on the model so that it can be serialized to JSON.
PyObjectId = Annotated[str, BeforeValidator(str)]

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
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    event_id: str
    name: str
    date: datetime
    location: str
    total_seats: int
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
