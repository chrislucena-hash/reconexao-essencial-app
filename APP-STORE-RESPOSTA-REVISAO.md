# Resposta para App Store Connect

Olá,

Obrigado pelo retorno detalhado. Identificamos e corrigimos ambos os problemas reportados:

**Guideline 2.1(a) - App Completeness (carregamento infinito)**

Encontramos a causa raiz: a configuração nativa do app estava apontando para um domínio remoto auxiliar que não estava resolvendo corretamente, fazendo com que a tela de carregamento do app ficasse aguardando indefinidamente em vez de carregar o conteúdo já empacotado localmente. Corrigimos a configuração para que o app carregue sempre os arquivos locais empacotados na build, eliminando essa dependência de rede no momento da inicialização. Testamos a nova build (build 3) em dispositivo físico, incluindo cenários de rede instável, e o app agora inicia normalmente.

**Guideline 2.3.8 - Accurate Metadata (ícone placeholder)**

O ícone final da marca Reconexão Essencial já está aplicado em todos os tamanhos exigidos para iOS nesta build, substituindo o ícone padrão que havia sido enviado por engano em uma submissão anterior.

A nova build (1.0, build 3) já está disponível no App Store Connect com ambas as correções. Ficamos à disposição para qualquer dúvida adicional.

Atenciosamente,
Equipe Reconexão Essencial
