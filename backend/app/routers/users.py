from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from ..auth import get_current_user
from ..firebase_client import get_db
from ..schemas import DailyLog, UserProfile, UserProfileUpdate

router = APIRouter(prefix="/users", tags=["users"])


def default_profile(user: dict) -> dict:
    return {
        "name": "Buscador",
        "email": user.get("email"),
        "startDate": None,
        "awakeningScore": 0,
        "hasSeenWarning": False,
        "hasAcceptedTerms": False,
        "isOnPath": False,
        "role": "client",
    }


@router.get("/me", response_model=UserProfile)
def read_my_profile(user: Annotated[dict, Depends(get_current_user)]) -> dict:
    snapshot = get_db().collection("users").document(user["uid"]).get()
    if not snapshot.exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Perfil nao encontrado.")
    return snapshot.to_dict()


@router.put("/me", response_model=UserProfile)
def update_my_profile(
    updates: UserProfileUpdate,
    user: Annotated[dict, Depends(get_current_user)],
) -> dict:
    user_ref = get_db().collection("users").document(user["uid"])
    snapshot = user_ref.get()
    current = snapshot.to_dict() if snapshot.exists else default_profile(user)
    payload = updates.model_dump(exclude_unset=True)

    profile = {**current, **payload}
    profile["role"] = current.get("role", "client")
    user_ref.set(profile)
    return profile


@router.get("/me/logs", response_model=list[DailyLog])
def read_my_logs(user: Annotated[dict, Depends(get_current_user)]) -> list[dict]:
    query = (
        get_db()
        .collection("users")
        .document(user["uid"])
        .collection("logs")
        .order_by("date", direction="DESCENDING")
        .limit(30)
    )
    return [snapshot.to_dict() for snapshot in query.stream()]


@router.put("/me/logs/{log_date}", response_model=DailyLog)
def save_my_log(
    log_date: str,
    log: DailyLog,
    user: Annotated[dict, Depends(get_current_user)],
) -> DailyLog:
    if log_date != log.date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A data da URL precisa ser igual a data do registro.",
        )

    (
        get_db()
        .collection("users")
        .document(user["uid"])
        .collection("logs")
        .document(log.date)
        .set(log.model_dump())
    )
    return log
