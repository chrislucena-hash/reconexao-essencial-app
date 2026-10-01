from fastapi import APIRouter

from app.api.v1.routes import assessments, auth, autocura, consents, evolucao, fasting, journal, progress

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(consents.router)
api_router.include_router(assessments.router)
api_router.include_router(journal.router)
api_router.include_router(fasting.router)
api_router.include_router(autocura.router)
api_router.include_router(progress.router)
api_router.include_router(evolucao.router)
