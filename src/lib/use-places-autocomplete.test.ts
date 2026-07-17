import { test, before } from "node:test";
import assert from "node:assert/strict";

/**
 * Tests du loader singleton `loadGoogleMaps`.
 *
 * Regression P0 : avant le fix, chaque instance du hook ecrasait le callback
 * global `window.initGooglePlaces`, si bien que seul le dernier formulaire monte
 * recevait le signal de chargement. On verifie ici que le loader :
 *  - injecte le <script> UNE seule fois,
 *  - renvoie la MEME promesse a tous les appelants (singleton),
 *  - resout `true` quand le callback global est invoque (script charge),
 *  - definit le callback global une seule fois.
 *
 * L'environnement de test (node:test + tsx) n'a pas de DOM : on installe un
 * mock minimal de window/document AVANT d'importer le module (la cle API et
 * `window` sont lues au chargement).
 */

type FakeScript = {
  id: string;
  src: string;
  async: boolean;
  defer: boolean;
  addEventListener: (ev: string, fn: () => void) => void;
};

// Cle API requise pour que le loader tente le chargement (sinon fallback direct).
process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = "test-key";

const scripts: FakeScript[] = [];

const fakeWindow: Record<string, unknown> = {};
const fakeDocument = {
  getElementById: (id: string) => scripts.find((s) => s.id === id) ?? null,
  createElement: (): FakeScript => ({
    id: "",
    src: "",
    async: false,
    defer: false,
    addEventListener: () => {},
  }),
  head: {
    appendChild: (el: FakeScript) => {
      scripts.push(el);
    },
  },
};

// @ts-expect-error injection d'un window minimal pour l'environnement node
globalThis.window = fakeWindow;
// @ts-expect-error injection d'un document minimal pour l'environnement node
globalThis.document = fakeDocument;

// Import differe (pas de top-level await en sortie CJS) : les globals ci-dessus
// et la cle API sont deja en place quand le module est charge.
let loadGoogleMaps: typeof import("./use-places-autocomplete").loadGoogleMaps;
before(async () => {
  ({ loadGoogleMaps } = await import("./use-places-autocomplete"));
});

test("loadGoogleMaps : singleton (meme promesse, un seul script injecte)", () => {
  const p1 = loadGoogleMaps();
  const p2 = loadGoogleMaps();
  assert.equal(p1, p2, "les appels concurrents doivent partager la meme promesse");
  assert.equal(scripts.length, 1, "le script Google ne doit etre injecte qu'une fois");
  assert.match(scripts[0].src, /libraries=places/);
  assert.match(scripts[0].src, /callback=initGooglePlaces/);
});

test("loadGoogleMaps : callback global unique defini, resout true au chargement", async () => {
  const p = loadGoogleMaps();
  assert.equal(
    typeof (fakeWindow.initGooglePlaces as unknown),
    "function",
    "le callback global doit etre defini une seule fois par le loader"
  );
  // Simule le chargement effectif du script Google.
  fakeWindow.google = { maps: { places: {} } };
  (fakeWindow.initGooglePlaces as () => void)();
  assert.equal(await p, true);
});

test("loadGoogleMaps : renvoie true immediatement si google deja present", async () => {
  // google est desormais present (test precedent) -> chemin rapide, pas de script.
  const avant = scripts.length;
  const ok = await loadGoogleMaps();
  assert.equal(ok, true);
  assert.equal(scripts.length, avant, "aucun nouveau script ne doit etre injecte");
});
