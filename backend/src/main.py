from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# Our mock database (in-memory list for now)
sheep_db = []

# Pydantic model for input validation
class Sheep(BaseModel):
    name: str
    age: int
    milk: float

@app.get("/")
def read_root():
    return {"message": "Welcome to your sheep farm API!"}

@app.get("/sheep")
def get_sheep():
    return sheep_db

@app.post("/sheep")
def create_sheep(sheep: Sheep):
    sheep_db.append(sheep)
    return {"message": f"Sheep {sheep.name} added successfully!"}
