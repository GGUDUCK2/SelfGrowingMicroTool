import type { PromptExport, TestSuiteExport } from './parser';

export function generateCurl(data: PromptExport): string {
    const escapedMessages = JSON.stringify(data.messages).replace(/'/g, "'\\''");

    return `curl https://api.openai.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $OPENAI_API_KEY" \\
  -d '{
    "model": "${data.model}",
    "messages": ${escapedMessages},
    "temperature": ${data.temperature}
  }'`;
}

export function generatePython(data: PromptExport): string {
    return `import openai

client = openai.OpenAI(api_key="YOUR_API_KEY")

response = client.chat.completions.create(
    model="${data.model}",
    messages=${JSON.stringify(data.messages, null, 4)},
    temperature=${data.temperature}
)

print(response.choices[0].message.content)`;
}

export function generateNode(data: PromptExport): string {
    return `import OpenAI from "openai";

const openai = new OpenAI({ apiKey: "YOUR_API_KEY" });

const completion = await openai.chat.completions.create({
    model: "${data.model}",
    messages: ${JSON.stringify(data.messages, null, 4)},
    temperature: ${data.temperature},
});

console.log(completion.choices[0].message.content);`;
}

export function generateLangChain(data: PromptExport): string {
    // Basic LangChain Python example
    const system = data.messages.find(m => m.role === 'system')?.content || '';
    const user = data.messages.find(m => m.role === 'user')?.content || '';

    return `from langchain.prompts import ChatPromptTemplate

template = ChatPromptTemplate.from_messages([
    ("system", """${system.replace(/"""/g, '\\"\\"\\"')}"""),
    ("human", """${user.replace(/"""/g, '\\"\\"\\"')}"""),
])

prompt_value = template.invoke({})
# chain.invoke(prompt_value)`;
}

export function generateTestSuiteJson(data: TestSuiteExport): string {
    return JSON.stringify(data, null, 2);
}

export function generateTestSuitePython(data: TestSuiteExport): string {
    return `import openai
import json

client = openai.OpenAI(api_key="YOUR_API_KEY")

SYSTEM_TEMPLATE = """${data.template.system.replace(/"""/g, '\\"\\"\\"')}"""
USER_TEMPLATE = """${data.template.user.replace(/"""/g, '\\"\\"\\"')}"""

test_cases = ${JSON.stringify(data.cases, null, 4)}

def compile_prompt(template, variables):
    res = template
    for key, val in variables.items():
        res = res.replace(f"{{{{{key}}}}}", str(val))
    return res

for case in test_cases:
    print(f"Running Case: {case['name']}")

    sys_prompt = compile_prompt(SYSTEM_TEMPLATE, case['variables'])
    user_prompt = compile_prompt(USER_TEMPLATE, case['variables'])

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": sys_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.7
    )

    print(f"Response: {response.choices[0].message.content}")
    print("-" * 40)
`;
}
