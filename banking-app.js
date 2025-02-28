// banking-app.js
const readline = require("readline");
const { processTransaction, processInterestRule, calculateInterestAndStatement } = require("./src/banking");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const menu = () => {
    console.log("Welcome to AwesomeGIC Bank! What would you like to do?");
    console.log("[T] Input transactions");
    console.log("[I] Define interest rules");
    console.log("[P] Print statement");
    console.log("[Q] Quit");
    rl.question("> ", handleUserInput);
};

const handleUserInput = (input) => {
    switch (input.toUpperCase()) {
        case "T":
            inputTransaction();
            break;
        case "I":
            inputInterestRule();
            break;
        case "P":
            printBankStatement();
            break;
        case "Q":
            console.log("Thank you for banking with AwesomeGIC Bank.\nHave a nice day!");
            rl.close();
            break;
        default:
            console.log("Invalid option. Try again.");
            menu();
    }
};

const inputTransaction = () => {
    console.log("Please enter transaction details in <Date> <Account> <Type> <Amount> format");
    console.log("(or enter blank to go back to main menu):");
    rl.question("> ", (line) => {
        if (!line) return menu();
        const result = processTransaction(line);
        console.log(result);
        inputTransaction();
    });
};

const inputInterestRule = () => {
    console.log("Please enter interest rules details in <Date> <RuleId> <Rate in %> format");
    console.log("(or enter blank to go back to main menu):");
    rl.question("> ", (line) => {
        if (!line) return menu();
        const result = processInterestRule(line);
        console.log(result);
        inputInterestRule();
    });
};

const printBankStatement = () => {
    console.log("Please enter account and month to generate the statement <Account> <Year><Month>");
    console.log("(or enter blank to go back to main menu):");
    rl.question("> ", (line) => {
        if (!line) return menu();
        const [account, yearMonth] = line.split(" ");
        console.log(calculateInterestAndStatement(account, yearMonth));
        printBankStatement();
    });
};


menu();
