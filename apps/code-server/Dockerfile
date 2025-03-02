FROM codercom/code-server:4.96.4

USER root
RUN apt-get update \
    && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Revert to the code-server default user
USER coder
# Expose code-server's default port
EXPOSE 8080

# Ensure the settings.json file exists and set the default theme to Dark Mode
RUN mkdir -p /home/coder/.local/share/code-server/User && \
    echo '{ "workbench.colorTheme": "Default Dark+" }' > /home/coder/.local/share/code-server/User/settings.json

# Start code-server
CMD ["code-server", "--auth", "none", "--bind-addr", "0.0.0.0:8080", "/tmp/bolty-worker"]
