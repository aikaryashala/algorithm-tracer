// Algorithm Tracer Application
class AlgorithmTracer {
    constructor() {
        this.algorithm = [];
        this.currentStep = 0;
        this.variables = new Map();
        this.consoleOutput = "";
        this.executionHistory = [];
        this.isWaitingForInput = false;
        this.traceData = [];
        this.variableColumns = new Set();
        this.codeLineElements = []; // Track code line elements for highlighting
        this.currentExecutingSubCommand = undefined; // Track current sub-command in if blocks
        this.isExecutingIfBlock = false; // Track if we're executing an if block
        this.ifBlockCommands = []; // Store remaining if block commands to execute
        this.currentIfStep = null; // Store the current if step number
        
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        // Screens
        this.inputScreen = document.getElementById("input-screen");
        this.executionScreen = document.getElementById("execution-screen");
        
        // Input elements
        this.algorithmInput = document.getElementById("algorithm-input");
        this.startTraceBtn = document.getElementById("start-trace-btn");
        
        // Execution elements
        this.codeDisplay = document.getElementById("code-display");
        this.traceTable = document.getElementById("trace-table");
        this.consoleOutputEl = document.getElementById("console-output");
        this.consoleInputContainer = document.getElementById("console-input-container");
        this.consoleInput = document.getElementById("console-input");
        this.submitInputBtn = document.getElementById("submit-input-btn");
        
        // Control buttons
        this.prevStepBtn = document.getElementById("prev-step-btn");
        this.nextStepBtn = document.getElementById("next-step-btn");
        this.restartBtn = document.getElementById("restart-btn");
        this.newCodeBtn = document.getElementById("new-code-btn");
        
        // Error display
        this.errorDisplay = document.getElementById("error-display");
    }

