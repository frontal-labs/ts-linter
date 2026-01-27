# Release Process

This document describes how releases are versioned, built, and published for **brand-kit**.

## Versioning

We follow **Semantic Versioning (SemVer)**:

MAJOR.MINOR.PATCH

- **MAJOR** — incompatible or breaking changes
- **MINOR** — backward-compatible new features
- **PATCH** — backward-compatible bug fixes

Pre-release versions MAY include suffixes such as:
- `-alpha.x`
- `-beta.x`
- `-rc.x`

Example:

1.4.0
2.0.0-beta.1

---

## Release Types

### Patch Release
- Bug fixes
- Documentation updates
- Internal refactors without API changes

### Minor Release
- New features
- Backward-compatible improvements
- New components, tokens, or utilities

### Major Release
- Breaking API or design changes
- Removed or renamed exports
- Significant design or architectural shifts

---

## Release Workflow

1. **Changes merged to `main`**
   - All changes must go through PR review
   - CI must pass

2. **Version bump**
   - Update `package.json` (and lockfiles if applicable)
   - Update `CHANGELOG.md` (if present)

3. **Tagging**
   - Create a git tag matching the version:
     ```bash
     git tag vX.Y.Z
     git push origin vX.Y.Z
     ```

4. **Build & Publish**
   - Artifacts are built from the tagged commit
   - Packages are published to the registry (if applicable)

5. **Release Notes**
   - Release notes are published alongside the tag
   - Notes include highlights, breaking changes, and migration steps

---

## Rollbacks

If a release introduces critical issues:

- A patch release is preferred
- In extreme cases, the release MAY be yanked or deprecated
- Consumers are encouraged to pin versions in production environments

---

## Support Window

- Only the **latest major version** is actively supported
- Security fixes MAY be backported at maintainers’ discretion

---

## Automation

Releases MAY be automated using CI/CD pipelines (e.g. GitHub Actions).  
Automation does not change the guarantees described in this document.

---

## Questions

If you have questions about the release process, open an issue or discussion in the repository.
