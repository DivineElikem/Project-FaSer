from fastapi import FastAPI
from .database import engine, Base
from .routers import users, camera, logs
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import PlainTextResponse
import logging
from fastapi.staticfiles import StaticFiles



Base.metadata.create_all(bind=engine)
app = FastAPI(title="Door Access Control API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(camera.router, prefix="/camera", tags=["camera"])
app.include_router(logs.router, prefix="/logs", tags=["logs"])

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    logging.error(f"Request validation error: {exc!s}")
    return PlainTextResponse(str(exc), status_code=400)




app.mount("/media/faces", StaticFiles(directory="/home/adeny/Documents/codes/Project-FaSer/app/media/faces"), name="faces")