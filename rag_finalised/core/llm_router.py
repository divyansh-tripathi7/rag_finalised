import core.query_expander as query_expander
from core.config import is_testing


def select_experts(query, experts):

    block = ""

    for i, e in enumerate(experts):

        block += f"""
Expert {i+1}

Name: {e.get('Manager_Name','Unknown')}

Profile:
{e.get('Role_Experience','')[:300]}
"""

    # Fast dummy path for testing: no model invocation.
    if is_testing():
        top = experts[:3]
        lines = [
            "Testing mode: heuristic expert selection (no LLM).\n",
            f"Original question: {query}\n",
            "Top candidates:",
        ]
        for i, e in enumerate(top):
            lines.append(
                f"\nExpert {i+1}: {e.get('Manager_Name','Unknown')}\n"
                f"Role snippet: {e.get('Role_Experience','')[:400]}\n"
            )
        return "\n".join(lines)

    prompt = f"""
You are an expert recommender.

Select the two most relevant experts.

QUESTION:
{query}

CANDIDATES:
{block}

Return the best experts with reasoning.
"""

    inputs = query_expander.tokenizer(prompt, return_tensors="pt").to(
        query_expander.model.device
    )

    outputs = query_expander.model.generate(
        **inputs,
        max_new_tokens=200,
    )

    return query_expander.tokenizer.decode(
        outputs[0],
        skip_special_tokens=True,
    )