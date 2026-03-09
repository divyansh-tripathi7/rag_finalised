import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

tokenizer = None
model = None


def load_llm():

    global tokenizer, model

    name = "Qwen/Qwen2.5-3B-Instruct"

    tokenizer = AutoTokenizer.from_pretrained(name)

    model = AutoModelForCausalLM.from_pretrained(
        name,
        torch_dtype=torch.float16,
        device_map="auto"
    )


def expand_query(query):

    prompt = f"""
Expand the following user question into technical keywords.

Question:
{query}

Expanded Query:
"""

    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

    outputs = model.generate(
        **inputs,
        max_new_tokens=120
    )

    text = tokenizer.decode(
        outputs[0],
        skip_special_tokens=True
    )

    return text