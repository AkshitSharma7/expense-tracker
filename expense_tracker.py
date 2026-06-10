import json
import os

FILE_NAME = "expenses.json"

# Load expenses
def load_data():
    if not os.path.exists(FILE_NAME):
        return []
    with open(FILE_NAME, "r") as file:
        return json.load(file)

# Save expenses
def save_data(data):
    with open(FILE_NAME, "w") as file:
        json.dump(data, file, indent=4)

# Add expense
def add_expense():
    name = input("Enter expense name: ")
    amount = float(input("Enter amount: "))

    expense = {
        "name": name,
        "amount": amount
    }

    data = load_data()
    data.append(expense)
    save_data(data)
    print("✅ Expense added!")

# View expenses
def view_expenses():
    data = load_data()
    if not data:
        print("No expenses found.")
        return

    total = 0
    print("\n--- Your Expenses ---")
    for i, exp in enumerate(data, start=1):
        print(f"{i}. {exp['name']} - ₹{exp['amount']}")
        total += exp['amount']

    print(f"\n💰 Total Expense: ₹{total}")

# Delete expense
def delete_expense():
    name = input("Enter expense name to delete: ")
    data = load_data()

    new_data = [exp for exp in data if exp["name"] != name]

    if len(data) == len(new_data):
        print("❌ Expense not found!")
    else:
        save_data(new_data)
        print("🗑️ Expense deleted!")

# Main menu
def main():
    while True:
        print("\n--- Expense Tracker ---")
        print("1. Add Expense")
        print("2. View Expenses")
        print("3. Delete Expense")
        print("4. Exit")

        choice = input("Enter your choice: ")

        if choice == "1":
            add_expense()
        elif choice == "2":
            view_expenses()
        elif choice == "3":
            delete_expense()
        elif choice == "4":
            print("Exiting...")
            break
        else:
            print("Invalid choice!")

main()