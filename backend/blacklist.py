
from typing import Set

# Conjunto em memória (em produção use Redis ou DB)
blacklisted_tokens: Set[str] = set()

def add_token_to_blacklist(token: str):
    blacklisted_tokens.add(token)

def is_token_blacklisted(token: str) -> bool:
    return token in blacklisted_tokens
