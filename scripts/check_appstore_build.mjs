import { createPrivateKey, sign } from 'node:crypto';

const {
  APPSTORE_API_ISSUER_ID: issuer,
  APPSTORE_API_KEY_ID: keyId,
  APPSTORE_API_KEY_P8_BASE64: encodedKey,
  APPSTORE_APP_ID: appId,
  APPSTORE_VERSION_NAME: versionName,
  APPSTORE_BUILD_NUMBER: buildNumber,
} = process.env;

if (![issuer, keyId, encodedKey, appId, versionName, buildNumber].every(Boolean)) {
  throw new Error('Missing App Store Connect build status configuration');
}

const now = Math.floor(Date.now() / 1000);
const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const content = `${encode({ alg: 'ES256', kid: keyId, typ: 'JWT' })}.${encode({ iss: issuer, iat: now, exp: now + 600, aud: 'appstoreconnect-v1' })}`;
const privateKey = createPrivateKey(Buffer.from(encodedKey, 'base64'));
const signature = sign('sha256', Buffer.from(content), { key: privateKey, dsaEncoding: 'ieee-p1363' });
const token = `${content}.${signature.toString('base64url')}`;

let next = new URL(`https://api.appstoreconnect.apple.com/v1/apps/${encodeURIComponent(appId)}/buildUploads?limit=200`);
let upload;

for (let page = 0; next && page < 5; page += 1) {
  if (next.origin !== 'https://api.appstoreconnect.apple.com') {
    throw new Error('Unexpected App Store Connect pagination URL');
  }
  const response = await fetch(next, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) {
    throw new Error(`App Store Connect build upload query returned HTTP ${response.status}`);
  }
  const body = await response.json();
  upload = body.data?.find(({ attributes }) =>
    attributes?.cfBundleShortVersionString === versionName &&
    attributes?.cfBundleVersion === buildNumber &&
    attributes?.platform === 'IOS'
  );
  if (upload) break;
  next = body.links?.next ? new URL(body.links.next) : null;
}

if (!upload) {
  throw new Error(`Build upload ${versionName} (${buildNumber}) was not found`);
}

const state = upload.attributes?.state?.state;
console.log(`App Store Connect ${versionName} (${buildNumber}): ${state ?? 'UNKNOWN'}`);
if (state !== 'COMPLETE') {
  process.exitCode = 1;
}

const versionsUrl = new URL(`https://api.appstoreconnect.apple.com/v1/apps/${encodeURIComponent(appId)}/appStoreVersions?limit=200`);
const versionsResponse = await fetch(versionsUrl, {
  headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  signal: AbortSignal.timeout(15_000),
});
if (versionsResponse.ok) {
  const versions = await versionsResponse.json();
  const version = versions.data?.find(({ attributes }) =>
    attributes?.versionString === versionName && attributes?.platform === 'IOS'
  );
  console.log(`App Store version ${versionName}: ${version?.attributes?.appStoreState ?? 'NOT_CREATED'}`);
} else {
  console.log(`App Store version lookup: HTTP ${versionsResponse.status}`);
}
