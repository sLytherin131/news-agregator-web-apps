from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import news, users, issues, bookmarks, reading_history
import os
# os.environ["HF_HOME"] = "G:/huggingface_cache" # Removed for production

app = FastAPI(title="Diberita API", description="Backend for News Bias Detection")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(news.router)
app.include_router(users.router)
app.include_router(issues.router)
app.include_router(bookmarks.router)
app.include_router(reading_history.router)

@app.get("/")
async def root():
    return {"message": "Diberita API is running"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)