const sendEmail = async (to, subject, html) => {
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
        throw new Error("BREVO_API_KEY is not configured");
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            accept: "application/json",
            "api-key": apiKey,
            "content-type": "application/json"
        },
        body: JSON.stringify({
            sender: {
                name: "BRIKRO",
                email: "sidh4gaming@gmail.com"
            },
            to: [{ email: to }],
            subject,
            htmlContent: html
        })
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            `Brevo API error (${response.status}): ${
                result.message || JSON.stringify(result)
            }`
        );
    }

    return result;
};

module.exports = sendEmail;
