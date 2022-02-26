# Building the extension

## Dependencies

* NodeJS >=16 (earlier versions will probably work, but are not tested)
* NPM >=8 (earlier versions might work, although package-lock-format version 2 support is required)
* A Jsonnet implementation compatible with the spec. Both of the following are known to work:
    * Go: <https://github.com/google/go-jsonnet>
    * C++: <https://github.com/google/jsonnet>
* make

## Initial checkout, installation and build

```shell
git clone https://github.com/pitkley/aws-search-extension.git
cd aws-search-extension
git submodule update --init --recursive
npm install
make empty-indices
```

This is already sufficient to launch a browser with the extension, perform an index update and start searching.
For the extension to work without an index update, the indices have to be pre-built locally.
You can do this by executing `make clean-indices indices`.

Please note that building the aws-cli indices requires that the AWS-CLI docs are already built.
To do this, execute the following commands:

```shell
cd index-sources/aws-cli/
pip install -r requirements.txt
pip install -r requirements-docs.txt
pip install -e .
# NOTE: this takes very long!
env PYTHONWARNINGS= make -C doc json
```

You can then rerun either `make indices` or just `make extension/index/cli.js`.

## Running a browser with the extension

We use the [`web-ext`](https://github.com/mozilla/web-ext/) command-line tool to make launching and developing the
extension easier.

* Chromium/Google Chrome

    ```shell
    mkdir -p profiles/chromium
    make chrome
    npx web-ext run \
      --source-dir extension/ \
      --target chromium \
      --chromium-profile profiles/chromium/
    ```
  
    `web-ext` will automatically try to find either Google Chrome or Chromium.
    If it does not use the exact browser you wanted (e.g. Google Chrome instead of Chromium), you can use the `--chromium-binary` option to specify the desired path.

* Firefox

    ```shell
    mkdir -p profiles/firefox
    make firefox
    npx web-ext run \
      --source-dir extension/ \
      --target firefox \
      --firefox-profile profiles/firefox/
    ```

With the extension launched with `web-ext`, changes to files in the [`extension/`](extension/) directory will be automatically reflected in the browser.
