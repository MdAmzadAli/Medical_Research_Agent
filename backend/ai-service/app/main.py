from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# from app.routes.ai_routes import router as ai_router
# from app.routes.ai_routes_test import router as ai_router_test
from app.routes.ai_routers_rag import router as ai_router_test
app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# register routes
app.include_router(ai_router_test)

@app.get("/health")
def root():
    return {"message": "AI Service Running 🚀"}