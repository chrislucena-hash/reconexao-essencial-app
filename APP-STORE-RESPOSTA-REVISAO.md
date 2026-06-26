# Resposta para App Store Connect

Olá,

Obrigado pelo retorno. Identificamos uma nova causa raiz para o travamento reportado e já corrigimos:

**Guideline 2.1(a) - App Completeness (carregamento infinito no login)**

O travamento ocorria especificamente durante o login: o SDK do Firebase Authentication tenta abrir o IndexedDB automaticamente para definir a persistência de sessão, e essa operação pode ficar pendente indefinidamente dentro da WebView nativa do iOS (WKWebView), especialmente em dispositivos como iPad. Isso fazia a tela de login ficar carregando para sempre, sem erro e sem resposta.

Corrigimos isso configurando a persistência de autenticação explicitamente para usar armazenamento local (localStorage) em vez de depender da detecção automática de IndexedDB, eliminando essa dependência problemática. Testamos a nova build (1.0.1, build 5) em iPhone e iPad, incluindo o fluxo completo de login, e o app responde normalmente.

A nova build já está disponível no App Store Connect com a correção. Ficamos à disposição para qualquer dúvida adicional.

Atenciosamente,
Equipe Reconexão Essencial
