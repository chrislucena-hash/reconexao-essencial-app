# Reconexão Essencial

Monorepo da aplicação, separado por responsabilidade:

- `frontend/`: aplicação React/Vite, servidor intermediário atual e projetos Capacitor iOS/Android.
- `backend/`: contratos, regras e futura implementação FastAPI recuperada da VPS.

## Frontend

```bash
cd frontend
npm install
npm run lint
npm run build
```

O `server.ts` ainda é o servidor intermediário usado pelas rotas de IA do frontend. Ele será substituído ou isolado quando o backend FastAPI for recuperado.

## Backend

Os documentos de contrato e migração estão em `backend/`. A implementação FastAPI será restaurada da VPS na próxima etapa.

Credenciais locais, certificados e arquivos de ambiente não devem ser versionados.
