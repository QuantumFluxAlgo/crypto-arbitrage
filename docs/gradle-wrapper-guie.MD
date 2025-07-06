# Regenerating the Gradle Wrapper

This guide explains how to regenerate the Gradle wrapper inside the `executor` module.

1. **Open a terminal** and change into the `executor` directory:
   ```bash
   cd executor
   ```
2. **Generate a new wrapper** using Gradle 8.14:
   ```bash
   gradle wrapper --gradle-version 8.14
   ```
   This updates `gradlew`, `gradlew.bat`, and the files under `gradle/wrapper/`.
3. **Ignore the wrapper JAR** so you don't commit the binary:
   ```bash
   echo "executor/gradle/wrapper/gradle-wrapper.jar" >> ../.gitignore
   git rm --cached gradle/wrapper/gradle-wrapper.jar 2>/dev/null || true
   ```
4. **Run the unit tests** to confirm everything works:
   ```bash
   ./gradlew test
   ```
5. **Commit the changes** without the JAR:
   ```bash
   git add gradlew gradlew.bat gradle/wrapper/gradle-wrapper.properties ../.gitignore
   git commit -m "Regenerate Gradle wrapper and ignore jar"
   ```

After committing, push your branch and open a pull request.
