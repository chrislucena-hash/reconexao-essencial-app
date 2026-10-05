import { expect, test, type Page } from '@playwright/test';

type Scenario = 'signed-out' | 'auth-stalled' | 'profile-stalled' | 'profile-ready';

async function openApp(page: Page, scenario: Scenario) {
  await page.addInitScript((value) => {
    (window as typeof window & { __E2E_FIREBASE_SCENARIO__?: Scenario }).__E2E_FIREBASE_SCENARIO__ = value;
  }, scenario);
  await page.route('**/api/v1/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
  );
  await page.goto('/', { waitUntil: 'domcontentloaded' });
}

test('sessão ausente abre a capa e valida o acesso sem sair da tela', async ({ page }) => {
  await openApp(page, 'signed-out');

  await expect(page.getByRole('button', { name: 'ENTRAR', exact: true })).toBeVisible();
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(247, 242, 236)');
  await page.getByRole('button', { name: 'ENTRAR', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Acesso à Jornada' })).toBeVisible();
  await page.getByRole('button', { name: 'Entrar na Jornada' }).click();
  await expect(page.getByText('Por favor, preencha todos os campos.')).toBeVisible();
});

test('autenticação sem resposta não deixa a Centelha girando indefinidamente', async ({ page }) => {
  await openApp(page, 'auth-stalled');

  await expect(page.getByText('Sincronizando com a Centelha...')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Não foi possível iniciar o app' })).toBeVisible({ timeout: 16_000 });
  await expect(page.getByText('Sincronizando com a Centelha...')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeEnabled();
});

test('perfil sem resposta oferece saída da conta e volta à capa', async ({ page }) => {
  await openApp(page, 'profile-stalled');

  await expect(page.getByText('Sincronizando com a Centelha...')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Não foi possível iniciar o app' })).toBeVisible({ timeout: 16_000 });
  await page.getByRole('button', { name: 'Entrar com outra conta' }).click();
  await expect(page.getByRole('button', { name: 'ENTRAR', exact: true })).toBeVisible();
});

test('perfil disponível abre painel e navega sem telas vazias', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await openApp(page, 'profile-ready');

  await expect(page.getByRole('heading', { name: 'Olá, Teste de publicação' })).toBeVisible();
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(247, 242, 236)');
  await page.getByRole('button', { name: 'Diário' }).click();
  await expect(page.getByRole('heading', { name: 'Livro de Espelhos' })).toBeVisible();
  await page.getByRole('button', { name: 'Bússola', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Bússola da Alma' })).toBeVisible();
  expect(pageErrors).toEqual([]);
});
