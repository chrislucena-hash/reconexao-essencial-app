# Reenvio ao Google Play: Reconexão Essencial

## Declaração de apps de saúde

Em **Política → Conteúdo do app → Apps de saúde**, declare as funções da versão enviada:

- **Controle de estresse, relaxamento e acuidade mental**: meditação, respiração e relaxamento guiados. Esta é a categoria explicitamente solicitada na rejeição.
- **Controle do sono**: há uma prática de relaxamento antes de dormir.
- **Controle de nutrição e peso**: o diário registra refeições e o Guia oferece receitas e informações gerais de alimentação; a categoria também abrange registro de consumo alimentar, mesmo sem metas de peso.
- **Educação e referências médicas**: o Guia contém informações sobre doença celíaca e exames para conversar com profissionais.

Confira todas as outras opções disponíveis antes de salvar. Não marque "Meu app não tem recursos de saúde". A declaração deve refletir a versão distribuída e todas as fichas de loja. Referência: [Ajuda do Play Console](https://support.google.com/googleplay/android-developer/answer/14738291?hl=pt-BR).

## Identidade do app

O nome instalado em Android é **Reconexão Essencial**, com pacote `com.reconexaoessencial`. Use esse mesmo nome em todas as fichas e traduções. O ícone da ficha deve usar [o PNG de 512 × 512](../assets/play-store/icon-512.png), derivado da mesma marca usada nos ícones nativos. Confira também fichas personalizadas, capturas de tela e a versão instalada do novo pacote. A imagem citada na rejeição, `LAUNCHER_ICON-6296.png`, não acompanha o texto recebido aqui; compare-a no Play Console.

## Descrição sugerida para a ficha principal

**Título:** Reconexão Essencial

**Descrição curta:** Diário, meditação e práticas de autoconhecimento no seu ritmo.

**Descrição completa:**

> Reconexão Essencial é um espaço de autoconhecimento e reflexão. Registre suas percepções no diário, acompanhe sua jornada pessoal e explore práticas guiadas de meditação, respiração e relaxamento, inclusive uma opção para o momento de dormir.
>
> O app também reúne receitas e informações gerais sobre alimentação. O questionário permite registrar sinais percebidos, sem identificar suas causas ou diagnosticar sensibilidades alimentares.
>
> O app não é um dispositivo médico e não diagnostica, trata, cura ou previne nenhuma condição médica. Consulte um profissional de saúde para orientações médicas, diagnóstico ou tratamento. Não altere sua dieta com base nos registros do app.

Se houver ficha em inglês, mantenha o título **Reconexão Essencial** e traduza as descrições preservando os mesmos limites e recursos reais. Revise capturas de tela e textos de todas as fichas após atualizar o app.

**A rejeição cita especificamente uma descrição completa em inglês ainda publicada no Play Console**, com “Essential Reconnection”, “healing”, “Temple Reading” e “Self-Healing”. A descrição em português acima não substitui essa ficha. Atualize a ficha em inglês e todas as fichas personalizadas ou traduções que ainda repitam esses termos.

**Descrição curta sugerida em inglês:** Journaling, meditation and self-reflection at your own pace.

**Descrição completa sugerida em inglês:**

> Reconexão Essencial is a space for self-reflection. Write in a personal journal, follow your journey, and explore guided meditation, breathing and relaxation practices, including an exercise for bedtime.
>
> The app also offers recipes and general information about food. A questionnaire lets you record sensations and symptoms you notice. It does not identify their causes, diagnose food sensitivities or measure health.
>
> This app is not a medical device and does not diagnose, treat, cure or prevent medical conditions. Seek qualified professional advice for health concerns, diagnosis or treatment. Do not change your diet based on records in the app.

## Antes de enviar à revisão

1. Use `android/` da raiz para gerar a release; `frontend/android/` contém artefatos locais e não é a fonte do CI.
2. Gere um AAB assinado com a chave de upload cadastrada e `versionCode` maior que o último enviado. O workflow recebe esse número em `version_code`.
3. Instale a nova versão em uma faixa de testes e confira nome e ícone no launcher, inclusive o ícone redondo/adaptativo. Confira também o link de solicitação de exclusão de conta em **Configurações**.
4. Atualize declaração, título, ícone e descrições no Play Console. Confirme a política de privacidade pública e no app, conforme [política de saúde](https://support.google.com/googleplay/android-developer/answer/16679511?hl=pt-BR). A página pública atualmente vinculada no app é a [política no Notion](https://www.notion.so/POL-TICA-DE-PRIVACIDADE-APP-RECONEX-O-ESSENCIAL-31eb9d89692a801e947efdd664aaa46d). Revise nela a descrição de dados coletados, uso, compartilhamento, retenção e exclusão, e informe no formulário de segurança dos dados um [recurso web para solicitar exclusão da conta](https://support.google.com/googleplay/android-developer/answer/13327111?hl=pt-BR). A solicitação por e-mail precisa ser atendida pela equipe, inclusive quanto aos dados associados à conta.
5. Envie as mudanças para revisão em **Visão geral da publicação**.

Antes do passo 5, valide a política e **Segurança dos dados** contra o funcionamento real: o app usa Firebase Authentication/Firestore, sincroniza perfil e diário com o backend e permite publicações, comentários e foto de perfil na comunidade. A política pública atual é breve e não explica claramente provedores, retenção e o procedimento de exclusão desses registros. A opção de Configurações apenas abre um pedido por e-mail; a equipe ainda precisa executar e confirmar a exclusão dos dados em todos os serviços aplicáveis. Uma URL pública que abre normalmente não basta para confirmar essas declarações.

### Artefato anterior preparado em 24/09/2026

- Branch: `codex/android-play-policy-20260924`.
- Workflow `android-release.yml`: AAB assinado com `versionCode` 6 e pacote `com.reconexaoessencial`. O certificado de assinatura coincide com o do AAB anterior gerado pelo CI, de `versionCode` 5.
- Antes de carregar o AAB, compare o número 6 com o maior `versionCode` já enviado ao Play Console. O histórico de uploads no Play Console não pôde ser verificado pelo repositório.
- O manifesto e os recursos do AAB registram **Reconexão Essencial**; os ícones nativos foram comparados com os arquivos fonte. A instalação e inspeção visual no launcher ainda exigem uma faixa de testes e um dispositivo Android.
- A captura `LAUNCHER_ICON-6296.png` mencionada pelo Google não estava no texto encaminhado; sem ela ou acesso à ficha atual do Play Console, a identidade visual publicada não pode ser comparada ao ícone instalado.
- O AAB de `versionCode` 6 não contém os ajustes de texto de 25/09/2026. Use um novo AAB gerado a partir da revisão mais recente, com código superior ao maior já enviado ao Play Console.

### Novo candidato em 25/09/2026

- A [execução 36137312685 do CI](https://github.com/chrislucena-hash/reconexao-essencial-app/actions/runs/36137312685) gerou um AAB assinado com `versionCode` 7 a partir do commit `754cdac`.
- O AAB está em `android/app/build/outputs/bundle/release/reconexao-essencial-v7.aab` neste workspace; SHA-256: `09047ce877a93cbe04aa5687c68cf601c0f9de7a6a34a2f627c2769409ccf98b`.
- O código 7 também é provisório até ser comparado ao maior `versionCode` já enviado ao Play Console. O pacote e o nome estão corretos, a assinatura é a mesma do AAB anterior e os 15 ícones do pacote coincidem com os arquivos fonte.
