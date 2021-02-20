![AWS search extension logo](extension/logo.png)

# AWS search extension

AWS search extension is a browser-extension compatible with Google Chrome, Mozilla Firefox and Microsoft Edge (and probably most Chromium-based browsers).
It provides search results for AWS API references and the AWS CloudFormation reference, and opens the official AWS documentation page when you select an item by pressing Enter.

![Demo GIF showcasing AWS search extension](docs/demo.gif)

You can **start searching by typing the keyword `ase` into the searchbar,** followed by a space (or also tab in Chromium-based browsers), which will select the AWS search extension.
Everything you now type will search through the included indices of the AWS CloudFormation documentation and the AWS API and aws-cli references.

You can find detailed information on how to structure your queries in the sections below.

## Privacy

The AWS search extension computes all search-suggestions locally and never sends your queries, or any other data, to any external server!
By default it also doesn't retrieve any data from any servers, the indices it uses are included with the extension when it is installed.
(You can enable automatic index updates, see below for more information.)

Please note that the extension **can not** guarantee that your browser doesn't collect any data for the queries you enter into its omnibox.

## Supported queries

You can use the following kinds of search-queries:

| Prefix                                | Description                                              |
| ------------------------------------- | -------------------------------------------------------- |
| *(no prefix)* or `/`                  | Search all API references                                |
| `<service>/`                          | Search the API references for the matching services.     |
| `@`                                   | Search all aws-cli references                            |
| `<service>@`                          | Search the aws-cli references for the matching services. |
| `:` *(or `::` anywhere in the query)* | Search the AWS CloudFormation documentation              |

### Example queries

* `createmultipart` or `/createmultipart`

    Fuzzy-searches all AWS API references for API-operations matching `createmultipart`.

    ![Example suggestions for query `/createmultipart`](docs/api-createmultipart.png)

* `lambda/invoke`

    Fuzzy-searches the AWS Lambda API-reference for API-operations matching `invoke`.

    ![Example suggestions for query `lambda/invoke`](docs/api-lambda-invoke.png)

* `api/getapp`

    Searches API-operations matching `getapp` in all services matching `api`.

    ![Example suggestions for query `api/getapp`](docs/api-api-getapp.png)

* `@get-cal`

    Searches all CLI-operations matching `get-cal`.

    ![Example suggestions for query `@get-cal`](docs/cli-getcal.png)

* `elbv2@wait`

    Searches the AWS Elastic Load Balancing v2 CLI-operations matching `wait`.

    ![Example suggestions for query `elbv2@wait`](docs/cli-elbv2-wait.png)

 * `data@job`

    Searches CLI-operations matching `job` in all services matching `data`.

    ![Example suggestions for query `data@job`](docs/cli-data-job.png)

* `a::e::instance`

    Fuzzy-searches the AWS CloudFormation documentation for matching resources, in this case `AWS::EC2::Instance` should be the top match.

    ![Example suggestions for query `a::e::instance`](docs/cfn-aeinstance.png)

* `:findinmap`

    Fuzzy-searches the AWS CloudFormation documentation for the matching documentation for `Fn::FindInMap`.

    ![Example suggestions for query `findinmap`](docs/cfn-findinmap.png)

## FAQ

* *How are the results computed so fast?*

    The extension uses pre-built indices to support a fast search.
    The indices contain just enough data to be useful to the users (it contains summaries for all results), but not too much to slow down the search.

* *How are the indices updated?*

    By default, the extension uses indices that are directly bundled with the extension itself.
    While this has the advantage that no network requests are made from the extension at all, this can lead to outdated indices.

    While the extension will receive index-updates by publishing updated versions to the various extension stores relatively regularly (monthly to quarterly), you have to additional options for updating indices:

    1. Trigger a manual index update.

        Use your browser's omnibox, activate the AWS search extension (e.g. by typing `ase` followed by a space), then enter `!update`.
        You will see a result informing you to hit "Enter" to trigger an index update, and it also informs you when the indices where last updated:

        ![Triggering a manual update](docs/aes-command-update.png)

        The update will execute in the background and will usually finish in a few seconds.

        Please note that you will not get further feedback on the status of the update.
        If you want to verify that it has worked, simply open the `!update` results once more, the "Last update" time should have updated.

    2. Enable automatic index updates.

        You can enable automatic updates within the extension settings dialog, which youcan open by clicking on the AWS search extension icon in your browsers extension menu:

        ![Settings dialog for AWS search extension](docs/aes-settings.png)

        Within the dialog you can also configure how often the extension should update the indices, the default is every 86400 seconds (i.e. 1 day).

* *What requests are being made for manual or automatic index updates?*

    If you execute a manual index update or opt into automatic index-updates, the extension will request the latest JSON-indices from the following URLs:

    ```
    https://raw.githubusercontent.com/pitkley/aws-search-extension/indices/api.json
    https://raw.githubusercontent.com/pitkley/aws-search-extension/indices/cfn.json
    https://raw.githubusercontent.com/pitkley/aws-search-extension/indices/cli.json
    ```

    In other words, it will retrieve the pre-built indices from GitHub out of the `indices` branch that is part of this repository.
    **No other requests will be made!**

    You can verify how these indices are built and committed from within this repository:

    * The [`hack/`](hack/) subdirectory includes the scripts used for generating the JSON-indices.
    * [`.github/workflows/ci.yml`](.github/workflows/ci.yml) contains the CI-code that will generate the indices and automatically commit it to the `indices` branch.

## <a name="license"></a> License

aws-search-extension is licensed under either of

* Apache License, Version 2.0, ([LICENSE-APACHE](LICENSE-APACHE) or <https://www.apache.org/licenses/LICENSE-2.0>)
* MIT license ([LICENSE-MIT](LICENSE-MIT) or <https://opensource.org/licenses/MIT>)

at your option.

### <a name="license-contribution"></a> Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in aws-search-extension by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.

## Affiliation

This repository and the extension have no official affiliation with Amazon Web Services, Inc., Amazon.com, Inc., or any of its affiliates.
Amazon Web Services is a trademark of Amazon.com, Inc. or its affiliates in the United States and/or other countries.
