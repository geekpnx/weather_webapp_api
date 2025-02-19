import subprocess

def create_database():
    
    # Prompt the user for the database name
    dbname = input("\nLets create Django DB_NAME (database) for you\n\nEnter the name of the database you wish to create: ")

    # Define the psql command to create the database
    command = ['psql', '-U', 'postgres', '-c', f'CREATE DATABASE {dbname};']

    try:
        # Execute the command using subprocess.run
        result = subprocess.run(command, check=True, text=True, capture_output=True)

        # Check for errors
        if result.returncode == 0:
            print(f"\nDatabase name '\033[94m{dbname}\033[0m'  created successfully.")
            print(f"\nPlease added this DB_NAME=\033[94m{dbname}\033[0m into your '.env' file")
        else:
            print(f"\nError creating database: {result.stderr}")

    except subprocess.CalledProcessError as e:
        print(f"\nCommand failed with error: {e}")

if __name__ == "__main__":
    create_database()