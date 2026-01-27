# Repository Guidelines

## Project Structure & Module Organization

The source code is located in the `src/` directory. Tests are in `test/
`, and assets such as configuration files or static files are in
`assets/`.

## Build, Test, and Development Commands

To build the project:
    ``` sh
    npm run build
    ```

To run tests (using Jest):
    ``` sh
    npm test
    ```

To run a development server with hot reloads:
    ``` sh
    npm start
    ```

## Coding Style & Naming Conventions

### Indentation Rules

Use 2 spaces for indentation.

### Naming Patterns

- Classes: PascalCase (e.g., MyClass)
- Functions and variables: camelCase (e.g., myFunction)
- Constants: UPPER_SNAKE_CASE (e.g., MY_CONSTANT)

## Testing Guidelines

We use Jest as our testing framework. Each source file should have a
  corresponding test file with the same name but prefixed by test_.
  Ensure all new functionality comes with appropriate tests.

Run the entire test suite:
    ``` sh
    npm test
    ```

## Commit & Pull Request Guidelines

### Commit Messages

Follow conventional commit messages, starting with one of the following
prefixes:

- feat: for a new feature
- fix: to fix an issue
- docs: documentation only changes
- style: formatting or syntax changes without affecting code logic

### Pull Requests

Applicable.

For example, a commit message might look like this:

    ``` sh
    feat: add new feature
    ```

## Additional Sections

### Security Tips

Ensure sensitive data is never hard-coded in the source code. Use
environment variables via .env files, which are excluded from version
control (see .gitignore).

### Configuration Tips

Use /skills to list available skills

Configuration files are located in config/. Modify these sparingly as
they impact application behavior significantly.
