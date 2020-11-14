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
        const value = ([
            `Prefix ${c.match(":")} to execute command (:history, etc.)`,
        ]);
        return value.map((description, index) => {
            return {content: `${index + 1}`, description};
        });
    }
}
