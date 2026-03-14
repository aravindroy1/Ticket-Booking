import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")

client = AsyncIOMotorClient(MONGO_URL)
db = client.ticket_booking_db

async def init_indexes():
    # Ensure indexes for faster queries
    await db.tickets.create_index([("event_id", 1)])
    await db.tickets.create_index([("status", 1)])
    await db.tickets.create_index([("seat_number", 1)])
