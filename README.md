<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Reconexao Essencial

O frontend React usa Firebase para o modelo completo atual e pode sincronizar os
recursos compativeis com a API FastAPI oficial clonada ao lado deste projeto em
`../reconexao-essencial-backend/backend_fastapi`.

View your app in AI Studio: https://ai.studio/apps/0a1cfe0f-6450-46ad-8e17-b4f70d5c2672

## Rodar somente o frontend

Requisitos: Node.js.

1. Instale as dependencias:
   `npm install`
2. Crie `.env.local` a partir de `.env.example` e defina `GEMINI_API_KEY`.
3. Inicie a aplicacao:
   `npm run dev`

Sem `VITE_API_URL`, as gravacoes continuam sendo feitas somente pelo SDK do Firebase.

## Conectar frontend e backend

Requisitos: Node.js, Python 3.10+ e o repositorio oficial
`../reconexao-essencial-backend`, clonado de
`https://github.com/kaikolimpio/reconexao-essencial-backend.git`.

1. Instale o backend oficial:
   `python -m pip install -r ../reconexao-essencial-backend/backend_fastapi/requirements.txt`
2. Para testar o Firebase Auth real, crie
   `../reconexao-essencial-backend/backend_fastapi/.env` com o projeto e uma
   credencial Firebase Admin local ignorada pelo Git:
   `FIREBASE_PROJECT_ID=gen-lang-client-0934798565`
   `FIREBASE_CREDENTIALS_PATH=firebase-admin.local.json`
   `ALLOW_INSECURE_DEV_AUTH=false`
3. Em `.env.local`, defina:
   `VITE_API_URL=http://127.0.0.1:8000`
   Para um teste sem Firebase real, `VITE_API_DEV_TOKEN=dev-token` pode ser usado
   somente se o backend também estiver em `ALLOW_INSECURE_DEV_AUTH=true`.
4. Em um terminal, inicie a API:
   `npm run backend`
5. Em outro terminal, inicie o frontend:
   `npm run dev`

A API oficial expoe `GET /health`, `POST /api/v1/auth/sync-user`,
`POST /api/v1/auth/consents`, `POST /api/v1/journal/entries`,
`PUT /api/v1/progress/modules/jornada-21-dias` e
`POST/PUT /api/v1/fasting/sessions`. Fora do modo de teste local, o frontend
envia automaticamente o token Firebase apos o login.

Nesta etapa, identidade, aceite do aviso, projecao compativel do diario, progresso
da jornada e sessoes de jejum sao sincronizados com o FastAPI. O modelo completo
do perfil/diario e o feed comunitario continuam na integracao Firebase existente.
As telas de avaliacao, autocura e evolucao ainda nao enviam dados para suas rotas.

O backend oficial atual utiliza repositorios em memoria para os endpoints da API;
os dados enviados a ele deixam de existir quando o processo reinicia. A persistencia
definitiva dessas rotas ainda precisa ser ligada ao Firestore ou outro banco.

`GEMINI_API_KEY` e necessaria para guia, audio, imagem e moderacao. Como a SDK e
chamada pelo frontend hoje, a configuracao segura de producao exige mover essas
chamadas para o backend antes de publicar uma chave real.

## Android - teste fechado

A versao React pode ser empacotada para Android com Capacitor, preservando o
identificador `com.reconexaoessencial` e usando a API publica em producao:

```powershell
npm run android:sync
npm run android:bundle
```

Para gerar um `.aab` aceito na Play Store, instale Android Studio/SDK e JDK e
configure a upload key em `android/key.properties`. Consulte
`PLAY-STORE-TESTE-FECHADO.md` para o formato e os cuidados ao atualizar um app
que ja existe no Console.

## iPhone e iPad - App Store

O frontend agora aplica safe areas e layout responsivo para os formatos oficiais
de screenshot de iPhone e iPad. A plataforma iOS pode ser sincronizada em um Mac:

```bash
npm run ios:sync
npm run ios:open
```

Consulte `APP-STORE-IOS-RESOLUCOES.md` para a matriz de resolucoes, configuracao
do App Store Connect e a origem Capacitor que precisa ser autorizada na API.
