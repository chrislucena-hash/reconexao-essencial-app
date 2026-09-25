# Revisão iOS: Reconexão Essencial

Em 25/09/2026, a [ficha pública brasileira](https://apps.apple.com/br/app/reconexao-essencial-app/id6762309447) mostra a versão **1.0.6** com nome **reconexao-essencial-app**, idioma **Inglês**, descrição que promete “autocura e paz mental” e rótulo de privacidade **Dados não coletados**. Esses campos são geridos no App Store Connect; um novo IPA não os corrige por si só.

## Identidade e versão

- Nome instalado no novo pacote: **Reconexão Essencial** (`CFBundleDisplayName`). Defina o mesmo nome na ficha principal e em todas as localizações do App Store Connect. Confira também o nome apresentado no resultado de busca.
- O novo ícone iOS é gerado do mesmo `public/icon.svg` usado para a marca Android e para `assets/play-store/icon-512.png`. Substitua capturas de tela antigas, se mostrarem ícone, nome ou funções desatualizados. Compare o ícone publicado com o instalado no iPhone antes de submeter.
- A ficha pública já está na versão **1.0.6**. Escolha a próxima `version_name` e um `build_number` ainda não usado para essa versão, conferindo o histórico no App Store Connect. Os antigos valores padrão 1.0.2/6 foram removidos do workflow. O binário novo declara **Português (Brasil)** como idioma da interface; confira as localizações da ficha separadamente.
- Execute o workflow **iOS TestFlight** manualmente com `build_only=true` para gerar o IPA assinado como artefato sem carregá-lo na Apple. Depois de validar, `build_only=false` carrega o IPA no App Store Connect/TestFlight. O upload não publica na App Store; a submissão para revisão é separada.

## Ficha e alegações de saúde

Remova da ficha atual as promessas de **autocura**, **paz mental** e qualquer leitura do corpo que sugira diagnóstico, identificação de desequilíbrios ou resultados de saúde. A ficha deve refletir as funções realmente distribuídas. Texto proposto para a descrição em português:

> Reconexão Essencial é um espaço de autoconhecimento e reflexão. Registre suas percepções no diário, acompanhe sua jornada pessoal e explore práticas guiadas de meditação, respiração e relaxamento, inclusive uma opção para o momento de dormir.
>
> O app também reúne receitas e informações gerais sobre alimentação. O questionário permite registrar sinais percebidos, sem identificar suas causas ou diagnosticar sensibilidades alimentares.
>
> O app não é um dispositivo médico e não diagnostica, trata, cura ou previne nenhuma condição médica. Consulte um profissional de saúde para orientações médicas, diagnóstico ou tratamento. Não altere sua dieta com base nos registros do app.

Nome sugerido: **Reconexão Essencial**. Subtítulo sugerido: **Diário e práticas de reflexão**. Revise as versões traduzidas, palavras-chave, texto promocional, capturas e classificação indicativa. A categoria “Estilo de vida” pode permanecer se corresponder ao posicionamento real. Verifique também se a interface em português aparece corretamente; a ficha pública atualmente indica apenas **Inglês**.

Referência: [App Review Guidelines, itens 1.4 e 2.3](https://developer.apple.com/app-store/review/guidelines/).

## Privacidade: correção prioritária no App Store Connect

O rótulo público **Dados não coletados** é incompatível com o código: o app usa Firebase Authentication, grava perfil, diário e progresso no Firestore, permite postagens e comentários e envia dados para o backend. Revise também foto de perfil, endereço de e-mail, telefone, conteúdo do diário, registros do questionário, identificadores, dados de uso e tratamento por fornecedores/IA antes de preencher cada categoria do formulário **Privacidade do App**. Não selecione categorias por suposição: confronte o código, os serviços em produção e o que é realmente vinculado ao usuário ou usado para rastreamento.

Atualize a [política pública vinculada](https://www.notion.so/POL-TICA-DE-PRIVACIDADE-APP-RECONEX-O-ESSENCIAL-31eb9d89692a801e947efdd664aaa46d) e o rótulo de privacidade de forma coerente. A página pública ainda menciona “testes de sensibilidade”, enquanto o app revisado apresenta o questionário como registro de percepções. A política precisa esclarecer coleta, finalidade, compartilhamento com Firebase/backend e outros fornecedores, retenção, segurança, exclusão e contato. Confira o link dentro de **Configurações** e na ficha.

Referências: [Privacidade do App](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy) e [App Review Guidelines, item 5.1](https://developer.apple.com/app-store/review/guidelines/).

## Funcionalidade ainda pendente de verificação ou implementação

- **Exclusão de conta:** Configurações hoje abre um e-mail, sem exclusão no app. O login não oferece cadastro na tela, mas é necessário confirmar como as contas são criadas, inclusive fora do app. Se há criação de conta em qualquer canal ou contas geradas automaticamente, implemente uma opção efetiva de iniciar a exclusão dentro do app, abrangendo Firebase Auth, Firestore, backend, publicações e comentários; confirme prazo e conclusão. A Apple diz que encaminhar apenas ao atendimento é permitido somente em setores altamente regulados. [Orientação da Apple](https://developer.apple.com/support/offering-account-deletion-in-your-app/).
- **Comunidade:** o botão “Reportar” atualmente só oculta a postagem na sessão local. Não envia denúncia para análise, não bloqueia o autor e não há denúncia de comentário. É preciso implementar denúncia entregue à equipe, resposta em prazo adequado, bloqueio de usuários e contato publicado; depois testar esses fluxos. A moderação tenta chamar `/api/moderate-content` por URL relativa, que no Capacitor aponta ao app local; quando essa chamada falha, o código permite a publicação. Configure um endpoint acessível no iOS e Android, faça a moderação falhar de modo seguro e teste a publicação real antes da revisão. [App Review Guidelines, item 1.2](https://developer.apple.com/app-store/review/guidelines/).
- **Acesso para revisão:** forneça conta de demonstração ativa e instruções de acesso ao revisor, pois a tela inicial exige credenciais. Confirme que API, Firebase e todo conteúdo funcionam no iPhone e iPad em rede externa. [App Review Guidelines, item 2.1](https://developer.apple.com/app-store/review/guidelines/).
- **IA e dados pessoais:** confira se diário, questionário, postagens e outros dados identificáveis são enviados a provedores de IA. Se houver compartilhamento com terceiros, divulgue-o com clareza e obtenha a permissão exigida pela Apple antes do envio. [App Review Guidelines, item 5.1.2](https://developer.apple.com/app-store/review/guidelines/).

## Validação antes de enviar à revisão

1. Gere o IPA assinado com `build_only=true`; confira `CFBundleIdentifier`, nome, versão, build e ícone no artefato. Instale pelo TestFlight após upload separado e valide no dispositivo o nome e ícone do launcher, diário, práticas, comunidade, conta e links.
2. Resolva os itens de privacidade, exclusão e comunidade acima; confirme que a ficha, a política e o app descrevem a mesma versão. Confirme o número de build no App Store Connect.
3. Quando estiver pronto, execute o workflow com `build_only=false` e o número de build definitivo, habilite testes internos/externos conforme necessário e registre feedback. O TestFlight é recomendado para achar falhas, mas não há uma etapa obrigatória de testes fechados equivalente à exigência de algumas contas no Google Play.
4. Selecione o build na versão do App Store Connect e use **Add for Review → Submit for Review**. [Instruções oficiais](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-app).
