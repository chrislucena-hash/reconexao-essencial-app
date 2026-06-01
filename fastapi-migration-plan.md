# Plano de Migração para REST API em FastAPI (Python)

Este documento descreve a arquitetura proposta e o contrato de dados para a migração do backend atual (Serverless/Firebase direto no front-end) para uma arquitetura RESTful baseada em **FastAPI** utilizando Python.

## Status de implementação

O backend oficial está em `../reconexao-essencial-backend/backend_fastapi`. Este frontend sincroniza identidade em `/api/v1/auth/sync-user`, aceite em `/api/v1/auth/consents` e a projeção compatível do diário em `/api/v1/journal/entries` quando `VITE_API_URL` estiver configurada. Os campos React que não existem no contrato da API continuam persistidos pelo Firebase atual.

## 1. Arquitetura Proposta

*   **Framework Web:** FastAPI (Python 3.10+)
*   **Autenticação:** Firebase Auth (Validação de Token via `firebase-admin` no backend).
*   **Banco de Dados:** O backend consumirá o Firestore via pacote `firebase-admin` em Python, ou servirá como ponte para um novo banco de dados (ex: PostgreSQL com SQLAlchemy).
*   **Inteligência Artificial:** O backend fará as chamadas para a API do Gemini utilizando o SDK do Google GenAI para Python (`google-genai`).

---

## 2. Estratégia de Autenticação (Bearer Token)

No front-end, o login continua sendo feito via SDK do Firebase. Porém, para acessar o backend em FastAPI, será necessário enviar o **ID Token** do Firebase.

**Cabeçalho da Requisição:**
```http
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

**FastAPI Dependency (Exemplo Numérico):**
```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth

security = HTTPBearer()

def get_current_user(cred: HTTPAuthorizationCredentials = Depends(security)):
    try:
        decoded_token = auth.verify_id_token(cred.credentials)
        return decoded_token # Contém o uid, email, etc.
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")
```

---

## 3. Mapeamento de Rotas (Endpoints REST)

Prefixo base sugerido: `/api/v1`

### 👤 Usuários e Log de Evolução (`/api/v1/users`)

| Método | Rota | Descrição | Permissão |
| :--- | :--- | :--- | :--- |
| `GET` | `/users/me` | Retorna o perfil do usuário logado. | Dono |
| `PUT` | `/users/me` | Atualiza dados do perfil (hasSeenWarning, isOnPath, etc). | Dono |
| `GET` | `/users/{user_id}` | Retorna o perfil de um usuário específico. | Admin |
| `GET` | `/users/me/logs` | Lista os logs diários de reflexão. | Dono |
| `POST` | `/users/me/logs` | Cria um novo log diário (salva data, energia, nível de consciência). | Dono |
| `GET` | `/users/me/journey` | Retorna o status da jornada atual (ex: Desafio de 21 dias). | Dono |
| `POST` | `/users/me/journey` | Atualiza o progresso da jornada. | Dono |

### 🌐 Comunidade / Feed (`/api/v1/posts`)

| Método | Rota | Descrição | Permissão |
| :--- | :--- | :--- | :--- |
| `GET` | `/posts` | Lista posts do feed (paginado). | Qualquer Authenticado |
| `POST` | `/posts` | Cria num novo post. *Passa por moderação de IA antes de salvar.* | Qualquer Authenticado |
| `GET` | `/posts/{post_id}` | Obtém detalhes de um post (incluindo comentários associados). | Qualquer Authenticado |
| `DELETE` | `/posts/{post_id}` | Exclui um post. | Dono ou Admin |
| `POST` | `/posts/{post_id}/like` | Adiciona/Remove curtida (Toggle) de um post. | Qualquer Authenticado |
| `POST` | `/posts/{post_id}/comments` | Adiciona um comentário a um post. | Qualquer Authenticado |
| `DELETE`| `/posts/{post_id}/comments/{id}` | Exclui um comentário. | Dono do comentário / Admin |

### 🧠 Inteligência Artificial & Serviços (`/api/v1/ai`)

Toda a lógica de negócio do Gemini sai do front-end (`geminiService.ts`) e passa a ser rotas do FastAPI, removendo o fardo computacional e a lógica de prompt do cliente.

| Método | Rota | Descrição (Payload SDK Gemini) |
| :--- | :--- | :--- |
| `GET` | `/ai/insight/daily` | Retorna um insight diário, reflexão e exercício de bioenergética (geração de texto e conversão estruturada em JSON). |
| `POST` | `/ai/insight/journey` | Envia os últimos 5 logs no corpo da requisição e recebe uma análise evolutiva profunda da alma. |
| `GET` | `/ai/recipes/daily` | Solicita planos nutricionais diários limpos (sem glúten/lactose). |
| `GET` | `/ai/recipes/fermentation`| Retorna receitas curativas (Kefir, Kombucha). |
| `GET` | `/ai/purification` | Retorna dicas naturais de purificação do corpo. |
| `POST` | `/ai/recipes/alchemist` | Envia uma lista de `{ ingredients: [...] }` e recebe uma receita curativa compatível. |
| `POST` | `/ai/moderation` | Envia um texto base `{ content: string }`. A rota valida utilizando IA se não é discurso de ódio. Utilizada internamente pela rota `POST /posts`. |
| `POST` | `/ai/generate-audio` | (TTS) Converte um texto de reflexão em um Blob de áudio/MP3 e devolve para o cliente. |
| `GET` | `/ai/generate-cover` | Gera variação de imagem (capas atmosféricas e místicas) devolvendo a URL final gerada pelo Gemini 2.5 Image. |

---

## 4. Modelagem de Dados no Backend (Pydantic)

O FastAPI usa **Pydantic** para validar a entrada e saída das requisições, eliminando dados errados antes mesmo da verificação de autorização total.

Exemplo de schema para o Log Diário:

```python
from pydantic import BaseModel, Field
from typing import Optional, Dict

class DailyLogCreate(BaseModel):
    date: str = Field(..., description="Data no formato YYYY-MM-DD")
    reflection: Optional[str] = None
    energyLevel: Optional[int] = Field(None, ge=1, le=5)
    awarenessLevel: Optional[int] = Field(None, ge=1, le=5)
    completedActions: Optional[Dict[str, bool]] = None

class PostCreate(BaseModel):
    content: str = Field(..., max_length=2000)
    avatar: Optional[str] = None
```

## 5. Passos Sugeridos para a Migração

1. **Configurar o Repositório FastAPI:** Inicializar estrutura (`main.py`, pasta `routers`, pasta `models`, pasta `services`).
2. **Setup do Firebase Admin:** Baixar do Console do Firebase (Project settings > Service accounts) o arquivo JSON de credenciais para que o Python se comunique com sua estrutura atual (`admin.credential.cert`).
3. **Migrar Regras de Segurança:** Transferir a validação dos papéis e restrições que hoje ficam no `firestore.rules` para *Dependências (Dependencies)* do FastAPI.
4. **Endpoint por Endpoint:** Começar pelas rotas mais simples (`/api/v1/users/me`), migrar o feed, e por último realizar a conversão das rotas de IA (Gemini API Toolkit).
5. **Ajuste no Front-end (React):** O arquivo atual `firebase.ts` continuará existindo para cuidar do Auth, e os serviços no cliente (como `geminiService.ts`) serão substituídos por chamadas HTTP `fetch` ou `axios` consumindo a nova API.
