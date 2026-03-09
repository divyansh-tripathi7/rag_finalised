# from core.query_expander import tokenizer, model

import core.query_expander as query_expander

def select_experts(query, experts):

    block = ""

    for i, e in enumerate(experts):

        block += f"""
Expert {i+1}

Name: {e.get('Manager_Name','Unknown')}

Profile:
{e.get('Role_Experience','')[:300]}
"""

    prompt = f"""
You are an expert recommender.

Select the two most relevant experts.

QUESTION:
{query}

CANDIDATES:
{block}

Return the best experts with reasoning.
"""

    # inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    
    inputs = query_expander.tokenizer(prompt, return_tensors="pt").to(query_expander.model.device)

    # outputs = model.generate(
    #     **inputs,
    #     max_new_tokens=200
    # )
    
    outputs = query_expander.model.generate(
        **inputs,
        max_new_tokens=200
    )      

    # return tokenizer.decode(outputs[0], skip_special_tokens=True)
    return query_expander.tokenizer.decode(outputs[0], skip_special_tokens=True)