import secrets
secretkey = secrets.token_urlsafe(50)
print("\nWe generating Django SECRET_KEY for you")
print(f"\nYour Django SECRET_KEY is: \033[94m{secretkey}\033[0m'")
print(f"\nPlease added this SECRET_KEY into your '.env' file")