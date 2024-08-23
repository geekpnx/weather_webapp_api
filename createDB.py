import subprocess

def create_database():
    # Prompt the user for the database name
    dbname = input("\nEnter the name of the database you wish to create: ")

    # Define the psql command to create the database
    command = ['psql', '-U', 'postgres', '-c', f'CREATE DATABASE {dbname};']

    try:
        # Execute the command using subprocess.run
        result = subprocess.run(command, check=True, text=True, capture_output=True)
        
        # Check for errors
        if result.returncode == 0:
            print(f"\nDatabase '{dbname}' created successfully.")
        else:
            print(f"\nError creating database: {result.stderr}")
    
    except subprocess.CalledProcessError as e:
        print(f"\nCommand failed with error: {e}")

if __name__ == "__main__":
    create_database()
