from datetime import datetime
import unicodedata
from uuid import uuid4

from app.models.assessments import AssessmentAnswer, AssessmentQuestion, AssessmentSubmission, AssessmentTemplate

_TEMPLATES: dict[str, AssessmentTemplate] = {}
_SUBMISSIONS: dict[str, AssessmentSubmission] = {}


def load_seed_templates() -> None:
    if _TEMPLATES:
        return

    templo_questions = [
        "Inchaço abdominal tipo \"balão\" (agudo após comer)",
        "Dores abdominais, gases excessivos ou cólicas intestinais",
        "Prisão de ventre (constiparção), diarréia ou fezes com odor forte",
        "Náuseas recorrentes ou queimação no estômago",
        "Refluxo persistente, esofagite ou queimação no esôfago",
        "Dores de cabeça persistentes ou enxaquecas frequentes",
        "Névoa mental (Brain Fog): confusão, falta de foco e memória",
        "Irritabilidade inexplicável, mudanças bruscas de humor ou ansiedade pós refeição",
        "Tonturas, desequilíbrio ou episódios de vertigem",
        "Dormência ou formigamento nas mãos e pés (Neuropatia)",
        "Dores articulares (juntas) e rigidez matinal",
        "Dores musculares difusas ou sensação de \"corpo surrado\"",
        "Infecções frequentes (gripes, candidíase ou cistites de repetição)",
        "Aftas recorrentes na boca ou gengivas sensíveis",
        "Problemas de pele persistentes (eczema, dermatite ou coceira)",
        "Fadiga extrema (cansaço que não passa com o sono)",
        "Anemia por deficiência de ferro (que não melhora com suplementos)",
    ]
    alma_questions = [
        "Apego ao passado: Dificuldade em desapegar de situações ou pessoas (A \"cola\" emocional)",
        "Resistência ao Fluxo: Necessidade de controle excessivo sobre a vida",
        "Fragmentação: Sensação de estar desconectado da própria verdade",
        "Densidade: Sentir a vida \"pesada\" e sem brilho criativo",
        "Filtro Obstruído: Dificuldade em receber mensagens de intuição",
        "Ego Rígido: Inflexibilidade mental diante de novas idéias",
    ]

    _TEMPLATES["leituradotemplo"] = AssessmentTemplate(
        id=str(uuid4()),
        slug="leituradotemplo",
        title="Leitura do Templo",
        description="Sinais do templo fisico baseados no checklist atual do frontend.",
        category="templo",
        is_active=True,
        questions=[
            AssessmentQuestion(
                id=str(uuid4()),
                code=_slugify_question(text),
                question_text=text,
                question_type="boolean",
                sort_order=index,
            )
            for index, text in enumerate(templo_questions, start=1)
        ],
    )
    _TEMPLATES["leituradaalma"] = AssessmentTemplate(
        id=str(uuid4()),
        slug="leituradaalma",
        title="Leitura da Alma",
        description="Sinais da alma baseados nos checkboxes atuais do frontend.",
        category="alma",
        is_active=True,
        questions=[
            AssessmentQuestion(
                id=str(uuid4()),
                code=_slugify_question(text),
                question_text=text,
                question_type="boolean",
                sort_order=index,
            )
            for index, text in enumerate(alma_questions, start=1)
        ],
    )


def list_templates() -> list[AssessmentTemplate]:
    load_seed_templates()
    return list(_TEMPLATES.values())


def get_template_by_slug(slug: str) -> AssessmentTemplate | None:
    load_seed_templates()
    return _TEMPLATES.get(slug)


def create_submission(
    *,
    user_id: str,
    template_slug: str,
    started_at: datetime | None,
    submitted_at: datetime,
    answers: list[AssessmentAnswer],
    score: float | None,
    result_level: str | None,
) -> AssessmentSubmission:
    submission = AssessmentSubmission(
        id=str(uuid4()),
        user_id=user_id,
        template_slug=template_slug,
        started_at=started_at,
        submitted_at=submitted_at,
        answers=answers,
        score=score,
        result_level=result_level,
    )
    _SUBMISSIONS[submission.id] = submission
    return submission


def get_submission(submission_id: str) -> AssessmentSubmission | None:
    return _SUBMISSIONS.get(submission_id)


def update_submission(
    submission_id: str,
    *,
    started_at: datetime | None,
    submitted_at: datetime,
    answers: list[AssessmentAnswer],
    score: float | None,
    result_level: str | None,
) -> AssessmentSubmission | None:
    submission = _SUBMISSIONS.get(submission_id)
    if submission is None:
        return None
    submission.started_at = started_at
    submission.submitted_at = submitted_at
    submission.answers = answers
    submission.score = score
    submission.result_level = result_level
    return submission


def delete_submission(submission_id: str) -> bool:
    return _SUBMISSIONS.pop(submission_id, None) is not None


def _slugify_question(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    allowed = "".join(char.lower() if char.isalnum() else "_" for char in normalized)
    compact = "_".join(part for part in allowed.split("_") if part)
    return compact[:80]
