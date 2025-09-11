# Algorithm Step Tracer - Application Specification

## Core Description (12 lines max)
1. User inputs algorithm steps in plain text with step labels (step-1, step-2, etc.)
2. App recognizes keywords: start, stop, read, print, if, goto (all lowercase)
3. Main interface shows code on left side with current line highlighted
4. Right side displays trace table with step number, variable columns, and Output column
5. Below trace table is input/output console for read/print operations
6. "Next Step" button executes current line and updates trace table
7. "Previous Step" button undoes last execution and restores previous state
8. "Restart" button resets execution to step-1 with empty trace table
9. "New Code" button returns to input screen for entering different algorithm
10. For `read`, app pauses and waits for console input before continuing
11. `if` statements show sub-steps (8a, 8b, etc.) when condition is true
12. Variables appear in table only when updated; Output column shows print results

## Key Operations

### `+` Operator Behavior
- **Integer + Integer** = Integer addition
- **String + String** = String concatenation  
- **Integer + String** or **String + Integer** = Convert integer to string, then concatenate

### Supported Operators
- **Comparison operators:** `<`, `<=`, `>`, `>=`, `==`, `!=` (integers only)
- **Arithmetic operators:** `+`, `-`, `*`, `/` (for integer operations)

### Console Display
- Spaces shown as greyed out dots (·)
- `\n` creates new lines
- User input appears inline after prompts

### Variables
- Auto-initialize when first used in read or assignment statements
- No need to track undefined states
- Can hold integers or strings

## Example 1: Simple Addition

### Algorithm:
```
step-1: start
step-2: print "To add two numbers.\n"
step-3: print "Enter the first number: "
step-4: read Num1
step-5: print "Enter the second number: "
step-6: read Num2
step-7: Sum = Num1 + Num2
step-8: print "The sum of " + Num1 + " and " + Num2 + " is " + Sum + ".\n"
step-9: stop
```

### Trace Execution:
- Step-1: Nothing in table, execution starts
- Step-2: Table adds row with Output="To add two numbers.\n"
- Step-3: Table adds row with Output="Enter the first number: "
- Step-4: Waits for input (user types 10), table adds row with Num1=10
- Step-5: Table adds row with Output="Enter the second number: "
- Step-6: Waits for input (user types 20), table adds row with Num2=20
- Step-7: Table adds row with Sum=30
- Step-8: Table adds row with Output="The sum of 10 and 20 is 30.\n"
- Step-9: Execution stops

### Console Display (· = greyed out dot for space):
```
To·add·two·numbers.
Enter·the·first·number:·10
Enter·the·second·number:·20
The·sum·of·10·and·20·is·30.
```

## Example 2: Conditional with If

### Algorithm:
```
step-1: start
step-2: print "Enter your age: "
step-3: read Age
step-4: CanVote = "No"
step-5: if Age >= 18
          CanVote = "Yes"
          print "You are eligible to vote!\n"
step-6: print "Can vote status: " + CanVote + "\n"
step-7: stop
```

### Trace Execution (Age=21):
- Step-1: Execution starts
- Step-2: Table adds row with Output="Enter your age: "
- Step-3: Waits for input (21), table adds row with Age=21
- Step-4: Table adds row with CanVote="No"
- Step-5: Condition true (21 >= 18):
  - Step-5a: Table adds row with CanVote="Yes"
  - Step-5b: Table adds row with Output="You are eligible to vote!\n"
- Step-6: Table adds row with Output="Can vote status: Yes\n"
- Step-7: Execution stops

### Console Display (· = greyed out dot for space):
```
Enter·your·age:·21
You·are·eligible·to·vote!
Can·vote·status:·Yes
```

## Example 3: Loop with Goto

### Algorithm:
```
step-1: start
step-2: print "Count from 1 to: "
step-3: read Max
step-4: Counter = 1
step-5: if Counter <= Max
          print Counter + " "
          Counter = Counter + 1
          goto step-5
step-6: print "\nDone!\n"
step-7: stop
```

### Trace Execution (Max=3):
- Step-1: Execution starts
- Step-2: Table adds row with Output="Count from 1 to: "
- Step-3: User inputs 3, table adds row with Max=3
- Step-4: Table adds row with Counter=1
- Step-5: First iteration (1 <= 3 is true):
  - Step-5a: Table adds row with Output="1 "
  - Step-5b: Table adds row with Counter=2
  - Step-5c: Jumps to step-5
- Step-5: Second iteration (2 <= 3 is true):
  - Step-5a: Table adds row with Output="2 "
  - Step-5b: Table adds row with Counter=3
  - Step-5c: Jumps to step-5
- Step-5: Third iteration (3 <= 3 is true):
  - Step-5a: Table adds row with Output="3 "
  - Step-5b: Table adds row with Counter=4
  - Step-5c: Jumps to step-5
- Step-5: Fourth check (4 <= 3 is false), continues to step-6
- Step-6: Table adds row with Output="\nDone!\n"
- Step-7: Execution stops

### Console Display (· = greyed out dot for space):
```
Count·from·1·to:·3
1·2·3·
Done!
```

### Sample Trace Table Visualization:
```
+--------+---------+---------+------------------+
| Step   | Max     | Counter | Output           |
+--------+---------+---------+------------------+
| 2      |         |         | Count from 1 to: |
| 3      | 3       |         |                  |
| 4      |         | 1       |                  |
| 5a     |         |         | 1                |
| 5b     |         | 2       |                  |
| 5a     |         |         | 2                |
| 5b     |         | 3       |                  |
| 5a     |         |         | 3                |
| 5b     |         | 4       |                  |
| 6      |         |         | \nDone!\n        |
+--------+---------+---------+------------------+
```

## Additional Notes

### If Statement Behavior
- Condition evaluates to true or false
- If true: Execute all indented statements (labeled as 5a, 5b, 5c, etc.)
- If false: Skip entire indented block, continue to next non-indented step
- Indented statements must be 2 character positions indented

### Goto Statement
- Can be used independently or within if blocks
- Jumps to specified step label
- Execution continues from target step

### Read Statement
- Pauses execution and waits for user input
- "Next Step" button disabled until input provided
- Input entered in console, followed by Enter key
- Attempts to parse as integer; if not valid integer, treats as string

### Print Statement
- Concatenates all parts using + operator rules
- Outputs result to both console and Output column in trace table
- Supports escape sequence \n for new lines

### Error Handling
- Division by zero: Show error message
- Invalid goto target: Show error message
- Non-integer in comparison: Show error message