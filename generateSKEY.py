from django.core.management.utils import get_random_secret_key

secretkey = get_random_secret_key()
print("\nWe generating Django SECRET_KEY for you")
print(f"\nYour Django SECRET_KEY is: {secretkey}")
print(f"\nPlease added this SECRET_KEY into your '.env' file")
