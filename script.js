// Algorithm Tracer Application
class AlgorithmTracer {
    constructor() {
        this.algorithm = [];
        this.currentStep = 0;
        this.variables = new Map();
        this.consoleOutput = '';
        this.executionHistory = [];
        this.isWaitingForInput = false;
        this.traceData = [];
        this.variableColumns = new Set();
        
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        // Screens
        this.inputScreen = document.getElementById('input-screen');
        this.executionScreen = document.getElementById('execution-screen');
        
        // Input elements
        this.algorithmInput = document.getElementById('algorithm-input');
        this.startTraceBtn = document.getElementById('start-trace-btn');
        
        // Execution elements
        this.codeDisplay = document.getElementById('code-display');
        this.traceTable = document.getElementById('trace-table');
        this.consoleOutputEl = document.getElementById('console-output');
        this.consoleInputContainer = document.getElementById('console-input-container');
        this.consoleInput = document.getElementById('console-input');
        this.submitInputBtn = document.getElementById('submit-input-btn');
        
        // Control buttons
        this.prevStepBtn = document.getElementById('prev-step-btn');
        this.nextStepBtn = document.getElementById('next-step-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.newCodeBtn = document.getElementById('new-code-btn');
        
        // Error display
        this.errorDisplay = document.getElementById('error-display');
    }

    attachEventListeners() {
        this.startTraceBtn.addEventListener('click', () => this.startTracing());
        this.nextStepBtn.addEventListener('click', () => this.nextStep());
        this.prevStepBtn.addEventListener('click', () => this.previousStep());
        this.restartBtn.addEventListener('click', () => this.restart());
        this.newCodeBtn.addEventListener('click', () => this.newCode());
        this.submitInputBtn.addEventListener('click', () => this.submitInput());
        this.consoleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitInput();
        });
        
