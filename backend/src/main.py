from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Welcome to your sheep farm API!"}

@app.get("/sheep")
def get_sheep():
    return ["Dolly", "Shaun", "Bella"]

@app.get("/sheep/{sheep_id}")
def get_sheep_by_id(sheep_id: int):
    return {"id": sheep_id, "name": "Test Sheep"}
