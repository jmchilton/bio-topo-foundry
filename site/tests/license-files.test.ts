import { auditLicenseFiles, loadLicenseFiles } from "@galaxy-foundry/license-policy";
import { describe, expect, it } from "vitest";

import { LICENSE_DIRECTORY, licenseDeclarations, vendoredLicenses } from "../src/lib/licenses";

/**
 * `license_file` is a string, so the kind schema can require it and cannot open it.
 *
 * The coherence rule already refuses a `verbatim-quotes-summary` that names no copy. What nothing
 * could check until the shared audit existed is whether the named copy is there — a typo satisfies
 * a `.strict()` schema and every link check, because the value never becomes a link.
 */
describe("vendored license texts", () => {
  it("agrees with what the corpus declares, in both directions", () => {
    const findings = auditLicenseFiles({
      licenseDirectory: LICENSE_DIRECTORY,
      declarations: licenseDeclarations(),
    });

    expect(
      findings.map((finding) => `${finding.code}: ${finding.message}`),
      findings.map((finding) => finding.message).join("\n"),
    ).toEqual([]);
  });

  it("sees the corpus, so a green audit is not an empty one", () => {
    // The audit reports nothing for a repository holding nothing, which is the same answer it
    // gives for a repository holding everything correctly. Only one of those is this one.
    expect(licenseDeclarations().length).toBeGreaterThan(0);
    expect(loadLicenseFiles(LICENSE_DIRECTORY).length).toBeGreaterThan(0);
  });

  it("catches a declaration naming a copy that is not vendored", () => {
    const findings = auditLicenseFiles({
      licenseDirectory: LICENSE_DIRECTORY,
      declarations: [
        ...licenseDeclarations(),
        { source: "content/papers/invented.md", licenseFile: "LICENSES/CC-BY-4.O.LICENSE" },
      ],
    });

    expect(findings.map((finding) => finding.code)).toEqual(["missing-copy"]);
  });

  it("routes every vendored copy, and names its carriers", () => {
    const licenses = vendoredLicenses();

    expect(licenses.length).toBe(loadLicenseFiles(LICENSE_DIRECTORY).length);
    for (const license of licenses) {
      expect(license.file.text.trim().length, `${license.file.filename} is empty`).toBeGreaterThan(
        0,
      );
      expect(
        license.carriers.length,
        `${license.file.filename} is routed but nothing carries under it`,
      ).toBeGreaterThan(0);
    }
  });
});
