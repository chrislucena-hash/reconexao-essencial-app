# Backend

Esta pasta contém a implementação FastAPI oficial da Reconexão Essencial, recuperada da VPS.

Os contratos atuais estão em:

- `backend-routes.md`
- `fastapi-migration-plan.md`
- `firebase-blueprint.json`
- `firestore.rules`

O código está em `backend/fastapi/`. Ele valida o Firebase ID Token e expõe as rotas em `/api/v1`. Os repositórios atuais ainda são mantidos em memória; a persistência durável e a integração final com o frontend serão tratadas na próxima etapa.
