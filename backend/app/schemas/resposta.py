from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    app: str
    version: str
    environment: str


class DBHealthResponse(BaseModel):
    status: str
    database: str
