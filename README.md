# Algorithm Step Tracer

A simple and modular web application for visualizing the step-by-step execution of algorithms. Built specifically for Chrome browser using standard web technologies.

## Features

- **Step-by-step execution**: Execute algorithms one step at a time with visual feedback
- **Variable tracking**: Dynamic trace table showing variable values at each step
- **Console I/O**: Interactive console for input/output operations
- **Code highlighting**: Current line highlighting with execution history
- **Navigation controls**: Next Step, Previous Step, Restart, and New Code buttons
- **Error handling**: Clear error messages for syntax and runtime errors

## Supported Operations

### Keywords
- `start` - Begin algorithm execution
- `stop` - End algorithm execution
- `print` - Output text to console
- `read` - Read input from user
- `if` - Conditional execution with indented blocks
- `goto` - Jump to specified step

### Operators
- **Arithmetic**: `+`, `-`, `*`, `/` (for integers)
- **Comparison**: `<`, `<=`, `>`, `>=`, `==`, `!=` (for integers)
- **String concatenation**: `+` operator with strings

### Data Types
- **Integers**: Whole numbers
- **Strings**: Text enclosed in double quotes
- **Variables**: Auto-initialized on first use

## Indentation Requirements for If Statements

### Important: Dynamic Indentation Rules

When writing if statements with indented blocks, the indentation must align properly with the if statement. The number of spaces required depends on the step number length.

### Rule: Calculate Required Spaces
The indented lines should align with the content AFTER the "if" keyword:
1. Count the characters in `step-X: if` 
2. Add 1 space for proper alignment
3. Use that many spaces for all indented lines under that if statement

### Examples:

#### Example 1: Two-digit step number
```
step-10: if (Counter < Count):
           print "hello"
           Counter = Counter + 1
```
- The "if" part is: `step-10: if` (10 characters)
- Required indentation: **11 spaces** before each indented line
- Visual alignment: indented lines start at position 11

#### Example 2: Single-digit step number  
```
step-6: if (Counter < Count):
          print "hello"
          Counter = Counter + 1
```
- The "if" part is: `step-6: if` (9 characters)
- Required indentation: **10 spaces** before each indented line
- Visual alignment: indented lines start at position 10

#### Example 3: Three-digit step number
```
step-100: if (Counter < Count):
             print "hello"
             Counter = Counter + 1
```
- The "if" part is: `step-100: if` (12 characters)
- Required indentation: **13 spaces** before each indented line
- Visual alignment: indented lines start at position 13

### Visual Alignment Guide:
```
step-10: if (Counter < Count):
           ↑ indented lines start here (position 11)

step-6: if (Counter < Count):
          ↑ indented lines start here (position 10)

step-100: if (Counter < Count):
             ↑ indented lines start here (position 13)
```

### Common Mistakes:
❌ **Wrong**: Using fixed 2-space indentation
```
step-10: if (Counter < Count):
  print "hello"    # Only 2 spaces - INCORRECT
```

✅ **Correct**: Using dynamic indentation based on step number
```
step-10: if (Counter < Count):
           print "hello"    # 11 spaces - CORRECT
```

### Why This Matters:
- Ensures proper visual alignment of code
- Makes algorithms more readable
- Follows consistent indentation standards
- Required for correct parsing by the application

## Usage

1. Open `index.html` in Chrome browser
2. Enter your algorithm in the text area using the step format:
   ```
   step-1: start
   step-2: print "Hello World!"
   step-3: stop
   ```
3. Click "Start Tracing" to begin execution
4. Use "Next Step" to advance through the algorithm
5. Use "Previous Step" to go back in execution history
6. Use "Restart" to reset to the beginning
7. Use "New Code" to enter a different algorithm

## Example Algorithms

### Simple Addition
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

### Conditional Logic
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

### Loop with Goto
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

## Technical Details

### Architecture
- **Modular Design**: Separate modules for parsing, execution, state management, and UI
- **Client-side Only**: No server required, runs entirely in the browser
- **Standard Web Technologies**: HTML, CSS, and vanilla JavaScript

### Browser Compatibility
- Optimized for Google Chrome
- Uses standard web APIs for maximum compatibility
- Responsive design for desktop and mobile

### File Structure
```
algorithm-tracer/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript application logic
└── README.md           # This documentation
```

## Error Handling

The application handles various error conditions:
- **Syntax Errors**: Invalid step format or malformed commands
- **Runtime Errors**: Division by zero, invalid goto targets
- **Type Errors**: Non-integer comparisons
- **Parse Errors**: Incorrect indentation in if blocks

## Console Features

- **Space Visualization**: Spaces shown as greyed dots (·)
- **Newline Support**: `\n` creates new lines in output
- **Input Prompting**: Clear input prompts for read operations
- **Scrollable Output**: Automatic scrolling to latest output

## Development

The application follows a modular architecture with clear separation of concerns:

1. **Algorithm Parser Module**: Converts text to executable format
2. **Execution Engine Module**: Interprets and executes steps
3. **State Management Module**: Handles execution history and variables
4. **Expression Evaluator Module**: Processes arithmetic and string operations
5. **UI Modules**: Handle display, input, and user interactions

This design makes the application easy to maintain, extend, and debug.

