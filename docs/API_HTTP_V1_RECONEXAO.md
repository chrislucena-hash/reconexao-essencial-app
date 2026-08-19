# API HTTP v1 - Reconexao Essencial

## Objetivo
Definir um contrato HTTP unico entre frontend e backend para evitar schema mismatch,
padronizar nomes de recursos e separar responsabilidades em `core`, `models`,
`schemas` e `api`.

## Convencoes globais
- Base path: `/api/v1`
- Content type: `application/json`
- Auth: `Authorization: Bearer <firebase-id-token>`
- Response envelope:

```json
{
  "data": {},
  "meta": {
    "requestId": "uuid",
    "schemaVersion": "2026-04-02"
  },
  "errors": []
}
```

- Error envelope:

```json
{
  "data": null,
  "meta": {
    "requestId": "uuid",
    "schemaVersion": "2026-04-02"
  },
  "errors": [
    {
      "code": "validation_error",
      "message": "Field email is required",
      "field": "email"
    }
  ]
}
```

## Regras para evitar mismatch
- O frontend deve enviar `snake_case` apenas se o backend exigir isso. Para o app
  atual, o contrato padrao sera `camelCase` em JSON.
- Perguntas de leitura devem usar `questionCode`, nunca indice do widget.
- O diario deve usar `restWindowLabel` para o campo de descanso curto do dia.
- O modulo de jejum deve usar `selectedWindowLabel` e `selectedWindowHours`.
- `OPTIONS` deve existir para todas as rotas versionadas.

## Recursos e metodos

### Auth e registro

| Metodo | Rota | Uso |
|---|---|---|
| `OPTIONS` | `/api/v1/auth/registration` | CORS e discovery |
| `POST` | `/api/v1/auth/registration` | Registrar perfil apos criacao/autenticacao no Firebase |
| `OPTIONS` | `/api/v1/auth/login` | CORS e discovery |
| `POST` | `/api/v1/auth/login` | Login por backend quando existir credencial proprietaria |
| `OPTIONS` | `/api/v1/auth/sync-user` | CORS e discovery |
| `POST` | `/api/v1/auth/sync-user` | Sincronizar `firebaseUid`, email e metadados |
| `OPTIONS` | `/api/v1/auth/me` | CORS e discovery |
| `GET` | `/api/v1/auth/me` | Ler usuario autenticado |
| `PATCH` | `/api/v1/auth/me` | Atualizar parcialmente perfil |
| `DELETE` | `/api/v1/auth/me` | Soft delete da conta |
| `OPTIONS` | `/api/v1/auth/password/reset` | CORS e discovery |
| `POST` | `/api/v1/auth/password/reset` | Disparar reset de senha |
| `OPTIONS` | `/api/v1/auth/consents` | CORS e discovery |
| `POST` | `/api/v1/auth/consents` | Criar aceite de termos/politica |
| `OPTIONS` | `/api/v1/auth/consents/{consentType}` | CORS e discovery |
| `GET` | `/api/v1/auth/consents/{consentType}` | Ler ultimo aceite |
| `PUT` | `/api/v1/auth/consents/{consentType}` | Substituir aceite atual |
| `PATCH` | `/api/v1/auth/consents/{consentType}` | Atualizar status/versao do aceite |

#### Request schema

```json
{
  "firebaseUid": "firebase-uid",
  "email": "user@example.com",
  "displayName": "Nome",
  "photoUrl": null,
  "phoneNumber": null,
  "provider": "password"
}
```

### Assessments

| Metodo | Rota | Uso |
|---|---|---|
| `OPTIONS` | `/api/v1/assessments/templates` | CORS e discovery |
| `GET` | `/api/v1/assessments/templates` | Listar templates ativos |
| `OPTIONS` | `/api/v1/assessments/templates/{slug}` | CORS e discovery |
| `GET` | `/api/v1/assessments/templates/{slug}` | Ler template e perguntas |
| `OPTIONS` | `/api/v1/assessments/submissions` | CORS e discovery |
| `POST` | `/api/v1/assessments/submissions` | Criar submissao |
| `OPTIONS` | `/api/v1/assessments/submissions/{submissionId}` | CORS e discovery |
| `GET` | `/api/v1/assessments/submissions/{submissionId}` | Ler submissao |
| `PUT` | `/api/v1/assessments/submissions/{submissionId}` | Substituir respostas do envio |
| `PATCH` | `/api/v1/assessments/submissions/{submissionId}` | Atualizar score/resultados |
| `DELETE` | `/api/v1/assessments/submissions/{submissionId}` | Remover envio invalido |

#### Request schema

```json
{
  "templateSlug": "leituradotemplo",
  "startedAt": "2026-04-02T12:00:00Z",
  "submittedAt": "2026-04-02T12:05:00Z",
  "answers": [
    {
      "questionCode": "inchaco_abdominal",
      "value": true
    }
  ]
}
```

### Journal

| Metodo | Rota | Uso |
|---|---|---|
| `OPTIONS` | `/api/v1/journal/entries` | CORS e discovery |
| `GET` | `/api/v1/journal/entries?date=YYYY-MM-DD` | Ler diario por data |
| `POST` | `/api/v1/journal/entries` | Criar diario |
| `OPTIONS` | `/api/v1/journal/entries/{entryId}` | CORS e discovery |
| `GET` | `/api/v1/journal/entries/{entryId}` | Ler diario por id |
| `PUT` | `/api/v1/journal/entries/{entryId}` | Substituir diario completo |
| `PATCH` | `/api/v1/journal/entries/{entryId}` | Atualizacao parcial |
| `DELETE` | `/api/v1/journal/entries/{entryId}` | Remover diario |

