# Pseudocode Syntax Rules

## Basic Structure

Each top-level step starts with `step-N:` followed by a keyword and optional arguments.

**Format:** `step-N: keyword [argument]`

**Required Program Structure:**
- **First statement must be `start`**
- **Last statement must be `stop`**
- **Step numbers must be sequential and increasing (no gaps allowed)**
- **Maximum of 99 steps allowed (step-1 through step-99)**

## Keywords

| Keyword | Arguments | Description |
|---------|-----------|-------------|
| `start` | None | Program starting point |
| `stop` | None | Program termination |
| `read` | Variable name | Input operation |
| `print` | String or expression | Output operation |
| `goto` | Step number | Jump to specified step |
| `if` | Condition in parentheses with colon | Conditional statement |

## Syntax Details

### Simple Commands
```
step-N: start
step-N: stop
step-N: read VariableName
step-N: print "Message"
step-N: goto step-N
```

### If Statements
```
step-N: if (condition):
```

**Requirements:**
- Condition must be enclosed in parentheses
- Must end with a colon `:`
- Body follows on subsequent lines with proper indentation

## Indentation Rules

### Basic Indentation
- If statement body starts at the same column as the **space after "if"**
- This creates consistent alignment regardless of step number

### Nested If Statements
- Each nested if block indents exactly **2 spaces** relative to its parent
- Indentation compounds for deeper nesting levels

### Step Number Consistency
- Rules apply identically for single-digit (1-9) and two-digit (10-99) steps
- **Maximum step number is 99**
- Alignment is based on the position after "if", not the step number length

## Data Types and Expressions

### Data Types
- `Int` - Integer numbers
- `String` - Text strings (enclosed in double quotes)

### Operators

#### Arithmetic Operations (Int only)
- `+` Addition
- `-` Subtraction  
- `*` Multiplication
- `/` Division
- `%` Modulus
- **Behavior follows C language semantics**

#### String Operations
- `+` Concatenation (String + String)

#### Mixed Type Operations
- `+` with String and Int: **Int is automatically converted to String, then concatenated**
  - Example: `"Count: " + Counter` results in `"Count: 42"` (if Counter = 42)

#### Assignment
- `=` Assignment operator

#### Comparison Operations
- `<` Less than
- `<=` Less than or equal
- `>` Greater than  
- `>=` Greater than or equal
- `==` Equal to
- `!=` Not equal to

#### Precedence and Grouping
- **Parentheses `()` allowed for precedence control**
- **BODMAS precedence rules followed (like C language)**
- Order: Parentheses → Multiplication/Division/Modulus → Addition/Subtraction → Comparisons

### Expression Rules
- **Only the above operators are allowed**

## Examples

### Single-Digit Steps
```
step-1: start                    ← Required first statement
step-2: read Num1
step-3: if (Num1 > 0):
          print "Positive"
          if (Num2 > 0):
            print "Both Positive"
            goto step-9
          goto step-8
step-8: print "Done"
step-9: stop                     ← Required last statement
```

**Indentation Analysis:**
- `step-3:` body starts at column 10 (space after "if")
- Nested if indents 2 spaces from parent (column 12)

### Two-Digit Steps
```
step-1: start                    ← Required first statement
step-2: read InputX
step-3: read InputY
step-4: print "Processing..."
step-5: goto step-10
step-6: print "Skipped"
step-7: goto step-15
step-8: print "Also Skipped"
step-9: goto step-15
step-10: if (InputX < 0):
           print "Negative"
           if (InputY < 0):
             print "Both Negative"
             goto step-15
           goto step-14
step-11: print "Unreachable"
step-12: print "Also Unreachable"
step-13: print "Still Unreachable"
step-14: print "X negative, Y non-negative"
step-15: stop                    ← Required last statement
```

**Indentation Analysis:**
- `step-10:` body starts at column 12 (space after "if")
- Nested if indents 2 spaces from parent (column 14)

## Valid If Body Statements

Within an if statement body, the following are allowed:
- `print` statements
- `read` statements  
- `goto` statements
- **One additional nested `if` statement (single-level nesting only)**

## Indentation and Execution Flow

Indentation determines the control flow structure and execution scope:

**Example Analysis from Two-Digit Steps:**
```
step-10: if (InputX < 0):
           print "Negative"        ← Outer if body
           if (InputY < 0):        ← Outer if body  
             print "Both Negative" ← Inner if body
             goto step-15          ← Inner if body
           goto step-14            ← Outer if body (executes regardless of inner if result)
```

The `goto step-14` statement is indented 2 spaces less than the inner if body statements, making it part of the **outer if body**. This means it will execute after the inner if completes, regardless of whether the inner condition `(InputY < 0)` was true or false.

## Formatting Notes

- No extra spaces around keywords (except the required space before arguments)
- String literals in print statements use double quotes
- **Variable names** follow PascalCase notation (e.g., `VariableName`, `Counter`, `InputValue`)

## Coding Style

- **String concatenation and mixed operations with `+` must have exactly one space on each side of the operator**
  - ✅ Correct: `"Welcome to " + "Enhance" + 42`
  - ✅ Correct: `"Hello " + UserName + " World"`  
  - ❌ Incorrect: `"Welcome to "+"Enhance"+42` (Coding Style not followed)
  - ❌ Incorrect: `"Hello "+UserName+" World"` (Coding Style not followed)
- **Variable names must follow PascalCase notation**
  - ✅ Correct: `VariableName`, `Counter`, `InputValue`, `UserName`
  - ❌ Incorrect: `variableName`, `counter`, `inputvalue` (PascalCase variable names not followed)
- **When these rules are violated, flag appropriately:**
  - **"Coding Style not followed"** for spacing violations
  - **"PascalCase variable names not followed"** for naming violations