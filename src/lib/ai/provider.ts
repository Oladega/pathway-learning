export interface MentorProvider {
  answer(
    system: string,
    messages: { role: "user" | "assistant"; content: string }[],
  ): Promise<string>;
}
export class OpenAIMentor implements MentorProvider {
  async answer(
    system: string,
    messages: { role: "user" | "assistant"; content: string }[],
  ) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
        messages: [{ role: "system", content: system }, ...messages],
        max_completion_tokens: 1200,
      }),
      signal: AbortSignal.timeout(45000),
    });
    if (!response.ok)
      throw Error(
        "Model provider unavailable. Retry later or check server configuration.",
      );
    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content;
    if (typeof answer !== "string" || !answer)
      throw Error("Model provider returned an empty response");
    return answer;
  }
}
