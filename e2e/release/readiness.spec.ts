import { expect, test } from '@playwright/test';

test('bundle de produção abre a capa com identidade e tema claro', async ({ page, request }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('button', { name: 'ENTRAR', exact: true })).toBeVisible({ timeout: 16_000 });
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(247, 242, 236)');

  const logo = page.getByRole('img', { name: 'Reconexão Essencial Logo' });
  await expect(logo).toBeVisible();
  await expect(logo).toHaveAttribute('src', '/icon-512.png');
  expect(await logo.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);

  const manifest = await request.get('/manifest.json');
  expect(manifest.ok()).toBeTruthy();
  expect((await manifest.json()).name).toBe('Reconexão Essencial');
  expect(pageErrors).toEqual([]);
});

test('API pública de produção responde sem loop de redirecionamento', async ({ request }) => {
  const healthUrl = process.env.RELEASE_API_HEALTH_URL ?? 'https://api.reconexaoessencial.com.br/health';
  const response = await request.get(healthUrl, { maxRedirects: 0, timeout: 15_000 });

  expect(response.status(), `Saúde da API em ${healthUrl}: ${response.status()} ${response.headers().location ?? ''}`).toBe(200);
  expect(await response.json()).toEqual({ status: 'ok' });
});
