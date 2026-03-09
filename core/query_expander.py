import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

tokenizer = None
model = None


def load_llm():

    global tokenizer, model

    name = "Qwen/Qwen2.5-3B-Instruct"

    tokenizer = AutoTokenizer.from_pretrained(name)

    # model = AutoModelForCausalLM.from_pretrained(
    #     name,
    #     torch_dtype=torch.float16,
    #     device_map="auto"
    # )
    
    device = "mps" if torch.backends.mps.is_available() else "cpu"

    model = AutoModelForCausalLM.from_pretrained(
        name
    ).to(device)


def expand_query(query):

#     prompt = f"""
# Expand the following user question into technical keywords.

# Question:
# {query}

# Expanded Query:
# """

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
        max_new_tokens=120
    )

    text = tokenizer.decode(
        outputs[0],
        skip_special_tokens=True
    )

    return text