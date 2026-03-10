import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

from core.config import is_testing

tokenizer = None
model = None


def load_llm():

    global tokenizer, model

    # In testing mode we skip loading the large model entirely.
    if is_testing():
        tokenizer = None
        model = None
        return

    name = "Qwen/Qwen2.5-3B-Instruct"

    tokenizer = AutoTokenizer.from_pretrained(name)

    # model = AutoModelForCausalLM.from_pretrained(
    #     name,
    #     torch_dtype=torch.float16,
    #     device_map="auto"
    # )

    device = "mps" if torch.backends.mps.is_available() else "cpu"

    model = AutoModelForCausalLM.from_pretrained(name).to(device)


def expand_query(query):

    # Fast dummy path for testing: no model invocation.
    if is_testing():
        base = query.lower().replace("?", "").replace(".", "")
        words = [w for w in base.split() if w]
        extra = ["expert", "experience", "skills", "domain", "projects", "research"]
        keywords = words + extra
        return "keywords: " + ", ".join(dict.fromkeys(keywords))

    prompt = f"""
You are a query expansion engine.

Expand the user query into a list of relevant technical keywords.

Only return keywords.

Query:
{query}

Keywords:
"""

    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

    outputs = model.generate(
        **inputs,
        max_new_tokens=120,
    )

    text = tokenizer.decode(
        outputs[0],
        skip_special_tokens=True,
    )

    return text

