# Backend FastAPI

Backend modular do Reconexao Essencial, espelhado no frontend atual para reduzir
risco de schema mismatch.

## Estrutura

```text
backend_fastapi/
  app/
    api/
      v1/
        routes/
    core/
    models/
    repositories/
    schemas/
    services/
    main.py
  .env.example
  requirements.txt
```

## Principios

- JSON em `camelCase`
- validação forte com Pydantic
- autenticação Bearer por Firebase no backend
- serviços curtos e responsabilidades separadas
- repositórios isolados para facilitar troca por banco real depois

## Execução local

```bash
cd backend/fastapi
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:create_app --factory --reload
```

## Autenticação

Por padrão, o backend exige Bearer token e não permite bypass inseguro.

Para desenvolvimento local apenas, você pode ativar:

```env
ALLOW_INSECURE_DEV_AUTH=true
DEV_AUTH_TOKEN=dev-token
```

Depois use:

```text
Authorization: Bearer dev-token
```
