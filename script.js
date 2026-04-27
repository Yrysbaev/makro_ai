const modules = {
  productGenerator: {
    title: 'Product Generator',
    role: 'Marketing Manager AI',
    prompt: (input) => `You are a ${modules.productGenerator.role}. Generate a polished product marketing package for the following product idea:

Product: ${input}

Provide:
- Description
- Top selling points
- Target audience
- SEO keywords

Format with clear headings and bullet points.`,
  },
  emailWriter: {
    title: 'Email Writer',
    role: 'Sales Department AI',
    prompt: (input) => `You are a ${modules.emailWriter.role}. Write a professional business email for this request:

${input}

Include a polite greeting, clear purpose, and call to action.`,
  },
  captionGenerator: {
    title: 'Caption Generator',
    role: 'Social Media Manager AI',
    prompt: (input) => `You are a ${modules.captionGenerator.role}. Create an engaging Instagram caption and relevant hashtags for this social media post topic:

${input}

Keep it short, friendly, and ideal for business marketing.`,
  },
  textSummarizer: {
    title: 'Text Summarizer',
    role: 'Analyst AI',
    prompt: (input) => `You are a ${modules.textSummarizer.role}. Summarize the following text into a concise, structured summary:

${input}

Use short paragraphs or bullet points.`,
  },
  customerReplyGenerator: {
    title: 'Customer Reply Generator',
    role: 'Customer Support AI',
    prompt: (input) => `You are a ${modules.customerReplyGenerator.role}. Craft a polite customer support reply for this customer message:

${input}

Make it professional, empathetic, and focused on resolving the issue.`,
  },
};

const buttons = document.querySelectorAll('button[data-module]');

buttons.forEach((button) => {
  button.addEventListener('click', async () => {
    const moduleKey = button.dataset.module;
    const module = modules[moduleKey];
    if (!module) return;

    const inputElement = document.getElementById(`${moduleKey.replace(/([A-Z])/g, ' $1').trim().replace(/ /g, '')}Input`);
    const outputElement = document.getElementById(`${moduleKey.replace(/([A-Z])/g, ' $1').trim().replace(/ /g, '')}Output`);
    const promptText = module.prompt(inputElement.value.trim());

    outputElement.textContent = 'Generating response...';

    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-nano',
          messages: [
            {
              role: 'system',
              content: `You are a helpful AI that acts like a real business department. Respond in a structured, professional way based on the assigned role.`,
            },
            {
              role: 'user',
              content: promptText,
            },
          ],
          max_tokens: 600,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        outputElement.textContent = `OpenAI API error: ${error.error?.message || response.statusText}`;
        return;
      }

      const data = await response.json();
      const message = data.choices?.[0]?.message?.content;
      outputElement.textContent = message || 'No response returned from OpenAI.';
    } catch (error) {
      outputElement.textContent = `Request failed: ${error.message}`;
    }
  });
});
