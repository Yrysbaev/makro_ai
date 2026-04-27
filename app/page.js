'use client';

import { useState } from 'react';

const modules = {
  productGenerator: {
    title: 'Product Generator',
    subtitle: 'Generate description, selling points, target audience, and SEO keywords.',
    prompt: (input) => `You are a Marketing Manager AI. Generate a polished product marketing package for the following product idea:\n\nProduct: ${input}\n\nProvide:\n- Description\n- Top selling points\n- Target audience\n- SEO keywords\n\nFormat with clear headings and bullet points.`,
  },
  emailWriter: {
    title: 'Email Writer',
    subtitle: 'Create a professional sales email instantly.',
    prompt: (input) => `You are a Sales Department AI. Write a professional business email for this request:\n\n${input}\n\nInclude a polite greeting, clear purpose, and call to action.`,
  },
  captionGenerator: {
    title: 'Caption Generator',
    subtitle: 'Generate Instagram caption ideas with hashtags.',
    prompt: (input) => `You are a Social Media Manager AI. Create an engaging Instagram caption and relevant hashtags for this social media post topic:\n\n${input}\n\nKeep it short, friendly, and ideal for business marketing.`,
  },
  textSummarizer: {
    title: 'Text Summarizer',
    subtitle: 'Turn long text into a short structured summary.',
    prompt: (input) => `You are an Analyst AI. Summarize the following text into a concise, structured summary:\n\n${input}\n\nUse short paragraphs or bullet points.`,
  },
  customerReplyGenerator: {
    title: 'Customer Reply Generator',
    subtitle: 'Generate polite professional responses for customer support.',
    prompt: (input) => `You are a Customer Support AI. Craft a polite customer support reply for this customer message:\n\n${input}\n\nMake it professional, empathetic, and focused on resolving the issue.`,
  },
};

const initialInputs = {
  productGenerator: 'Turkish Baklava',
  emailWriter: 'Ask supplier for price list',
  captionGenerator: 'New Turkish dessert launch',
  textSummarizer:
    'Makro AI Assistant helps businesses automate daily operations using AI-trained role-based prompts. It reduces manual workload and improves communication quality across marketing, sales, and support.',
  customerReplyGenerator: 'Customer complains about late delivery',
};

export default function Home() {
  const [inputs, setInputs] = useState(initialInputs);
  const [outputs, setOutputs] = useState({});
  const [loading, setLoading] = useState({});

  const handleInputChange = (key, value) => {
    setInputs((current) => ({ ...current, [key]: value }));
  };

  const handleGenerate = async (key) => {
    const input = inputs[key]?.trim();
    if (!input) {
      setOutputs((current) => ({ ...current, [key]: 'Enter text to generate output.' }));
      return;
    }

    setLoading((current) => ({ ...current, [key]: true }));
    setOutputs((current) => ({ ...current, [key]: 'Generating response...' }));

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
              content:
                'You are a helpful AI that acts like a real business department. Respond in a structured, professional way based on the assigned role.',
            },
            {
              role: 'user',
              content: modules[key].prompt(input),
            },
          ],
          max_tokens: 600,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || response.statusText);
      }

      const data = await response.json();
      const message = data.choices?.[0]?.message?.content;
      setOutputs((current) => ({ ...current, [key]: message || 'No response returned from OpenAI.' }));
    } catch (error) {
      setOutputs((current) => ({ ...current, [key]: `Request failed: ${error.message}` }));
    } finally {
      setLoading((current) => ({ ...current, [key]: false }));
    }
  };

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <span className="eyebrow">Makro AI Assistant Dashboard</span>
          <h1>Makro AI Assistant – Business Automation System</h1>
          <p>
            Automate marketing, sales, support and analysis with role-based AI modules. Each tool simulates a
            different business department to produce practical, structured output.
          </p>
        </div>
        <div className="api-card">
          <h2>Run locally</h2>
          <p className="note">
            Start the dashboard with `npm run dev` and store your OpenAI API key in a local <code>.env</code> file.
          </p>
        </div>
      </header>

      <section className="grid">
        {Object.entries(modules).map(([key, module]) => (
          <article className="card" key={key}>
            <h2>{module.title}</h2>
            <p>{module.subtitle}</p>
            <textarea
              value={inputs[key]}
              onChange={(event) => handleInputChange(key, event.target.value)}
              placeholder="Enter your prompt here..."
            />
            <button type="button" onClick={() => handleGenerate(key)} disabled={loading[key]}>
              {loading[key] ? 'Generating…' : `Run ${module.title}`}
            </button>
            <pre className="output">{outputs[key] || ''}</pre>
          </article>
        ))}
      </section>

      <section className="notes">
        <h3>How it works</h3>
        <ul>
          <li>User inputs data into a module</li>
          <li>The system selects a role-based AI prompt</li>
          <li>OpenAI processes the prompt through the API</li>
          <li>Structured business output is displayed instantly</li>
        </ul>
        <h3>Innovation</h3>
        <p>
          Instead of using a single general AI, this system uses role-based prompt engineering to simulate real business
          departments, making the outputs more specialized and practical.
        </p>
      </section>
    </main>
  );
}
