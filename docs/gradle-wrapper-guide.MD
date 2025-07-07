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
3. **Include the wrapper JAR** so builds remain reproducible. The file should
   stay under version control.
4. **Run the unit tests** to confirm everything works:
   ```bash
   ./gradlew test
   ```
5. **Commit the changes**, including the wrapper JAR:
   ```bash
   git add gradlew gradlew.bat gradle/wrapper/gradle-wrapper.properties gradle/wrapper/gradle-wrapper.jar
   git commit -m "Regenerate Gradle wrapper"
   ```

After committing, push your branch and open a pull request.