#### Request schema

```json
{
  "entryDate": "2026-04-02",
  "energyLevel": 7.5,
  "presenceLevel": 8.0,
  "waterIntakeLabel": "3 copos",
  "restWindowLabel": "6 horas",
  "meals": [
    {
      "mealType": "desjejum",
      "description": "frutas"
    }
  ],
  "reflections": {
    "emanacoesAlmaText": "texto",
    "sincronicidadesText": "texto"
  }
}
```

### Fasting

| Metodo | Rota | Uso |
|---|---|---|
| `OPTIONS` | `/api/v1/fasting/sessions` | CORS e discovery |
| `GET` | `/api/v1/fasting/sessions` | Historico do usuario |
| `POST` | `/api/v1/fasting/sessions` | Iniciar jejum |
| `OPTIONS` | `/api/v1/fasting/sessions/{sessionId}` | CORS e discovery |
| `GET` | `/api/v1/fasting/sessions/{sessionId}` | Ler sessao |
| `PUT` | `/api/v1/fasting/sessions/{sessionId}` | Substituir sessao completa |
| `PATCH` | `/api/v1/fasting/sessions/{sessionId}` | Finalizar ou interromper |
| `DELETE` | `/api/v1/fasting/sessions/{sessionId}` | Cancelar sessao |

#### Request schema

```json
{
  "selectedWindowLabel": "16h",
  "selectedWindowHours": 16,
  "startedAt": "2026-04-02T10:00:00Z",
  "status": "active",
  "source": "bussoladaalma"
}
```

### Autocura

| Metodo | Rota | Uso |
|---|---|---|
| `OPTIONS` | `/api/v1/autocura/programs` | CORS e discovery |
| `GET` | `/api/v1/autocura/programs` | Listar programas |
| `OPTIONS` | `/api/v1/autocura/programs/{programSlug}` | CORS e discovery |
| `GET` | `/api/v1/autocura/programs/{programSlug}` | Ler programa |
| `OPTIONS` | `/api/v1/autocura/programs/{programSlug}/contents` | CORS e discovery |
| `GET` | `/api/v1/autocura/programs/{programSlug}/contents` | Listar conteudos |
| `OPTIONS` | `/api/v1/autocura/sessions` | CORS e discovery |
| `GET` | `/api/v1/autocura/sessions` | Historico de sessoes |
| `POST` | `/api/v1/autocura/sessions` | Iniciar ritual |
| `OPTIONS` | `/api/v1/autocura/sessions/{sessionId}` | CORS e discovery |
| `GET` | `/api/v1/autocura/sessions/{sessionId}` | Ler sessao |
| `PUT` | `/api/v1/autocura/sessions/{sessionId}` | Substituir sessao |
| `PATCH` | `/api/v1/autocura/sessions/{sessionId}` | Finalizar ou interromper |
| `DELETE` | `/api/v1/autocura/sessions/{sessionId}` | Remover sessao |

#### Request schema

```json
{
  "programSlug": "purificacao-do-templo-sagrado",
  "contentSlug": "guia-pela-voz-da-alma",
  "startedAt": "2026-04-02T13:00:00Z",
  "completed": false,
  "interruptionReason": null
}
```

### Progress e evolucao

| Metodo | Rota | Uso |
|---|---|---|
| `OPTIONS` | `/api/v1/progress/modules` | CORS e discovery |
| `GET` | `/api/v1/progress/modules` | Ler progresso |
| `OPTIONS` | `/api/v1/progress/modules/{moduleSlug}` | CORS e discovery |
| `PUT` | `/api/v1/progress/modules/{moduleSlug}` | Substituir progresso |
| `PATCH` | `/api/v1/progress/modules/{moduleSlug}` | Atualizar progresso |
| `DELETE` | `/api/v1/progress/modules/{moduleSlug}` | Resetar progresso |
| `OPTIONS` | `/api/v1/evolucao/series` | CORS e discovery |
| `GET` | `/api/v1/evolucao/series` | Serie historica para graficos |
| `OPTIONS` | `/api/v1/evolucao/snapshots` | CORS e discovery |
| `POST` | `/api/v1/evolucao/snapshots` | Criar snapshot |
| `OPTIONS` | `/api/v1/evolucao/snapshots/{snapshotId}` | CORS e discovery |
| `PUT` | `/api/v1/evolucao/snapshots/{snapshotId}` | Substituir snapshot |
| `PATCH` | `/api/v1/evolucao/snapshots/{snapshotId}` | Atualizar snapshot |
| `DELETE` | `/api/v1/evolucao/snapshots/{snapshotId}` | Remover snapshot |

## Estrutura recomendada

### Frontend Flutter

```text
lib/backend/
  core/
  models/
  schemas/
  api/
```

### Backend Firebase Functions

```text
firebase/functions/src/
  core/
  models/
  schemas/
  api/v1/
```

## Ordem sugerida de implementacao
1. `auth`
2. `assessments`
3. `journal`
4. `fasting`
5. `autocura`
6. `progress` e `evolucao`
