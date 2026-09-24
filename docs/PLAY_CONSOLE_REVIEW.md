# Reenvio ao Google Play: Reconexão Essencial

## Declaração de apps de saúde

Em **Política → Conteúdo do app → Apps de saúde**, declare as funções da versão enviada:

- **Controle de estresse, relaxamento e acuidade mental**: meditação, respiração e relaxamento guiados. Esta é a categoria explicitamente solicitada na rejeição.
- **Controle do sono**: há uma prática de relaxamento antes de dormir.
- **Controle de nutrição e peso**: o diário registra refeições e o Guia oferece receitas e informações gerais de alimentação. Confirme a categoria no formulário conforme a versão publicada; o app não define metas de peso.
- **Educação e referências médicas**: o Guia contém informações gerais sobre doença celíaca e exames para conversar com profissionais. Confirme a categoria no formulário conforme a versão publicada.

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

## Antes de enviar à revisão

1. Use `android/` da raiz para gerar a release; `frontend/android/` contém artefatos locais e não é a fonte do CI.
2. Gere um AAB assinado com a chave de upload cadastrada e `versionCode` maior que o último enviado. O workflow recebe esse número em `version_code`.
3. Instale a nova versão em uma faixa de testes e confira nome e ícone no launcher, inclusive o ícone redondo/adaptativo.
4. Atualize declaração, título, ícone e descrições no Play Console. Confirme a política de privacidade pública e no app, conforme [política de saúde](https://support.google.com/googleplay/android-developer/answer/16679511?hl=pt-BR).
5. Envie as mudanças para revisão em **Visão geral da publicação**.
