from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserProfileUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=99)
    email: EmailStr | None = None
    phone: str | None = None
    startDate: str | None = None
    awakeningScore: float | None = None
    hasSeenWarning: bool | None = None
    hasAcceptedTerms: bool | None = None
    isOnPath: bool | None = None
    favoriteActivities: list[str] | None = None

    model_config = ConfigDict(extra="forbid")


class UserProfile(UserProfileUpdate):
    name: str
    startDate: str | None = None
    awakeningScore: float = 0
    hasSeenWarning: bool
    hasAcceptedTerms: bool
    isOnPath: bool
    role: Literal["admin", "client"] = "client"


class SpiritualPractices(BaseModel):
    morning: str
    afternoon: str
    evening: str


class FoodRecord(BaseModel):
    breakfast: str
    lunch: str
    dinner: str
    snacks: str
    waterGlasses: int
    fastingHours: int | None = None


class DailyLog(BaseModel):
    date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    spiritualPractices: SpiritualPractices
    reflection: str
    energyLevel: int = Field(ge=1, le=5)
    awarenessLevel: int = Field(ge=1, le=5)
    synchronicities: str | None = None
    shadowObservations: str | None = None
    foodRecord: FoodRecord | None = None
    completedActions: dict[str, bool]

    model_config = ConfigDict(extra="forbid")
