import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (specifier.startsWith("@/")) {
            const candidate = path.resolve("src", specifier.slice(2));
            const target = existsSync(`${candidate}.ts`)
                ? `${candidate}.ts`
                : path.join(candidate, "index.ts");
            return nextResolve(pathToFileURL(target).href, context);
        }
        if (
            (specifier.startsWith("./") || specifier.startsWith("../")) &&
            !path.extname(specifier) &&
            context.parentURL?.endsWith(".ts")
        ) {
            return nextResolve(`${specifier}.ts`, context);
        }
        return nextResolve(specifier, context);
    },
});

const { createGuideResponse, resolveInitialGuideContext } = await import(
    "./GuideEngine.ts"
);

test("Guide resolves known astronomy entities", () => {
    const response = createGuideResponse("Tell me about Mars");
    assert.equal(response.intent, "DEFINITION");
    assert.equal(response.resolvedEntity?.id, "mars");
    assert.ok(response.answer.length > 0);
    assert.ok(response.sources?.length);
});

test("Guide handles empty and unsupported questions without a blank response", () => {
    const empty = createGuideResponse("   ");
    assert.equal(empty.intent, "HELP");
    assert.ok(empty.answer.length > 0);

    const unsupported = createGuideResponse("How do I bake sourdough?");
    assert.equal(unsupported.intent, "UNSUPPORTED");
    assert.ok(unsupported.answer.length > 0);
    assert.ok(unsupported.suggestions?.length);
});

test("invalid Guide URL contexts resolve safely", () => {
    assert.equal(resolveInitialGuideContext("not-an-object"), null);
    assert.equal(resolveInitialGuideContext(undefined, "not-a-star"), null);
    assert.equal(
        resolveInitialGuideContext(undefined, undefined, "not-a-constellation"),
        null
    );
});
