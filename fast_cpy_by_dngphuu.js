// ==UserScript==
// @name         Fast Copy for Code PTIT
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Add copy buttons to test samples on Code PTIT
// @author       dngphuu
// @match        https://code.ptit.edu.vn/student/question/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/dngphuu/fast_cpy_codeptit/main/fast_cpy_by_dngphuu.js
// @downloadURL    https://raw.githubusercontent.com/dngphuu/fast_cpy_codeptit/main/fast_cpy_by_dngphuu.js
// ==/UserScript==

(function () {
    "use strict";

    // Helper function to copy text to clipboard
    function copyToClipboard(text) {
        try {
            const textarea = document.createElement("textarea");
            document.body.appendChild(textarea);
            textarea.value = text;
            textarea.select();
            navigator.clipboard.writeText(text);
            textarea.remove();
        } catch (error) {
            console.error("Failed to copy text:", error);
        }
    }

    // Clean up text by removing leading whitespace from each line and adding newline at end
    function cleanupText(text) {
        return text
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean)
            .join("\n")
            .trim() + "\n";
    }

    // Extract sample test cases from the question description
    function extractTestCases() {
        const tables = document.querySelectorAll("table.MsoTableGrid:not([data-processed])");
        tables.forEach((table) => {
            try {
                // Mark table as processed
                table.setAttribute("data-processed", "true");

                const rows = table.querySelectorAll("tr");
                if (rows.length === 0) return;

                // Skip header row
                for (let i = 1; i < rows.length; i++) {
                    const cells = rows[i].querySelectorAll("td");
                    if (cells.length >= 2) {
                        const inputCell = cells[0];
                        const outputCell = cells[1];

                        // Handle input cell
                        const inputSpan = inputCell.querySelector(
                            'span[style*="Courier New"]'
                        );
                        if (inputSpan) {
                            const cleanedInput = cleanupText(inputSpan.textContent);
                            if (cleanedInput) {
                                const inputBtn = createCopyButton(
                                    cleanedInput,
                                    `Copy Input ${rows.length > 2 ? i : ""}`
                                );
                                inputSpan.parentNode.insertBefore(
                                    inputBtn,
                                    inputSpan
                                );
                            }
                        }

                        // Handle output cell
                        const outputSpan = outputCell.querySelector(
                            'span[style*="Courier New"]'
                        );
                        if (outputSpan) {
                            const cleanedOutput = cleanupText(
                                outputSpan.textContent
                            );
                            if (cleanedOutput) {
                                const outputBtn = createCopyButton(
                                    cleanedOutput,
                                    `Copy Output ${rows.length > 2 ? i : ""}`
                                );
                                outputSpan.parentNode.insertBefore(
                                    outputBtn,
                                    outputSpan
                                );
                            }
                        }
                    }
                }

                // Add "Copy All" buttons if there are multiple test cases
                const firstRow = rows[0];
                if (rows.length > 2 && firstRow.cells.length >= 2) {
                    const inputCell = firstRow.cells[0];
                    const outputCell = firstRow.cells[1];

                    // Add "Copy All Input" button
                    const allInputText =
                        Array.from(
                            table.querySelectorAll(
                                'td:first-child span[style*="Courier New"]'
                            )
                        )
                            .map((span) => cleanupText(span.textContent))
                            .filter((text) => text.length > 0)
                            .join("")
                            .trim() + "\n";
                    if (allInputText) {
                        const allInputBtn = createCopyButton(
                            allInputText,
                            "Copy All Input"
                        );
                        inputCell.insertBefore(allInputBtn, inputCell.firstChild);
                    }

                    // Add "Copy All Output" button
                    const allOutputText =
                        Array.from(
                            table.querySelectorAll(
                                'td:last-child span[style*="Courier New"]'
                            )
                        )
                            .map((span) => cleanupText(span.textContent))
                            .filter((text) => text.length > 0)
                            .join("")
                            .trim() + "\n";
                    if (allOutputText) {
                        const allOutputBtn = createCopyButton(
                            allOutputText,
                            "Copy All Output"
                        );
                        outputCell.insertBefore(
                            allOutputBtn,
                            outputCell.firstChild
                        );
                    }
                }
            } catch (error) {
                console.error("Error processing table:", error);
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
        let timeoutId = null;

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

            // Clear existing timeout if any
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            // Visual feedback
            isCopied = true;
            button.textContent = "✓ Copied";
            button.style.backgroundColor = "#19be70";
            button.style.transform = "scale(0.98)";
            button.style.letterSpacing = "0.03em";
            button.style.fontWeight = "600";

            // Reset button after delay
            timeoutId = setTimeout(() => {
                isCopied = false;
                button.textContent = label;
                button.style.backgroundColor = "#dc3545";
                button.style.transform = "scale(1)";
                button.style.letterSpacing = "-0.01em";
                button.style.fontWeight = "500";
                timeoutId = null;
            }, 1500);
        });

        return button;
    }

    // Initialize MutationObserver with debouncing
    let debounceTimeout = null;
    const observer = new MutationObserver((mutations) => {
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }
        debounceTimeout = setTimeout(() => {
            extractTestCases();
            debounceTimeout = null;
        }, 100);
    });

    // Start observing after initial content is loaded
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeScript);
    } else {
        initializeScript();
    }

    function initializeScript() {
        try {
            extractTestCases();
            observer.observe(document.body, {
                childList: true,
                subtree: true,
            });
        } catch (error) {
            console.error("Error initializing script:", error);
        }
    }
})();
