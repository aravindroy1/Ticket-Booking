from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Dict, Any
from datetime import datetime, timedelta
import uuid

from database import db
from models import TicketModel

router = APIRouter()

# Release seat task scheduler
async def release_seat_if_pending(ticket_id: str):
    ticket = await db.tickets.find_one({"ticket_id": ticket_id})
    if ticket and ticket.get("status") == "PENDING":
        if ticket.get("reserved_until") and datetime.utcnow() >= ticket.get("reserved_until"):
            await db.tickets.update_one(
                {"ticket_id": ticket_id},
                {"$set": {"status": "AVAILABLE", "user_id": None, "reserved_until": None}}
            )

@router.get("/event/{event_id}", response_model=List[TicketModel])
async def get_event_tickets(event_id: str):
    tickets_cursor = db.tickets.find({"event_id": event_id})
    tickets = await tickets_cursor.to_list(length=1000)
    return tickets

@router.post("/generate")
async def generate_tickets(event_id: str, num_seats: int, base_price: float):
    tickets_to_insert = []
    rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
    
    for i in range(num_seats):
        row = rows[i // 10]
        col = (i % 10) + 1
        seat_number = f"{row}{col}"
        
        # Simple price strategy
        multiplier = 1.0
        if row in ["A", "B", "C"]:
            multiplier = 1.5
            
        tickets_to_insert.append({
            "ticket_id": str(uuid.uuid4()),
            "event_id": event_id,
            "seat_number": seat_number,
            "price": base_price * multiplier,
            "status": "AVAILABLE",
            "created_at": datetime.utcnow()
        })
        
    await db.tickets.insert_many(tickets_to_insert)
    return {"message": f"{num_seats} tickets generated for event {event_id}"}

@router.put("/reserve/{ticket_id}")
async def reserve_ticket(ticket_id: str, user_id: str, background_tasks: BackgroundTasks):
    ticket = await db.tickets.find_one({"ticket_id": ticket_id})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    if ticket.get("status") != "AVAILABLE":
        raise HTTPException(status_code=400, detail="Ticket is not available")
        
    reserved_until = datetime.utcnow() + timedelta(minutes=5)
    
    await db.tickets.update_one(
        {"ticket_id": ticket_id},
        {"$set": {
            "status": "PENDING",
            "user_id": user_id,
            "reserved_until": reserved_until
        }}
    )
    
    return {"message": "Ticket reserved for 5 minutes", "reserved_until": reserved_until}

@router.put("/confirm/{ticket_id}")
async def confirm_ticket(ticket_id: str):
    ticket = await db.tickets.find_one({"ticket_id": ticket_id})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    if ticket.get("status") != "PENDING":
        raise HTTPException(status_code=400, detail="Ticket must be reserved before booking")
        
    await db.tickets.update_one(
        {"ticket_id": ticket_id},
        {"$set": {"status": "BOOKED", "reserved_until": None}}
    )
    
    return {"message": "Ticket successfully booked"}

@router.put("/release/{ticket_id}")
async def release_ticket(ticket_id: str):
    ticket = await db.tickets.find_one({"ticket_id": ticket_id})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    await db.tickets.update_one(
        {"ticket_id": ticket_id},
        {"$set": {"status": "AVAILABLE", "user_id": None, "reserved_until": None}}
    )
    
    return {"message": "Ticket released back to available"}

@router.get("/recommended/{event_id}")
async def get_recommended_tickets(event_id: str):
    # Retrieve available tickets
    tickets_cursor = db.tickets.find({"event_id": event_id, "status": "AVAILABLE"}).limit(3)
    tickets = await tickets_cursor.to_list(length=3)
    return tickets

@router.get("/dashboard/stats")
async def get_dashboard_stats(event_id: str = None):
    pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    if event_id:
        pipeline.insert(0, {"$match": {"event_id": event_id}})
        
    stats_cursor = db.tickets.aggregate(pipeline)
    stats_list = await stats_cursor.to_list(length=10)
    
    result = {"AVAILABLE": 0, "PENDING": 0, "BOOKED": 0, "CANCELLED": 0}
    for stat in stats_list:
        if stat["_id"] in result:
            result[stat["_id"]] = stat["count"]
            
    return result
