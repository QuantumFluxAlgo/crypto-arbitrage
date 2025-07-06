# Test environment Dockerfile
# Installs Node.js, Python, and Java to run project tests

FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        nodejs npm \
        openjdk-17-jdk \
        python3 python3-pip \
        git ca-certificates && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . /app

# Install Python dependencies
RUN pip3 install --no-cache-dir -r requirements.txt

# Install root Node deps
RUN npm install

# Install Node deps for sub-services
RUN npm install --prefix api && \
    npm install --prefix dashboard && \
    npm install --prefix feed-aggregator

# Fetch Gradle wrapper to allow offline builds
RUN ./executor/gradlew -p executor --quiet --no-daemon help

CMD ["bash"]