    attachEventListeners() {
        this.startTraceBtn.addEventListener("click", () => this.startTracing());
        this.nextStepBtn.addEventListener("click", () => this.nextStep());
        this.prevStepBtn.addEventListener("click", () => this.previousStep());
        this.restartBtn.addEventListener("click", () => this.restart());
        this.newCodeBtn.addEventListener("click", () => this.newCode());
        this.submitInputBtn.addEventListener("click", () => this.submitInput());
        this.consoleInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") this.submitInput();
        });
        
        // Error display close
        document.querySelector(".error-close").addEventListener("click", () => {
            this.errorDisplay.style.display = "none";
        });
    }

    showError(message) {
        document.querySelector(".error-message").textContent = message;
        this.errorDisplay.style.display = "block";
        setTimeout(() => {
            this.errorDisplay.style.display = "none";
        }, 5000);
    }

    parseAlgorithm(text) {
        const lines = text.split("\n").map(line => line.trimEnd()); // Keep leading spaces for indentation check
        const algorithm = [];
        const allVariables = new Set();
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();

            if (!trimmedLine) continue; // Skip empty lines
            
            // Check if this is an indented line (should be handled by previous if block)
            if (line.startsWith("  ") || line.startsWith("\t")) {
                // This is an indented line that wasn't consumed by an if block
                // This means it's either orphaned or there's a parsing issue
                throw new Error(`Unexpected indented line at line ${i + 1}: ${line.trim()}`);
            }
            
            const stepMatch = trimmedLine.match(/^step-(\d+):\s*(.+)$/);
            
            if (!stepMatch) {
                throw new Error(`Invalid step format at line ${i + 1}: ${line}`);
            }
            
            const stepNumber = parseInt(stepMatch[1]);
            const command = stepMatch[2].trim();
            
            // Extract variables from the current command
            this.extractVariables(command).forEach(v => allVariables.add(v));

            // Parse if statements with indented blocks
            if (command.startsWith("if ")) {
                let condition = command.substring(3).trim();
                
                // Remove trailing colon if present (support both "if condition" and "if condition:" syntax)
                if (condition.endsWith(":")) {
                    condition = condition.slice(0, -1).trim();
                }
                
                // Parse the if block recursively
                const parseResult = this.parseIfBlock(lines, i + 1, stepNumber);
                const ifBlock = parseResult.commands;
                
                // Extract variables from the if block
                this.extractVariablesFromBlock(ifBlock).forEach(v => allVariables.add(v));
                
                algorithm.push({
                    step: stepNumber,
                    type: "if",
                    condition: condition,
                    ifBlock: ifBlock,
                    originalLine: line
                });
                
                i = parseResult.nextLineIndex - 1; // Skip the processed indented lines
            } else {
                algorithm.push({
                    step: stepNumber,
                    type: this.getCommandType(command),
                    command: command,
                    originalLine: line
                });
            }
        }
        
        return { algorithm, variables: Array.from(allVariables) };
    }

    parseIfBlock(lines, startIndex, parentStepNumber) {
        const commands = [];
        let i = startIndex;
        
        // Calculate expected indentation based on parent step
        const stepPrefix = `step-${parentStepNumber}: if`;
        const expectedIndentation = stepPrefix.length;
        const indentationSpaces = ' '.repeat(expectedIndentation);
        
        while (i < lines.length) {
            const line = lines[i];
            const trimmedLine = line.trim();
            
            // Check if this line has the expected indentation
            if (line.startsWith(indentationSpaces) || (line.startsWith("  ") && trimmedLine)) {
                if (!trimmedLine) {
                    i++;
                    continue; // Skip empty indented lines
                }
                
                // Check if this is a nested if statement
                if (trimmedLine.startsWith("if ")) {
                    let condition = trimmedLine.substring(3).trim();
                    if (condition.endsWith(":")) {
                        condition = condition.slice(0, -1).trim();
                    }
                    
                    // Calculate the indentation level for the nested if
                    const leadingSpaces = line.length - line.trimStart().length;
                    
                    // Parse the nested if block
                    const nestedResult = this.parseNestedIfBlock(lines, i + 1, leadingSpaces);
                    
                    commands.push({
                        type: "nested-if",
                        condition: condition,
                        ifBlock: nestedResult.commands,
                        originalLine: trimmedLine
                    });
                    
                    i = nestedResult.nextLineIndex;
                } else {
                    // Regular command
                    commands.push({
                        type: "command",
                        command: trimmedLine,
                        originalLine: trimmedLine
                    });
                    i++;
                }
            } else {
                // Not indented, end of if block
                break;
            }
        }
        
        return { commands: commands, nextLineIndex: i };
    }

    parseNestedIfBlock(lines, startIndex, parentIndentLevel) {
        const commands = [];
        let i = startIndex;
        
        // For nested if, we need more indentation than the parent
        const expectedMinIndent = parentIndentLevel + 2; // At least 2 more spaces
        
        while (i < lines.length) {
            const line = lines[i];
            const trimmedLine = line.trim();
            const currentIndent = line.length - line.trimStart().length;
            
            // Check if this line has enough indentation for the nested block
            if (currentIndent >= expectedMinIndent && trimmedLine) {
                // Check for another level of nested if
                if (trimmedLine.startsWith("if ")) {
                    let condition = trimmedLine.substring(3).trim();
                    if (condition.endsWith(":")) {
                        condition = condition.slice(0, -1).trim();
                    }
                    
                    // Parse the nested if block recursively
                    const nestedResult = this.parseNestedIfBlock(lines, i + 1, currentIndent);
                    
                    commands.push({
                        type: "nested-if",
                        condition: condition,
                        ifBlock: nestedResult.commands,
                        originalLine: trimmedLine
                    });
                    
                    i = nestedResult.nextLineIndex;
                } else {
                    // Regular command in nested block
                    commands.push({
                        type: "command",
                        command: trimmedLine,
                        originalLine: trimmedLine
                    });
                    i++;
                }
            } else if (currentIndent > parentIndentLevel && currentIndent < expectedMinIndent && trimmedLine) {
                // This might be a continuation at an intermediate level - stop parsing
                break;
            } else if (!trimmedLine && currentIndent >= expectedMinIndent) {
                // Empty line with proper indentation - skip
                i++;
            } else {
                // Not properly indented for this nested block, end of block
                break;
            }
        }
        
        return { commands: commands, nextLineIndex: i };
    }

    extractVariables(command) {
        const variables = new Set();

        // For assignment statements: VarName = Expression
        const assignmentMatch = command.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.*)$/);
        if (assignmentMatch) {
            variables.add(assignmentMatch[1]);
        }

        // For read statements: read VarName
        const readMatch = command.match(/^read\s+([a-zA-Z_][a-zA-Z0-9_]*)$/);
        if (readMatch) {
            variables.add(readMatch[1]);
        }

        return variables;
    }

    extractVariablesFromBlock(block) {
        const variables = new Set();
        
        for (const item of block) {
            if (item.type === "command") {
                this.extractVariables(item.command).forEach(v => variables.add(v));
            } else if (item.type === "nested-if") {
                // Recursively extract from nested if blocks
                this.extractVariablesFromBlock(item.ifBlock).forEach(v => variables.add(v));
            }
        }
        
        return variables;
    }

    getCommandType(command) {
        if (command === "start") return "start";
        if (command === "stop") return "stop";
        if (command.startsWith("print ")) return "print";
        if (command.startsWith("read ")) return "read";
        if (command.startsWith("goto ")) return "goto";
        if (command.includes(" = ")) return "assignment";
        return "unknown";
    }

    startTracing() {
        try {
            const algorithmText = this.algorithmInput.value.trim();
            if (!algorithmText) {
                this.showError("Please enter an algorithm");
                return;
            }
            
            const parsed = this.parseAlgorithm(algorithmText);
            this.algorithm = parsed.algorithm;
            this.variableColumns = new Set(parsed.variables);
            this.reset();
            this.displayCode();
            this.switchToExecutionScreen();
            
        } catch (error) {
            this.showError(error.message);
        }
    }

    reset() {
        this.currentStep = 0;
        this.variables.clear();
        this.consoleOutput = "";
        this.executionHistory = [];
        this.isWaitingForInput = false;
        this.traceData = [];
        this.codeLineElements = [];
        this.currentExecutingSubCommand = undefined;
        this.isExecutingIfBlock = false;
        this.ifBlockCommands = [];
        this.currentIfStep = null;
        
        this.updateDisplay();
    }

    displayCode() {
        this.codeDisplay.innerHTML = "";
        this.codeLineElements = []; // Track all code line elements for highlighting
        
        this.algorithm.forEach((step, index) => {
            const lineEl = document.createElement("div");
            lineEl.className = "code-line";
            lineEl.textContent = step.originalLine;
            lineEl.dataset.stepIndex = index;
            lineEl.dataset.lineType = "main";
            this.codeDisplay.appendChild(lineEl);
            this.codeLineElements.push(lineEl);

            // If it's an if statement, also display its indented block
            if (step.type === "if" && step.ifBlock && step.ifBlock.length > 0) {
                // Calculate proper indentation based on step number
                const stepPrefix = `step-${step.step}: if`;
                const baseIndentSpaces = ' '.repeat(stepPrefix.length);
                
                this.displayIfBlock(step.ifBlock, index, baseIndentSpaces, 0);
            }
        });
    }

    displayIfBlock(block, parentStepIndex, baseIndent, subCommandOffset) {
        let currentOffset = subCommandOffset;
        
        block.forEach((item, itemIndex) => {
            if (item.type === "command") {
                const subLineEl = document.createElement("div");
                subLineEl.className = "code-line";
                subLineEl.textContent = baseIndent + item.command;
                subLineEl.dataset.stepIndex = parentStepIndex;
                subLineEl.dataset.subIndex = currentOffset;
                subLineEl.dataset.lineType = "sub";
                this.codeDisplay.appendChild(subLineEl);
                this.codeLineElements.push(subLineEl);
                currentOffset++;
            } else if (item.type === "nested-if") {
                // Display the nested if statement
                const nestedIfElement = document.createElement("div");
                nestedIfElement.className = "code-line";
                nestedIfElement.textContent = baseIndent + "if " + item.condition + ":";
                nestedIfElement.dataset.stepIndex = parentStepIndex;
                nestedIfElement.dataset.subIndex = currentOffset;
                nestedIfElement.dataset.lineType = "sub";
                this.codeDisplay.appendChild(nestedIfElement);
                this.codeLineElements.push(nestedIfElement);
                currentOffset++;
                
                // Display the nested if block with additional indentation
                const nestedIndent = baseIndent + "  "; // Add 2 more spaces for nested blocks
                currentOffset = this.displayIfBlock(item.ifBlock, parentStepIndex, nestedIndent, currentOffset);
            }
        });
        
        return currentOffset;
    }

    switchToExecutionScreen() {
        this.inputScreen.classList.remove("active");
        this.executionScreen.classList.add("active");
    }

    switchToInputScreen() {
        this.executionScreen.classList.remove("active");
        this.inputScreen.classList.add("active");
    }

    updateDisplay() {
        this.updateCodeHighlight();
        this.updateTraceTable();
        this.updateConsole();
        this.updateButtons();
    }

    updateCodeHighlight() {
        // Reset all highlighting
        this.codeLineElements.forEach(line => {
            line.classList.remove("current");
        });
        
        // Handle highlighting for currently executing if block sub-commands
        if (this.currentExecutingSubCommand !== undefined) {
            this.codeLineElements.forEach(line => {
                const stepIndex = parseInt(line.dataset.stepIndex);
                const subIndex = parseInt(line.dataset.subIndex);
                const lineType = line.dataset.lineType;
                
                if (stepIndex === this.currentStep && lineType === "sub" && subIndex === this.currentExecutingSubCommand) {
                    line.classList.add("current");
                }
            });
        } else {
            // Only highlight main line if we're not executing sub-commands
            this.codeLineElements.forEach(line => {
                const stepIndex = parseInt(line.dataset.stepIndex);
                const lineType = line.dataset.lineType;
                
                if (stepIndex === this.currentStep && lineType === "main") {
                    line.classList.add("current");
                }
            });
        }
    }

    updateTraceTable() {
        // Update table headers
        const thead = this.traceTable.querySelector("thead tr");
        thead.innerHTML = "<th>Step</th>";
        
        // Add variable columns
        this.variableColumns.forEach(varName => {
            const th = document.createElement("th");
            th.textContent = varName;
            thead.appendChild(th);
        });
        
        // Add Output column
        const outputTh = document.createElement("th");
        outputTh.textContent = "Output";
        thead.appendChild(outputTh);
        
        // Update table body
        const tbody = this.traceTable.querySelector("tbody");
        tbody.innerHTML = "";
        
        this.traceData.forEach(row => {
            const tr = document.createElement("tr");
            
            // Step column
            const stepTd = document.createElement("td");
            stepTd.textContent = row.step;
            tr.appendChild(stepTd);
            
            // Variable columns
            this.variableColumns.forEach(varName => {
                const td = document.createElement("td");
                td.textContent = row.changedVariables.has(varName) ? row.changedVariables.get(varName) : "";
                tr.appendChild(td);
            });
            
            // Output column
            const outputTd = document.createElement("td");
            outputTd.textContent = row.output || "";
            tr.appendChild(outputTd);
            
            tbody.appendChild(tr);
        });
        
        // Auto-scroll to the latest row in the table container
        const tableContainer = document.querySelector(".table-container");
        if (tableContainer) {
            setTimeout(() => {
                tableContainer.scrollTop = tableContainer.scrollHeight;
            }, 0);
        }
    }

    updateConsole() {
        this.consoleOutputEl.textContent = this.formatConsoleOutput(this.consoleOutput);
        this.consoleOutputEl.scrollTop = this.consoleOutputEl.scrollHeight;
    }

    formatConsoleOutput(text) {
        // Replace spaces with dots for visualization
        return text.replace(/ /g, "·");
    }

    updateButtons() {
        this.prevStepBtn.disabled = this.executionHistory.length === 0;
        
        // Next button is disabled if waiting for input or if we've reached the end
        // (unless we're in an if block with more commands to execute)
        this.nextStepBtn.disabled = this.isWaitingForInput || 
            (!this.isExecutingIfBlock && this.currentStep >= this.algorithm.length);
        
        if (this.isWaitingForInput) {
            this.consoleInputContainer.style.display = "flex";
            this.consoleInput.focus();
        } else {
            this.consoleInputContainer.style.display = "none";
        }
    }

    saveState() {
        this.executionHistory.push({
            currentStep: this.currentStep,
            variables: new Map(this.variables),
            consoleOutput: this.consoleOutput,
            traceData: [...this.traceData],
            variableColumns: new Set(this.variableColumns),
            isExecutingIfBlock: this.isExecutingIfBlock,
            ifBlockCommands: [...this.ifBlockCommands],
            currentIfStep: this.currentIfStep,
            currentExecutingSubCommand: this.currentExecutingSubCommand
        });
    }

    nextStep() {
        if (this.isWaitingForInput || this.currentStep >= this.algorithm.length) return;
        
        this.saveState();
        
        try {
            this.executeStep();
        } catch (error) {
            this.showError(error.message);
            // Restore previous state on error
            this.previousStep();
        }
    }

    executeStep() {
        // Check if we're executing an if block
        if (this.isExecutingIfBlock && this.ifBlockCommands.length > 0) {
            this.executeIfSubCommand();
            return;
        }
        
        const step = this.algorithm[this.currentStep];
        
        switch (step.type) {
            case "start":
                this.addTraceRow(step.step, "", new Map()); // No variables changed at start
                this.currentStep++;
                break;
                
            case "stop":
                this.addTraceRow(step.step, "", new Map()); // No variables changed at stop
                this.currentStep++;
                break;
                
            case "print":
                const printOutput = this.evaluateExpression(step.command.substring(6).trim());
                this.consoleOutput += printOutput;
                this.addTraceRow(step.step, printOutput, new Map()); // No variables changed in print, only output
                this.currentStep++;
                break;
                
            case "read":
                const varName = step.command.substring(5).trim();
                this.isWaitingForInput = true;
                this.waitingForVariable = varName;
                this.waitingStep = step.step;
                // No addTraceRow here, it will be added in submitInput
                break;
                
            case "assignment":
                this.executeAssignment(step.command, step.step);
                this.currentStep++;
                break;
                
            case "if":
                this.executeIf(step);
                break;
                
            case "goto":
                this.executeGoto(step.command);
                break;
                
            default:
                throw new Error(`Unknown command type: ${step.type}`);
        }
        
        this.updateDisplay();
    }

    executeAssignment(command, stepNum) {
        // Find the first unquoted '=' to split the variable name and expression
        let eqIndex = -1;
        let inQuote = false;
        for (let i = 0; i < command.length; i++) {
            if (command[i] === '"') {
                inQuote = !inQuote;
            } else if (command[i] === '=' && !inQuote) {
                eqIndex = i;
                break;
            }
        }

        if (eqIndex === -1) {
            throw new Error(`Invalid assignment: ${command}`);
        }
        
        const varName = command.substring(0, eqIndex).trim();
        const expression = command.substring(eqIndex + 1).trim();
        const value = this.evaluateExpression(expression);
        
        this.variables.set(varName, value);
        this.variableColumns.add(varName);
        this.addTraceRow(stepNum, "", new Map([[varName, value]]));
    }

    executeIf(step) {
        const conditionResult = this.evaluateCondition(step.condition);
        
        if (conditionResult) {
            // Set up for executing if block one command at a time
            // Convert the parsed block structure to executable commands
            this.isExecutingIfBlock = true;
            this.ifBlockCommands = [...step.ifBlock]; // Now these are objects with type and command/condition
            this.currentIfStep = step.step;
            this.currentExecutingSubCommand = 0;
        } else {
            // Condition is false, skip to next step
            this.currentStep++;
        }
        
        this.updateDisplay();
    }

    executeIfSubCommand() {
        if (this.ifBlockCommands.length === 0) {
            // Finished executing if block
            this.isExecutingIfBlock = false;
            this.currentExecutingSubCommand = undefined;
            this.currentIfStep = null;
            this.currentStep++;
            this.updateDisplay();
            return;
        }
        
        const subItem = this.ifBlockCommands.shift();
        const subStepLabel = `${this.currentIfStep}${String.fromCharCode(97 + this.currentExecutingSubCommand)}`;
        
        // Handle different types of sub-items
        if (subItem.type === "command") {
            const subCommand = subItem.command;
            
            // Skip empty commands
            if (!subCommand.trim()) {
                this.currentExecutingSubCommand++;
                this.executeIfSubCommand(); // Recursively execute next
                return;
            }
            
            const commandType = this.getCommandType(subCommand);
            
            try {
                if (commandType === "goto") {
                    this.executeGoto(subCommand);
                    // Clear if block execution state after goto
                    this.isExecutingIfBlock = false;
                    this.ifBlockCommands = [];
                    this.currentExecutingSubCommand = undefined;
                    this.currentIfStep = null;
                } else if (commandType === "assignment") {
                    this.executeAssignment(subCommand, subStepLabel);
                    this.currentExecutingSubCommand++;
                } else if (commandType === "print") {
                    const printOutput = this.evaluateExpression(subCommand.substring(6).trim());
                    this.consoleOutput += printOutput;
                    this.addTraceRow(subStepLabel, printOutput, new Map());
                    this.currentExecutingSubCommand++;
                } else if (commandType === "read") {
                    const varName = subCommand.substring(5).trim();
                    this.isWaitingForInput = true;
                    this.waitingForVariable = varName;
                    this.waitingStep = subStepLabel;
                    // Don't increment currentExecutingSubCommand here, will be done after input
                } else {
                    throw new Error(`Unsupported command in if block: ${subCommand}`);
                }
            } catch (error) {
                // On error, clear if block execution and rethrow
                this.isExecutingIfBlock = false;
                this.ifBlockCommands = [];
                this.currentExecutingSubCommand = undefined;
                this.currentIfStep = null;
                throw error;
            }
        } else if (subItem.type === "nested-if") {
            // Handle nested if statement
            const conditionResult = this.evaluateCondition(subItem.condition);
            
            if (conditionResult) {
                // Insert the nested if block commands at the beginning of the remaining commands
                const nestedCommands = [...subItem.ifBlock];
                this.ifBlockCommands = nestedCommands.concat(this.ifBlockCommands);
            }
            
            // Move to next sub-command
            this.currentExecutingSubCommand++;
        }
        
        this.updateDisplay();
    }

    executeGoto(command) {
        const targetStepMatch = command.match(/goto step-(\d+)/);
        if (!targetStepMatch) {
            throw new Error(`Invalid goto command: ${command}`);
        }
        
        const targetStep = parseInt(targetStepMatch[1]);
        const targetIndex = this.algorithm.findIndex(step => step.step === targetStep);
        
        if (targetIndex === -1) {
            throw new Error(`Invalid goto target: step-${targetStep}`);
        }
        
        this.currentStep = targetIndex;
    }

    evaluateCondition(condition) {
        // Remove outer parentheses if present
        condition = condition.trim();
        if (condition.startsWith("(") && condition.endsWith(")")) {
            condition = condition.slice(1, -1).trim();
        }
        
        // Simple condition evaluation for comparison operators
        const operators = ["<=", ">=", "==", "!=", "<", ">"];
        
        for (const op of operators) {
            if (condition.includes(op)) {
                const parts = condition.split(op).map(p => p.trim());
                if (parts.length === 2) {
                    const left = this.evaluateExpression(parts[0]);
                    const right = this.evaluateExpression(parts[1]);
                    
                    // Ensure both operands are integers for comparison
                    if (!Number.isInteger(left) || !Number.isInteger(right)) {
                        throw new Error("Comparison operators only work with integers");
                    }
                    
                    switch (op) {
                        case "<": return left < right;
                        case "<=": return left <= right;
                        case ">": return left > right;
                        case ">=": return left >= right;
                        case "==": return left === right;
                        case "!=": return left !== right;
                    }
                }
            }
        }
        
        throw new Error(`Invalid condition: ${condition}`);
    }

    evaluateExpression(expr) {
        expr = expr.trim();

        // Handle parentheses by recursively evaluating sub-expressions
        while (expr.includes('(')) {
            let openIndex = -1;
            let closeIndex = -1;
            let depth = 0;
            
            // Find the innermost parentheses
            for (let i = 0; i < expr.length; i++) {
                if (expr[i] === '(') {
                    if (depth === 0) openIndex = i;
                    depth++;
                } else if (expr[i] === ')') {
                    depth--;
                    if (depth === 0) {
                        closeIndex = i;
                        break;
                    }
                }
            }
            
            if (openIndex === -1 || closeIndex === -1) {
                throw new Error('Mismatched parentheses in expression');
            }
            
            // Evaluate the sub-expression inside parentheses
            const subExpr = expr.substring(openIndex + 1, closeIndex);
            const subResult = this.evaluateExpression(subExpr);
            
            // Replace the parentheses and their content with the result
            expr = expr.substring(0, openIndex) + subResult + expr.substring(closeIndex + 1);
        }

        const tokens = [];
        let i = 0;
        while (i < expr.length) {
            let char = expr[i];

            // Handle string literals
            if (char === '"') {
                let j = i + 1;
                while (j < expr.length) {
                    if (expr[j] === '"' && expr[j-1] !== '\\') { // Check for unescaped quote
                        break;
                    }
                    j++;
                }
                if (j === expr.length) {
                    throw new Error(`Unterminated string literal: ${expr.substring(i)}`);
                }
                tokens.push(expr.substring(i, j + 1));
                i = j + 1;
                continue;
            }

            // Handle operators
            if (['+', '-', '*', '/', '%'].includes(char)) {
                tokens.push(char);
                i++;
                continue;
            }

            // Handle whitespace
            if (char === ' ') {
                i++;
                continue;
            }

            // Handle numbers and variable names
            let j = i;
            while (j < expr.length && !['"', '+', '-', '*', '/', '%', ' '].includes(expr[j])) {
                j++;
            }
            tokens.push(expr.substring(i, j));
            i = j;
        }

        // Evaluate tokens (simple left-to-right evaluation)
        if (tokens.length === 0) return "";

        let result = this.getLiteralValue(tokens[0]);

        for (let k = 1; k < tokens.length; k++) {
            const operator = tokens[k];
            if (['+', '-', '*', '/', '%'].includes(operator)) {
                if (k + 1 < tokens.length) {
                    const nextOperand = this.getLiteralValue(tokens[k + 1]);
                    
                    switch (operator) {
                        case '+':
                            if (typeof result === 'string' || typeof nextOperand === 'string') {
                                result = String(result) + String(nextOperand);
                            } else {
                                result = result + nextOperand;
                            }
                            break;
                        case '-':
                            if (typeof result === 'number' && typeof nextOperand === 'number') {
                                result = result - nextOperand;
                            } else {
                                throw new Error('Subtraction only works with numbers');
                            }
                            break;
                        case '*':
                            if (typeof result === 'number' && typeof nextOperand === 'number') {
                                result = result * nextOperand;
                            } else {
                                throw new Error('Multiplication only works with numbers');
                            }
                            break;
                        case '/':
                            if (typeof result === 'number' && typeof nextOperand === 'number') {
                                if (nextOperand === 0) {
                                    throw new Error('Division by zero');
                                }
                                result = Math.floor(result / nextOperand); // Integer division
                            } else {
                                throw new Error('Division only works with numbers');
                            }
                            break;
                        case '%':
                            if (typeof result === 'number' && typeof nextOperand === 'number') {
                                result = result % nextOperand;
                            } else {
                                throw new Error('Modulo only works with numbers');
                            }
                            break;
                    }
                    k++; // Skip the operand as it's already processed
                } else {
                    throw new Error(`Invalid expression: dangling ${operator} operator`);
                }
            } else {
                throw new Error(`Unsupported operator in complex expression: ${operator}`);
            }
        }
        return result;
    }

    getLiteralValue(token) {
        token = token.trim();
        // Handle string literals
        if (token.startsWith('"') && token.endsWith('"')) {
            // Remove quotes and handle escaped newlines
            let value = token.substring(1, token.length - 1);
            value = value.replace(/\\n/g, '\n');
            value = value.replace(/\\"/g, '"'); // Handle escaped double quotes
            return value;
        }
        // Handle numeric literals
        const num = parseInt(token);
        if (!isNaN(num)) {
            return num;
        }
        // Handle variable references
        if (this.variables.has(token)) {
            return this.variables.get(token);
        }
        throw new Error(`Unknown token or variable: ${token}`);
    }

    submitInput() {
        if (!this.isWaitingForInput) return;

        const inputValue = this.consoleInput.value;
        this.consoleOutput += inputValue + "\n"; // Add newline after input
        this.consoleInput.value = "";

        const value = parseInt(inputValue);
        if (isNaN(value)) {
            this.showError("Input must be a number.");
            return;
        }

        this.variables.set(this.waitingForVariable, value);
        this.addTraceRow(this.waitingStep, "", new Map([[this.waitingForVariable, value]]));

        this.isWaitingForInput = false;
        this.waitingForVariable = null;
        this.waitingStep = null;
        
        // Check if we were in an if block
        if (this.isExecutingIfBlock) {
            this.currentExecutingSubCommand++; // Move to next sub-command
        } else {
            this.currentStep++; // Advance step after input for normal commands
        }
        
        this.updateDisplay();
    }

    addTraceRow(step, output, changedVariables) {
        this.traceData.push({
            step: step,
            output: output,
            changedVariables: changedVariables
        });
        this.updateTraceTable();
    }

    previousStep() {
        if (this.executionHistory.length > 0) {
            const prevState = this.executionHistory.pop();
            this.currentStep = prevState.currentStep;
            this.variables = prevState.variables;
            this.consoleOutput = prevState.consoleOutput;
            this.traceData = prevState.traceData;
            this.variableColumns = prevState.variableColumns;
            this.isExecutingIfBlock = prevState.isExecutingIfBlock;
            this.ifBlockCommands = prevState.ifBlockCommands;
            this.currentIfStep = prevState.currentIfStep;
            this.currentExecutingSubCommand = prevState.currentExecutingSubCommand;
            this.isWaitingForInput = false; // Reset waiting state
            this.updateDisplay();
        }
    }

    restart() {
        this.startTracing(); // Re-parse and restart
    }

    newCode() {
        this.switchToInputScreen();
        this.algorithmInput.value = "";
        this.reset();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new AlgorithmTracer();
});