// Copyright Pit Kleyersburg <pitkley@googlemail.com>
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified or distributed
// except according to those terms.

class HelpCommand extends Command {
    constructor() {
        super("help", "Show the help messages.");
    }

    onExecute(_arg) {
        const helpValues = [
            ["!", `Use prefix ${c.match("!")} to execute a command (!update, !history, etc.)`],
            [":", `Use prefix ${c.match(":")} to search for AWS CloudFormation resources`],
            ["/", `Use prefix ${c.match("/")} to search for AWS API operations`],
            ["<service>/", `Use prefix ${c.match(c.escape("<service>/"))} to search for service-specific API operations`],
            ["@", `Use prefix ${c.match("@")} to search for aws-cli commands`],
            ["<service>@", `Use prefix ${c.match(c.escape("<service>@"))} to search for service-specific aws-cli commands`],
        ];
        return helpValues.map(([content, description]) => {
            return { content, description };
        });
    }
}
