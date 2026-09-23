import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { GitHubUpdater } from './githubUpdater';

vi.mock('electron', () => ({ app: { getVersion: () => '1.50.0' } }));
vi.mock('./logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform')!;
const originalArch = Object.getOwnPropertyDescriptor(process, 'arch')!;
const originalSystemVersion = Object.getOwnPropertyDescriptor(process, 'getSystemVersion');
const updateFeedUrl = 'https://downloads.asi1.ai/asi-work/latest';
const requirementsUrl = `${updateFeedUrl}/mac-update-requirements.json`;

function generatedRequirements(minimumMacOSVersion: string, version = 'v1.51.0') {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'goose-fallback-release-test-'));
  try {
    for (const name of ['ASI-Work.zip', 'ASI-Work_intel_mac.zip']) {
      fs.writeFileSync(path.join(directory, name), 'archive fixture');
      fs.writeFileSync(
        path.join(directory, `${name}.macos.json`),
        JSON.stringify({ minimumMacOSVersion })
      );
    }
    execFileSync(process.execPath, [
      path.resolve('scripts/generate-mac-update-manifest.js'),
      '--version',
      version,
      '--directory',
      directory,
    ]);
    return JSON.parse(
      fs.readFileSync(path.join(directory, 'mac-update-requirements.json'), 'utf8')
    ) as unknown;
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

const macOS12Requirements = generatedRequirements('12.0.0');
const macOS13Requirements = generatedRequirements('13.0.0');

function mockRequirements(metadata: unknown, status = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (url === requirementsUrl) {
        return metadata instanceof Response
          ? metadata
          : new Response(JSON.stringify(metadata), { status });
      }
      throw new Error(`Unexpected request: ${url}`);
    })
  );
}

beforeEach(() => {
  Object.defineProperty(process, 'platform', { value: 'darwin' });
  Object.defineProperty(process, 'arch', { value: 'arm64' });
  Object.defineProperty(process, 'getSystemVersion', {
    value: vi.fn(() => '12.7.6'),
    configurable: true,
  });
});

afterEach(() => {
  Object.defineProperty(process, 'platform', originalPlatform);
  Object.defineProperty(process, 'arch', originalArch);
  if (originalSystemVersion) {
    Object.defineProperty(process, 'getSystemVersion', originalSystemVersion);
  } else {
    Reflect.deleteProperty(process, 'getSystemVersion');
  }
  vi.unstubAllGlobals();
});

describe('update feed fallback', () => {
  it.each(['arm64', 'x64'])(
    'does not offer a macOS 13 update on macOS 12 (%s)',
    async (arch) => {
      Object.defineProperty(process, 'arch', { value: arch });
      mockRequirements(macOS13Requirements);
      const result = await new GitHubUpdater().checkForUpdates();
      expect(result).toEqual({ updateAvailable: false, latestVersion: '1.51.0' });
      expect(result.downloadUrl).toBeUndefined();
    }
  );

  it.each([
    ['arm64', '13.0', 'Goose-mac-arm64.zip'],
    ['x64', '13.0', 'Goose-mac-x64.zip'],
    ['arm64', '26.0', 'Goose-mac-arm64.zip'],
  ])('offers the %s download on macOS %s', async (arch, version, artifact) => {
    Object.defineProperty(process, 'arch', { value: arch });
    vi.mocked(process.getSystemVersion).mockReturnValue(version);
    mockRequirements(macOS13Requirements);
    expect(await new GitHubUpdater().checkForUpdates()).toEqual({
      updateAvailable: true,
      latestVersion: '1.51.0',
      downloadUrl: `${updateFeedUrl}/${artifact}`,
    });
  });

  it('still offers a macOS 12-compatible update on macOS 12', async () => {
    mockRequirements(macOS12Requirements);
    expect(await new GitHubUpdater().checkForUpdates()).toMatchObject({ updateAvailable: true });
  });

  it('does not offer an update when the feed version is not newer', async () => {
    vi.mocked(process.getSystemVersion).mockReturnValue('13.0');
    mockRequirements(generatedRequirements('13.0.0', 'v1.50.0'));
    expect(await new GitHubUpdater().checkForUpdates()).toEqual({
      updateAvailable: false,
      latestVersion: '1.50.0',
    });
  });

  it.each([{}, { version: '1.51.0', minimumMacOSVersion: 'invalid' }])(
    'rejects malformed requirements: %j',
    async (metadata) => {
      mockRequirements(metadata);
      expect(await new GitHubUpdater().checkForUpdates()).toMatchObject({
        updateAvailable: false,
        error: expect.any(String),
      });
    }
  );

  it('does not offer an update when the feed cannot be reached', async () => {
    mockRequirements(new Response('', { status: 503 }));
    expect(await new GitHubUpdater().checkForUpdates()).toMatchObject({
      updateAvailable: false,
      error: expect.any(String),
    });
  });

  it.each(['win32', 'linux'])('resolves %s artifacts against the feed', async (platform) => {
    Object.defineProperty(process, 'platform', { value: platform });
    Object.defineProperty(process, 'arch', { value: 'x64' });
    mockRequirements(macOS13Requirements);
    const artifact =
      platform === 'win32' ? 'Goose-win-x64.zip' : 'Goose-linux-x64.zip';
    expect(await new GitHubUpdater().checkForUpdates()).toEqual({
      updateAvailable: true,
      latestVersion: '1.51.0',
      downloadUrl: `${updateFeedUrl}/${artifact}`,
    });
  });
});
