# Drone Authorizer

This application uses a headless browser to automate the oAuth2 authorization of Drone in Gitea.
It is necessary because after creating a new repository in Gitea, the KDL Server synchronizes the Drone repositories
automatically calling to the Drone API. For this process, Drone performs a call to Gitea and needs to be authorized.

For more information see: https://github.com/konstellation-io/science-toolkit/issues/107
