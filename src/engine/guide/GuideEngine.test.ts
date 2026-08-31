import assert from "node:assert/strict";
import test from "node:test";

import { createGuideResponse } from "./GuideEngine";

test("Great Red Spot size does not fall back to Jupiter diameter", () => {
    const response = createGuideResponse(
        "jupiter red spot size compare with earth"
    );

    assert.equal(response.intent, "COMPARISON");
    assert.equal(
        response.answer,
        "ASTRA does not currently have a sourced Great Red Spot size measurement in its curated dataset."
    );
    assert.doesNotMatch(response.answer, /139,800|wider than Earth/i);
});

test("Orion ambiguity preserves Helix Nebula", () => {
    const response = createGuideResponse("tell me about orion and helix");

    assert.match(response.answer, /Orion is ambiguous/i);
    assert.match(response.answer, /Helix Nebula was also detected/i);
    assert.deepEqual(response.pendingEntities?.map((entity) => entity.id), ["helix-nebula"]);
    assert.deepEqual(response.suggestions?.map((suggestion) => suggestion.label), [
        "Orion constellation",
        "Orion Nebula",
    ]);
});

test("resolving Orion as a nebula restores the preserved Helix entity", () => {
    const ambiguity = createGuideResponse("tell me about orion and helix");
    const resolved = createGuideResponse("Tell me about Orion Nebula", {
        pendingEntities: ambiguity.pendingEntities,
    });

    assert.deepEqual(resolved.resolvedEntities?.map((entity) => entity.id), [
        "orion-nebula",
        "helix-nebula",
    ]);
    assert.match(resolved.answer, /Orion Nebula:/);
    assert.match(resolved.answer, /Helix Nebula:/);
    assert.deepEqual(resolved.pendingEntities, []);
});

test("Earth and Jupiter retain their diameter comparison", () => {
    const response = createGuideResponse("compare Earth and Jupiter");

    assert.equal(response.intent, "COMPARISON");
    assert.match(response.answer, /Earth is about 11× smaller in diameter than Jupiter/i);
    assert.equal(response.dataNote, "Calculated from ASTRA data");
});

test("Jupiter definition remains unchanged", () => {
    const response = createGuideResponse("What is Jupiter?");

    assert.equal(response.intent, "DEFINITION");
    assert.equal(response.resolvedEntity?.id, "jupiter");
    assert.match(response.answer, /Solar System’s largest planet/i);
});

test("Saturn rings do not fall back to Saturn diameter", () => {
    const response = createGuideResponse("Saturn rings compared with Earth");

    assert.match(response.answer, /does not currently have a sourced Saturn ring-size measurement/i);
    assert.doesNotMatch(response.answer, /116,400|Saturn is about .*wider/i);
});