        // Error display close
        document.querySelector('.error-close').addEventListener('click', () => {
            this.errorDisplay.style.display = 'none';
        });
    }

    showError(message) {
        document.querySelector('.error-message').textContent = message;
        this.errorDisplay.style.display = 'block';
        setTimeout(() => {
            this.errorDisplay.style.display = 'none';
        }, 5000);
    }

    parseAlgorithm(text) {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        const algorithm = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const stepMatch = line.match(/^step-(\d+):\s*(.+)$/);
            
            if (!stepMatch) {
                throw new Error(`Invalid step format at line ${i + 1}: ${line}`);
            }
            
            const stepNumber = parseInt(stepMatch[1]);
            const command = stepMatch[2].trim();
            
            // Parse if statements with indented blocks
            if (command.startsWith('if ')) {
                const condition = command.substring(3).trim();
                const ifBlock = [];
                
                // Look for indented lines following the if statement
                let j = i + 1;
                while (j < lines.length && lines[j].startsWith('  ')) {
                    ifBlock.push(lines[j].substring(2).trim());
                    j++;
                }
                
                algorithm.push({
                    step: stepNumber,
                    type: 'if',
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
        
        return algorithm;
    }

    getCommandType(command) {
        if (command === 'start') return 'start';
        if (command === 'stop') return 'stop';
        if (command.startsWith('print ')) return 'print';
        if (command.startsWith('read ')) return 'read';
        if (command.startsWith('goto ')) return 'goto';
        if (command.includes(' = ')) return 'assignment';
        return 'unknown';
    }

    startTracing() {
        try {
            const algorithmText = this.algorithmInput.value.trim();
            if (!algorithmText) {
                this.showError('Please enter an algorithm');
                return;
            }
            
            this.algorithm = this.parseAlgorithm(algorithmText);
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
        this.consoleOutput = '';
        this.executionHistory = [];
        this.isWaitingForInput = false;
        this.traceData = [];
        this.variableColumns.clear();
        
        this.updateDisplay();
    }

    displayCode() {
        this.codeDisplay.innerHTML = '';
        this.algorithm.forEach((step, index) => {
            const lineEl = document.createElement('div');
            lineEl.className = 'code-line';
            lineEl.textContent = step.originalLine;
            lineEl.dataset.stepIndex = index;
            this.codeDisplay.appendChild(lineEl);
        });
    }

    switchToExecutionScreen() {
        this.inputScreen.classList.remove('active');
        this.executionScreen.classList.add('active');
    }

    switchToInputScreen() {
        this.executionScreen.classList.remove('active');
        this.inputScreen.classList.add('active');
    }

    updateDisplay() {
        this.updateCodeHighlight();
        this.updateTraceTable();
        this.updateConsole();
        this.updateButtons();
    }

    updateCodeHighlight() {
        const lines = this.codeDisplay.querySelectorAll('.code-line');
        lines.forEach((line, index) => {
            line.classList.remove('current', 'executed');
            if (index < this.currentStep) {
                line.classList.add('executed');
            } else if (index === this.currentStep) {
                line.classList.add('current');
            }
        });
    }

    updateTraceTable() {
        // Update table headers
        const thead = this.traceTable.querySelector('thead tr');
        thead.innerHTML = '<th>Step</th>';
        
        // Add variable columns
        this.variableColumns.forEach(varName => {
            const th = document.createElement('th');
            th.textContent = varName;
            thead.appendChild(th);
        });
        
        // Add Output column
        const outputTh = document.createElement('th');
        outputTh.textContent = 'Output';
        thead.appendChild(outputTh);
        
        // Update table body
        const tbody = this.traceTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        this.traceData.forEach(row => {
            const tr = document.createElement('tr');
            
            // Step column
            const stepTd = document.createElement('td');
            stepTd.textContent = row.step;
            tr.appendChild(stepTd);
            
            // Variable columns
            this.variableColumns.forEach(varName => {
                const td = document.createElement('td');
                td.textContent = row.variables.has(varName) ? row.variables.get(varName) : '';
                tr.appendChild(td);
            });
            
            // Output column
            const outputTd = document.createElement('td');
            outputTd.textContent = row.output || '';
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
        return text.replace(/ /g, '·');
    }

    updateButtons() {
        this.prevStepBtn.disabled = this.executionHistory.length === 0;
        this.nextStepBtn.disabled = this.isWaitingForInput || this.currentStep >= this.algorithm.length;
        
        if (this.isWaitingForInput) {
            this.consoleInputContainer.style.display = 'flex';
            this.consoleInput.focus();
        } else {
            this.consoleInputContainer.style.display = 'none';
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
            case 'start':
                this.addTraceRow(step.step, '', new Map(this.variables));
                this.currentStep++;
                break;
                
            case 'stop':
                this.addTraceRow(step.step, '', new Map(this.variables));
                this.currentStep++;
                break;
                
            case 'print':
                const printOutput = this.evaluateExpression(step.command.substring(6).trim());
                this.consoleOutput += printOutput;
                this.addTraceRow(step.step, printOutput, new Map(this.variables));
                this.currentStep++;
                break;
                
            case 'read':
                const varName = step.command.substring(5).trim();
                this.isWaitingForInput = true;
                this.waitingForVariable = varName;
                this.waitingStep = step.step;
                break;
                
            case 'assignment':
                this.executeAssignment(step.command, step.step);
                this.currentStep++;
                break;
                
            case 'if':
                this.executeIf(step);
                break;
                
            case 'goto':
                this.executeGoto(step.command);
                break;
                
            default:
                throw new Error(`Unknown command type: ${step.type}`);
        }
        
        this.updateDisplay();
    }

    executeAssignment(command, stepNum) {
        const parts = command.split(' = ');
        if (parts.length !== 2) {
            throw new Error(`Invalid assignment: ${command}`);
        }
        
        const varName = parts[0].trim();
        const expression = parts[1].trim();
        const value = this.evaluateExpression(expression);
        
        this.variables.set(varName, value);
        this.variableColumns.add(varName);
        this.addTraceRow(stepNum, '', new Map(this.variables));
    }

    executeIf(step) {
        const conditionResult = this.evaluateCondition(step.condition);
        
        if (conditionResult) {
            // Execute if block
            let subStepIndex = 0;
            for (const subCommand of step.ifBlock) {
                const subStepLabel = `${step.step}${String.fromCharCode(97 + subStepIndex)}`;
                
                if (subCommand.startsWith('goto ')) {
                    this.executeGoto(subCommand);
                    return;
                } else if (subCommand.includes(' = ')) {
                    this.executeAssignment(subCommand, subStepLabel);
                } else if (subCommand.startsWith('print ')) {
                    const printOutput = this.evaluateExpression(subCommand.substring(6).trim());
                    this.consoleOutput += printOutput;
                    this.addTraceRow(subStepLabel, printOutput, new Map(this.variables));
                }
                
                subStepIndex++;
            }
        }
        
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
        const operators = ['<=', '>=', '==', '!=', '<', '>'];
        
        for (const op of operators) {
            if (condition.includes(op)) {
                const parts = condition.split(op).map(p => p.trim());
                if (parts.length === 2) {
                    const left = this.evaluateExpression(parts[0]);
                    const right = this.evaluateExpression(parts[1]);
                    
                    // Ensure both operands are integers for comparison
                    if (!Number.isInteger(left) || !Number.isInteger(right)) {
                        throw new Error('Comparison operators only work with integers');
                    }
                    
                    switch (op) {
                        case '<': return left < right;
                        case '<=': return left <= right;
                        case '>': return left > right;
                        case '>=': return left >= right;
                        case '==': return left === right;
                        case '!=': return left !== right;
                    }
                }
            }
        }
        
        throw new Error(`Invalid condition: ${condition}`);
    }

    evaluateExpression(expr) {
        expr = expr.trim();
        
        // Handle string literals
        if (expr.startsWith('"') && expr.endsWith('"')) {
            return expr.slice(1, -1).replace(/\\n/g, '\n');
        }
        
        // Handle simple variable references
        if (this.variables.has(expr)) {
            return this.variables.get(expr);
        }
        
        // Handle numeric literals
        const num = parseInt(expr);
        if (!isNaN(num)) {
            return num;
        }
        
        // Handle expressions with + operator
        if (expr.includes(' + ')) {
            return this.evaluateAddition(expr);
        }
        
        // Handle other arithmetic operations
        if (expr.includes(' - ') || expr.includes(' * ') || expr.includes(' / ')) {
            return this.evaluateArithmetic(expr);
        }
        
        throw new Error(`Cannot evaluate expression: ${expr}`);
    }

    evaluateAddition(expr) {
        const parts = expr.split(' + ').map(p => p.trim());
        let result = this.evaluateExpression(parts[0]);
        
        for (let i = 1; i < parts.length; i++) {
            const value = this.evaluateExpression(parts[i]);
            
            if (typeof result === 'string' || typeof value === 'string') {
                // String concatenation
                result = String(result) + String(value);
            } else {
                // Numeric addition
                result = result + value;
            }
        }
        
        return result;
    }

    evaluateArithmetic(expr) {
        // Simple arithmetic evaluation (left to right, no precedence)
        const operators = [' - ', ' * ', ' / '];
        
        for (const op of operators) {
            if (expr.includes(op)) {
                const parts = expr.split(op);
                if (parts.length === 2) {
                    const left = this.evaluateExpression(parts[0].trim());
                    const right = this.evaluateExpression(parts[1].trim());
                    
                    if (!Number.isInteger(left) || !Number.isInteger(right)) {
                        throw new Error('Arithmetic operations require integers');
                    }
                    
                    switch (op.trim()) {
                        case '-': return left - right;
                        case '*': return left * right;
                        case '/': 
                            if (right === 0) {
                                throw new Error('Division by zero');
                            }
                            return Math.floor(left / right);
                    }
                }
            }
        }
        
        throw new Error(`Cannot evaluate arithmetic expression: ${expr}`);
    }

    addTraceRow(step, output, variables) {
        this.traceData.push({
            step: step,
            output: output,
            variables: new Map(variables)
        });
    }

    submitInput() {
        if (!this.isWaitingForInput) return;
        
        const inputValue = this.consoleInput.value;
        this.consoleInput.value = '';
        
        // Try to parse as integer, otherwise treat as string
        let value = parseInt(inputValue);
        if (isNaN(value)) {
            value = inputValue;
        }
        
        this.variables.set(this.waitingForVariable, value);
        this.variableColumns.add(this.waitingForVariable);
        this.consoleOutput += inputValue;
        
        this.addTraceRow(this.waitingStep, '', new Map(this.variables));
        
        this.isWaitingForInput = false;
        this.currentStep++;
        this.updateDisplay();
    }

    previousStep() {
        if (this.executionHistory.length === 0) return;
        
        const previousState = this.executionHistory.pop();
        this.currentStep = previousState.currentStep;
        this.variables = previousState.variables;
        this.consoleOutput = previousState.consoleOutput;
        this.traceData = previousState.traceData;
        this.variableColumns = previousState.variableColumns;
        this.isWaitingForInput = false;
        
        this.updateDisplay();
    }

    restart() {
        this.reset();
        this.updateDisplay();
    }

    newCode() {
        this.switchToInputScreen();
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AlgorithmTracer();
});

