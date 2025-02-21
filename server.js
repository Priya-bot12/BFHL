const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.json()); // Middleware to parse JSON
app.use(cors({
    origin : "*"
}))

// Store the last received data (temporary storage)
let lastProcessedData = {};

/**
 * Middleware for input validation
 */
const validateRequest = (req, res, next) => {
    const { user_id, email, roll_number, data } = req.body;

    if (!user_id || !email || !roll_number || !Array.isArray(data)) {
        return res.status(400).json({
            is_success: false,
            message: "Invalid input, required fields missing or incorrect format"
        });
    }

    // Check if all data values are strings
    if (!data.every(item => typeof item === "string")) {
        return res.status(400).json({
            is_success: false,
            message: "All elements in 'data' must be strings"
        });
    }

    next(); // Proceed if validation passes
};

/**
 * ✅ Define POST Route for /bfhl
 */
app.post("/bfhl", validateRequest, (req, res) => {
    try {
        const { user_id, email, roll_number, data } = req.body;

        const numbers = data.filter(item => !isNaN(item));
        const alphabets = data.filter(item => isNaN(item));

        const highestAlphabet = alphabets.length > 0
            ? [alphabets.sort((a, b) => b.localeCompare(a))[0]]
            : [];

        // Save the last processed request
        lastProcessedData = {
            is_success: true,
            user_id,
            email,
            roll_number,
            numbers,
            alphabets,
            highest_alphabet: highestAlphabet
        };

        res.json(lastProcessedData);
    } catch (error) {
        res.status(500).json({ is_success: false, message: "Internal server error" });
    }
});

/**
 * ✅ Define GET Route for /bfhl (Returns last processed data)
 */
app.get("/bfhl", (req, res) => {
    if (Object.keys(lastProcessedData).length === 0) {
        return res.status(404).json({ is_success: false, message: "No data available" });
    }
    res.json(lastProcessedData);
});

// Export the app for Vercel
module.exports = app;
