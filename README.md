![AWS search extension logo](extension/logo.png)

# AWS search extension

AWS search extension is a browser-extension compatible with Google Chrome, Mozilla Firefox and Microsoft Edge (and probably most Chromium-based browsers).
It provides search results for AWS API references and the AWS CloudFormation reference, and opens the official AWS documentation page when you select an item by pressing Enter.

![Demo GIF showcasing AWS search extension](docs/demo.gif)

You can start searching by typing the keyword `aws` into the searchbar, followed by a space (or also tab in Chromium-based browsers), which will select the AWS search extension.
Everything you now type will search through the included indices of the AWS CloudFormation and AWS API documentation.

You can find detailed information on how to structure your queries in the sections below.

## Privacy

The AWS search extension computes all search-suggestions locally and never sends your queries, or any other data, to any external server!
It also doesn't retrieve any data from any servers, the indices it uses are included with the extension when it is installed.

Please note that the extension **can not** guarantee that your browser doesn't collect any data for the queries you enter into its omnibox.

## Supported queries

You can use the following kinds of search-queries:

| Prefix        | Description                                          |
| ------------- | ---------------------------------------------------- |
| *(no prefix)* | Search the AWS CloudFormation documentation          |
| `/`           | Search all API references                            |
| `<service>/`  | Search the API references for the matching services. |

### Example queries

* `a::e::instance`

    Fuzzy-searches the AWS CloudFormation documentation for matching resources, in this case `AWS::EC2::Instance` should be the top match.
    
    ![Example suggestions for query `a::e::instance`](docs/cfn-aeinstance.png)

* `findinmap`

    Fuzzy-searches the AWS CloudFormation documentation for the matching documentation for `Fn::FindInMap`.
    
    ![Example suggestions for query `findinmap`](docs/cfn-findinmap.png)

* `/createmultipart`

    Fuzzy-searches all AWS API references for API-operations matching `createmultipart`.
    
    ![Example suggestions for query `/createmultipart`](docs/api-createmultipart.png)

* `lambda/invoke`

    Fuzzy-searches the AWS Lambda API-reference for API-operations matching `invoke`.
    
    ![Example suggestions for query `lambda/invoke`](docs/api-lambda-invoke.png)

* `api/getapp`

    Searches API-operations matching `getapp` in all services matching `api`.
    
    ![Example suggestions for query `api/getapp`](docs/api-api-getapp.png)

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
