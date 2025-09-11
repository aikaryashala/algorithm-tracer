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
                
                const ifBlock = [];
                
                // Look for indented lines following the if statement
                let j = i + 1;
                while (j < lines.length) {
                    const nextLine = lines[j];
                    const nextTrimmed = nextLine.trim();
                    
                    // Check if this line is indented (part of the if block)
                    if (nextLine.startsWith("  ") || nextLine.startsWith("\t")) {
                        if (nextTrimmed) { // Only add non-empty indented lines
                            this.extractVariables(nextTrimmed).forEach(v => allVariables.add(v));
                            ifBlock.push(nextTrimmed);
                        }
                        j++;
                    } else {
                        // Not indented, end of if block
                        break;
                    }
                }
                
                algorithm.push({
                    step: stepNumber,
                    type: "if",
                    condition: condition,
                    ifBlock: ifBlock,
                    originalLine: line
                });
                
                i = j - 1; // Skip the processed indented lines
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
                step.ifBlock.forEach((subCommand, subIndex) => {
                    const subLineEl = document.createElement("div");
                    subLineEl.className = "code-line indented"; // Add an 'indented' class for styling
                    subLineEl.textContent = `  ${subCommand}`; // Add two spaces for visual indentation
                    subLineEl.dataset.stepIndex = index;
                    subLineEl.dataset.subIndex = subIndex;
                    subLineEl.dataset.lineType = "sub";
                    this.codeDisplay.appendChild(subLineEl);
                    this.codeLineElements.push(subLineEl);
                });
            }
        });
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
            line.classList.remove("current", "executed");
        });
        
        // Highlight executed and current lines
        this.codeLineElements.forEach(line => {
            const stepIndex = parseInt(line.dataset.stepIndex);
            const lineType = line.dataset.lineType;
            
            if (stepIndex < this.currentStep) {
                line.classList.add("executed");
            } else if (stepIndex === this.currentStep) {
                if (lineType === "main") {
                    line.classList.add("current");
                }
            }
        });
        
        // Handle highlighting for currently executing if block sub-commands
        if (this.currentExecutingSubCommand !== undefined) {
            this.codeLineElements.forEach(line => {
                const stepIndex = parseInt(line.dataset.stepIndex);
                const subIndex = parseInt(line.dataset.subIndex);
                const lineType = line.dataset.lineType;
                
                if (stepIndex === this.currentStep && lineType === "sub") {
                    if (subIndex < this.currentExecutingSubCommand) {
                        line.classList.add("executed");
                    } else if (subIndex === this.currentExecutingSubCommand) {
                        line.classList.add("current");
                    }
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
        this.nextStepBtn.disabled = this.isWaitingForInput || this.currentStep >= this.algorithm.length;
        
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
            variableColumns: new Set(this.variableColumns)
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
            // Execute if block
            let subStepIndex = 0;
            for (const subCommand of step.ifBlock) {
                const subStepLabel = `${step.step}${String.fromCharCode(97 + subStepIndex)}`;
                
                // Check if subCommand is empty after trimming, if so, skip it
                if (!subCommand.trim()) continue;

                // Set current executing sub-command for highlighting
                this.currentExecutingSubCommand = subStepIndex;
                this.updateDisplay();

                // The subCommand from ifBlock already has leading spaces trimmed by parseAlgorithm
                // but we need to check its type and execute accordingly
                const commandType = this.getCommandType(subCommand);

                if (commandType === "goto") {
                    this.executeGoto(subCommand);
                    this.currentExecutingSubCommand = undefined;
                    return; // Exit if block execution after goto
                } else if (commandType === "assignment") {
                    this.executeAssignment(subCommand, subStepLabel);
                } else if (commandType === "print") {
                    const printOutput = this.evaluateExpression(subCommand.substring(6).trim());
                    this.consoleOutput += printOutput;
                    this.addTraceRow(subStepLabel, printOutput, new Map());
                } else if (commandType === "read") {
                    const varName = subCommand.substring(5).trim();
                    this.isWaitingForInput = true;
                    this.waitingForVariable = varName;
                    this.waitingStep = subStepLabel;
                    return; // Wait for input, do not advance currentStep
                } else {
                    throw new Error(`Unsupported command in if block: ${subCommand}`);
                }
                
                subStepIndex++;
            }
        }
        
        // Clear sub-command tracking and advance to next step
        this.currentExecutingSubCommand = undefined;
        this.currentStep++;
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
            if (['+', '-', '*', '/'].includes(char)) {
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
            while (j < expr.length && !['"', '+', '-', '*', '/', ' '].includes(expr[j])) {
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
            if (['+', '-', '*', '/'].includes(operator)) {
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
        this.currentStep++; // Advance step after input
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


