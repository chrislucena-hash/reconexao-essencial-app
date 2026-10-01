# Schema Alignment Audit

## Mismatches encontrados no frontend atual

### 1. Jejum do diario conflita com jejum do modulo bussola
- O diario usa valores como `3 horas`, `4 horas`, `8 horas ou mais`.
- A bussola usa rotulos de jejum `12h`, `14h`, `16h`, `18h`, `24h`.
- Se ambos forem mapeados para o mesmo campo backend, o schema quebra.
- Solucao: manter dois campos distintos:
  - `restWindowLabel` em `journal_entries`
  - `selectedWindowLabel` e `selectedWindowHours` em `fasting_sessions`

### 2. Dropdown da bussola usa labels corretos, mas values errados
- O widget mostra `12h`, `14h`, `16h`, `18h`, `24h`.
- Os `options` reais estao como `Option 1`, `Option 2`, `Option 3`, `3`, `4`.
- Se o app enviar o valor cru do dropdown, o backend nao vai receber a janela correta.
- Solucao: normalizar o valor enviado para os mesmos labels exibidos.

### 3. Registro nao existe na UX atual
- O app atual implementa login por email/senha via Firebase.
- Nao existe tela clara de cadastro de conta no fluxo principal.
- Solucao: o backend pode expor `POST /api/v1/auth/registration`, mas o frontend
  precisa de tela/acao dedicada antes de usar a rota.

### 4. Consentimento existe visualmente, mas nao esta acoplado ao backend
- A tela de termos possui checkbox, mas o fluxo atual segue viagem pela UI.
- Sem persistencia de aceite, `user_consents` fica defasado.
- Solucao: bloquear avancar sem aceite valido e disparar `POST/PUT /auth/consents`.

### 5. Leituras usam checkbox booleano, nao escala nem texto
- `leituradotemplo` tem 17 perguntas booleanas.
- `leituradaalma` tem 6 perguntas booleanas.
- O backend nao deve exigir `numericValue` ou `textValue` para esses templates.
- Solucao: receber `answers[].value` booleano e calcular score no servidor.

### 6. Conteudo de autocura esta hardcoded nas telas
- Titulos, textos e instrucoes do ritual estao estaticos no widget.
- Se o backend passar slugs/conteudos diferentes, o frontend pode divergir.
- Solucao: migrar textos fixos para `autocura_programs` e `autocura_contents`.

## Decisoes consolidadas
- Padrao JSON: `camelCase`
- Identificador estavel de pergunta: `questionCode`
- Identificador estavel de programa/conteudo: `slug`
- Envelope unico de resposta: `data`, `meta`, `errors`
- `OPTIONS` obrigatorio para todas as rotas versionadas
