// ==UserScript==
// @name         Fast Copy for Code PTIT
// @namespace    http://tampermonkey.net/
// @version      2024-03-14
// @description  Add copy buttons to test samples on Code PTIT
// @author       dngphuu
// @match        https://code.ptit.edu.vn/student/question/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    // Helper function to copy text to clipboard
    function copyToClipboard(text) {
        const textarea = document.createElement("textarea");
        document.body.appendChild(textarea);
        textarea.value = text;
        textarea.select();
        navigator.clipboard.writeText(text);
        textarea.remove();
    }

    // Clean up text by removing leading whitespace from each line and adding newline at end
    function cleanupText(text) {
        const lines = text.split("\n");
        let finalText = "";

        // Process lines except the last one
        for (let i = 0; i < lines.length - 1; i++) {
            finalText += lines[i].trimStart() + "\n";
        }

        // Handle last line - only add newline if it's not empty
        if (lines.length > 0) {
            const lastLine = lines[lines.length - 1].trimStart();
            if (lastLine) {
                finalText += lastLine + "\n";
            }
        }

        return finalText;
    }

    // Extract sample test cases from the question description
    function extractTestCases() {
        const tables = document.querySelectorAll(".MsoTableGrid");
        tables.forEach((table) => {
            // Get all rows
            const rows = table.querySelectorAll("tr");

            // Skip if less than 2 rows (need header + data)
            if (rows.length < 2) return;

            // Get data cells (skip header row)
            const dataCells = rows[1].querySelectorAll("td");
            if (dataCells.length >= 2) {
                const inputCell = dataCells[0];
                const outputCell = dataCells[1];

                // Extract text only from Courier New font spans for input
                if (inputCell) {
                    const courierSpans = inputCell.querySelectorAll(
                        'span[style*="Courier New"]'
                    );
                    const inputText = Array.from(courierSpans)
                        .map((span) => span.textContent)
                        .join("\n");
                    const cleanedInput = cleanupText(inputText);
                    const inputBtn = createCopyButton(
                        cleanedInput,
                        "Copy Input"
                    );
                    inputCell.insertBefore(inputBtn, inputCell.firstChild);
                }

                // Extract text only from Courier New font spans for output
                if (outputCell) {
                    const courierSpans = outputCell.querySelectorAll(
                        'span[style*="Courier New"]'
                    );
                    const outputText = Array.from(courierSpans)
                        .map((span) => span.textContent)
                        .join("\n");
                    const cleanedOutput = cleanupText(outputText);
                    const outputBtn = createCopyButton(
                        cleanedOutput,
                        "Copy Output"
                    );
                    outputCell.insertBefore(outputBtn, outputCell.firstChild);
                }
            }
        });
    }

    // Create a styled copy button with click handler
    function createCopyButton(text, label) {
        const button = document.createElement("button");
        button.textContent = label;
        button.style.cssText = `
            background-color: #dc3545;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px 16px;
            margin: 4px;
            cursor: pointer;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            font-size: 13px;
            font-weight: 500;
            letter-spacing: -0.01em;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        `;

        let isCopied = false;

        button.addEventListener("mouseover", () => {
            if (!isCopied) {
                button.style.backgroundColor = "#c82333";
            }
        });

        button.addEventListener("mouseout", () => {
            if (!isCopied) {
                button.style.backgroundColor = "#dc3545";
            }
        });

        button.addEventListener("click", () => {
            copyToClipboard(text);

            // Visual feedback
            isCopied = true;
            button.textContent = "✓ Copied";
            button.style.backgroundColor = "#19be70";
            button.style.transform = "scale(0.98)";
            button.style.letterSpacing = "0.03em";
            button.style.fontWeight = "600";

            // Reset button after delay
            setTimeout(() => {
                isCopied = false;
                button.textContent = label;
                button.style.backgroundColor = "#dc3545";
                button.style.transform = "scale(1)";
                button.style.letterSpacing = "-0.01em";
                button.style.fontWeight = "500";
            }, 1500);
        });

        return button;
    }

    // Initialize script
    extractTestCases();
})();
