# Pseudocode Syntax Rules

## Basic Structure

Each top-level step starts with `step-N:` followed by a keyword and optional arguments.

**Format:** `step-N: keyword [argument]`

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
  - Example: `"Count: " + 42` results in `"Count: 42"`

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
- Alignment is based on the position after "if", not the step number length

## Examples

### Single-Digit Steps
```
step-1: start                    ← Required first statement
step-2: read A
step-3: if (A > 0):
          print "Positive"
          if (B > 0):
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
step-2: read X
step-3: read Y
step-4: print "Processing..."
step-5: goto step-10
step-6: print "Skipped"
step-7: goto step-15
step-8: print "Also Skipped"
step-9: goto step-15
step-10: if (X < 0):
           print "Negative"
           if (Y < 0):
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
- Additional nested `if` statements

## Formatting Notes

- No extra spaces around keywords (except the required space before arguments)
- String literals in print statements use double quotes
- **Variable names** follow PascalCase notation (e.g., `VariableName`, `Counter`, `InputValue`)
- **Execution** Consistent spacing and alignment are must.
- **Maximum steps** in an algorithm are 99.
- Every program must start with `step-1: start` and end with `step-N: stop`.
- **Sequential** step numbering
- **Step references** use the format `step-N` (e.g., `step-9`, `step-20`, `step-99`)

