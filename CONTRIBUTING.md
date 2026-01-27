# Contributing to the TypeScript Linter

Thanks for your interest in contributing to this TypeScript linter 
Contributions are welcome and appreciated — especially those that improve correctness, performance, and developer experience.

This document explains how to contribute effectively.

---

## Scope of the Project

This linter focuses on:

- Static analysis of TypeScript code
- Enforcing best practices and consistency
- Catching potential bugs and unsafe patterns
- Providing clear, actionable diagnostics
- Maintaining predictable and stable rule behavior

Changes outside this scope may be declined.

---

## Code of Conduct

All contributors are expected to be respectful, constructive, and professional.

Harassment, hostile behavior, or low-effort engagement will not be tolerated.

---

## Ways to Contribute

You can help by:

- Reporting false positives or false negatives
- Proposing new lint rules
- Improving existing rules
- Fixing bugs
- Improving documentation
- Optimizing performance
- Adding tests and edge cases

Look for issues labeled `good first issue` if you’re new.

---

## Reporting Issues

Before opening an issue:

1. Search existing issues to avoid duplicates
2. Ensure the behavior is reproducible

When reporting an issue, include:
- Minimal reproducible example
- Expected vs actual behavior
- TypeScript version
- Linter version
- Node / Bun / runtime version

Security issues should **not** be reported publicly.  
See `SECURITY.md`.

---

## Proposing New Rules

New rules should:

- Solve a real and recurring problem
- Be narrowly scoped
- Avoid stylistic preferences unless strongly justified
- Provide clear diagnostics and fixes (when possible)

When proposing a rule, include:
- Problem statement
- Example of bad vs good code
- Rationale
- Potential false positives
- Autofix behavior (if applicable)

Discussion issues are encouraged before implementation.

---

## Development Setup

Clone and install dependencies:

```bash
git clone https://github.com/frontal-labs/ts-linter.git
cd ts-linter
pnpm install
```