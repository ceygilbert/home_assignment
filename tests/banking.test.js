const { processTransaction, processInterestRule, calculateInterestAndStatement } = require("../src/banking");

test("Deposit transaction", () => {
    expect(processTransaction("20230626 AC001 D 100.00")).toMatch(/Transaction recorded/);
});

test("Withdrawal transaction with enough balance", () => {
    processTransaction("20230626 AC002 D 200.00");
    expect(processTransaction("20230627 AC002 W 50.00")).toMatch(/Transaction recorded/);
});

test("Withdrawal transaction with insufficient balance", () => {
    expect(processTransaction("20230626 AC003 W 50.00")).toBe("Insufficient balance.");
});

test("Invalid interest rule", () => {
    expect(processInterestRule("20230615 RULE03 -5")).toBe("Invalid interest rule format.");
});

test("Print statement for empty account", () => {
    expect(calculateInterestAndStatement("AC999 202306")).toBe("Account not found.");
});
