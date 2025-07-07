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
3. **Extract the wrapper JAR** from the Gradle distribution:
   ```bash
   unzip -p gradle.zip gradle-8.14/lib/plugins/gradle-wrapper-main-8.14.jar \
     > executor/gradle/wrapper/gradle-wrapper.jar
   ```
   The archive also contains `gradle-wrapper-shared-8.14.jar`.
   Verify the JAR size:
   ```bash
   ls -lh executor/gradle/wrapper/gradle-wrapper.jar
   ```
4. **Ignore the wrapper JAR** so you don't commit the binary:
   ```bash
   echo "executor/gradle/wrapper/gradle-wrapper.jar" >> ../.gitignore
   git rm --cached gradle/wrapper/gradle-wrapper.jar 2>/dev/null || true
   ```
5. **Run the unit tests** to confirm everything works:
   ```bash
   ./gradlew test
   ```
6. **Commit the changes** without the JAR:
   ```bash
   git add gradlew gradlew.bat gradle/wrapper/gradle-wrapper.properties ../.gitignore
   git commit -m "Regenerate Gradle wrapper and ignore jar"
   ```

After committing, push your branch and open a pull request.
