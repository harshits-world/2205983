const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;
let numberWindow = [];

const API_URLS = {
    "p": "http://20.244.56.144/evaluation-service/primes",
    "f": "http://20.244.56.144/evaluation-service/fibo",
    "e": "http://20.244.56.144/evaluation-service/even",
    "r": "http://20.244.56.144/evaluation-service/rand"
};

app.get("/numbers/:numberid", async (req, res) => {
    const numberType = req.params.numberid;

    if (!API_URLS[numberType]) {
        return res.status(400).json({ error: "Invalid number type. Use 'p', 'f', 'e', or 'r'." });
    }

    try {
        const response = await axios.get(API_URLS[numberType], { timeout: 500 });

        if (response.status === 200) {
            let newNumbers = response.data.numbers.filter(num => !numberWindow.includes(num));

            numberWindow = [...numberWindow, ...newNumbers].slice(-WINDOW_SIZE);

            const average = numberWindow.reduce((sum, num) => sum + num, 0) / numberWindow.length;

            res.json({
                "windowPrevState": numberWindow.slice(0, -newNumbers.length),
                "windowCurrState": numberWindow,
                "numbers": newNumbers,
                "avg": parseFloat(average.toFixed(2))
            });
        } else {
            res.status(500).json({ error: "Error fetching numbers" });
        }
    } catch (error) {
        res.status(500).json({ error: "Request timeout or server error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
