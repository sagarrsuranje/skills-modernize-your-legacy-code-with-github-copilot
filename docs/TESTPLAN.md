# COBOL Account System Test Plan

This test plan covers all business logic in the current COBOL app (MainProgram + Operations + DataProgram).
It is intended for stakeholder validation and can be reused to build Node.js unit and integration tests.

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status (Pass/Fail) | Comments |
|--------------|-----------------------|----------------|------------|-----------------|---------------|--------------------|----------|
| TC-001 | Verify menu displays and accepts choice 1 | App started, balance initialized to 1000.00 | 1) Start app 2) Enter 1 | “Current balance: 1000.00” shown |  |  | "View Balance" reads from DataProgram and shows initial balance. |
| TC-002 | Verify balance persists after credit | App started, balance 1000.00 | 1) Enter 2 2) Credit 500 3) Enter 1 | After credit show 1500.00; then view shows 1500.00 |  |  | Credit calls DataProgram READ, ADD, WRITE. |
| TC-003 | Verify debit with sufficient funds | App started, balance 1000.00 | 1) Enter 3 2) Debit 200 3) Enter 1 | After debit show 800.00; then view shows 800.00 |  |  | Debit checks FINAL-BALANCE >= AMOUNT then writes. |
| TC-004 | Verify debit with insufficient funds | App started, balance 1000.00 | 1) Enter 3 2) Debit 2000 3) Enter 1 | Display "Insufficient funds for this debit." and balance remains 1000.00 |  |  | Debit does not write when insufficient; ensures no negative. |
| TC-005 | Verify invalid menu choice handling | App started | 1) Enter 9 | Display "Invalid choice, please select 1-4." and loop back to menu |  |  | MainProgram EVALUATE WHEN OTHER. |
| TC-006 | Verify exit path sets continue flag to NO | App started | 1) Enter 4 | Program exits with "Exiting the program. Goodbye!" |  |  | MainProgram terminates loop. |
| TC-007 | Verify stateful sequence of operations | App started, balance 1000.00 | 1) Credit 100 2) Debit 50 3) View (1) | New balance is 1050.00 then 1000.00 then shown as 1000.00 |  |  | Cross-case persistence through DataProgram. |
| TC-008 | Verify no write on insufficient debit | Start with balance 500.00 (via setup) | 1) Debit 600 2) View | Display insufficient message; balance still 500.00 |  |  | Edge-case transaction rejection. |

> Notes:
> - Business data is held in `DataProgram`'s `STORAGE-BALANCE`, initially `1000.00`.
> - `Operations` calls `DataProgram` for READ/WRITE and applies no amount validation or scale constraints.
> - Amount input is treated as numeric `9(6)V99`; non-numeric input behavior should be documented for a Node.js port.

