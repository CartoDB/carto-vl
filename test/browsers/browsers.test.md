
# Cross browser tests

We have some basic cross browser testing, using **selenium** + [saucelabs](https://saucelabs.com/). These tests can be run locally and are also integrated in our current CI tool (CircleCI at github).

## To run tests locally

*a) First time configuration*

1. Set the proper credentials as env variables (SAUCELABS_USER and SAUCELABS_KEY). For example, in your `~/.zshrc` file:

  ```bash
  export SAUCELABS_USER="YourUser"
  export SAUCELABS_KEY="your-long-api-key"
  ```

2. Install `sauce-connect` tunnel, so saucelabs browsers can have access to your localhost remotely. Download it from the [official site](https://wiki.saucelabs.com/display/DOCS/Sauce+Connect+Proxy) into your `bin` or use `brew cask install sauce-connect`

*b) Testing*

3. Run sauce-connect with your credentials: `sc -u $SAUCELABS_USER -k $SAUCELABS_KEY`. This process has to be open while running the tests, and there is also a convenient script for that named:

  ```
  yarn test:browsers:connect
  ```

4. Once the tunnel is ready (see its messages in the shell), run the tests with:

  ```
  test:browsers:compatibility
  ```


## To run tests at CircleCI

*a) First time configuration*

1. Add the saucelabs credentials as variables to the project in:
  `Build Settings > Environment Variables`: **SAUCELABS_USER** and **SAUCELABS_KEY**

2. saucelabs configuration requires v2.1 configuration from CircleCI. This allows the use of CircleCI Orbs (`sauce-connect: saucelabs/sauce-connect`). So enable `Build Settings > Advanced Settings > Enable build processing (preview)`.

*b) Testing*

3. Every commit will launch automatically the CircleCI workflows, which include a special job for cross browser testing.

4. You can check the output at CircleCI but there is also quite a lot of information for each one at [saucelabs dashboard](https://app.saucelabs.com/dashboard/tests), including a video and some logs.
