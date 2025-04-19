import os
from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# load the URL from the .env file
DATABASE_URL = os.getenv("DATABASE_URL")

# create the engine to connect to the database
engine = create_engine(DATABASE_URL)

# how to talk to the DB in the routes
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# define models
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
