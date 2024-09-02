import subprocess

def create_user_db(): 
	# Prompt the user for the database name
    db_username = input("\nLets create Django DB_USER (database user) for you\n\nEnter user name of the database you wish to create: ")
    user_pwd = input("\nLets create Django DB_PWD (database user password) for you\n\nEnter user password you wish to create: ")

    # Define the psql command to create the database
    command = ['psql', '-U', 'postgres', '-c', f"CREATE ROLE {db_username} WITH LOGIN SUPERUSER PASSWORD '{user_pwd}';"]

    try:
        # Execute the command using subprocess.run
        result = subprocess.run(command, check=True, text=True, capture_output=True)

        # Check for errors
        if result.returncode == 0:
            # Use ANSI escape codes to add color
            print(f"\nDatabase user '\033[94m{db_username}\033[0m' and password '\033[94m{user_pwd}\033[0m' created successfully.")
            print(f"\nPlease added this DB_USER=\033[94m{db_username}\033[0m and DB_PWD=\033[94m{user_pwd}\033[0m into your '.env' file")
        else:
            print(f"\nError creating database: {result.stderr}")

    except subprocess.CalledProcessError as e:
        print(f"\nCommand failed with error: {e}")

if __name__ == "__main__":
    create_user_db()