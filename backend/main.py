from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio

from routes.tickets import router as tickets_router
from database import init_indexes

app = FastAPI(title="Ticket Booking Service API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tickets_router, prefix="/tickets", tags=["Tickets"])

@app.on_event("startup")
async def startup_event():
    await init_indexes()

@app.get("/")
def read_root():
    return {"message": "Welcome to the Ticket Management Service API"}
